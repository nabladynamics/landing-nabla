import { createDataCentre } from './datacentre.js';
import { createEngineeringStudio } from './engineering-studio.js';
import { buildFlowPaths } from './flow-paths.js';
import { createFlowVisual } from './flow-visual.js';
import { createDataCentreThermal } from './datacentre-thermal.js';

/**
 * Procedural exhibit models for the spatial experience. No external assets.
 *
 * createWorld(THREE) -> { group, stations, animate(timeInSeconds) }
 * All stations face local -X, with a clear presentation side toward +Z.
 * Positions are world-space exhibit centres, on a floor at Y=0.
 * Each station also exposes its local group, focus target and bounding size.
 */
export function createWorld(THREE, { cadStations = [] } = {}) {
  const world = new THREE.Group();
  world.name = "Nabla exhibition models";
  const movingDetails = [];
  const flowingDetails = [];
  const flowExhibits = [];
  const materials = {
    pearl: new THREE.MeshStandardMaterial({ color: 0xf4f5f1, roughness: 0.35, metalness: 0.16 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.04 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xaab9c3, roughness: 0.32, metalness: 0.65 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x243948, roughness: 0.62, metalness: 0.2 }),
    navy: new THREE.MeshStandardMaterial({ color: 0x21475e, roughness: 0.28, metalness: 0.38 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x427c96, roughness: 0.18, metalness: 0.46 }),
    paleBlue: new THREE.MeshStandardMaterial({ color: 0xc6e0e7, roughness: 0.42, metalness: 0.12 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x263138, roughness: 0.9 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xd87942, roughness: 0.34, metalness: 0.55 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xef8b4b, roughness: 0.43, metalness: 0.08 }),
    blueLight: new THREE.MeshBasicMaterial({ color: 0x80d6e8 }),
    orangeLight: new THREE.MeshBasicMaterial({ color: 0xf1a064 }),
    screen: new THREE.MeshBasicMaterial({ color: 0xdbeef2 }),
    flow: new THREE.MeshBasicMaterial({ color: 0x7eb1c2, transparent: true, opacity: 0.46, depthWrite: false }),
    flowAccent: new THREE.MeshBasicMaterial({ color: 0xe6a06f, transparent: true, opacity: 0.56, depthWrite: false }),
    water: new THREE.MeshStandardMaterial({ color: 0xc6e1e8, roughness: 0.27, metalness: 0.15, transparent: true, opacity: 0.55, depthWrite: false }),
  };

  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitSphere = new THREE.SphereGeometry(1, 16, 10);
  const pointGeometry = new THREE.SphereGeometry(0.035, 8, 6);

  function mesh(geometry, material, parent, position = [0, 0, 0]) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function box(parent, size, position, material = materials.pearl) {
    const object = mesh(unitBox, material, parent, position);
    object.scale.set(...size);
    return object;
  }

  function ellipsoid(parent, size, position, material = materials.pearl) {
    const object = mesh(unitSphere, material, parent, position);
    object.scale.set(...size);
    return object;
  }

  function cylinder(parent, radius, height, position, material = materials.silver, segments = 16) {
    return mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material, parent, position);
  }

  function rod(parent, start, end, radius = 0.028, material = materials.silver) {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const object = cylinder(parent, radius, direction.length(), a.clone().add(b).multiplyScalar(0.5).toArray(), material, 8);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return object;
  }

  function sideProfile(parent, points, thickness, material, position = [0, 0, 0], bevel = 0) {
    const shape = new THREE.Shape();
    points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: bevel > 0,
      bevelSegments: 2,
      bevelSize: bevel,
      bevelThickness: bevel,
      steps: 1,
      curveSegments: 12,
    });
    geometry.translate(0, 0, -thickness / 2);
    return mesh(geometry, material, parent, position);
  }

  function planProfile(parent, points, thickness, material, y, bevel = 0) {
    const shape = new THREE.Shape();
    points.forEach(([x, z], i) => i ? shape.lineTo(x, -z) : shape.moveTo(x, -z));
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: bevel > 0,
      bevelSegments: 2,
      bevelSize: bevel,
      bevelThickness: bevel,
      steps: 1,
      curveSegments: 12,
    });
    geometry.rotateX(-Math.PI / 2);
    return mesh(geometry, material, parent, [0, y - thickness / 2, 0]);
  }

  function tube(parent, points, radius, material, segments = 48, radialSegments = 6) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, "centripetal");
    const object = mesh(new THREE.TubeGeometry(curve, segments, radius, radialSegments, false), material, parent);
    return { object, curve };
  }

  function flow(parent, points, accent = false, phase = 0) {
    const { object, curve } = tube(parent, points, accent ? 0.015 : 0.013, accent ? materials.flowAccent : materials.flow, 52, 4);
    object.castShadow = false;
    object.receiveShadow = false;
    const particle = mesh(pointGeometry, accent ? materials.orangeLight : materials.blueLight, parent);
    particle.castShadow = false;
    flowingDetails.push({ particle, curve, phase });
    return curve;
  }

  function flowAround(parent, height, halfWidth, lift, length = 7) {
    [-1, 1].forEach(side => {
      [0, 0.65, 1.3].forEach((offset, index) => {
        const z = side * (halfWidth + offset);
        flow(parent, [
          [-length, height, z * 0.82],
          [-length * 0.56, height + lift * 0.5, z],
          [0, height + lift, z * 1.07],
          [length * 0.65, height + lift * 0.35, z],
          [length, height, z * 0.87],
        ], index === 0 && side === 1, index / 3 + (side + 1) / 8);
      });
    });
  }

  function aircraft() {
    const group = new THREE.Group();
    group.name = "Aircraft";
    const bodyProfile = [[0, -5.8], [0.22, -5.65], [0.53, -5.02], [0.67, -4.1], [0.69, -2.8], [0.66, 2.85], [0.49, 4.3], [0.22, 5.25], [0.025, 5.75]];
    const body = mesh(new THREE.LatheGeometry(bodyProfile.map(p => new THREE.Vector2(...p)), 28), materials.pearl, group, [0, 2.14, 0]);
    body.rotation.z = -Math.PI / 2;
    ellipsoid(group, [0.79, 0.23, 0.55], [-4.66, 2.54, 0], materials.glass);

    [-1, 1].forEach(side => {
      planProfile(group, [[-1.18, side * 0.53], [1.65, side * 4.36], [2.35, side * 4.42], [1.7, side * 0.53]], 0.1, materials.pearl, 2.03, 0.045);
      planProfile(group, [[0.12, side * 1.7], [1.97, side * 4.22], [2.17, side * 4.2], [0.54, side * 1.7]], 0.018, materials.silver, 2.105);
      sideProfile(group, [[1.65, 2.09], [2.33, 2.09], [2.63, 2.98], [2.22, 2.91]], 0.065, materials.pearl, [0, 0, side * 4.39]);
      sideProfile(group, [[2.25, 2.78], [2.6, 2.84], [2.63, 2.98], [2.22, 2.91]], 0.085, materials.orange, [0, 0, side * 4.39]);
      planProfile(group, [[3.67, side * 0.35], [4.85, side * 2.08], [5.53, side * 2.08], [5.12, side * 0.25]], 0.075, materials.pearl, 2.34, 0.025);

      // A continuous row of quiet blue cabin windows.
      for (let i = 0; i < 15; i++) {
        const x = -3.52 + i * 0.45;
        ellipsoid(group, [0.075, 0.11, 0.023], [x, 2.4, side * (x > 2.5 ? 0.59 : 0.64)], materials.glass);
      }

      const engine = new THREE.Group();
      engine.position.set(-0.07, 1.39, side * 1.71);
      group.add(engine);
      const nacelle = mesh(new THREE.LatheGeometry([[0.3, -1.0], [0.46, -0.9], [0.49, -0.55], [0.47, 0.58], [0.31, 1.0]].map(p => new THREE.Vector2(...p)), 24), materials.pearl, engine);
      nacelle.rotation.z = -Math.PI / 2;
      const intake = mesh(new THREE.CircleGeometry(0.365, 24), materials.dark, engine, [-0.96, 0, 0]);
      intake.rotation.y = -Math.PI / 2;
      const rim = mesh(new THREE.TorusGeometry(0.365, 0.042, 8, 24), materials.silver, engine, [-0.98, 0, 0]);
      rim.rotation.y = Math.PI / 2;
      const fan = new THREE.Group();
      fan.position.x = -1.015;
      engine.add(fan);
      for (let i = 0; i < 9; i++) {
        const angle = i * Math.PI * 2 / 9;
        const blade = box(fan, [0.018, 0.18, 0.065], [0, Math.cos(angle) * 0.21, Math.sin(angle) * 0.21], materials.silver);
        blade.rotation.x = angle + 0.36;
      }
      ellipsoid(fan, [0.14, 0.11, 0.11], [-0.015, 0, 0], materials.silver);
      movingDetails.push({ object: fan, axis: "x", speed: 0.75 });
      box(group, [0.86, 0.43, 0.115], [0.32, 1.8, side * 1.71], materials.pearl);
    });

    sideProfile(group, [[3.37, 2.55], [4.69, 4.6], [5.24, 4.57], [5.31, 2.36]], 0.12, materials.pearl, [0, 0, 0], 0.02);
    sideProfile(group, [[4.5, 4.27], [4.69, 4.6], [5.24, 4.57], [5.25, 4.23]], 0.19, materials.orange);
    [[-3.75, 0], [1.45, -0.89], [1.45, 0.89]].forEach(([x, z]) => {
      rod(group, [x, 0.49, z], [x + 0.1, 1.7, z], 0.06, materials.silver);
      [-1, 1].forEach(side => {
        const wheel = mesh(new THREE.TorusGeometry(0.19, 0.082, 8, 16), materials.rubber, group, [x, 0.3, z + side * 0.135]);
        wheel.scale.set(1, 1, 0.82);
        const hub = cylinder(group, 0.13, 0.075, [x, 0.3, z + side * 0.17], materials.silver, 12);
        hub.rotation.x = Math.PI / 2;
      });
    });
    flowAround(group, 1.06, 3.0, 0.36, 6.8);
    flow(group, [[-6.7, 2.85, 0.03], [-4.4, 3.12, 0.04], [-0.4, 3.38, 0.04], [3.2, 3.36, 0.05], [6.65, 3.13, 0.04]], false, 0.34);
    return group;
  }

  function vessel() {
    const group = new THREE.Group();
    group.name = "Marine vessel";
    const sections = [
      [-5.8, 0.02, 1.53], [-5.4, 0.48, 0.87], [-4.3, 1.13, 0.5],
      [-2.6, 1.53, 0.38], [0.1, 1.63, 0.36], [3.75, 1.61, 0.38], [5.0, 1.31, 0.6],
    ];
    const vertices = [];
    const indices = [];
    sections.forEach(([x, width, keel]) => {
      const crossSection = [[-1, 1.73], [-1, 1.23], [-0.82, keel + 0.18], [0, keel], [0.82, keel + 0.18], [1, 1.23], [1, 1.73]];
      crossSection.forEach(([z, y]) => vertices.push(x, y, z * width));
    });
    for (let section = 0; section < sections.length - 1; section++) {
      for (let edge = 0; edge < 6; edge++) {
        const a = section * 7 + edge;
        const b = a + 7;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const hullGeometry = new THREE.BufferGeometry();
    hullGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    hullGeometry.setIndex(indices);
    hullGeometry.computeVertexNormals();
    mesh(hullGeometry, materials.pearl, group);
    const deckPoints = sections.map(([x, width]) => [x, -width]).concat([...sections].reverse().map(([x, width]) => [x, width]));
    planProfile(group, deckPoints, 0.08, materials.pearl, 1.75);
    sideProfile(group, [[5.01, 0.6], [5.01, 1.74], [4.92, 1.74], [4.92, 0.6]], 2.61, materials.pearl);

    [-1, 1].forEach(side => {
      tube(group, sections.slice(1).map(([x, width]) => [x, 1.29, side * (width + 0.008)]), 0.065, materials.navy, 34, 6);
      const railPoints = sections.slice(1).map(([x, width]) => [x, 2.12, side * width * 0.94]);
      tube(group, railPoints, 0.024, materials.silver, 32, 6);
      sections.slice(1).forEach(([x, width]) => rod(group, [x, 1.77, side * width * 0.94], [x, 2.12, side * width * 0.94], 0.017));
    });

    sideProfile(group, [[-3.12, 1.81], [-2.48, 2.76], [2.54, 2.76], [3.48, 2.14], [3.8, 1.81]], 2.61, materials.pearl, [0, 0, 0], 0.035);
    sideProfile(group, [[-2.53, 2.2], [-2.24, 2.62], [2.38, 2.62], [2.99, 2.2]], 2.73, materials.glass);
    [-1, 1].forEach(side => {
      for (let x = -1.8; x < 2.5; x += 0.76) box(group, [0.055, 0.48, 0.04], [x, 2.41, side * 1.393], materials.pearl);
    });
    box(group, [5.85, 0.13, 2.95], [0.23, 2.85, 0], materials.pearl);
    sideProfile(group, [[-1.94, 2.94], [-1.36, 3.64], [1.1, 3.64], [1.42, 2.94]], 1.96, materials.pearl, [0, 0, 0], 0.03);
    sideProfile(group, [[-1.72, 3.2], [-1.31, 3.54], [1.06, 3.54], [1.22, 3.2]], 2.065, materials.glass);
    box(group, [3.35, 0.12, 2.28], [-0.18, 3.73, 0], materials.pearl);
    rod(group, [0.57, 3.79, 0], [0.57, 4.83, 0], 0.048);
    box(group, [1.08, 0.11, 0.14], [0.57, 4.62, 0], materials.pearl);
    ellipsoid(group, [0.22, 0.2, 0.22], [-0.44, 3.97, 0.58], materials.pearl);
    ellipsoid(group, [0.15, 0.17, 0.15], [0.57, 4.92, 0], materials.orange);
    box(group, [0.93, 0.33, 0.75], [3.75, 2.03, 0], materials.orange);
    const water = cylinder(group, 1, 0.055, [0, 0.2, 0], materials.water, 64);
    water.scale.set(6.5, 1, 2.9);
    water.castShadow = false;
    flowAround(group, 0.27, 1.95, 0.012, 6.7);
    return group;
  }

  function car() {
    const group = new THREE.Group();
    group.name = "Performance car";
    sideProfile(group, [[-4.09, 0.64], [-3.8, 0.98], [-2.45, 1.2], [-1.2, 1.3], [1.75, 1.31], [3.36, 1.19], [4.04, 0.94], [3.83, 0.51], [-3.61, 0.46]], 3.02, materials.pearl, [0, 0, 0], 0.16);
    sideProfile(group, [[-1.65, 1.3], [-0.35, 2.11], [1.46, 2.11], [2.63, 1.31]], 2.49, materials.pearl, [0, 0, 0], 0.09);
    [-1, 1].forEach(side => {
      sideProfile(group, [[-1.43, 1.39], [-0.29, 2.02], [1.41, 2.02], [2.34, 1.39]], 0.035, materials.glass, [0, 0, side * 1.342], 0.018);
      box(group, [0.075, 0.67, 0.052], [0.69, 1.69, side * 1.397], materials.dark);
      box(group, [5.55, 0.073, 0.065], [0.08, 0.57, side * 1.665], materials.copper);
      ellipsoid(group, [0.26, 0.12, 0.2], [-0.91, 1.45, side * 1.71], materials.pearl);
      box(group, [0.35, 0.032, 0.025], [0.95, 1.19, side * 1.69], materials.silver);

      [-2.6, 2.58].forEach(x => {
        const wheel = new THREE.Group();
        wheel.position.set(x, 0.7, side * 1.59);
        group.add(wheel);
        mesh(new THREE.TorusGeometry(0.48, 0.2, 10, 24), materials.rubber, wheel);
        const rim = cylinder(wheel, 0.454, 0.08, [0, 0, side * 0.19], materials.silver, 24);
        rim.rotation.x = Math.PI / 2;
        const inner = cylinder(wheel, 0.357, 0.09, [0, 0, side * 0.23], materials.dark, 24);
        inner.rotation.x = Math.PI / 2;
        for (let spoke = 0; spoke < 6; spoke++) {
          const angle = spoke * Math.PI / 3;
          const strut = box(wheel, [0.056, 0.38, 0.07], [Math.sin(angle) * 0.19, Math.cos(angle) * 0.19, side * 0.3], materials.silver);
          strut.rotation.z = -angle;
        }
        const hub = cylinder(wheel, 0.095, 0.09, [0, 0, side * 0.34], materials.silver, 12);
        hub.rotation.x = Math.PI / 2;
      });
      const headlight = box(group, [0.3, 0.055, 0.84], [-3.67, 1.08, side * 1.04], materials.blueLight);
      headlight.rotation.z = 0.14;
      box(group, [0.052, 0.062, 0.87], [3.91, 0.99, side * 1.04], materials.orangeLight);
    });
    // Glazing sits outside the cabin bevel instead of sharing its surface.
    const windshield = box(group, [1.42, 0.025, 2.36], [-1.066, 1.811, 0], materials.glass);
    windshield.rotation.z = Math.atan2(0.81, 1.3);
    const rearWindow = box(group, [1.23, 0.025, 2.36], [2.115, 1.813, 0], materials.glass);
    rearWindow.rotation.z = Math.atan2(-0.8, 1.17);
    box(group, [0.08, 0.17, 2.34], [-4.19, 0.66, 0], materials.navy);
    box(group, [0.06, 0.17, 2.35], [4.14, 0.65, 0], materials.dark);
    box(group, [1.88, 0.021, 1.82], [-2.45, 1.285, 0], materials.white);
    [-1, 1].forEach(side => box(group, [0.065, 0.33, 0.065], [3.13, 1.44, side * 1.13], materials.silver));
    box(group, [0.56, 0.065, 3.28], [3.13, 1.63, 0], materials.pearl);
    flowAround(group, 0.91, 2.25, 0.19, 5.75);
    [-0.7, 0.7].forEach((z, i) => flow(group, [[-5.6, 1.36, z], [-3.2, 1.56, z], [-0.2, 2.72, z], [2.2, 2.59, z], [5.7, 1.41, z]], i === 1, i * 0.4));
    return group;
  }

  function dataCentre() {
    return createDataCentre(THREE);
  }

  function laboratory() {
    return createEngineeringStudio(THREE);
  }

  const definitions = [
    { id: "aerospace", x: 0, targetY: 2.1, size: [14, 5.1, 10], build: aircraft },
    { id: "marine", x: 22, targetY: 2.0, size: [14, 5.1, 7], build: vessel },
    { id: "automotive", x: 44, targetY: 1.4, size: [12, 3.1, 8], build: car },
    { id: "cooling", x: 66, targetY: 2.25, size: [11, 4.9, 7], build: dataCentre },
    { id: "engineering", x: 88, targetY: 1.7, size: [12, 4, 7], build: laboratory },
  ];

  // Batch the many small architectural details into one static mesh per
  // material. Fans and flow markers retain their own transforms for animation.
  // This keeps the complete exhibition inexpensive to show in an overview.
  function batchStaticParts(group) {
    const dynamic = new Set([
      ...movingDetails.map(detail => detail.object),
      ...flowingDetails.map(detail => detail.particle),
    ]);
    const buckets = new Map();
    const originals = [];
    group.updateMatrixWorld(true);
    group.traverse(object => {
      if (!object.isMesh) return;
      let ancestor = object;
      while (ancestor && ancestor !== group) {
        if (dynamic.has(ancestor)) return;
        ancestor = ancestor.parent;
      }
      const geometry = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
      geometry.applyMatrix4(object.matrixWorld);
      const bucket = buckets.get(object.material) || [];
      bucket.push(geometry);
      buckets.set(object.material, bucket);
      originals.push(object);
    });
    originals.forEach(object => object.removeFromParent());
    buckets.forEach((parts, material) => {
      const length = parts.reduce((total, part) => total + part.attributes.position.array.length, 0);
      const positions = new Float32Array(length);
      const normals = new Float32Array(length);
      let offset = 0;
      parts.forEach(part => {
        positions.set(part.attributes.position.array, offset);
        normals.set(part.attributes.normal.array, offset);
        offset += part.attributes.position.array.length;
        part.dispose();
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
      const batched = mesh(geometry, material, group);
      batched.castShadow = !material.transparent;
      batched.name = `${group.name} · static details`;
    });
  }

  const stations = definitions.map(({ id, x, targetY, size, build }) => {
    const usesCAD = cadStations.includes(id);
    const group = usesCAD ? new THREE.Group() : build();
    const paths = usesCAD ? buildFlowPaths(id) : [];
    // Keep the fuselage clear in both aircraft views: a few body/wing paths
    // and the two tip wakes, without the overlapping bundle above the cabin.
    const exhibitPaths = id === 'aerospace'
      ? paths.filter((_, index) => [2, 5, 6, 7, 11, 14, 15, 16, 18, 20].includes(index))
      : paths;
    const flow = usesCAD ? createFlowVisual(THREE, exhibitPaths)
      : id === 'cooling' ? createDataCentreThermal(THREE) : null;
    if (usesCAD) {
      group.name = `${id} CAD exhibit`;
    }
    // Detailed exhibits preserve their texture UVs in their own material batches.
    if (!group.userData.prebatched) batchStaticParts(group);
    if (flow) {
      // Exhibit geometry and its illustrative flow stay independent.
      // Add after batching to retain the streamline shader's custom attributes.
      group.add(flow.group);
      flowExhibits.push({ flow, group, x, id });
    }
    group.position.x = x;
    world.add(group);
    return { id, group, position: [x, 0, 0], target: [x, targetY, 0], size, animated: Boolean(flow) };
  });

  function animate(timeInSeconds, focusX = 0, introAmount = 1) {
    movingDetails.forEach(({ object, axis, speed }) => { object.rotation[axis] = timeInSeconds * speed; });
    flowingDetails.forEach(({ particle, curve, phase }) => {
      const progress = ((timeInSeconds * 0.055 + phase) % 1 + 1) % 1;
      particle.position.copy(curve.getPointAt(progress));
      const fade = Math.min(progress * 12, (1 - progress) * 12, 1);
      particle.visible = fade > 0.05;
    });
    flowExhibits.forEach(({ flow, group, x, id }) => {
      const visibility = group.visible ? 1 - THREE.MathUtils.smoothstep(Math.abs(x - focusX), 8, 17) : 0;
      const strength = id === 'aerospace' ? THREE.MathUtils.lerp(0.75, 1, introAmount) : 1;
      flow.update(timeInSeconds, visibility * strength, id === 'aerospace' ? introAmount : 0);
    });
  }

  animate(0);
  return { group: world, stations, animate };
}
