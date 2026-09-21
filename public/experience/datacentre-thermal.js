import { mergeGeometries } from "./vendor/utils/BufferGeometryUtils.js";
import { createDataCentrePipeGeometry } from "./datacentre-pipe.js";

/**
 * Illustrative cooling circulation, not a solved CFD or temperature field.
 * Routes follow the physical datacentre.js plumbing; the host owns scheduling.
 */
export function createDataCentreThermal(THREE) {
  const group = new THREE.Group();
  group.name = "Illustrative data centre cooling circulation";
  group.userData.prebatched = true;
  const routes = [];
  const addPipe = (points, radius, heat, role, phase = 0, speed = 0.105, bend = 0.095, physicalRadius = 0.027) => {
    routes.push({ points, radius, heat, role, phase, speed, bend, physicalRadius, kind: "pipe" });
  };
  const reverse = points => [...points].reverse();
  const frontX = [-3.15, -1.91, -0.67, 0.57];
  const rearX = [-2.53, -1.29, -0.05, 1.19];

  // Direction follows the circuit: supply leaves the CDU and travels left;
  // the adjacent return header gathers flow travelling right back to the CDU.
  // End at the last connected tee, leaving the capped dead legs unanimated.
  addPipe([[3.36, 3.18, 0.66], [3.36, 3.18, -0.145], [3.36, 4.035, -0.145], [-2.86, 4.035, -0.145]], 0.065, 0, "Supply header", 0.0, 0.080, 0.13, 0.054);
  addPipe([[-2.72, 4.035, 0.145], [3.63, 4.035, 0.145], [3.63, 3.18, 0.145], [3.63, 3.18, 0.66]], 0.065, 1, "Return header", 0.39, 0.076, 0.13, 0.054);

  [frontX, rearX].forEach((positions, row) => {
    const manifoldZ = row === 0 ? 0.526 : -2.328;
    const rackRear = row === 0 ? 0.65 : -2.18;
    const topY = row === 0 ? 3.98 : 4.09;
    positions.forEach((rackX, index) => {
      [0, 1].forEach(heat => {
        const x = rackX + (heat ? 0.43 : 0.29);
        const headerZ = heat ? 0.145 : -0.145;
        const phase = (0.17 * index + 0.23 * row + 0.43 * heat) % 1;
        const branch = [[x, 4.035, headerZ], [x, topY, headerZ], [x, topY, manifoldZ], [x, 0.51, manifoldZ]];
        addPipe(heat ? reverse(branch) : branch, 0.036, heat, `${heat ? "Return" : "Supply"} rack manifold`, phase, 0.12 + index * 0.004);

        // Show two service connections per rack. The remaining original hoses
        // stay visible as ordinary hardware, keeping the graphic legible.
        [1.68, 3.18].forEach((y, hoseIndex) => {
          const destinationX = rackX - 0.10 + heat * 0.15;
          const hose = [[x, y, manifoldZ], [x + 0.07, y, manifoldZ - 0.04], [destinationX, y - 0.08, manifoldZ - 0.055], [destinationX, y - 0.08, rackRear]];
          addPipe(heat ? reverse(hose) : hose, 0.026, heat, `${heat ? "Return" : "Supply"} short rack hose`, (phase + hoseIndex * 0.38) % 1, 0.20, 0.10, 0.020);
        });
      });
    });
  });

  // The open CDU service side makes the two loops readable all the way back to
  // its pump/filter assembly. These coordinates mirror the existing hardware.
  [-0.28, 0.33].forEach((z, heat) => {
    const world = points => points.map(([x, y, depth]) => [x + 3.30, y + 0.135, depth + 1.00]);
    const lower = world([[0.39, 0.68, z], [0.39, 1.02, z], [0.48, 1.02, z], [0.48, 2.93, z]]);
    const upper = world([[0.48, 2.94, z], [0.48, 3.30, z], [0.06 + heat * 0.27, 3.30, z], [0.06 + heat * 0.27, 3.04, -0.34]]);
    addPipe(heat ? reverse(lower) : lower, 0.051, heat, `${heat ? "Return" : "Supply"} CDU riser`, 0.16 + heat * 0.48, 0.16, 0.08, 0.042);
    addPipe(heat ? reverse(upper) : upper, 0.051, heat, `${heat ? "Return" : "Supply"} CDU connection`, 0.31 + heat * 0.39, 0.17, 0.075, 0.042);
  });

  // Four short intake paths approach the visible front doors and stop at the
  // intake surface. Nothing draws a fictitious line through the opaque racks.
  frontX.forEach((x, index) => {
    routes.push({
      points: [[x - 0.10, 0.70, 3.17], [x - 0.055, 1.01, 2.92], [x, 1.25, 2.58], [x, 1.27, 2.32]],
      radius: 0.032, heat: 0, role: "Cool front intake", phase: index * 0.21,
      speed: 0.23 + index * 0.008, kind: "air", bend: 0,
    });
  });
  // Warm-air indications occupy only the open service-side gap. They are
  // slender, smooth trails, without smoke, particles or a translucent volume.
  [
    [[1.23, 1.09, 1.81], [1.34, 1.91, 1.77], [1.34, 2.78, 1.68], [1.43, 3.63, 1.39], [1.52, 4.07, 1.09]],
    [[1.28, 1.25, 0.90], [1.41, 1.98, 0.85], [1.48, 2.84, 0.77], [1.64, 3.67, 0.60], [1.79, 4.13, 0.40]],
  ].forEach((points, index) => routes.push({
    points, radius: 0.026, heat: 1, role: "Warm service-side rise",
    phase: 0.23 + index * 0.47, speed: 0.16 + index * 0.012, kind: "air", bend: 0,
  }));

  // Exposed for local geometric QA, with no measurements or solver claims.
  group.userData.thermalPaths = routes.map(route => ({ ...route, points: route.points.map(point => [...point]) }));

  const parts = [];
  for (const route of routes) {
    const geometry = route.kind === "air"
      ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(route.points.map(point => new THREE.Vector3(...point)), false, "centripetal"), 64, route.radius, 6, false)
      : createDataCentrePipeGeometry(THREE, route.points, route.radius, { bend: route.bend, routeRadius: route.physicalRadius });
    const count = geometry.getAttribute("position").count;
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      data[i * 4] = route.phase;
      data[i * 4 + 1] = route.speed;
      data[i * 4 + 2] = route.heat;
      data[i * 4 + 3] = route.kind === "air" ? 1 : 0;
    }
    geometry.setAttribute("thermalRoute", new THREE.BufferAttribute(data, 4));
    parts.push(geometry);
  }
  const geometry = mergeGeometries(parts, false);
  parts.forEach(part => part.dispose());
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      thermalTime: { value: 0 },
      thermalVisibility: { value: 1 },
      thermalCool: { value: new THREE.Color("#247f96") },
      thermalCoolHead: { value: new THREE.Color("#62c0ca") },
      thermalWarm: { value: new THREE.Color("#b96a37") },
      thermalWarmHead: { value: new THREE.Color("#e5a066") },
    },
  ]);
  const material = new THREE.ShaderMaterial({
    name: "Illustrative cooling and heat-return pulses",
    uniforms,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
    fog: true,
    vertexShader: /* glsl */ `
      attribute vec4 thermalRoute;
      varying vec2 vThermalUV;
      varying vec4 vThermalRoute;
      varying vec3 vThermalNormal;
      varying vec3 vThermalView;
      #include <fog_pars_vertex>
      void main() {
        vThermalUV = uv;
        vThermalRoute = thermalRoute;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vThermalNormal = normalize(normalMatrix * normal);
        vThermalView = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float thermalTime;
      uniform float thermalVisibility;
      uniform vec3 thermalCool;
      uniform vec3 thermalCoolHead;
      uniform vec3 thermalWarm;
      uniform vec3 thermalWarmHead;
      varying vec2 vThermalUV;
      varying vec4 vThermalRoute;
      varying vec3 vThermalNormal;
      varying vec3 vThermalView;
      #include <fog_pars_fragment>

      float trail(float distanceBehind, float span) {
        return smoothstep(0.0, 0.026, distanceBehind)
          * (1.0 - smoothstep(span * 0.16, span, distanceBehind));
      }
      void main() {
        float u = vThermalUV.x;
        float phase = vThermalRoute.x;
        float speed = vThermalRoute.y;
        float heat = vThermalRoute.z;
        float air = vThermalRoute.w;
        float head = fract(thermalTime * speed + phase);
        float first = trail(fract(head - u + 1.0), mix(0.29, 0.40, air));
        float second = 0.68 * trail(fract(head + 0.51 - u + 1.0), 0.24);
        float pulse = max(first, second);
        float facing = clamp(dot(normalize(vThermalNormal), normalize(vThermalView)), 0.0, 1.0);
        float softEdge = pow(facing, mix(0.34, 0.65, air));
        float ends = smoothstep(0.0, mix(0.025, 0.11, air), u)
          * (1.0 - smoothstep(mix(0.97, 0.83, air), 1.0, u));
        float base = mix(0.34, 0.17, air);
        float alpha = (base + mix(0.55, 0.59, air) * pulse) * ends * softEdge * thermalVisibility;
        vec3 color = mix(thermalCool, thermalWarm, heat);
        vec3 headColor = mix(thermalCoolHead, thermalWarmHead, heat);
        color = mix(color, headColor, pulse * 0.61);
        if (alpha < 0.003) discard;
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "Cooling supply, heat return and local intake trails";
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.renderOrder = 2;
  group.add(mesh);

  return {
    group,
    update(timeSeconds, visibility = 1) {
      uniforms.thermalTime.value = Number.isFinite(timeSeconds) ? timeSeconds : 0;
      uniforms.thermalVisibility.value = Math.max(0, Math.min(1, Number.isFinite(visibility) ? visibility : 1));
      group.visible = uniforms.thermalVisibility.value > 0.001;
    },
  };
}
