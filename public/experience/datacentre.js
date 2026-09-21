import { mergeGeometries } from "./vendor/utils/BufferGeometryUtils.js";
import { createDataCentreMaterials } from "./datacentre-materials.js";

/**
 * A compact, open service-aisle exhibit. Dimensions are display units rather than
 * engineering specifications. The pipework is illustrative, not simulation data.
 * All static geometry is batched by material, with normal and UV data preserved.
 */
export function createDataCentre(THREE) {
  const root = new THREE.Group();
  root.name = "Data centre cooling — service aisle cutaway";
  const m = createDataCentreMaterials(THREE);
  const sourceGeometries = new Set();
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitPlane = new THREE.PlaneGeometry(1, 1);
  sourceGeometries.add(unitBox);
  sourceGeometries.add(unitPlane);

  function mesh(parent, geometry, material, position = [0, 0, 0]) {
    sourceGeometries.add(geometry);
    const part = new THREE.Mesh(geometry, material);
    part.position.set(...position);
    parent.add(part);
    return part;
  }

  function box(parent, size, position, material = m.frame) {
    const part = mesh(parent, unitBox, material, position);
    part.scale.set(...size);
    return part;
  }

  function plane(parent, width, height, position, material) {
    const part = mesh(parent, unitPlane, material, position);
    part.scale.set(width, height, 1);
    return part;
  }

  function rod(parent, a, b, radius, material = m.steel, segments = 8) {
    const start = new THREE.Vector3(...a);
    const end = new THREE.Vector3(...b);
    const direction = end.clone().sub(start);
    const part = mesh(parent, new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material,
      start.clone().add(end).multiplyScalar(0.5).toArray());
    part.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return part;
  }

  // Compact bent tubing: straight runs joined by local radiused elbows. Unlike a
  // Catmull-Rom spline this does not turn a pipe manifold into a sweeping loop.
  function pipe(parent, points, radius, material = m.steel, bend = 0.1) {
    const curve = new THREE.CurvePath();
    const vectors = points.map(p => new THREE.Vector3(...p));
    let cursor = vectors[0];
    for (let i = 1; i < vectors.length - 1; i++) {
      const before = vectors[i - 1];
      const corner = vectors[i];
      const after = vectors[i + 1];
      const distance = Math.min(bend, before.distanceTo(corner) * 0.35, after.distanceTo(corner) * 0.35);
      const entry = corner.clone().add(before.clone().sub(corner).normalize().multiplyScalar(distance));
      const exit = corner.clone().add(after.clone().sub(corner).normalize().multiplyScalar(distance));
      curve.add(new THREE.LineCurve3(cursor, entry));
      curve.add(new THREE.QuadraticBezierCurve3(entry, corner, exit));
      cursor = exit;
    }
    curve.add(new THREE.LineCurve3(cursor, vectors[vectors.length - 1]));
    return mesh(parent, new THREE.TubeGeometry(curve, Math.max(12, points.length * 6), radius, radius < 0.03 ? 6 : 10, false), material);
  }

  function collar(parent, centre, axis, radius, material, width = 0.055) {
    const direction = new THREE.Vector3(...axis).normalize().multiplyScalar(width * 0.5);
    const point = new THREE.Vector3(...centre);
    rod(parent, point.clone().sub(direction).toArray(), point.clone().add(direction).toArray(), radius, material, 12);
  }

  function screw(parent, x, y, z) {
    rod(parent, [x, y, z - 0.004], [x, y, z + 0.004], 0.008, m.steel, 6);
  }

  // A thin tiled plinth makes the floor construction legible without enclosing
  // the exhibit in a room or adding a broad white stage behind the equipment.
  for (let ix = 0; ix < 10; ix++) {
    for (let iz = 0; iz < 7; iz++) {
      box(root, [0.988, 0.065, 0.926], [-4.5 + ix, 0.06, -2.82 + iz * 0.94], m.floor);
    }
  }
  box(root, [10, 0.025, 0.018], [0, 0.043, 3.294], m.aluminium);
  box(root, [0.018, 0.025, 6.58], [4.997, 0.043, 0], m.aluminium);

  function rack(x, z, index, openDoor = false) {
    const cabinet = new THREE.Group();
    cabinet.name = `Server rack ${index + 1}`;
    cabinet.position.set(x, 0.135, z);
    root.add(cabinet);

    // Powder-coated sheet panels and an inset skeletal frame, with realistic
    // vertical proportions and a small reveal around every removable panel.
    box(cabinet, [1.16, 0.09, 1.72], [0, 0.12, 0], m.frame);
    box(cabinet, [1.16, 0.045, 1.72], [0, 3.68, 0], m.cabinet);
    box(cabinet, [1.10, 0.035, 1.66], [0, 0.205, 0], m.cabinet);
    [-1, 1].forEach(side => {
      box(cabinet, [0.035, 3.42, 1.61], [side * 0.557, 1.94, -0.018], m.cabinet);
      [-0.81, 0.81].forEach(depth => {
        box(cabinet, [0.058, 3.55, 0.061], [side * 0.532, 1.9, depth], m.frame);
        rod(cabinet, [side * 0.43, 0.002, depth * 0.88], [side * 0.43, 0.12, depth * 0.88], 0.037, m.steel);
        collar(cabinet, [side * 0.43, 0.005, depth * 0.88], [0, 1, 0], 0.06, m.rubber, 0.025);
      });
      box(cabinet, [0.038, 3.13, 0.036], [side * 0.479, 1.91, 0.736], m.aluminium);
      // Side-panel retaining fasteners, visible in the three-quarter view.
      [0.39, 3.42].forEach(y => {
        const fastener = rod(cabinet, [side * 0.577, y, -0.57], [side * 0.583, y, -0.57], 0.012, m.frame, 8);
        fastener.name = "Side panel captive screw";
      });
    });
    box(cabinet, [1.08, 3.37, 0.035], [0, 1.94, -0.812], m.cabinet);
    box(cabinet, [1.045, 0.20, 0.045], [0, 3.525, 0.802], m.frame);
    box(cabinet, [0.64, 0.018, 0.028], [0, 3.58, 0.83], m.aluminium);

    // A varied bank of 2U sleds. The textured front faces carry fine drive and
    // ventilation detail; independent edges, rails and handles give real depth.
    for (let unit = 0; unit < 16; unit++) {
      const y = 0.405 + unit * 0.19;
      box(cabinet, [0.924, 0.171, 1.43], [0, y, -0.02], unit % 5 === 0 ? m.aluminium : m.frame);
      box(cabinet, [0.961, 0.178, 0.023], [0, y, 0.711], m.frame);
      plane(cabinet, 0.914, 0.162, [0, y, 0.726], m.serverFace);
      [-1, 1].forEach(side => {
        box(cabinet, [0.033, 0.149, 0.026], [side * 0.449, y, 0.744], m.aluminium);
        rod(cabinet, [side * 0.427, y - 0.042, 0.779], [side * 0.427, y + 0.042, 0.779], 0.008, m.frame, 6);
        [y - 0.049, y + 0.049].forEach(sy => screw(cabinet, side * 0.48, sy, 0.76));
      });
      // Quiet physical status indicators, not oversized glowing strips.
      box(cabinet, [0.009, 0.009, 0.005], [0.381, y + 0.038, 0.743], unit % 7 === 0 ? m.ledBlue : m.ledGreen);
      if (unit % 4 === 1) {
        box(cabinet, [0.009, 0.009, 0.005], [0.363, y + 0.038, 0.743], m.ledGreen);
      }
    }

    const door = new THREE.Group();
    door.name = openDoor ? "Ajar perforated rack door" : "Perforated rack door";
    door.position.set(-0.516, 0, 0.864);
    // Opening toward the viewer reveals server depth without turning the rack
    // into an exploded diagram. This door stays within the floor footprint.
    if (openDoor) door.rotation.y = -Math.PI / 6;
    cabinet.add(door);
    plane(door, 0.955, 3.205, [0.516, 1.895, 0.014], m.door);
    [0.01, 1.022].forEach(dx => box(door, [0.037, 3.38, 0.038], [dx, 1.895, 0.015], m.frame));
    [0.222, 3.565].forEach(y => box(door, [1.047, 0.045, 0.038], [0.516, y, 0.015], m.frame));
    box(door, [0.024, 0.235, 0.021], [0.91, 1.83, 0.044], m.cabinet);
    rod(door, [0.91, 1.74, 0.077], [0.91, 1.92, 0.077], 0.014, m.rubber, 8);
    [0.47, 1.85, 3.21].forEach(y => collar(door, [0.004, y, 0.021], [0, 1, 0], 0.025, m.aluminium, 0.108));

    // Low-profile roof fans and a cable gland add useful silhouette detail.
    [-0.40, 0.12].forEach(depth => {
      box(cabinet, [0.66, 0.022, 0.40], [0, 3.714, depth], m.frame);
      for (let slot = 0; slot < 8; slot++) box(cabinet, [0.50, 0.008, 0.012], [0, 3.73, depth - 0.14 + slot * 0.04], m.aluminium);
    });
    box(cabinet, [0.24, 0.055, 0.11], [0.30, 3.736, -0.62], m.rubber);
    return cabinet;
  }

  const frontX = [-3.15, -1.91, -0.67, 0.57];
  const rearX = [-2.53, -1.29, -0.05, 1.19];
  frontX.forEach((x, i) => rack(x, 1.49, i, i === 3));
  rearX.forEach((x, i) => rack(x, -1.36, i + 4));

  // Two wire-basket cable trays with actual open rungs and a few restrained
  // dark cable bundles. No solid overhead lid or room backdrop hides the racks.
  function cableTray(x0, x1, z) {
    const y = 4.255;
    [-0.235, 0.235].forEach(dz => {
      rod(root, [x0, y, z + dz], [x1, y, z + dz], 0.014);
      rod(root, [x0, y + 0.17, z + dz], [x1, y + 0.17, z + dz], 0.014);
    });
    for (let x = x0; x <= x1 + 0.01; x += 0.24) {
      rod(root, [x, y, z - 0.235], [x, y, z + 0.235], 0.010, m.steel, 6);
      [-1, 1].forEach(side => rod(root, [x, y, z + side * 0.235], [x, y + 0.17, z + side * 0.235], 0.010, m.steel, 6));
    }
    [-0.14, -0.04, 0.065, 0.155].forEach((offset, i) => {
      pipe(root, [[x0 + 0.05, y + 0.027, z + offset], [x1 - 0.2, y + 0.027, z + offset], [x1 + 0.04, y - 0.14, z + offset], [x1 + 0.04, 3.68, z + offset]], 0.018 + (i % 2) * 0.005, m.rubber, 0.11);
    });
    [x0 + 0.45, x1 - 0.45].forEach(x => {
      box(root, [0.055, 0.04, 0.62], [x, y - 0.035, z], m.steel);
      [-0.25, 0.25].forEach(dz => rod(root, [x, 3.82, z + dz], [x, y - 0.03, z + dz], 0.014, m.steel));
    });
  }
  cableTray(-3.63, 1.17, 1.33);
  cableTray(-3.01, 1.79, -1.52);

  // Supply/return headers run through the service aisle. Colour is confined to
  // identification bands and valve handles; the actual plumbing is steel.
  const lines = [
    { z: -0.145, y: 4.035, x: 3.36, color: m.pipeSupply },
    { z: 0.145, y: 4.035, x: 3.63, color: m.pipeReturn },
  ];
  lines.forEach((line, lineIndex) => {
    pipe(root, [[-3.76, line.y, line.z], [line.x, line.y, line.z], [line.x, 3.18, line.z], [line.x, 3.18, 0.66]], 0.054, m.steel, 0.13);
    [-3.50, -1.1, 1.2, 2.86].forEach(x => {
      collar(root, [x, line.y, line.z], [1, 0, 0], 0.067, m.aluminium, 0.062);
      collar(root, [x + 0.085, line.y, line.z], [1, 0, 0], 0.058, line.color, 0.065);
    });
    // A real end cap rather than a pipe that mysteriously disappears into space.
    collar(root, [-3.758, line.y, line.z], [1, 0, 0], 0.061, m.steel, 0.035);
    [frontX, rearX].forEach((positions, rowIndex) => {
      const manifoldZ = rowIndex === 0 ? 0.526 : -2.328;
      positions.forEach((rackX, index) => {
        const x = rackX + (lineIndex === 0 ? 0.29 : 0.43);
        const topY = rowIndex === 0 ? 3.98 : 4.09;
        pipe(root, [[x, line.y, line.z], [x, topY, line.z], [x, topY, manifoldZ], [x, 0.51, manifoldZ]], 0.027, m.steel, 0.095);
        [0.79, 2.04, 3.36].forEach(y => {
          collar(root, [x, y, manifoldZ], [0, 1, 0], 0.042, m.frame, 0.045);
          box(root, [0.10, 0.024, 0.10], [x, y, manifoldZ + 0.045], m.aluminium);
        });
        collar(root, [x, 3.60, manifoldZ], [0, 1, 0], 0.034, line.color, 0.095);
        // Short braided-style hoses connect the vertical manifold to the rack,
        // with steel quick-connect ends and small identification collars.
        [0.92, 1.68, 2.44, 3.18].forEach((y, hoseIndex) => {
          const destinationX = rackX - 0.10 + lineIndex * 0.15;
          const rackRear = rowIndex === 0 ? 0.65 : -2.18;
          pipe(root, [[x, y, manifoldZ], [x + 0.07, y, manifoldZ - 0.04], [destinationX, y - 0.08, manifoldZ - 0.055], [destinationX, y - 0.08, rackRear]], 0.020, m.rubber, 0.10);
          collar(root, [x, y, manifoldZ], [1, 0, 0], 0.032, m.steel, 0.07);
          collar(root, [destinationX, y - 0.08, rackRear - 0.026], [0, 0, 1], 0.029, line.color, 0.04);
          // Offsets are deterministic to avoid render-to-render variation.
          if ((index + hoseIndex) % 3 === 0) box(root, [0.07, 0.016, 0.016], [x, y + 0.06, manifoldZ - 0.016], line.color);
        });
      });
    });
  });
  [-3.65, -0.30, 2.24].forEach(x => {
    box(root, [0.045, 0.04, 0.48], [x, 3.943, 0], m.steel);
    // Compact brackets fixed to the adjacent rack roofs.
    box(root, [0.045, 0.23, 0.06], [x, 3.84, 0.215], m.steel);
  });

  function cdu() {
    const unit = new THREE.Group();
    unit.name = "Coolant distribution unit with service cutaway";
    unit.position.set(3.30, 0.135, 1.00);
    root.add(unit);
    const width = 1.38;
    const height = 3.23;
    const depth = 1.45;
    box(unit, [width, 0.14, depth], [0, 0.11, 0], m.frame);
    box(unit, [width, 0.04, depth], [0, height, 0], m.aluminium);
    box(unit, [0.035, height - 0.2, depth - 0.04], [-width * 0.5 + 0.018, height * 0.5 + 0.05, 0], m.cabinet);
    box(unit, [width - 0.05, height - 0.22, 0.045], [0, height * 0.5 + 0.05, -depth * 0.5], m.aluminium);
    [-1, 1].forEach(sx => {
      [-1, 1].forEach(sz => {
        box(unit, [0.055, height, 0.055], [sx * (width * 0.5 - 0.035), height * 0.5, sz * (depth * 0.5 - 0.035)], m.frame);
        collar(unit, [sx * 0.52, 0.015, sz * 0.56], [0, 1, 0], 0.059, m.rubber, 0.03);
      });
    });
    box(unit, [1.235, 2.92, 0.03], [0, 1.72, 0.717], m.aluminium);
    plane(unit, 1.212, 2.88, [0, 1.72, 0.735], m.cduFace);
    // A thin physical bezel surrounds the HMI already painted on cduFace;
    // leaving the aperture open preserves its authored diagram and label.
    [-1, 1].forEach(side => {
      box(unit, [0.790, 0.016, 0.016], [-0.05, 2.666 + side * 0.212, 0.746], m.frame);
      box(unit, [0.016, 0.408, 0.016], [-0.05 + side * 0.387, 2.666, 0.746], m.frame);
    });
    rod(unit, [0.518, 1.45, 0.778], [0.518, 1.82, 0.778], 0.012, m.frame);
    box(unit, [0.024, 0.49, 0.022], [0.518, 1.635, 0.754], m.frame);
    [0.42, 2.0, 2.94].forEach(y => collar(unit, [-0.610, y, 0.736], [0, 1, 0], 0.018, m.steel, 0.09));

    // Open right-hand service panel: paired compact pump assemblies, a plate
    // heat exchanger, filter and visible shut-off valves within the cabinet.
    box(unit, [1.22, 0.055, 1.23], [0, 0.37, -0.015], m.aluminium);
    box(unit, [0.44, 1.40, 0.57], [-0.24, 1.14, -0.21], m.steel);
    for (let plate = 0; plate < 16; plate++) {
      box(unit, [0.016, 1.39, 0.595], [-0.438 + plate * 0.026, 1.14, -0.21], m.aluminium);
    }
    [-0.28, 0.33].forEach((z, index) => {
      rod(unit, [0.39, 0.65, z - 0.17], [0.39, 0.65, z + 0.17], 0.15, m.frame, 16);
      collar(unit, [0.39, 0.65, z + 0.187], [0, 0, 1], 0.125, m.steel, 0.065);
      box(unit, [0.33, 0.05, 0.42], [0.39, 0.44, z], m.frame);
      pipe(unit, [[0.39, 0.68, z], [0.39, 1.02, z], [0.48, 1.02, z], [0.48, 2.93, z]], 0.042, m.steel, 0.08);
      collar(unit, [0.48, 1.72, z], [0, 1, 0], 0.07, m.steel, 0.12);
      box(unit, [0.025, 0.022, 0.17], [0.48, 1.80, z + 0.04], index ? m.pipeReturn : m.pipeSupply);
      collar(unit, [0.48, 2.47, z], [0, 1, 0], 0.047, index ? m.pipeReturn : m.pipeSupply, 0.10);
      pipe(unit, [[0.48, 2.94, z], [0.48, 3.30, z], [0.06 + index * 0.27, 3.30, z], [0.06 + index * 0.27, 3.04, -0.34]], 0.042, m.steel, 0.075);
    });
    rod(unit, [0.37, 1.37, -0.33], [0.37, 1.90, -0.33], 0.089, m.aluminium, 16);
    [1.35, 1.92].forEach(y => collar(unit, [0.37, y, -0.33], [0, 1, 0], 0.105, m.steel, 0.045));
    // Two horizontal safety rails preserve the enclosure outline around the
    // service opening while leaving the internal cooling equipment readable.
    [0.26, 2.13].forEach(y => box(unit, [0.037, 0.037, 1.41], [0.684, y, 0], m.frame));
    for (let vent = 0; vent < 9; vent++) box(unit, [0.45, 0.014, 0.042], [0.22, 3.264, -0.43 + vent * 0.093], m.frame);
  }
  cdu();

  // Bake transforms once. Batching keeps the exhibit inexpensive to render
  // while retaining UVs used by the perforated doors and detailed face maps.
  root.updateMatrixWorld(true);
  const buckets = new Map();
  root.traverse(object => {
    if (!object.isMesh) return;
    const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    if (!buckets.has(object.material)) buckets.set(object.material, []);
    buckets.get(object.material).push(geometry);
  });
  root.clear();
  for (const [material, geometries] of buckets) {
    const geometry = mergeGeometries(geometries, false);
    geometries.forEach(part => part.dispose());
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const batched = new THREE.Mesh(geometry, material);
    const key = Object.keys(m).find(name => m[name] === material) || "detail";
    batched.name = `Data centre ${key}`;
    batched.castShadow = key !== "ledGreen" && key !== "ledBlue" && key !== "screen";
    batched.receiveShadow = true;
    root.add(batched);
  }
  sourceGeometries.forEach(geometry => geometry.dispose());
  root.userData.prebatched = true;
  return root;
}
