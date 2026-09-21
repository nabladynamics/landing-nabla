/**
 * Presentation finishes for the supplied CADs. These are illustrative liveries,
 * not manufacturer paint schemes. Geometry, topology and source files stay intact.
 * Masks use the normalized exhibit coordinates, independent of station placement.
 */
const FINISH_VERSION = 'nabla-cad-finishes-2';

export function applyCADFinish(THREE, scene, stationId) {
  if (!['aerospace', 'marine', 'automotive'].includes(stationId)) return scene;
  if (scene.userData.cadFinishVersion === FINISH_VERSION) return scene;
  scene.updateMatrixWorld(true);
  const rootInverse = scene.matrixWorld.clone().invert();
  const originals = new Set();
  const result = [];
  const linear = (hex) => {
    const color = new THREE.Color(hex);
    return `vec3(${color.r.toFixed(7)}, ${color.g.toFixed(7)}, ${color.b.toFixed(7)})`;
  };
  const palette = {
    pearl: '#e8e6dd', navy: '#123d4c', teal: '#00695f', copper: '#c98148',
    carbon: '#152125', rubber: '#101517', glass: '#102e3c', silver: '#9faeb1',
    deck: '#7f9290', antifouling: '#a64f39', white: '#e4e0d4', orange: '#d46d32',
  };
  const colors = Object.fromEntries(Object.entries(palette).map(([name, hex]) => [name, linear(hex)]));

  function plain(label, color, roughness = 0.4, metalness = 0.2, extra = {}) {
    return new THREE.MeshPhysicalMaterial({
      name: label, color, roughness, metalness, side: THREE.DoubleSide,
      clearcoat: 0.24, clearcoatRoughness: 0.3, ...extra,
    });
  }

  function patterned(mesh, material, key, colorCode, surfaceCode = '') {
    // cargo-ship uses quantized attributes and a scale on its glTF node.
    // This transform restores scene units before the fragment masks run.
    const coordinates = rootInverse.clone().multiply(mesh.matrixWorld);
    const normalCoordinates = new THREE.Matrix3().getNormalMatrix(coordinates);
    material.onBeforeCompile = (shader) => {
      shader.uniforms.nablaCADMatrix = { value: coordinates };
      shader.uniforms.nablaCADNormalMatrix = { value: normalCoordinates };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          uniform mat4 nablaCADMatrix;
          uniform mat3 nablaCADNormalMatrix;
          varying vec3 vNablaCADPosition;
          varying vec3 vNablaCADNormal;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vNablaCADPosition = (nablaCADMatrix * vec4(transformed, 1.0)).xyz;
          vNablaCADNormal = normalize(nablaCADNormalMatrix * objectNormal);`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          varying vec3 vNablaCADPosition;
          varying vec3 vNablaCADNormal;
          float nablaBand(float value, float lower, float upper, float feather) {
            return smoothstep(lower - feather, lower + feather, value)
              * (1.0 - smoothstep(upper - feather, upper + feather, value));
          }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          vec3 cadP = vNablaCADPosition;
          vec3 cadN = normalize(vNablaCADNormal);
          ${colorCode}`);
      if (surfaceCode) shader.fragmentShader = shader.fragmentShader.replace(
        '#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>\n${surfaceCode}`,
      );
    };
    material.customProgramCacheKey = () => `${FINISH_VERSION}:${key}`;
    return material;
  }

  function aircraft(mesh, old) {
    const name = old.name.toLowerCase();
    if (name.includes('tyre')) return plain('Aircraft tyre rubber', palette.rubber, 0.91, 0, { clearcoat: 0 });
    if (name.includes('landing')) return plain('Brushed landing gear alloy', '#87999f', 0.3, 0.78, { clearcoat: 0 });
    if (name.includes('fan')) return plain('Engine fan titanium', '#34464e', 0.34, 0.72, { clearcoat: 0 });
    return patterned(mesh, plain('Pearl, ocean and copper aircraft livery', palette.pearl, 0.3, 0.22,
      { clearcoat: 0.5, clearcoatRoughness: 0.23 }), 'aircraft-livery', `
      // Restrict the belly stripe to the fuselage; leave the broad wings pearl.
      float fuselage = 1.0 - smoothstep(0.47, 0.62, abs(cadP.z));
      float belly = (1.0 - smoothstep(1.10, 1.13, cadP.y)) * fuselage;
      float tail = smoothstep(3.05, 3.35, cadP.x) * smoothstep(1.65, 1.77, cadP.y)
        * (1.0 - smoothstep(0.28, 0.45, abs(cadP.z)));
      float engine = smoothstep(0.85, 1.0, abs(cadP.z))
        * (1.0 - smoothstep(1.03, 1.10, cadP.y));
      diffuseColor.rgb = mix(${colors.pearl}, ${colors.navy}, max(max(belly, tail), engine));
      float cheatline = nablaBand(cadP.y, 1.125, 1.155, 0.003) * fuselage;
      float tailAccent = nablaBand(cadP.y - 0.27 * cadP.x, 1.34, 1.41, 0.006) * tail;
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.copper}, max(cheatline, tailAccent));
      // Surface-only cabin glazing; no new geometry or texture downloads.
      float side = smoothstep(0.38, 0.62, abs(cadN.z)) * fuselage;
      float windowX = abs(fract((cadP.x + 4.60) / 0.145) - 0.5) * 0.145;
      float cabinShape = 1.0 - smoothstep(0.84, 1.05,
        length(vec2(windowX / 0.030, (cadP.y - 1.350) / 0.043)));
      float cabin = cabinShape * nablaBand(cadP.x, -4.62, 3.40, 0.035) * side;
      float upperShape = 1.0 - smoothstep(0.84, 1.05,
        length(vec2(windowX / 0.027, (cadP.y - 1.586) / 0.032)));
      float upper = upperShape * nablaBand(cadP.x, -4.43, -2.45, 0.025) * side;
      float cockpit = nablaBand(cadP.x, -5.17, -4.82, 0.025)
        * nablaBand(cadP.y + 0.16 * (cadP.x + 5.0), 1.455, 1.535, 0.008)
        * smoothstep(0.08, 0.20, abs(cadP.z));
      float glazing = max(max(cabin, upper), cockpit);
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.glass}, glazing);
    `, `roughnessFactor = mix(roughnessFactor, 0.18, glazing);
        metalnessFactor = mix(metalnessFactor, 0.42, glazing);`);
  }

  function ship(mesh, old) {
    // IDs come from the inspected CAD material groups, not scene traversal order.
    const materialId = Number(/^mat_(\d+)$/.exec(old.name)?.[1]);
    if (materialId === 0) return patterned(mesh,
      plain('Navy hull, oxide antifouling and steel deck', palette.navy, 0.58, 0.16,
        { clearcoat: 0 }), 'ship-hull', `
      // This CAD has both windings on its deck and smoothed normals across
      // the bow rim. Use the actual local face plane, independent of winding,
      // so flat deck panels share one finish and curved bulwarks stay navy.
      vec3 hullFaceNormal = normalize(cross(dFdx(cadP), dFdy(cadP)));
      float horizontalDeck = smoothstep(0.975, 0.995, abs(hullFaceNormal.y));
      float deck = horizontalDeck * smoothstep(1.315, 1.345, cadP.y);
      float bottom = 1.0 - smoothstep(0.63, 0.65, cadP.y);
      diffuseColor.rgb = mix(${colors.navy}, ${colors.antifouling}, bottom);
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.deck}, deck);
      float bootstripe = nablaBand(cadP.y, 0.67, 0.705, 0.003) * (1.0 - deck);
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.white}, bootstripe);
      float rail = smoothstep(1.64, 1.73, cadP.y) * smoothstep(-2.1, -1.7, cadP.x);
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.silver}, rail);
    `, `roughnessFactor = mix(mix(0.58, 0.72, bottom), 0.86, deck);
        metalnessFactor = mix(metalnessFactor, 0.05, max(bottom, deck));`);
    if (materialId === 2) return patterned(mesh,
      plain('Warm white bridge with dark glazing', palette.white, 0.4, 0.14), 'ship-bridge', `
      diffuseColor.rgb = ${colors.white};
      float side = smoothstep(0.48, 0.73, abs(cadN.z));
      float front = smoothstep(0.50, 0.78, -cadN.x);
      float windowRow = nablaBand(cadP.y, 2.14, 2.365, 0.009);
      float sideFrames = 1.0 - smoothstep(0.072, 0.085, abs(fract(cadP.x / 0.25) - 0.5) * 0.25);
      float frontFrames = 1.0 - smoothstep(0.090, 0.106, abs(fract(cadP.z / 0.31) - 0.5) * 0.31);
      float glazing = windowRow * max(side * sideFrames, front * frontFrames)
        * nablaBand(cadP.x, 2.62, 3.93, 0.015);
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.glass}, glazing);
      float funnel = smoothstep(2.57, 2.64, cadP.y);
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.navy}, funnel);
    `, `roughnessFactor = mix(roughnessFactor, 0.19, glazing);
        metalnessFactor = mix(metalnessFactor, 0.4, glazing);`);
    if ([6, 8].includes(materialId)) return plain('Bridge glazing', '#254454', 0.18, 0.35, { clearcoat: 0.65 });
    if ([14, 16, 27].includes(materialId)) return plain('Dark marine equipment', '#202c32', 0.64, 0.25, { clearcoat: 0 });
    if ([15, 22, 24].includes(materialId)) return plain('Marine safety orange', '#cf6336', 0.4, 0.06);
    if (materialId === 21) return plain('Marine safety marking', '#50856d', 0.5, 0.05);
    if ([3, 12].includes(materialId)) return plain('Bronze deck fittings', '#967148', 0.43, 0.55);
    if ([23, 25].includes(materialId)) return plain('Rescue craft warm orange', '#c27c42', 0.45, 0.12);
    if ([1, 9, 13, 26, 28].includes(materialId)) return plain('Brushed marine steel', '#8b9c9d', 0.48, 0.65, { clearcoat: 0 });
    return plain('Warm white marine superstructure', '#dddccf', 0.48, 0.15);
  }

  function racingCar(mesh, old) {
    const name = `${mesh.name} ${old.name}`.toLowerCase();
    if (name.includes('tire')) return plain('Satin black racing tyre', palette.rubber, 0.92, 0, { clearcoat: 0 });
    if (name.includes('rim') || name.includes('alloy')) return plain('Machined racing alloy', '#a2b0b5', 0.24, 0.86, { clearcoat: 0.05 });
    if (name.includes('steering') || name.includes('controls')) return plain('Carbon cockpit controls', palette.carbon, 0.57, 0.12, { clearcoat: 0 });
    if (name.includes('helmet')) return patterned(mesh,
      plain('Copper driver helmet with smoked visor', '#d39453', 0.26, 0.2, { clearcoat: 0.6 }), 'driver-helmet', `
      float visor = nablaBand(cadP.y, 1.345, 1.46, 0.01)
        * (1.0 - smoothstep(-0.03, 0.07, cadP.x));
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.glass}, visor);
    `, 'roughnessFactor = mix(roughnessFactor, 0.14, visor);');
    return patterned(mesh,
      plain('Racing teal, carbon and copper body', palette.teal, 0.3, 0.35,
        { clearcoat: 0.58, clearcoatRoughness: 0.23 }), 'racing-body', `
      float frontWing = (1.0 - smoothstep(-3.14, -2.98, cadP.x))
        * (1.0 - smoothstep(0.72, 0.84, cadP.y));
      float rearWing = smoothstep(3.58, 3.77, cadP.x);
      float floorPanel = 1.0 - smoothstep(0.45, 0.53, cadP.y);
      float suspension = smoothstep(0.82, 1.02, abs(cadP.z))
        * (1.0 - smoothstep(1.00, 1.13, cadP.y))
        * max(nablaBand(cadP.x, -2.97, -0.65, 0.07), nablaBand(cadP.x, 2.05, 3.55, 0.07));
      float cockpit = nablaBand(cadP.x, -0.92, 0.53, 0.06)
        * (1.0 - smoothstep(0.31, 0.43, abs(cadP.z))) * smoothstep(1.03, 1.12, cadP.y);
      float carbon = max(max(frontWing, rearWing), max(max(floorPanel, suspension), cockpit));
      diffuseColor.rgb = mix(${colors.teal}, ${colors.carbon}, carbon);
      float centreStripe = (1.0 - smoothstep(0.035, 0.052, abs(cadP.z)))
        * nablaBand(cadP.x, -3.29, -1.02, 0.045) * smoothstep(0.72, 0.79, cadP.y);
      float sideStripe = nablaBand(cadP.y, 0.635, 0.685, 0.006)
        * smoothstep(0.66, 0.80, abs(cadP.z)) * nablaBand(cadP.x, -0.45, 2.45, 0.06);
      float endplate = smoothstep(1.54, 1.61, abs(cadP.z)) * frontWing;
      float rearLip = smoothstep(1.96, 2.005, cadP.y) * rearWing;
      float accent = max(max(centreStripe, sideStripe), max(endplate, rearLip));
      diffuseColor.rgb = mix(diffuseColor.rgb, ${colors.copper}, accent);
    `, `roughnessFactor = mix(roughnessFactor, 0.5, carbon);
        metalnessFactor = mix(metalnessFactor, 0.14, carbon);`);
  }

  const finish = { aerospace: aircraft, marine: ship, automotive: racingCar }[stationId];
  scene.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const replace = (old) => {
      originals.add(old);
      const material = finish(mesh, old);
      result.push(material.name);
      return material;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(replace) : replace(mesh.material);
  });
  // These GLBs have no texture maps. Dispose any original maps too if future
  // exports add them; replacement materials never share those resources.
  const textures = new Set();
  for (const material of originals) {
    for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    material.dispose();
  }
  for (const texture of textures) texture.dispose();
  scene.userData.cadFinishVersion = FINISH_VERSION;
  scene.userData.cadFinishGroups = [...new Set(result)];
  return scene;
}
