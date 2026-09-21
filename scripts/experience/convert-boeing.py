#!/usr/bin/env python3
"""Convert the supplied complete Boeing STL to the browser Spatial asset.

Run with FreeCAD's bundled Python (includes VTK and NumPy):
  /Applications/FreeCAD.app/Contents/Resources/bin/python scripts/experience/convert-boeing.py

The assembly STEP references a missing fuselage file, so this uses the complete
STL instead. Geometry is simplified directly from source triangles. STL carries no surface
colors: neutral material groups are assigned to existing body/tyre/fan geometry.
"""

import argparse
import json
from pathlib import Path
import struct

import numpy as np
from vtkmodules.util.numpy_support import numpy_to_vtk, numpy_to_vtkIdTypeArray, vtk_to_numpy
from vtkmodules.vtkCommonDataModel import vtkCellArray, vtkPolyData
from vtkmodules.vtkCommonCore import vtkPoints
from vtkmodules.vtkFiltersCore import vtkPolyDataConnectivityFilter, vtkPolyDataNormals, vtkQuadricDecimation
from vtkmodules.vtkIOGeometry import vtkSTLReader


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'lib/CADs/boeing-747-400-klm-royal-dutch-airlines-livery-1.snapshot.8/Boeing 747-8 Assembly.STL'
DESTINATION = ROOT / 'public/experience/assets/boeing.glb'


def polydata(vertices, triangles):
    points = vtkPoints()
    points.SetData(numpy_to_vtk(np.ascontiguousarray(vertices), deep=True))
    cells = vtkCellArray()
    offsets = np.arange(0, triangles.size + 1, 3, dtype=np.int64)
    cells.SetData(numpy_to_vtkIdTypeArray(offsets, deep=True), numpy_to_vtkIdTypeArray(triangles.ravel().astype(np.int64), deep=True))
    mesh = vtkPolyData()
    mesh.SetPoints(points)
    mesh.SetPolys(cells)
    return mesh


def convert(source, destination):
    reader = vtkSTLReader()
    reader.SetFileName(str(source))
    reader.MergingOn()
    reader.Update()
    original = reader.GetOutput()
    if original.GetNumberOfPolys() < 100000:
        raise ValueError('Expected the complete Boeing assembly STL.')

    connectivity = vtkPolyDataConnectivityFilter()
    connectivity.SetInputData(original)
    connectivity.SetExtractionModeToAllRegions()
    connectivity.ColorRegionsOn()
    connectivity.Update()
    connected = connectivity.GetOutput()
    vertices = vtk_to_numpy(connected.GetPoints().GetData()).astype(np.float64)
    triangles = vtk_to_numpy(connected.GetPolys().GetConnectivityArray()).reshape(-1, 3)
    regions = vtk_to_numpy(connected.GetPointData().GetArray('RegionId'))

    # Component ids follow the stable traversal of this particular supplied STL.
    # Fans are the existing nine blade components plus their hub at each engine.
    fan_regions = set(range(673, 684)) | set(range(686, 697)) | set(range(1189, 1200)) | set(range(1202, 1213))
    categories = np.zeros(int(regions.max()) + 1, dtype=np.int32)
    for region in np.unique(regions):
        points = vertices[regions == region]
        lo, hi = points.min(axis=0), points.max(axis=0)
        dimensions = hi - lo
        if dimensions[0] > 570 and dimensions[0] < 600 and dimensions[1] > 1400 and dimensions[1] < 1450 and hi[1] < 1900:
            categories[region] = 1  # Eighteen original tyre solids.
        elif region in fan_regions:
            categories[region] = 3
        elif hi[1] < 2600:
            categories[region] = 2  # Existing undercarriage and wheel hardware.

    # Original coordinates: X spans the wings, Y is up, nose points towards +Z.
    # Rotate -90 degrees about Y; center X/Z; longest dimension = 11 scene units.
    vertices = vertices[:, [2, 1, 0]] * np.array([-1, 1, 1])
    lo, hi = vertices.min(axis=0), vertices.max(axis=0)
    scale = 11.0 / float(max(hi - lo))
    vertices -= np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2])
    vertices *= scale
    vertices[:, 1] += 0.25
    category_for_face = categories[regions[triangles[:, 0]]]

    materials = [
        {'name': 'Neutral aircraft finish', 'pbrMetallicRoughness': {'baseColorFactor': [0.82, 0.85, 0.88, 1], 'metallicFactor': 0.15, 'roughnessFactor': 0.38}},
        {'name': 'Tyres', 'pbrMetallicRoughness': {'baseColorFactor': [0.015, 0.02, 0.026, 1], 'metallicFactor': 0, 'roughnessFactor': 0.9}},
        {'name': 'Landing gear metal', 'pbrMetallicRoughness': {'baseColorFactor': [0.35, 0.4, 0.45, 1], 'metallicFactor': 0.7, 'roughnessFactor': 0.34}},
        {'name': 'Engine fans', 'pbrMetallicRoughness': {'baseColorFactor': [0.065, 0.075, 0.087, 1], 'metallicFactor': 0.6, 'roughnessFactor': 0.4}},
    ]
    gltf = {'asset': {'version': '2.0', 'generator': 'Nabla local CAD conversion / VTK'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': 'Boeing CAD assembly'}], 'meshes': [{'primitives': []}], 'materials': materials, 'buffers': [], 'bufferViews': [], 'accessors': []}
    binary = bytearray()

    def accessor(data, kind, component_type, bounds=False):
        while len(binary) % 4:
            binary.extend(b'\0')
        payload = data.tobytes()
        view = len(gltf['bufferViews'])
        gltf['bufferViews'].append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(payload)})
        binary.extend(payload)
        item = {'bufferView': view, 'componentType': component_type, 'count': len(data), 'type': kind}
        if bounds:
            item.update({'min': data.min(axis=0).tolist(), 'max': data.max(axis=0).tolist()})
        index = len(gltf['accessors'])
        gltf['accessors'].append(item)
        return index

    budget = [55000, 18000, 28000, 11000]
    triangle_count = 0
    for category in range(4):
        group = triangles[category_for_face == category]
        if len(group) == 0:
            continue
        ids, inverse = np.unique(group, return_inverse=True)
        mesh = polydata(vertices[ids].astype(np.float32), inverse.reshape(-1, 3))
        decimator = vtkQuadricDecimation()
        decimator.SetInputData(mesh)
        decimator.SetTargetReduction(max(0, 1 - budget[category] / len(group)))
        decimator.VolumePreservationOn()
        decimator.Update()
        normals = vtkPolyDataNormals()
        normals.SetInputConnection(decimator.GetOutputPort())
        normals.SetFeatureAngle(45)
        normals.SplittingOn()
        normals.ConsistencyOn()
        normals.ComputePointNormalsOn()
        normals.ComputeCellNormalsOff()
        normals.Update()
        result = normals.GetOutput()
        positions = vtk_to_numpy(result.GetPoints().GetData()).astype('<f4')
        normal_values = vtk_to_numpy(result.GetPointData().GetNormals()).astype('<f4')
        indices = vtk_to_numpy(result.GetPolys().GetConnectivityArray())
        index_type = '<u2' if len(positions) <= 65535 else '<u4'
        gltf['meshes'][0]['primitives'].append({'attributes': {'POSITION': accessor(positions, 'VEC3', 5126, True), 'NORMAL': accessor(normal_values, 'VEC3', 5126)}, 'indices': accessor(indices.astype(index_type), 'SCALAR', 5123 if index_type == '<u2' else 5125), 'material': category})
        triangle_count += len(indices) // 3
        print(materials[category]['name'], len(group), '->', len(indices) // 3, 'triangles', flush=True)

    while len(binary) % 4:
        binary.extend(b'\0')
    gltf['buffers'] = [{'byteLength': len(binary)}]
    encoded = json.dumps(gltf, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 4)
    total = 12 + 8 + len(encoded) + 8 + len(binary)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open('wb') as output:
        output.write(struct.pack('<III', 0x46546C67, 2, total))
        output.write(struct.pack('<II', len(encoded), 0x4E4F534A))
        output.write(encoded)
        output.write(struct.pack('<II', len(binary), 0x004E4942))
        output.write(binary)
    print(json.dumps({'output': str(destination), 'bytes': total, 'triangles': triangle_count, 'bounds': [vertices.min(0).tolist(), vertices.max(0).tolist()], 'originalTriangles': original.GetNumberOfPolys(), 'originalBounds': original.GetBounds()}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE)
    parser.add_argument('--output', type=Path, default=DESTINATION)
    args = parser.parse_args()
    convert(args.source, args.output)
