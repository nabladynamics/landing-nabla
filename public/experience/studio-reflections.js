// A locally authored studio reflection map. Used only by the CAD finishes;
// it does not alter the lighting of the cooling or engineering exhibits.
export function createStudioReflections(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const backdrop = context.createLinearGradient(0, 0, 0, 512);
  backdrop.addColorStop(0, '#ccd3d2');
  backdrop.addColorStop(0.38, '#647477');
  backdrop.addColorStop(0.6, '#929a97');
  backdrop.addColorStop(1, '#354449');
  context.fillStyle = backdrop;
  context.fillRect(0, 0, 1024, 512);
  for (const [x, width, alpha] of [[100, 170, 0.85], [525, 72, 0.7], [795, 125, 0.6]]) {
    const light = context.createLinearGradient(x - 28, 0, x + width + 28, 0);
    light.addColorStop(0, 'rgba(255,255,255,0)');
    light.addColorStop(0.18, `rgba(255,255,255,${alpha})`);
    light.addColorStop(0.82, `rgba(255,255,255,${alpha})`);
    light.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = light;
    context.fillRect(x - 28, 62, width + 56, 295);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'CAD studio softboxes';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}
