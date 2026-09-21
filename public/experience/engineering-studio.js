import { mergeGeometries } from "./vendor/utils/BufferGeometryUtils.js";
import { createEngineeringMaterials } from "./engineering-materials.js";

/** A furnished design workspace; screen illustrations are not solver results. */
export function createEngineeringStudio(THREE) {
  const root = new THREE.Group();
  root.name = "Engineering studio — design and physical review";
  const m = createEngineeringMaterials(THREE);
  const originals = new Set();
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitPlane = new THREE.PlaneGeometry(1, 1);
  const unitSphere = new THREE.SphereGeometry(1, 24, 16);
  const up = new THREE.Vector3(0, 1, 0);

  function mesh(parent, geometry, material, position = [0, 0, 0]) {
    originals.add(geometry);
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...position);
    parent.add(object);
    return object;
  }
  function group(parent, position = [0, 0, 0], rotation = 0, name = "") {
    const object = new THREE.Group();
    object.name = name;
    object.position.set(...position);
    object.rotation.y = rotation;
    parent.add(object);
    return object;
  }
  function box(parent, size, position, material = m.black) {
    const object = mesh(parent, unitBox, material, position);
    object.scale.set(...size);
    return object;
  }
  function plane(parent, width, height, position, material) {
    const object = mesh(parent, unitPlane, material, position);
    object.scale.set(width, height, 1);
    return object;
  }
  function sphere(parent, size, position, material) {
    const object = mesh(parent, unitSphere, material, position);
    object.scale.set(...size);
    return object;
  }
  function cylinder(parent, radius, height, position, material, segments = 20, topRadius = radius) {
    return mesh(parent, new THREE.CylinderGeometry(topRadius, radius, height, segments), material, position);
  }
  function rod(parent, start, end, radius, material = m.aluminium, segments = 10) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
    const delta = b.clone().sub(a);
    const object = cylinder(parent, radius, delta.length(), a.add(b).multiplyScalar(0.5).toArray(), material, segments);
    object.quaternion.setFromUnitVectors(up, delta.normalize());
    return object;
  }
  function tube(parent, points, radius, material, segments = 32, radialSegments = 8, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), closed, "centripetal");
    return mesh(parent, new THREE.TubeGeometry(curve, segments, radius, radialSegments, closed), material);
  }

  // Rounded and softly bevelled plates, authored in XY with thickness in Z.
  // Explicit planar UVs preserve natural material proportions after batching.
  function panelGeometry(width, height, depth, radius = 0.05, bevel = 0.006) {
    const b = Math.min(bevel, depth * 0.22);
    const w = width - b * 2, h = height - b * 2;
    const r = Math.min(Math.max(radius - b, 0.002), w * 0.49, h * 0.49);
    const x = -w / 2, y = -h / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y); shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r); shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h); shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: depth - b * 2, bevelEnabled: b > 0, bevelSegments: 2,
      bevelSize: b, bevelThickness: b, steps: 1, curveSegments: 5,
    });
    geometry.translate(0, 0, -depth / 2 + b);
    const positions = geometry.getAttribute("position"), normals = geometry.getAttribute("normal"), uv = geometry.getAttribute("uv");
    for (let i = 0; i < positions.count; i++) {
      if (Math.abs(normals.getZ(i)) >= 0.6) uv.setXY(i, positions.getX(i) / width + 0.5, positions.getY(i) / height + 0.5);
      else uv.setXY(i, (positions.getX(i) + positions.getY(i)) / (width + height) + 0.5, positions.getZ(i) / depth + 0.5);
    }
    return geometry;
  }
  function panel(parent, width, height, depth, position, material, radius = 0.05, bevel = 0.006) {
    return mesh(parent, panelGeometry(width, height, depth, radius, bevel), material, position);
  }
  function horizontalPanel(parent, width, depth, thickness, position, material, radius = 0.05, bevel = 0.006) {
    const object = panel(parent, width, depth, thickness, position, material, radius, bevel);
    object.rotation.x = -Math.PI / 2;
    return object;
  }

  // One generous shared worktable, with a fine oak edge and a slender structural
  // underframe. The original continuous exhibition floor remains visible.
  const desktopY = 1.51, desktopThickness = 0.13;
  const desktopTop = desktopY + desktopThickness / 2;
  horizontalPanel(root, 8.8, 2.76, desktopThickness, [0, desktopY, -0.10], m.oak, 0.13, 0.015);
  horizontalPanel(root, 8.63, 2.60, 0.035, [0, 1.43, -0.10], m.oakEdge, 0.095, 0.006);
  box(root, [7.51, 0.10, 0.08], [0, 1.345, -0.92], m.black);
  box(root, [7.51, 0.10, 0.08], [0, 1.345, 0.72], m.black);
  [-3.62, 3.62].forEach(x => {
    box(root, [0.10, 0.12, 2.07], [x, 1.34, -0.10], m.black);
    [-1, 1].forEach(side => {
      const leg = panel(root, 0.105, 1.27, 0.105, [x + Math.sign(x) * 0.09, 0.68, -0.10 + side * 0.97], m.black, 0.018, 0.004);
      leg.rotation.z = -Math.sign(x) * 0.055;
      leg.rotation.x = side * 0.04;
      horizontalPanel(root, 0.16, 0.17, 0.022, [x + Math.sign(x) * 0.12, 0.041, -0.10 + side * 1.0], m.rubber, 0.025, 0.003);
    });
  });
  // Concealed cable trough and a single neat drop keep the workspace believable.
  box(root, [3.56, 0.14, 0.28], [-1.48, 1.27, -1.02], m.black);
  tube(root, [[-1.32, 1.54, -1.03], [-1.32, 1.35, -1.05], [-2.0, 1.26, -1.11], [-3.6, 1.25, -1.10], [-3.74, 0.25, -1.10], [-3.85, 0.025, -0.80]], 0.018, m.rubber, 40);

  // Dual articulated display arm, its hinges and cable paths remain visible as
  // the camera travels around the workspace.
  cylinder(root, 0.062, 0.90, [-1.46, 2.005, -1.09], m.aluminium, 20);
  horizontalPanel(root, 0.30, 0.22, 0.058, [-1.46, 1.61, -1.09], m.charcoal, 0.035);
  box(root, [0.14, 0.20, 0.16], [-1.46, 1.48, -1.18], m.charcoal);
  const displays = [
    { x: -2.55, y: 2.49, z: -0.65, width: 2.04, angle: -0.10, material: m.screenCAD },
    { x: -0.40, y: 2.52, z: -0.69, width: 1.97, angle: -0.18, material: m.screenFlow },
  ];
  displays.forEach(({ x, y, z, width, angle, material }, index) => {
    rod(root, [-1.46, 2.19 + index * 0.08, -1.09], [x + (index ? -0.30 : 0.28), 2.32, -0.98], 0.042, m.aluminium);
    rod(root, [x + (index ? -0.30 : 0.28), 2.32, -0.98], [x, y, z - 0.085], 0.044, m.aluminium);
    cylinder(root, 0.075, 0.095, [x + (index ? -0.30 : 0.28), 2.32, -0.98], m.charcoal, 20);
    const display = group(root, [x, y, z], angle, index ? "Flow review display" : "CAD review display");
    const height = width / 1.6;
    panel(display, width, height, 0.078, [0, 0, 0], m.charcoal, 0.032, 0.005);
    panel(display, width - 0.11, height - 0.10, 0.036, [0, 0.015, -0.047], m.black, 0.09, 0.007);
    plane(display, width - 0.065, height - 0.075, [0, 0.005, 0.041], material);
    box(display, [0.020, 0.004, 0.005], [width * 0.5 - 0.105, -height * 0.5 + 0.018, 0.044], m.led);
    // Rear cooling slots and VESA attachment—not a floating flat rectangle.
    for (let vent = 0; vent < 15; vent++) box(display, [0.012, 0.058, 0.008], [-0.30 + vent * 0.043, height * 0.5 - 0.15, -0.070], m.rubber);
    panel(display, 0.22, 0.23, 0.034, [0, 0, -0.075], m.aluminium, 0.02);
    tube(root, [[x, y - 0.13, z - 0.09], [x, 1.86, -0.98], [-1.46, 1.76, -1.08], [-1.46, 1.43, -1.09]], 0.012, m.rubber, 24, 6);
  });

  horizontalPanel(root, 2.83, 1.03, 0.012, [-1.59, 1.587, 0.54], m.leather, 0.105, 0.002);
  function keyboard() {
    const keys = group(root, [-1.94, 1.628, 0.48], -0.015, "Low profile keyboard");
    horizontalPanel(keys, 1.61, 0.57, 0.065, [0, 0, 0], m.aluminium, 0.048, 0.006);
    horizontalPanel(keys, 1.53, 0.50, 0.016, [0, 0.035, -0.007], m.black, 0.035, 0.002);
    const cap = panelGeometry(0.081, 0.073, 0.023, 0.01, 0.003);
    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 15; column++) {
        if (row === 4 && column > 2 && column < 10) continue;
        const key = mesh(keys, cap, m.charcoal, [-0.697 + column * 0.099, 0.059 - row * 0.0008, -0.198 + row * 0.097]);
        key.rotation.x = -Math.PI / 2;
      }
    }
    horizontalPanel(keys, 0.66, 0.073, 0.023, [-0.06, 0.056, 0.19], m.charcoal, 0.01, 0.003);
    box(keys, [0.006, 0.006, 0.008], [0.697, 0.055, -0.24], m.led);
  }
  keyboard();
  const mouse = group(root, [-0.64, 1.64, 0.58], -0.12, "Sculpted mouse");
  sphere(mouse, [0.112, 0.052, 0.18], [0, 0.018, 0], m.charcoal);
  tube(mouse, [[0, 0.067, -0.127], [0, 0.073, -0.055], [0, 0.071, 0.015]], 0.003, m.black, 12, 4);
  const wheel = cylinder(mouse, 0.024, 0.023, [0, 0.070, -0.057], m.aluminium, 14);
  wheel.rotation.z = Math.PI / 2;

  function chair(position, angle, name) {
    const seat = group(root, position, angle, name);
    cylinder(seat, 0.080, 0.30, [0, 0.25, 0], m.charcoal);
    cylinder(seat, 0.044, 0.42, [0, 0.53, 0], m.chrome);
    cylinder(seat, 0.068, 0.24, [0, 0.79, 0], m.charcoal);
    // Cast aluminium five-star base with individual twin-wheel swivel casters.
    for (let spoke = 0; spoke < 5; spoke++) {
      const a = spoke * Math.PI * 2 / 5 + 0.10;
      const direction = [Math.sin(a), Math.cos(a)];
      const points = [
        [direction[0] * 0.055, 0.275, direction[1] * 0.055],
        [direction[0] * 0.28, 0.225, direction[1] * 0.28],
        [direction[0] * 0.53, 0.145, direction[1] * 0.53],
        [direction[0] * 0.66, 0.125, direction[1] * 0.66],
      ];
      tube(seat, points, 0.037, m.aluminium, 16, 8);
      const caster = group(seat, [direction[0] * 0.66, 0.072, direction[1] * 0.66], a + 0.17);
      box(caster, [0.045, 0.055, 0.060], [0, 0.051, 0], m.charcoal);
      [-1, 1].forEach(side => {
        const tire = cylinder(caster, 0.068, 0.037, [side * 0.037, 0, 0], m.rubber, 18);
        tire.rotation.z = Math.PI / 2;
        const hub = cylinder(caster, 0.032, 0.040, [side * 0.041, 0, 0], m.charcoal, 12);
        hub.rotation.z = Math.PI / 2;
      });
    }
    horizontalPanel(seat, 0.58, 0.60, 0.115, [0, 0.848, 0.014], m.charcoal, 0.08, 0.016);
    horizontalPanel(seat, 1.095, 0.988, 0.077, [0, 0.91, 0.014], m.charcoal, 0.20, 0.014);
    horizontalPanel(seat, 1.075, 0.965, 0.142, [0, 0.984, -0.006], m.fabric, 0.215, 0.027);
    // The back is a real doubly-curved mesh surface, supported by a tubular
    // perimeter and a shaped rear spine. It is deliberately not a flat square.
    function backPoint(u, v) {
      const width = 0.91 + 0.13 * Math.sin(v * Math.PI * 0.8);
      return [u * width * 0.5, 1.16 + v * 1.16,
        0.44 + v * 0.16 - 0.13 * Math.sin(v * Math.PI) + 0.12 * (1 - u * u)];
    }
    const nx = 16, ny = 22, points = [], uvs = [], indices = [];
    for (let iy = 0; iy <= ny; iy++) {
      for (let ix = 0; ix <= nx; ix++) {
        const u = ix / nx, v = iy / ny;
        points.push(...backPoint(u * 2 - 1, v));
        uvs.push(u, v);
        if (ix < nx && iy < ny) {
          const i = iy * (nx + 1) + ix;
          indices.push(i, i + 1, i + nx + 1, i + 1, i + nx + 2, i + nx + 1);
        }
      }
    }
    const back = new THREE.BufferGeometry();
    back.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    back.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    back.setIndex(indices); back.computeVertexNormals();
    mesh(seat, back, m.mesh);
    const rim = [];
    for (let i = 0; i <= 12; i++) rim.push(backPoint(-1, i / 12));
    for (let i = 1; i <= 12; i++) rim.push(backPoint(-1 + 2 * i / 12, 1));
    for (let i = 1; i <= 12; i++) rim.push(backPoint(1, 1 - i / 12));
    for (let i = 1; i < 12; i++) rim.push(backPoint(1 - 2 * i / 12, 0));
    tube(seat, rim, 0.026, m.charcoal, 80, 8, true);
    tube(seat, [[0, 0.84, 0.15], [0, 0.96, 0.48], [0, 1.28, 0.61], [0, 1.68, 0.72]], 0.043, m.charcoal, 28, 10);
    tube(seat, [[-0.43, 1.49, 0.44], [-0.23, 1.49, 0.52], [0, 1.49, 0.55], [0.23, 1.49, 0.52], [0.43, 1.49, 0.44]], 0.025, m.charcoal, 24, 8);
    [-1, 1].forEach(side => {
      tube(seat, [[side * 0.37, 0.86, 0.12], [side * 0.57, 0.99, 0.13], [side * 0.61, 1.29, 0.14], [side * 0.60, 1.43, 0.06]], 0.025, m.aluminium, 24, 8);
      horizontalPanel(seat, 0.16, 0.48, 0.066, [side * 0.60, 1.46, -0.04], m.rubber, 0.065, 0.012);
    });
    rod(seat, [0.21, 0.84, -0.09], [0.53, 0.85, -0.18], 0.014, m.aluminium);
    panel(seat, 0.13, 0.045, 0.048, [0.56, 0.85, -0.19], m.charcoal, 0.017);
    const knob = cylinder(seat, 0.053, 0.050, [-0.33, 0.84, 0.12], m.rubber, 16);
    knob.rotation.z = Math.PI / 2;
    return seat;
  }
  chair([-1.75, 0, 2.15], -0.18, "Primary ergonomic mesh task chair");
  chair([2.40, 0, 1.86], 0.46, "Collaborative review chair");

  // Review area at the clear end of the same table: physical prototype,
  // drawing notebook and tablet establish a coherent engineering activity.
  const notebook = group(root, [1.26, 1.595, 0.53], -0.18, "Open engineering notebook");
  horizontalPanel(notebook, 1.14, 0.77, 0.026, [0, 0, 0], m.leather, 0.025, 0.003);
  [-1, 1].forEach(side => {
    horizontalPanel(notebook, 0.536, 0.728, 0.019, [side * 0.276, 0.022, 0], m.paper, 0.012, 0.002);
    const page = plane(notebook, 0.526, 0.708, [side * 0.276, 0.033, 0], m.paper);
    page.rotation.x = -Math.PI / 2;
    if (side === -1) page.rotation.z = Math.PI;
  });
  rod(notebook, [0.025, 0.038, -0.34], [0.025, 0.038, 0.34], 0.004, m.oakEdge, 6);
  rod(root, [1.66, 1.665, 0.73], [2.10, 1.665, 0.87], 0.012, m.aluminium, 10);
  rod(root, [2.10, 1.665, 0.87], [2.16, 1.663, 0.889], 0.007, m.black, 8);

  const tabletTilt = 0.25, tabletHeight = 0.76, tabletDepth = 0.035;
  // Yaw the whole assembly before tilting the screen. Combining both in an
  // XYZ Euler rotation rolls a front corner below the tabletop.
  const tabletMount = group(root, [1.32, desktopTop, -0.55], -0.12, "Review tablet mount");
  const tabletLift = tabletHeight / 2 * Math.sin(tabletTilt) + tabletDepth / 2 * Math.cos(tabletTilt) + 0.003;
  const tablet = group(tabletMount, [0, tabletLift, 0], 0, "Review tablet");
  tablet.rotation.x = -Math.PI / 2 + tabletTilt;
  panel(tablet, 1.10, tabletHeight, tabletDepth, [0, 0, 0], m.aluminium, 0.047, 0.005);
  panel(tablet, 1.083, 0.743, 0.012, [0, 0, 0.021], m.charcoal, 0.042, 0.003);
  plane(tablet, 1.007, 0.670, [0, 0, 0.028], m.tabletScreen);
  sphere(tablet, [0.010, 0.010, 0.002], [0, 0.351, 0.029], m.rubber);
  // The stand follows the tablet's yaw and meets the underside, rather than
  // protruding through the screen when the workspace is viewed from the front.
  const standZ = -0.25, standRadius = 0.012;
  const standY = tabletLift - Math.tan(tabletTilt) * standZ - (tabletDepth / 2 + standRadius) / Math.cos(tabletTilt);
  rod(tabletMount, [-0.355, standY, standZ], [0.355, standY, standZ], standRadius, m.aluminium, 16);
  [-1, 1].forEach(side => {
    const x = side * 0.355;
    rod(tabletMount, [x, 0.01, -0.40], [x, standY, standZ], standRadius, m.aluminium, 16);
    sphere(tabletMount, [standRadius, standRadius, standRadius], [x, standY, standZ], m.aluminium);
    cylinder(tabletMount, 0.028, 0.01, [x, 0.005, -0.40], m.rubber, 16);
  });

  const prototype = group(root, [3.12, 1.60, -0.29], -0.14, "Physical wing section study");
  horizontalPanel(prototype, 1.47, 0.73, 0.032, [0, 0, 0], m.aluminium, 0.05, 0.004);
  [-0.47, 0.47].forEach(x => rod(prototype, [x, 0.02, 0.01], [x, 0.28, 0.01], 0.018, m.chrome, 10));
  const wingVertices = [], wingUVs = [], wingIndices = [];
  const spanSegments = 14, chordSegments = 32;
  for (let side = 0; side < 2; side++) {
    for (let ix = 0; ix <= spanSegments; ix++) {
      const span = ix / spanSegments * 2 - 1;
      const chord = 0.64 * (1 - Math.abs(span) * 0.30);
      for (let iz = 0; iz <= chordSegments; iz++) {
        const t = iz / chordSegments;
        const thickness = 0.32 * (0.2969 * Math.sqrt(t) - 0.126 * t - 0.3516 * t ** 2 + 0.2843 * t ** 3 - 0.1036 * t ** 4);
        wingVertices.push(span * 0.83, 0.29 + (side ? -1 : 1) * thickness + 0.07 * Math.abs(span), (t - 0.47) * chord + Math.abs(span) * 0.15);
        wingUVs.push(ix / spanSegments, t);
        if (ix < spanSegments && iz < chordSegments) {
          const i = side * (spanSegments + 1) * (chordSegments + 1) + ix * (chordSegments + 1) + iz;
          if (side) wingIndices.push(i, i + chordSegments + 1, i + 1, i + 1, i + chordSegments + 1, i + chordSegments + 2);
          else wingIndices.push(i, i + 1, i + chordSegments + 1, i + 1, i + chordSegments + 2, i + chordSegments + 1);
        }
      }
    }
  }
  const wingSideOffset = (spanSegments + 1) * (chordSegments + 1);
  for (let tip = 0; tip < 2; tip++) {
    for (let iz = 0; iz < chordSegments; iz++) {
      const a = tip * spanSegments * (chordSegments + 1) + iz;
      const b = a + wingSideOffset;
      if (tip) wingIndices.push(a, b, a + 1, a + 1, b, b + 1);
      else wingIndices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const wing = new THREE.BufferGeometry();
  wing.setAttribute("position", new THREE.Float32BufferAttribute(wingVertices, 3));
  wing.setAttribute("uv", new THREE.Float32BufferAttribute(wingUVs, 2));
  wing.setIndex(wingIndices); wing.computeVertexNormals();
  mesh(prototype, wing, m.prototype);

  // Articulated task light with a thin metal shade and an inset diffuser.
  const lamp = group(root, [-3.83, 1.585, -0.58], -0.15, "Task light");
  cylinder(lamp, 0.247, 0.045, [0, 0.027, 0], m.black, 32);
  rod(lamp, [0, 0.05, 0], [-0.07, 0.66, -0.03], 0.022, m.aluminium, 12);
  rod(lamp, [-0.07, 0.66, -0.03], [0.25, 1.07, 0.08], 0.020, m.aluminium, 12);
  [[-0.07, 0.66, -0.03], [0.25, 1.07, 0.08]].forEach(position => {
    const pivot = cylinder(lamp, 0.045, 0.062, position, m.charcoal, 18);
    pivot.rotation.z = Math.PI / 2;
  });
  const shade = group(lamp, [0.29, 1.045, 0.10]);
  shade.rotation.x = 0.38;
  const hood = cylinder(shade, 0.19, 0.22, [0, -0.03, 0], m.lampShade, 32, 0.076);
  hood.name = "Fine spun metal lamp shade";
  cylinder(shade, 0.162, 0.008, [0, -0.145, 0], m.led, 28);
  tube(lamp, [[0.25, 1.07, 0.08], [-0.10, 0.66, -0.052], [-0.03, 0.05, -0.02], [-0.16, 0.00, -0.42]], 0.007, m.rubber, 24, 6);

  // A few practical objects, scaled quietly; no decorative office clutter.
  const mug = group(root, [-3.43, 1.587, 0.52], 0.18, "Ceramic coffee cup");
  const cupShape = [[0.070, 0], [0.078, 0.015], [0.091, 0.151], [0.094, 0.180], [0.083, 0.183], [0.079, 0.163], [0.067, 0.026]].map(p => new THREE.Vector2(...p));
  mesh(mug, new THREE.LatheGeometry(cupShape, 32), m.ceramic);
  tube(mug, [[0.086, 0.141, 0], [0.147, 0.141, 0], [0.160, 0.082, 0], [0.086, 0.044, 0]], 0.011, m.ceramic, 24, 8);
  cylinder(mug, 0.075, 0.004, [0, 0.155, 0], m.oakEdge, 28);
  horizontalPanel(root, 0.28, 0.28, 0.008, [-3.43, 1.581, 0.52], m.leather, 0.12, 0.001);

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
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    const object = new THREE.Mesh(geometry, material);
    const key = Object.keys(m).find(name => m[name] === material) || "detail";
    object.name = `Engineering studio ${key}`;
    object.castShadow = !key.toLowerCase().includes("screen") && key !== "led";
    object.receiveShadow = true;
    root.add(object);
  }
  originals.forEach(geometry => geometry.dispose());
  root.userData.prebatched = true;
  return root;
}
