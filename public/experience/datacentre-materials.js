// Locally authored surface detail for the cooling exhibit. These are material
// textures, not simulation imagery, product branding or measured telemetry.
export function createDataCentreMaterials(THREE) {
  function texture(width, height, paint, color = true) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    paint(context, width, height);
    const map = new THREE.CanvasTexture(canvas);
    if (color) map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
  }

  function rect(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }

  function screw(context, x, y, radius = 4) {
    const gradient = context.createRadialGradient(x - 1, y - 1, 0, x, y, radius);
    gradient.addColorStop(0, '#a6adb0');
    gradient.addColorStop(0.6, '#555e63');
    gradient.addColorStop(1, '#171c1f');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    rect(context, x - radius * 0.55, y - 0.6, radius * 1.1, 1.2, '#101517');
  }

  const microSurface = texture(128, 128, (context, width, height) => {
    const pixels = context.createImageData(width, height);
    let seed = 1927;
    for (let i = 0; i < pixels.data.length; i += 4) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const value = 122 + (seed % 15);
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = value;
      pixels.data[i + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
  }, false);
  microSurface.wrapS = microSurface.wrapT = THREE.RepeatWrapping;
  microSurface.repeat.set(5, 12);

  // Broad studio reflections give steel edge highlights without adding lights
  // or changing the appearance of the other exhibits.
  const environment = texture(1024, 512, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#d5dbdd');
    gradient.addColorStop(0.36, '#747e84');
    gradient.addColorStop(0.55, '#a4acae');
    gradient.addColorStop(1, '#59636a');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    for (const [x, w, alpha] of [[125, 135, 0.8], [580, 65, 0.58], [790, 100, 0.36]]) {
      const glow = context.createLinearGradient(x - 24, 0, x + w + 24, 0);
      glow.addColorStop(0, 'rgba(255,255,255,0)');
      glow.addColorStop(0.18, `rgba(255,255,255,${alpha})`);
      glow.addColorStop(0.82, `rgba(255,255,255,${alpha})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = glow;
      context.fillRect(x - 24, 75, w + 48, 300);
    }
  });
  environment.mapping = THREE.EquirectangularReflectionMapping;

  const perforation = texture(512, 1536, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#535a5e');
    gradient.addColorStop(0.4, '#798084');
    gradient.addColorStop(1, '#555d60');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'destination-out';
    for (let row = 0, y = 14; y < height - 12; row++, y += 12) {
      for (let x = 14 + (row % 2) * 6; x < width - 12; x += 12) {
        context.beginPath();
        context.arc(x, y, 4.55, 0, Math.PI * 2);
        context.fill();
      }
    }
    context.globalCompositeOperation = 'source-over';
    rect(context, 0, 0, 7, height, '#383e41');
    rect(context, width - 7, 0, 7, height, '#383e41');
    rect(context, 0, 0, width, 7, '#383e41');
    rect(context, 0, height - 7, width, 7, '#383e41');
  });

  const serverFace = texture(1024, 192, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#737a7c');
    gradient.addColorStop(0.16, '#42494c');
    gradient.addColorStop(0.88, '#30373b');
    gradient.addColorStop(1, '#1b2226');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    rect(context, 10, 10, 1004, 4, '#8a9294');
    rect(context, 12, 178, 1000, 7, '#13191c');
    for (const x of [29, 995]) for (const y of [34, 158]) screw(context, x, y, 7);
    for (let bay = 0; bay < 8; bay++) {
      const x = 86 + bay * 102;
      rect(context, x, 27, 94, 139, '#131a1d');
      rect(context, x + 3, 30, 87, 3, '#737c81');
      rect(context, x + 7, 38, 76, 116, bay % 3 === 0 ? '#343d41' : '#2c3438');
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 6; col++) {
          rect(context, x + 13 + col * 11, 46 + row * 10, 6, 5, '#11181b');
        }
      }
      rect(context, x + 15, 143, 58, 5, '#687175');
      rect(context, x + 68, 135, 10, 4, bay % 4 === 0 ? '#7ba994' : '#5b6468');
    }
    rect(context, 48, 46, 17, 102, '#171e22');
    rect(context, 51, 49, 3, 94, '#859094');
    rect(context, 925, 44, 32, 20, '#141d23');
    rect(context, 930, 48, 21, 7, '#4d6672');
    for (let i = 0; i < 3; i++) {
      context.beginPath();
      context.arc(941, 88 + i * 23, 3.3, 0, Math.PI * 2);
      context.fillStyle = i === 0 ? '#74b69a' : '#557c87';
      context.fill();
    }
    rect(context, 977, 46, 8, 105, '#232c30');
  });

  const cduFace = texture(512, 1024, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#aeb8bc');
    gradient.addColorStop(0.35, '#d3d9da');
    gradient.addColorStop(0.82, '#c6cecf');
    gradient.addColorStop(1, '#a5b0b4');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    rect(context, 18, 20, 476, 5, '#e1e5e5');
    rect(context, 27, 65, 458, 253, '#404b51');
    rect(context, 75, 103, 320, 145, '#101f29');
    context.font = '17px Arial, sans-serif';
    context.fillStyle = '#c9d5d9';
    context.fillText('Liquid cooling', 94, 130);
    context.strokeStyle = '#648f9b';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(105, 163); context.lineTo(202, 163);
    context.lineTo(202, 209); context.lineTo(353, 209);
    context.stroke();
    context.strokeStyle = '#b68166';
    context.beginPath();
    context.moveTo(105, 191); context.lineTo(169, 191);
    context.lineTo(169, 151); context.lineTo(353, 151);
    context.stroke();
    for (const [x, y] of [[112, 163], [251, 209], [278, 151]]) {
      rect(context, x, y - 9, 27, 18, '#283d47');
      rect(context, x + 3, y - 6, 21, 12, '#617b83');
    }
    rect(context, 440, 164, 12, 45, '#8faaa1');
    for (const y of [345, 639]) {
      rect(context, 18, y, 475, 3, '#78858a');
      rect(context, 18, y + 3, 475, 2, '#e2e6e6');
    }
    for (let row = 0; row < 24; row++) {
      for (let col = 0; col < 34; col++) {
        rect(context, 47 + col * 12, 693 + row * 10, 7, 4, '#48555b');
      }
    }
    rect(context, 440, 393, 20, 127, '#59676c');
    rect(context, 445, 397, 10, 118, '#b0bbbf');
    for (const x of [30, 482]) for (const y of [44, 365, 615, 971]) screw(context, x, y, 5);
  });

  const metal = (color, roughness, metalness, extra = {}) => new THREE.MeshStandardMaterial({
    color, roughness, metalness, envMap: environment, envMapIntensity: 0.5,
    ...extra,
  });

  return {
    frame: metal('#20282d', 0.46, 0.52),
    cabinet: metal('#323b40', 0.6, 0.35, { bumpMap: microSurface, bumpScale: 0.003 }),
    steel: metal('#abb8bf', 0.27, 0.86),
    aluminium: metal('#9aa8ad', 0.4, 0.73, { bumpMap: microSurface, bumpScale: 0.001 }),
    rubber: metal('#172024', 0.92, 0.03),
    door: metal('#566268', 0.58, 0.42, {
      map: perforation, alphaTest: 0.3, alphaToCoverage: true, side: THREE.DoubleSide,
    }),
    serverFace: metal('#ffffff', 0.51, 0.38, { map: serverFace }),
    cduFace: metal('#ffffff', 0.43, 0.55, { map: cduFace }),
    floor: metal('#b4bebf', 0.91, 0.06, { bumpMap: microSurface, bumpScale: 0.002 }),
    pipeSupply: metal('#427e90', 0.4, 0.43),
    pipeReturn: metal('#ae755d', 0.44, 0.47),
    ledGreen: new THREE.MeshBasicMaterial({ color: '#8ebea1', toneMapped: false }),
    ledBlue: new THREE.MeshBasicMaterial({ color: '#83aebe', toneMapped: false }),
    screen: metal('#102c3c', 0.27, 0.15, { emissive: '#173b4b', emissiveIntensity: 0.25 }),
  };
}
