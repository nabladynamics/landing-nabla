#!/usr/bin/env python3
"""Convert the supplied Formula 1 STEP assembly into a lightweight, Y-up GLB.

Run with a Python containing pythonocc-core, trimesh, numpy and
fast-simplification. FreeCAD's bundled Python provides pythonocc-core on macOS.
No source CAD files are modified. --raw-input reuses an OCC export.
"""
from pathlib import Path
import argparse
import json
import os
import struct
import tempfile

import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'lib/CADs/formula-1-concept-car-high-performance-aerodynamic-design-1.snapshot.7/F1_Assembly.STEP'


def tessellate_step(source, output):
    resources = '/Applications/FreeCAD.app/Contents/Resources/share/opencascade/resources'
    for name, directory in {
        'CSF_PluginDefaults': 'StdResource', 'CSF_XCAFDefaults': 'StdResource',
        'CSF_StandardDefaults': 'StdResource', 'CSF_XSMessage': 'XSMessage',
        'CSF_STEPDefaults': 'XSTEPResource',
    }.items():
        os.environ.setdefault(name, str(Path(resources) / directory))
    from OCC.Core.TDocStd import TDocStd_Document
    from OCC.Core.STEPCAFControl import STEPCAFControl_Reader
    from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool
    from OCC.Core.TDF import TDF_LabelSequence
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core.RWGltf import RWGltf_CafWriter
    from OCC.Core.TColStd import TColStd_IndexedDataMapOfStringString
    from OCC.Core.Message import Message_ProgressRange
    from OCC.Core.XCAFApp import XCAFApp_Application
    app = XCAFApp_Application.GetApplication()
    doc = TDocStd_Document('formula-one')
    app.NewDocument('MDTV-XCAF', doc)
    reader = STEPCAFControl_Reader()
    reader.SetColorMode(True)
    reader.SetNameMode(True)
    if reader.ReadFile(str(source)) != 1 or not reader.Transfer(doc):
        raise RuntimeError('Unable to load the STEP assembly')
    shape_tool = XCAFDoc_DocumentTool.ShapeTool(doc.Main())
    labels = TDF_LabelSequence()
    shape_tool.GetFreeShapes(labels)
    for index in range(1, labels.Length() + 1):
        mesh = BRepMesh_IncrementalMesh(shape_tool.GetShape(labels.Value(index)), 3.0, False, 0.35, True)
        if not mesh.IsDone():
            raise RuntimeError('STEP tessellation failed')
    writer = RWGltf_CafWriter(str(output), True)
    writer.SetMergeFaces(True)
    writer.SetSplitIndices16(True)
    writer.SetParallel(True)
    if not writer.Perform(doc, TColStd_IndexedDataMapOfStringString(), Message_ProgressRange()):
        raise RuntimeError('Intermediate GLB export failed')


def compact_indices(data):
    """Use standard unsigned-short glTF indices where a mesh permits it."""
    length = struct.unpack_from('<I', data, 12)[0]
    tree = json.loads(data[20:20 + length])
    binary = data[28 + length:]
    changed = {}
    for mesh in tree['meshes']:
        for primitive in mesh['primitives']:
            accessor = tree['accessors'][primitive['indices']]
            view_id = accessor['bufferView']
            view = tree['bufferViews'][view_id]
            if accessor['componentType'] != 5125 or accessor.get('byteOffset', 0):
                continue
            indices = np.frombuffer(binary, dtype='<u4', count=accessor['count'], offset=view.get('byteOffset', 0))
            if indices.max() <= 65535:
                changed[view_id] = indices.astype('<u2').tobytes()
                accessor['componentType'] = 5123
    packed = bytearray()
    for index, view in enumerate(tree['bufferViews']):
        packed.extend(b'\0' * ((-len(packed)) % 4))
        old_offset = view.get('byteOffset', 0)
        chunk = changed.get(index, binary[old_offset:old_offset + view['byteLength']])
        view['byteOffset'] = len(packed)
        view['byteLength'] = len(chunk)
        packed.extend(chunk)
    packed.extend(b'\0' * ((-len(packed)) % 4))
    tree['buffers'][0]['byteLength'] = len(packed)
    encoded = json.dumps(tree, separators=(',', ':')).encode()
    encoded += b' ' * ((-len(encoded)) % 4)
    return (struct.pack('<III', 0x46546c67, 2, 28 + len(encoded) + len(packed))
            + struct.pack('<II', len(encoded), 0x4e4f534a) + encoded
            + struct.pack('<II', len(packed), 0x004e4942) + packed)


def optimize(raw_path, output):
    original = trimesh.load(raw_path, force='scene')
    groups = {}
    for node in original.graph.nodes_geometry:
        transform, geometry_name = original.graph[node]
        mesh = original.geometry[geometry_name].copy()
        if 'Wheel' in geometry_name and 'Steerin' not in geometry_name:
            name = geometry_name.split('_')[0]
            # Work on the original CAD face patches, before material splitting
            # drops their hard-edge normals. Keep the main circular surfaces
            # untouched and simplify only the small sidewall/rim details.
            mesh.merge_vertices(digits_vertex=7)
            wheel_patches = []
            for patch in mesh.split(only_watertight=False, repair=False):
                if patch.extents.max() <= 0.1 and len(patch.faces) > 48:
                    target = max(24, int(len(patch.faces) * 0.15))
                    patch = patch.simplify_quadric_decimation(face_count=target, aggression=4)
                wheel_patches.append(patch)
            mesh = trimesh.util.concatenate(wheel_patches)
            # The CAD wheel's local Z axis is its axle. Retain all faces and use
            # their radial position solely to distinguish rubber from the rim.
            radial = np.linalg.norm(mesh.triangles_center[:, :2], axis=1)
            masks = [('tire', radial > 0.265), ('rim', radial <= 0.265)]
            for surface, mask in masks:
                if not mask.any():
                    continue
                part = mesh.submesh([np.flatnonzero(mask)], append=True)
                part.apply_transform(transform)
                groups.setdefault(f'{name} {surface}', []).append(part)
        else:
            name = 'Body' if 'Main_Body' in geometry_name else ('Helmet' if 'Helmet' in geometry_name else 'Steering wheel')
            mesh.apply_transform(transform)
            groups.setdefault(name, []).append(mesh)

    materials = {
        'Body': PBRMaterial(name='Pearl body', baseColorFactor=[219, 225, 233, 255], metallicFactor=0.25, roughnessFactor=0.38, doubleSided=True),
        'tire': PBRMaterial(name='Tire rubber', baseColorFactor=[31, 36, 43, 255], metallicFactor=0.0, roughnessFactor=0.86, doubleSided=True),
        'rim': PBRMaterial(name='Wheel alloy', baseColorFactor=[104, 118, 135, 255], metallicFactor=0.7, roughnessFactor=0.32, doubleSided=True),
        'Helmet': PBRMaterial(name='Driver helmet', baseColorFactor=[95, 87, 145, 255], metallicFactor=0.2, roughnessFactor=0.35),
        'Steering wheel': PBRMaterial(name='Cockpit controls', baseColorFactor=[34, 43, 58, 255], metallicFactor=0.2, roughnessFactor=0.5),
    }
    # Original STEP carries a single pale material. Neutral presentation
    # materials expose the genuine CAD's body, wheels and cockpit clearly.
    budgets = {'Body': 75000, 'tire': 9000, 'rim': 2200, 'Helmet': 5000, 'Steering wheel': 4000}
    bounds = original.bounds
    scale = 8.5 / (bounds[1, 2] - bounds[0, 2])
    cx, cz = (bounds[0, 0] + bounds[1, 0]) / 2, (bounds[0, 2] + bounds[1, 2]) / 2
    transform = np.array([[0, 0, -scale, cz * scale], [0, scale, 0, 0.2 - bounds[0, 1] * scale], [scale, 0, 0, -cx * scale], [0, 0, 0, 1]])
    result = trimesh.Scene()
    stats = []
    for name, parts in groups.items():
        mesh = trimesh.util.concatenate(parts)
        mesh.merge_vertices(digits_vertex=7)
        mesh.update_faces(mesh.unique_faces())
        mesh.update_faces(mesh.nondegenerate_faces())
        mesh.remove_unreferenced_vertices()
        category = 'tire' if name.endswith('tire') else ('rim' if name.endswith('rim') else name)
        before = len(mesh.faces)
        if category not in ('tire', 'rim') and before > budgets[category]:
            mesh = mesh.simplify_quadric_decimation(face_count=budgets[category], aggression=7)
        mesh.apply_transform(transform)
        mesh.visual = trimesh.visual.TextureVisuals(material=materials[category])
        result.add_geometry(mesh, node_name=name, geom_name=name)
        stats.append({'part': name, 'triangles': len(mesh.faces), 'before': before})
    # Re-center the simplified mesh and restore an exact ground clearance.
    bounds = result.bounds
    adjustment = np.eye(4)
    adjustment[:3, :3] *= 8.5 / (bounds[1, 0] - bounds[0, 0])
    center = (bounds[0] + bounds[1]) / 2
    adjustment[:3, 3] = -center * adjustment[0, 0]
    adjustment[1, 3] = 0.2 - bounds[0, 1] * adjustment[0, 0]
    result.apply_transform(adjustment)
    result.metadata = {'source': SOURCE.name, 'purpose': 'Illustrative CAD application geometry', 'orientation': 'Y up, nose -X', 'normalized_length': 8.5}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(compact_indices(trimesh.exchange.gltf.export_glb(result, include_normals=True)))
    report = {'source': SOURCE.name, 'bounds': result.bounds.tolist(), 'parts': stats, 'triangles': sum(len(m.faces) for m in result.geometry.values()), 'bytes': output.stat().st_size, 'materials': len(materials)}
    print(json.dumps(report, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, default=SOURCE)
    parser.add_argument('--output', type=Path, default=ROOT / 'public/experience/assets/formula-one.glb')
    parser.add_argument('--raw-input', type=Path)
    args = parser.parse_args()
    if args.raw_input:
        optimize(args.raw_input, args.output)
    else:
        with tempfile.TemporaryDirectory(prefix='nabla-formula-one-') as temp:
            raw = Path(temp) / 'raw.glb'
            tessellate_step(args.input, raw)
            optimize(raw, args.output)


if __name__ == '__main__':
    main()
