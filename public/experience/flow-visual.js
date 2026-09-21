import { mergeGeometries } from "./vendor/utils/BufferGeometryUtils.js";

/**
 * Illustrative streamline rendering, independent of lights and solver data.
 * The host owns scheduling; update() only changes shader uniforms.
 *
 * Each path supplies points, kind, phase, speed (cycles/second), radius and
 * warmth. Geometry is merged into one draw call with per-path attributes.
 */
export function createFlowVisual(THREE, paths, { introPathIndices } = {}) {
  const group = new THREE.Group();
  group.name = "Illustrative animated flow";
  group.userData.prebatched = true;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const valueOr = (value, fallback) => Number.isFinite(value) ? value : fallback;
  const introSelection = introPathIndices === undefined ? null : new Set(introPathIndices);

  const specifications = [];
  for (const [pathIndex, path] of paths.entries()) {
    if (!Array.isArray(path.points) || path.points.length < 2) continue;
    const points = [];
    for (const point of path.points) {
      if (point.length !== 3 || !point.every(Number.isFinite)) {
        throw new TypeError("Flow path points must contain three finite coordinates.");
      }
      const vector = new THREE.Vector3(...point);
      if (!points.length || points[points.length - 1].distanceToSquared(vector) > 1e-10) points.push(vector);
    }
    if (points.length < 2) continue;
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    const length = curve.getLength();
    if (length < 1e-5) continue;
    curve.arcLengthDivisions = Math.max(200, points.length * 40);
    curve.updateArcLengths();
    specifications.push({
      curve,
      segments: clamp(Math.ceil(length * 7), 64, 192),
      radius: clamp(valueOr(path.radius, 0.019), 0.007, 0.045),
      phase: ((valueOr(path.phase, 0) % 1) + 1) % 1,
      speed: clamp(valueOr(path.speed, 0.075), 0.005, 0.5),
      warmth: clamp(valueOr(path.warmth, 0), 0, 1),
      kind: path.kind === "surface" ? 0 : path.kind === "wake" ? 2 : 1,
      introWeight: introSelection === null || introSelection.has(pathIndex) ? 1 : 0,
    });
  }

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      flowTime: { value: 0 },
      flowVisibility: { value: 1 },
      flowIntroAmount: { value: 0 },
      flowPetrol: { value: new THREE.Color("#255f68") },
      flowTeal: { value: new THREE.Color("#43858b") },
      flowCopper: { value: new THREE.Color("#ad6b49") },
      flowIntroTint: { value: new THREE.Color("#6e9799") },
    },
  ]);

  if (specifications.length) {
    const parts = [];
    // Soft envelope first, crisp core second, both within the same transparent
    // draw. The envelope is only a narrow, low-opacity antialiasing shoulder.
    for (const layer of [1, 0]) {
      for (const spec of specifications) {
        const geometry = new THREE.TubeGeometry(spec.curve, spec.segments, spec.radius * (layer ? 1.85 : 1), 6, false);
        const count = geometry.getAttribute("position").count;
        const pathData = new Float32Array(count * 4);
        const layers = new Float32Array(count);
        const introData = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
          pathData[i * 4] = spec.phase;
          pathData[i * 4 + 1] = spec.speed;
          pathData[i * 4 + 2] = spec.warmth;
          pathData[i * 4 + 3] = spec.kind;
          layers[i] = layer;
          introData[i * 2] = spec.introWeight;
          introData[i * 2 + 1] = spec.radius * (layer ? 1.85 : 1);
        }
        geometry.setAttribute("flowPath", new THREE.BufferAttribute(pathData, 4));
        geometry.setAttribute("flowLayer", new THREE.BufferAttribute(layers, 1));
        geometry.setAttribute("flowIntro", new THREE.BufferAttribute(introData, 2));
        parts.push(geometry);
      }
    }
    const geometry = mergeGeometries(parts, false);
    parts.forEach(part => part.dispose());
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const material = new THREE.ShaderMaterial({
      name: "Flow understroke and tapered streaks",
      uniforms,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.FrontSide,
      toneMapped: false,
      fog: true,
      vertexShader: /* glsl */ `
        attribute vec4 flowPath;
        attribute float flowLayer;
        attribute vec2 flowIntro;
        uniform float flowIntroAmount;
        varying vec2 vFlowUV;
        varying vec4 vFlowPath;
        varying float vFlowLayer;
        varying float vFlowIntroWeight;
        varying vec3 vFlowNormal;
        varying vec3 vFlowView;
        #include <fog_pars_vertex>

        void main() {
          vFlowUV = uv;
          vFlowPath = flowPath;
          vFlowLayer = flowLayer;
          vFlowIntroWeight = flowIntro.x;
          // Tube normals are its radial unit vectors. Recover the centreline
          // and contract only the cross-section; path positions stay fixed.
          float radiusScale = mix(1.0, 0.65, flowIntroAmount);
          vec3 introPosition = position - normal * flowIntro.y * (1.0 - radiusScale);
          vec4 mvPosition = modelViewMatrix * vec4(introPosition, 1.0);
          vFlowNormal = normalize(normalMatrix * normal);
          vFlowView = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float flowTime;
        uniform float flowVisibility;
        uniform float flowIntroAmount;
        uniform vec3 flowPetrol;
        uniform vec3 flowTeal;
        uniform vec3 flowCopper;
        uniform vec3 flowIntroTint;
        varying vec2 vFlowUV;
        varying vec4 vFlowPath;
        varying float vFlowLayer;
        varying float vFlowIntroWeight;
        varying vec3 vFlowNormal;
        varying vec3 vFlowView;
        #include <fog_pars_fragment>

        float taperedStreak(float distanceBehind, float span) {
          // A short soft nose and much longer tail give direction without a
          // bright bead, a hard dashed edge or an obvious repeated pulse.
          float nose = smoothstep(0.0, 0.017, distanceBehind);
          float tail = 1.0 - smoothstep(span * 0.16, span, distanceBehind);
          return nose * tail;
        }

        void main() {
          float u = vFlowUV.x;
          float phase = vFlowPath.x;
          float speed = vFlowPath.y;
          float warmth = vFlowPath.z;
          float kind = vFlowPath.w;
          float head = fract(flowTime * speed + phase);
          float d1 = fract(head - u + 1.0);
          float d2 = fract(head + 0.57 - u + 1.0);
          float span = mix(0.19, 0.28, phase);
          float streak = max(taperedStreak(d1, span), 0.58 * taperedStreak(d2, span * 0.68));

          float ends = smoothstep(0.0, 0.055, u) * (1.0 - smoothstep(0.89, 1.0, u));
          float facing = clamp(dot(normalize(vFlowNormal), normalize(vFlowView)), 0.0, 1.0);
          float softEdge = pow(facing, mix(0.42, 0.78, vFlowLayer));
          float pathWeight = kind > 1.5 ? 0.9 : kind > 0.5 ? 0.7 : 1.0;
          float coreAlpha = 0.14 + 0.81 * streak;
          float envelopeAlpha = 0.014 + 0.14 * streak;
          float alpha = mix(coreAlpha, envelopeAlpha, vFlowLayer) * ends * softEdge * pathWeight * flowVisibility;
          alpha *= mix(1.0, 0.55 * vFlowIntroWeight, flowIntroAmount);

          float warmZone = smoothstep(0.20, 0.45, u) * (1.0 - smoothstep(0.62, 0.87, u));
          float copper = warmth * warmZone * (0.18 + 0.82 * streak);
          vec3 ink = mix(flowPetrol, flowTeal, streak * 0.52 + vFlowLayer * 0.14);
          ink = mix(ink, flowCopper, copper);
          ink = mix(ink, flowIntroTint, flowIntroAmount * 0.35);
          if (alpha < 0.002) discard;
          gl_FragColor = vec4(ink, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }
      `,
    });
    const strokes = new THREE.Mesh(geometry, material);
    strokes.name = "Continuous flow paths with travelling tapered streaks";
    strokes.castShadow = false;
    strokes.receiveShadow = false;
    // Transparent vehicle windows render first; opaque CAD geometry still
    // occludes paths correctly because depth testing remains enabled.
    strokes.renderOrder = 2;
    group.add(strokes);
  }

  return {
    group,
    update(timeSeconds, visibility = 1, introAmount = 0) {
      uniforms.flowTime.value = valueOr(timeSeconds, 0);
      uniforms.flowVisibility.value = clamp(valueOr(visibility, 1), 0, 1);
      uniforms.flowIntroAmount.value = clamp(valueOr(introAmount, 0), 0, 1);
      group.visible = uniforms.flowVisibility.value > 0.001;
    },
  };
}
