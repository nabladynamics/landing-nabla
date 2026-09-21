"""Convert the supplied cargo-ship CAD into the lightweight Spatial exhibit.

Run with FreeCAD's bundled Python (OCC + NumPy + VTK are required):
  /Applications/FreeCAD.app/Contents/Resources/bin/python \
    scripts/experience/convert-cargo-ship.py

Only tessellation/LOD, material batching, quantization and a uniform normalization are
applied; no model parts are reconstructed. The original STEP is never modified.
"""
from pathlib import Path
import argparse
import json
import os
import struct
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=ROOT / 'lib/CADs/cargo-ship-5.snapshot.2/cargo ship.STEP')
parser.add_argument('--output', type=Path, default=ROOT / 'public/experience/assets/cargo-ship.glb')
parser.add_argument('--raw', type=Path, default=Path('/tmp/nabla-ship-conversion/raw.glb'))
parser.add_argument('--reuse-raw', action='store_true')
args = parser.parse_args()


def convert_step():
    resources = '/Applications/FreeCAD.app/Contents/Resources/share/opencascade/resources'
    for key, folder in [('CSF_PluginDefaults', 'StdResource'), ('CSF_XCAFDefaults', 'StdResource'),
                        ('CSF_StandardDefaults', 'StdResource'), ('CSF_XSMessage', 'XSMessage'),
                        ('CSF_STEPDefaults', 'XSTEPResource')]:
        os.environ.setdefault(key, resources + '/' + folder)
    from OCC.Core.TDocStd import TDocStd_Document
    from OCC.Core.STEPCAFControl import STEPCAFControl_Reader
    from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool
    from OCC.Core.TDF import TDF_LabelSequence
    from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
    from OCC.Core.RWGltf import RWGltf_CafWriter
    from OCC.Core.TColStd import TColStd_IndexedDataMapOfStringString
    from OCC.Core.Message import Message_ProgressRange
    from OCC.Core.XCAFApp import XCAFApp_Application
    doc = TDocStd_Document('cargo ship')
    XCAFApp_Application.GetApplication().NewDocument('MDTV-XCAF', doc)
    reader = STEPCAFControl_Reader()
    reader.SetColorMode(True)
    reader.SetNameMode(True)
    assert reader.ReadFile(str(args.source)) == 1, 'Cannot read STEP'
    assert reader.Transfer(doc), 'Cannot transfer CAD assembly'
    shape_tool = XCAFDoc_DocumentTool.ShapeTool(doc.Main())
    labels = TDF_LabelSequence()
    shape_tool.GetFreeShapes(labels)
    for i in range(1, labels.Length() + 1):
        mesh = BRepMesh_IncrementalMesh(shape_tool.GetShape(labels.Value(i)), 80.0, False, 0.5, True)
        assert mesh.IsDone(), 'Tessellation failed'
    args.raw.parent.mkdir(parents=True, exist_ok=True)
    writer = RWGltf_CafWriter(str(args.raw), True)
    writer.SetMergeFaces(True)
    writer.SetSplitIndices16(True)
    writer.SetParallel(True)
    assert writer.Perform(doc, TColStd_IndexedDataMapOfStringString(), Message_ProgressRange())


if not args.reuse_raw:
    convert_step()

raw = args.raw.read_bytes()
json_len = struct.unpack_from('<I', raw, 12)[0]
gltf = json.loads(raw[20:20 + json_len])
binary = raw[28 + json_len:]


def read_accessor(i):
    accessor = gltf['accessors'][i]
    view = gltf['bufferViews'][accessor['bufferView']]
    dtype = {5126: '<f4', 5125: '<u4', 5123: '<u2'}[accessor['componentType']]
    width = {'SCALAR': 1, 'VEC3': 3}[accessor['type']]
    offset = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
    return np.frombuffer(binary, dtype=dtype, count=accessor['count'] * width,
                         offset=offset).reshape(accessor['count'], width)


def node_matrix(node):
    if 'matrix' in node:
        return np.array(node['matrix']).reshape(4, 4).T
    result = np.eye(4)
    result[:3, 3] = node.get('translation', [0, 0, 0])
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    rotation = np.array([
        [1 - 2*y*y - 2*z*z, 2*x*y - 2*z*w, 2*x*z + 2*y*w],
        [2*x*y + 2*z*w, 1 - 2*x*x - 2*z*z, 2*y*z - 2*x*w],
        [2*x*z - 2*y*w, 2*y*z + 2*x*w, 1 - 2*x*x - 2*y*y],
    ])
    result[:3, :3] = rotation @ np.diag(node.get('scale', [1, 1, 1]))
    return result


parts = []


def visit(i, parent):
    node = gltf['nodes'][i]
    world = parent @ node_matrix(node)
    if 'mesh' in node:
        for primitive in gltf['meshes'][node['mesh']]['primitives']:
            vertices = read_accessor(primitive['attributes']['POSITION'])
            vertices = vertices @ world[:3, :3].T + world[:3, 3]
            triangles = read_accessor(primitive['indices']).reshape(-1, 3)
            if np.linalg.det(world[:3, :3]) < 0:
                triangles = triangles[:, [0, 2, 1]]
            parts.append((vertices, triangles, primitive.get('material', 0)))
    for child in node.get('children', []):
        visit(child, world)


for i in gltf['scenes'][gltf.get('scene', 0)]['nodes']:
    visit(i, np.eye(4))

all_vertices = np.concatenate([part[0] for part in parts])
lo, hi = all_vertices.min(0), all_vertices.max(0)
centre = (lo + hi) / 2
scale = 11 / (hi[0] - lo[0])

# The source is Y-up, with its bow at +X. Turn it toward exhibit-local -X.
for vertices, _, _ in parts:
    vertices -= centre
    vertices *= scale
    vertices[:, [0, 2]] *= -1
    vertices[:, 1] += (hi[1] - lo[1]) * scale / 2 + 0.2

# Import only needed VTK modules: top-level `vtk` loads optional GUI bindings.
from vtkmodules.vtkFiltersCore import vtkQuadricDecimation, vtkPolyDataNormals, vtkCleanPolyData
from vtkmodules.vtkCommonDataModel import vtkPolyData, vtkCellArray
from vtkmodules.vtkCommonCore import vtkPoints
from vtkmodules.util.numpy_support import numpy_to_vtk, numpy_to_vtkIdTypeArray, vtk_to_numpy

out = {
    'asset': {'version': '2.0', 'generator': 'Nabla CAD web conversion: OpenCascade + VTK',
              'extras': {'source': 'User-supplied cargo ship.STEP', 'length': 11,
                         'up': '+Y', 'forward': '-X', 'bottom': 0.2}},
    'extensionsUsed': ['KHR_mesh_quantization'],
    'extensionsRequired': ['KHR_mesh_quantization'],
    'scene': 0, 'scenes': [{'nodes': [0]}],
    'nodes': [{'name': 'Cargo ship CAD', 'mesh': 0, 'scale': [5.5, 5.5, 5.5]}],
    'meshes': [{'name': 'Cargo ship CAD', 'primitives': []}],
    'materials': gltf['materials'], 'accessors': [], 'bufferViews': [], 'buffers': [],
}
for mat in out['materials']:
    pbr = mat.setdefault('pbrMetallicRoughness', {})
    pbr['metallicFactor'] = 0.12
    pbr['roughnessFactor'] = 0.68
    mat['doubleSided'] = True

buffer = bytearray()


def add_accessor(array, component_type, kind, target, bounds=False, normalized=False, stride=None):
    while len(buffer) % 4:
        buffer.append(0)
    offset = len(buffer)
    data = array.tobytes()
    buffer.extend(data)
    view_index = len(out['bufferViews'])
    out['bufferViews'].append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(data), 'target': target})
    accessor = {'bufferView': view_index, 'componentType': component_type,
                'count': len(array), 'type': kind}
    if normalized:
        accessor['normalized'] = True
    if stride:
        out['bufferViews'][-1]['byteStride'] = stride
    if bounds:
        accessor['min'] = array[:, :3].min(0).tolist()
        accessor['max'] = array[:, :3].max(0).tolist()
    index = len(out['accessors'])
    out['accessors'].append(accessor)
    return index


triangle_count = 0
vertex_count = 0
all_final = []
for material in range(len(out['materials'])):
    matching = [p for p in parts if p[2] == material]
    if not matching:
        continue
    vertices, triangles, offset = [], [], 0
    for points, cells, _ in matching:
        vertices.append(points)
        triangles.append(cells.astype(np.int64) + offset)
        offset += len(points)
    vertices = np.concatenate(vertices)
    triangles = np.concatenate(triangles)
    points = vtkPoints()
    points.SetData(numpy_to_vtk(vertices, deep=True))
    cells = vtkCellArray()
    cells.SetCells(len(triangles), numpy_to_vtkIdTypeArray(
        np.column_stack((np.full(len(triangles), 3), triangles)).reshape(-1), deep=True))
    poly = vtkPolyData()
    poly.SetPoints(points)
    poly.SetPolys(cells)
    clean = vtkCleanPolyData()
    clean.SetInputData(poly)
    clean.ToleranceIsAbsoluteOn()
    clean.SetAbsoluteTolerance(0.000001)
    clean.Update()
    source = clean.GetOutput()
    # Keep more hull geometry; simplify high-density fittings more aggressively.
    reduction = 0.30 if material == 0 else (0.78 if len(triangles) > 2000 else 0.0)
    if reduction:
        decimate = vtkQuadricDecimation()
        decimate.SetInputData(source)
        decimate.SetTargetReduction(reduction)
        decimate.SetVolumePreservation(True)
        decimate.Update()
        source = decimate.GetOutput()
    normals = vtkPolyDataNormals()
    normals.SetInputData(source)
    normals.SetFeatureAngle(35)
    normals.SplittingOn()
    normals.ConsistencyOn()
    normals.ComputePointNormalsOn()
    normals.ComputeCellNormalsOff()
    normals.Update()
    final = normals.GetOutput()
    vertices = vtk_to_numpy(final.GetPoints().GetData()).astype('<f4')
    directions = vtk_to_numpy(final.GetPointData().GetNormals()).astype('<f4')
    triangles = vtk_to_numpy(final.GetPolys().GetData()).reshape(-1, 4)[:, 1:]
    assert np.isfinite(vertices).all() and np.isfinite(directions).all()
    index_type, dtype = (5123, '<u2') if len(vertices) <= 65535 else (5125, '<u4')
    indices = triangles.reshape(-1).astype(dtype)
    # Four-byte attribute alignment: 3 SHORTs + padding; 3 BYTEs + padding.
    # A uniform node scale dequantizes positions without changing normals.
    quantized_positions = np.zeros((len(vertices), 4), dtype='<i2')
    quantized_positions[:, :3] = np.rint(vertices / 5.5 * 32767).clip(-32767, 32767).astype('<i2')
    quantized_normals = np.zeros((len(directions), 4), dtype='i1')
    quantized_normals[:, :3] = np.rint(directions * 127).clip(-127, 127).astype('i1')
    position = add_accessor(quantized_positions, 5122, 'VEC3', 34962, True, True, 8)
    normal = add_accessor(quantized_normals, 5120, 'VEC3', 34962, False, True, 4)
    index = add_accessor(indices, index_type, 'SCALAR', 34963)
    out['meshes'][0]['primitives'].append({'attributes': {'POSITION': position, 'NORMAL': normal},
                                         'indices': index, 'material': material, 'mode': 4})
    triangle_count += len(triangles)
    vertex_count += len(vertices)
    all_final.append(vertices)
    print('material', material, 'triangles', len(triangles), 'vertices', len(vertices), flush=True)

while len(buffer) % 4:
    buffer.append(0)
out['buffers'] = [{'byteLength': len(buffer)}]
encoded = json.dumps(out, separators=(',', ':')).encode()
encoded += b' ' * ((-len(encoded)) % 4)
length = 12 + 8 + len(encoded) + 8 + len(buffer)
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_bytes(struct.pack('<III', 0x46546c67, 2, length)
                        + struct.pack('<II', len(encoded), 0x4e4f534a) + encoded
                        + struct.pack('<II', len(buffer), 0x004e4942) + buffer)
final_vertices = np.concatenate(all_final)
print(json.dumps({'output': str(args.output), 'bytes': length, 'triangles': triangle_count,
                  'vertices': vertex_count, 'materials': len(out['materials']),
                  'bounds': [final_vertices.min(0).tolist(), final_vertices.max(0).tolist()]}, indent=2))
