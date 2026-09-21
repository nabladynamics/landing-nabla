import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { createWorld } from './models.js';
import { cadAssets } from './cad-assets.js';
import { applyCADFinish } from './cad-finishes.js';
import { createStudioReflections } from './studio-reflections.js';
import { mountExhibitRotation } from './exhibit-rotation.js';

// Browser-native ES module, loaded only by the Spatial home.
const poses = [
  { position: [-11.5, 7.8, 16.5], target: [0, 1.75, 0] },
  { position: [-8.4, 6.4, 15.6], target: [0, 2.15, 0] },
  { position: [29, 6.2, 14], target: [22, 1.5, 0] },
  { position: [36.8, 4.8, 12], target: [44, 1.15, 0] },
  { position: [74.6, 7.2, 14], target: [66, 2.0, 0] },
  { position: [81.4, 5.9, 12.6], target: [88, 1.6, 0.15] },
];

function createStudio(scene) {
  // A seamless studio floor shares the page colour, with no backdrop panels or
  // display furniture competing with the CAD silhouettes during camera travel.
  const paper = new THREE.MeshBasicMaterial({ color: '#f3f2ec', toneMapped: false });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(230, 110), paper);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(44, -0.04, 0);
  scene.add(floor);

  // A soft, baked contact shadow avoids a heavy real-time shadow map on mobile.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const context = shadowCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 1, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(33,49,42,.25)');
  gradient.addColorStop(0.35, 'rgba(33,49,42,.14)');
  gradient.addColorStop(1, 'rgba(33,49,42,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });

  const footprints = [[14, 10], [13, 5], [11, 6], [11, 8], [14, 9]];
  for (let index = 0; index < footprints.length; index++) {
    const x = index * 22;
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(...footprints[index]), shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.015, 0);
    scene.add(shadow);
  }

  // Fine ground references retain parallax without enclosing each exhibit.
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#b9c1b3', transparent: true, opacity: 0.2 });
  for (let x = -22; x <= 132; x += 11) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, 0.005, -15), new THREE.Vector3(x, 0.005, 20),
    ]), lineMaterial);
    scene.add(line);
  }
  const guide = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-12, 0.012, 6.5), new THREE.Vector3(101, 0.012, 6.5),
  ]), new THREE.LineBasicMaterial({ color: '#bf7953', transparent: true, opacity: 0.3 }));
  scene.add(guide);
}

function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    list.filter(Boolean).forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => { if (value?.isTexture) textures.add(value); });
    });
  });
  geometries.forEach((geometry) => geometry.dispose());
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
}

export function mountExperience(canvas, { onError, onReady, interactionElement, onRotationState, reducedMotion = false }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f3f2ec');
  scene.fog = new THREE.Fog('#f3f2ec', 24, 64);
  scene.add(new THREE.HemisphereLight('#fffef4', '#a9b8a0', 2.0));
  const key = new THREE.DirectionalLight('#fff3dc', 3.0);
  key.position.set(-8, 16, 9);
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#d9e8ef', 1.35);
  fill.position.set(8, 9, -7);
  scene.add(fill, fill.target);

  createStudio(scene);
  const world = createWorld(THREE, { cadStations: cadAssets.map((asset) => asset.station) });
  scene.add(world.group);

  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 140);
  const fromPosition = new THREE.Vector3();
  const toPosition = new THREE.Vector3();
  const fromTarget = new THREE.Vector3();
  const toTarget = new THREE.Vector3();
  const look = new THREE.Vector3();
  const offset = new THREE.Vector3();
  let targetProgress = 0;
  let progress = 0;
  let frame = 0;
  let disposed = false;
  let assetsReady = false;
  let notifiedReady = false;
  let width = 1;
  let height = 1;
  let mobile = false;
  let reduceMotion = reducedMotion;
  let inView = true;
  let lastRenderTime = 0;
  let cadenceTime = 0;
  let flowTime = 0;
  let rotation;
  let dragging = false;
  let rotationState = '';
  const exhibitNames = {
    aerospace: 'Boeing 747', marine: 'cargo ship', automotive: 'Formula racing car',
    cooling: 'data centre', engineering: 'engineering studio',
  };

  const updateInteraction = () => {
    const station = world.stations.reduce((nearest, candidate) =>
      Math.abs(candidate.position[0] - look.x) < Math.abs(nearest.position[0] - look.x) ? candidate : nearest,
    );
    const enabled = assetsReady && inView && !document.hidden
      && Math.abs(station.position[0] - look.x) < 0.9 && Math.abs(targetProgress - progress) < 0.002;
    const rotated = Math.abs(station.group.rotation.y) > 0.001;
    rotation?.setExhibit({ id: station.id, label: exhibitNames[station.id], angle: station.group.rotation.y, enabled });
    const nextState = `${enabled}:${rotated}`;
    if (nextState !== rotationState) {
      rotationState = nextState;
      onRotationState?.({ enabled, rotated });
    }
  };

  const hasVisibleFlow = () => world.stations.some((station) =>
    station.group.visible && station.animated,
  );

  const draw = (now = performance.now()) => {
    frame = 0;
    if (disposed || document.hidden || !inView) return;
    // The first visible frame starts at the current scroll position. Easing
    // applies only after reveal, never from a stale/loading camera pose.
    if (!notifiedReady || reduceMotion) progress = targetProgress;
    const difference = targetProgress - progress;
    // Camera movement stays responsive; steady flow runs at a quieter cadence.
    // No geometry is rebuilt while the trails move.
    const steadyFlow = !reduceMotion && !dragging && assetsReady && Math.abs(difference) < 0.00005 && hasVisibleFlow();
    const interval = 1000 / (mobile ? 24 : 30);
    if (steadyFlow && cadenceTime) {
      const elapsed = now - cadenceTime;
      if (elapsed + 0.1 < interval) {
        frame = requestAnimationFrame(draw);
        return;
      }
      // Preserve fractional RAF intervals (24 fps on a 60 Hz display, for example).
      cadenceTime += Math.max(1, Math.floor((elapsed + 0.1) / interval)) * interval;
    } else {
      cadenceTime = now;
    }
    if (lastRenderTime && !reduceMotion) flowTime += Math.min((now - lastRenderTime) / 1000, 0.1);
    lastRenderTime = now;
    progress = Math.abs(difference) < 0.00005 ? targetProgress : progress + difference * 0.13;
    const step = progress * (poses.length - 1);
    const index = Math.min(poses.length - 2, Math.floor(step));
    const fraction = step - index;
    // Long resting windows allow the copy to be read before the camera leaves.
    const t = THREE.MathUtils.smoothstep(fraction, 0.12, 0.88);
    const start = poses[index];
    const end = poses[index + 1];
    fromPosition.fromArray(start.position);
    toPosition.fromArray(end.position);
    fromTarget.fromArray(start.target);
    toTarget.fromArray(end.target);
    camera.position.lerpVectors(fromPosition, toPosition, t);
    look.lerpVectors(fromTarget, toTarget, t);

    // A subtle arc connects exhibits inside one physical studio.
    camera.position.y += Math.sin(t * Math.PI) * 1.6;
    camera.position.z += Math.sin(t * Math.PI) * 2.2;
    // Tall desktop windows need more distance to keep the wider CAD assemblies
    // inside the scene column. Preserve the closer framing on landscape screens.
    const introAmount = 1 - THREE.MathUtils.smoothstep(progress, 0.035, 0.17);
    const distance = mobile ? Math.max(1.05, 1.18 / camera.aspect) : Math.max(1.16, 1.74 / camera.aspect);
    // Give the opening aircraft more presence on a wide laptop display, while
    // keeping the existing fit for Air and the larger assemblies further on.
    const introFraming = mobile ? 0.9 : 1 - 0.17 * THREE.MathUtils.smoothstep(width, 900, 1280);
    offset.copy(camera.position).sub(look).multiplyScalar(distance * THREE.MathUtils.lerp(1, introFraming, introAmount));
    camera.position.copy(look).add(offset);
    camera.lookAt(look);
    key.position.x = look.x - 8;
    key.target.position.set(look.x, 0, 0);
    fill.position.x = look.x + 8;
    fill.target.position.set(look.x, 1, 0);
    world.stations.forEach((station) => {
      // Keep adjacent exhibits during travel, but clear them at each resting
      // view so a coloured model does not ghost through the copy column.
      station.group.visible = Math.abs(station.position[0] - look.x) < 18;
    });
    // Start has a quieter treatment; gently strengthen the same sparse paths in Air.
    world.animate(flowTime, look.x, introAmount);
    updateInteraction();
    renderer.render(scene, camera);
    canvas.dataset.rendered = 'true';
    if (assetsReady && !notifiedReady) {
      notifiedReady = true;
      canvas.dataset.cadModels = cadAssets.map((asset) => asset.station).join(',');
      onReady?.();
    }
    if (!frame && (Math.abs(targetProgress - progress) >= 0.00005 || (!reduceMotion && assetsReady && hasVisibleFlow()))) {
      frame = requestAnimationFrame(draw);
    }
  };
  const schedule = () => {
    if (!frame && !disposed && inView && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastRenderTime = 0;
    cadenceTime = 0;
    updateInteraction();
  };
  if (interactionElement) {
    rotation = mountExhibitRotation(interactionElement, {
      onRotate(id, angle) {
        const station = world.stations.find((entry) => entry.id === id);
        if (!station) return;
        // Rotate the exhibit and its flow together, preserving the shared studio
        // and the camera's scroll-driven journey. Each exhibit retains its angle.
        station.group.rotation.y = angle;
        schedule();
      },
      onInteractionChange(active) {
        dragging = active;
        schedule();
      },
    });
  }
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    mobile = window.innerWidth <= 760 && window.innerHeight > 580;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // The scene occupies the right-hand side, leaving a calm editorial column.
    camera.setViewOffset(width, height, mobile ? 0 : -width * 0.18, mobile ? height * 0.13 : 0, width, height);
    camera.updateProjectionMatrix();
    schedule();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) schedule(); else pause();
  });
  intersection.observe(canvas);
  const visibility = () => { if (document.hidden) pause(); else schedule(); };
  const lost = (event) => { event.preventDefault(); onError(); };
  document.addEventListener('visibilitychange', visibility);
  canvas.addEventListener('webglcontextlost', lost);
  delete canvas.dataset.cadModels;
  resize();

  const assetRequest = new AbortController();
  const cadReflections = createStudioReflections(THREE);
  async function loadCADModels() {
    try {
      await Promise.all(cadAssets.map(async (asset) => {
        const url = new URL(`./assets/${asset.file}`, import.meta.url);
        const response = await fetch(url, { signal: assetRequest.signal });
        if (!response.ok) throw new Error(`CAD asset request failed: ${response.status}`);
        const bytes = await response.arrayBuffer();
        if (disposed) return;
        const gltf = await new GLTFLoader().parseAsync(bytes, new URL('./assets/', import.meta.url).href);
        if (disposed) { disposeObject(gltf.scene); return; }
        gltf.scene.name = asset.name;
        applyCADFinish(THREE, gltf.scene, asset.station);
        gltf.scene.traverse((object) => {
          if (!object.isMesh) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            material.envMap = cadReflections;
            material.envMapIntensity = 0.48;
          });
        });
        const station = world.stations.find((entry) => entry.id === asset.station);
        if (!station) { disposeObject(gltf.scene); throw new Error(`Unknown CAD station: ${asset.station}`); }
        station.group.add(gltf.scene);
      }));
      if (!disposed) {
        assetsReady = true;
        schedule();
      }
    } catch (error) {
      assetRequest.abort();
      if (!disposed && error.name !== 'AbortError') onError();
    }
  }
  loadCADModels();

  return {
    setProgress(value) {
      targetProgress = THREE.MathUtils.clamp(value, 0, 1);
      schedule();
    },
    setReducedMotion(value) {
      reduceMotion = Boolean(value);
      lastRenderTime = 0;
      cadenceTime = 0;
      schedule();
    },
    resetRotation() { rotation?.reset(); },
    dispose() {
      disposed = true;
      rotation?.dispose();
      assetRequest.abort();
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', lost);
      disposeObject(scene);
      renderer.dispose();
    },
  };
}
