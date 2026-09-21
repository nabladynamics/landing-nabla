// Locally authored studio surfaces. Screen drawings are illustrative design
// viewports, not simulation results, product interfaces or measured telemetry.
export function createEngineeringMaterials(THREE) {
  let seed = 24117;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  function texture(width, height, paint, color = true) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    paint(canvas.getContext('2d'), width, height);
    const map = new THREE.CanvasTexture(canvas);
    if (color) map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return map;
  }

  function rectangle(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }

  function line(context, points, color, width = 1) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
    context.stroke();
  }

  function polygon(context, points, color, stroke) {
    context.beginPath();
    points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
    context.closePath();
    context.fillStyle = color;
    context.fill();
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = 1.5;
      context.stroke();
    }
  }

  function label(context, value, x, y, color = '#738080', size = 10) {
    context.font = `${size}px Arial, sans-serif`;
    context.fillStyle = color;
    context.fillText(value, x, y);
  }

  const grain = texture(1024, 512, (context, width, height) => {
    const wash = context.createLinearGradient(0, 0, 0, height);
    wash.addColorStop(0, '#978263');
    wash.addColorStop(0.48, '#a79576');
    wash.addColorStop(1, '#9e8868');
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);
    for (let i = 0; i < 600; i++) {
      const y = random() * height;
      const amplitude = 2 + random() * 7;
      const phase = random() * Math.PI * 2;
      const alpha = 0.025 + random() * 0.11;
      context.strokeStyle = i % 3 ? `rgba(75,47,22,${alpha})` : `rgba(255,240,208,${alpha * 1.2})`;
      context.lineWidth = 0.4 + random() * 1.1;
      context.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const gy = y + Math.sin(x / 170 + phase) * amplitude + Math.sin(x / 49 + phase) * 0.55;
        if (x === 0) context.moveTo(x, gy); else context.lineTo(x, gy);
      }
      context.stroke();
    }
    // Quiet pores interrupt the long grain without obvious repeating knots.
    for (let i = 0; i < 1450; i++) {
      rectangle(context, random() * width, random() * height, 1 + random() * 6, 0.5, 'rgba(68,42,19,0.09)');
    }
  });

  const endGrain = texture(256, 256, (context, width, height) => {
    rectangle(context, 0, 0, width, height, '#9d886d');
    for (let i = 0; i < 120; i++) {
      const x = random() * width;
      line(context, [[x, 0], [x + 2, 90], [x - 1, 256]], `rgba(88,59,30,${0.03 + random() * 0.07})`, 0.6);
    }
  });

  const micro = texture(128, 128, (context, width, height) => {
    const pixels = context.createImageData(width, height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const value = 118 + Math.floor(random() * 20);
      pixels.data[index] = pixels.data[index + 1] = pixels.data[index + 2] = value;
      pixels.data[index + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
  }, false);
  micro.wrapS = micro.wrapT = THREE.RepeatWrapping;
  micro.repeat.set(8, 8);

  const weave = texture(256, 256, (context, width, height) => {
    rectangle(context, 0, 0, width, height, '#545958');
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const light = (x / 4 + y / 4) % 2 === 0;
        rectangle(context, x, y, light ? 3 : 1, light ? 1 : 3, light ? '#777b77' : '#3f4545');
        rectangle(context, x + 1, y + 2, 2, 1, '#626762');
      }
    }
  });
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(3, 3);

  const meshWeave = texture(512, 768, (context, width, height) => {
    context.clearRect(0, 0, width, height);
    for (let x = 0; x <= width; x += 8) {
      rectangle(context, x, 0, 2.4, height, '#464e50');
      rectangle(context, x, 0, 0.7, height, '#8a9190');
    }
    for (let y = 0; y <= height; y += 8) {
      rectangle(context, 0, y, width, 2.2, '#555d5e');
      rectangle(context, 0, y, width, 0.65, '#8e9492');
    }
    rectangle(context, 0, 0, width, 5, '#30393b');
    rectangle(context, 0, height - 5, width, 5, '#30393b');
    rectangle(context, 0, 0, 5, height, '#30393b');
    rectangle(context, width - 5, 0, 5, height, '#30393b');
  });

  // Broad reflections local to these materials keep the other exhibits intact.
  const environment = texture(1024, 512, (context, width, height) => {
    const wash = context.createLinearGradient(0, 0, 0, height);
    wash.addColorStop(0, '#dfdfd9');
    wash.addColorStop(0.4, '#879291');
    wash.addColorStop(0.56, '#c4c9c6');
    wash.addColorStop(1, '#5c6b6c');
    context.fillStyle = wash;
    context.fillRect(0, 0, width, height);
    for (const [x, span, opacity] of [[110, 190, 0.82], [515, 76, 0.62], [785, 130, 0.48]]) {
      const strip = context.createLinearGradient(x - 20, 0, x + span + 20, 0);
      strip.addColorStop(0, 'rgba(255,255,255,0)');
      strip.addColorStop(0.17, `rgba(255,255,255,${opacity})`);
      strip.addColorStop(0.83, `rgba(255,255,255,${opacity})`);
      strip.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = strip;
      context.fillRect(x - 20, 70, span + 40, 320);
    }
  });
  environment.mapping = THREE.EquirectangularReflectionMapping;

  function viewportChrome(context, title) {
    rectangle(context, 0, 0, 1024, 640, '#e7ece9');
    rectangle(context, 0, 0, 1024, 26, '#263539');
    label(context, title, 17, 17, '#d5deda', 11);
    for (let i = 0; i < 3; i++) rectangle(context, 963 + i * 19, 10, 9, 6, '#7b8c8d');
    rectangle(context, 0, 26, 1024, 43, '#f6f7f3');
    for (let i = 0; i < 15; i++) {
      const x = 18 + i * 37;
      context.strokeStyle = i === 3 ? '#688f90' : '#8f9d9b';
      context.lineWidth = 1.4;
      context.strokeRect(x, 38, 12, 12);
      line(context, [[x + 2, 50], [x + 11, 39]], '#829692', 1);
    }
    rectangle(context, 0, 69, 163, 553, '#f4f5f1');
    line(context, [[163, 69], [163, 621]], '#cbd4d0');
    label(context, 'Design workspace', 14, 91, '#667875', 11);
    ['Assembly', 'Surface', 'Reference planes', 'Sections', 'Construction'].forEach((item, index) => {
      const y = 123 + index * 33;
      line(context, [[14, y - 5], [18, y - 1], [14, y + 3]], '#8a9995');
      context.strokeStyle = '#8d9e97';
      context.strokeRect(27, y - 7, 10, 10);
      label(context, item, 46, y + 1, '#7c8985', 10);
    });
    rectangle(context, 9, 162, 144, 23, 'rgba(104,145,140,0.10)');
    rectangle(context, 0, 621, 1024, 19, '#d4dcd8');
    label(context, 'Perspective', 177, 634, '#6d7e79', 9);
    // Subtle construction grid and neutral orientation marker; no data legend.
    context.save();
    context.beginPath(); context.rect(164, 70, 860, 551); context.clip();
    for (let x = -300; x < 1300; x += 64) {
      line(context, [[x, 620], [x + 600, 282]], 'rgba(124,148,144,0.14)', 0.7);
      line(context, [[x, 282], [x + 650, 620]], 'rgba(124,148,144,0.12)', 0.7);
    }
    context.restore();
    const cube = [[953, 99], [974, 89], [995, 100], [974, 112]];
    polygon(context, cube, '#cbd7d3', '#849a95');
    polygon(context, [[953, 99], [974, 112], [974, 135], [953, 121]], '#a8bdb7', '#849a95');
    polygon(context, [[974, 112], [995, 100], [995, 123], [974, 135]], '#dce4df', '#849a95');
    line(context, [[946, 586], [976, 586]], '#a87561', 1.8);
    line(context, [[946, 586], [946, 556]], '#6c9995', 1.8);
    line(context, [[946, 586], [928, 602]], '#8a9cab', 1.8);
  }

  function foil(context, dx = 0, dy = 0) {
    context.save();
    context.translate(dx, dy);
    // Swept wing study: shaded surfaces and edge curves create a clear CAD
    // volume instead of a chart or a made-up numeric performance result.
    polygon(context, [[309, 402], [656, 238], [872, 280], [485, 467]], '#a7bfba', '#668782');
    polygon(context, [[309, 402], [485, 467], [487, 484], [311, 415]], '#698c87', '#557b77');
    polygon(context, [[485, 467], [872, 280], [871, 291], [487, 484]], '#83a6a0', '#648981');
    context.strokeStyle = '#d5e2da';
    context.lineWidth = 1.5;
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      context.beginPath();
      context.moveTo(309 + (656 - 309) * t, 402 + (238 - 402) * t);
      context.bezierCurveTo(345 + 355 * t, 398 - 166 * t, 441 + 371 * t, 442 - 170 * t, 485 + 387 * t, 467 - 187 * t);
      context.stroke();
    }
    line(context, [[343, 407], [683, 245]], '#698f88', 1.1);
    line(context, [[449, 452], [831, 272]], '#698f88', 1.1);
    context.restore();
  }

  const cadScreen = texture(1024, 640, context => {
    viewportChrome(context, 'Surface study');
    foil(context);
    line(context, [[364, 349], [347, 331], [245, 331]], '#8c9f98', 1);
    label(context, 'Leading edge', 189, 324, '#7a8c85', 10);
    line(context, [[769, 303], [817, 341], [903, 341]], '#8c9f98', 1);
    label(context, 'Surface continuity', 807, 357, '#7a8c85', 10);
    rectangle(context, 190, 519, 227, 78, '#f3f5ef');
    label(context, 'Section view', 201, 537, '#768a81', 10);
    context.beginPath();
    context.moveTo(204, 575);
    context.bezierCurveTo(202, 557, 261, 548, 395, 575);
    context.bezierCurveTo(274, 571, 219, 583, 204, 575);
    context.closePath();
    context.fillStyle = '#c6d8ce'; context.fill();
    context.strokeStyle = '#709387'; context.lineWidth = 1.3; context.stroke();
  });

  const flowScreen = texture(1024, 640, context => {
    viewportChrome(context, 'Flow study');
    // A dark viewport distinguishes flow review from the light CAD workspace.
    // Restrained but sufficiently broad strokes survive at exhibit-view scale.
    const background = context.createLinearGradient(0, 69, 0, 621);
    background.addColorStop(0, '#142a34');
    background.addColorStop(1, '#243e45');
    context.fillStyle = background;
    context.fillRect(164, 69, 860, 552);
    context.save();
    context.beginPath(); context.rect(169, 72, 853, 545); context.clip();
    for (let x = -260; x < 1300; x += 85) {
      line(context, [[x, 620], [x + 600, 282]], 'rgba(140,185,185,0.10)', 1);
      line(context, [[x, 282], [x + 650, 620]], 'rgba(140,185,185,0.08)', 1);
    }
    for (let i = 0; i < 17; i++) {
      const y = 170 + i * 22;
      const displacement = Math.exp(-Math.pow((i - 8) / 4.7, 2)) * 75;
      context.beginPath();
      context.moveTo(193, y + 59);
      context.bezierCurveTo(400, y + 54, 429, y - displacement - 9, 610, y - displacement - 4);
      context.bezierCurveTo(799, y - displacement, 824, y - 37, 1020, y - 32);
      context.strokeStyle = i > 6 && i < 10 ? 'rgba(207,159,120,0.92)' : 'rgba(124,181,178,0.86)';
      context.lineWidth = i > 6 && i < 10 ? 4.0 : 2.8;
      context.stroke();
    }
    foil(context, 0, -5);
    context.restore();
    label(context, 'Illustrative flow paths', 181, 609, '#a6c1bd', 10);
  });

  const plan = texture(768, 1024, (context, width, height) => {
    rectangle(context, 0, 0, width, height, '#eeeae0');
    for (let y = 32; y < height; y += 24) line(context, [[29, y], [width - 29, y]], '#dddcd2', 0.6);
    label(context, 'Surface exploration', 59, 71, '#747b76', 23);
    line(context, [[58, 95], [696, 95]], '#9fa8a0', 1);
    const shapes = [
      [[93, 235], [527, 131], [663, 219], [233, 359]],
      [[124, 518], [498, 416], [632, 461], [295, 631]],
    ];
    shapes.forEach(points => {
      polygon(context, points, '#e1e6de', '#83958b');
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        line(context, [
          [points[0][0] + (points[1][0] - points[0][0]) * t, points[0][1] + (points[1][1] - points[0][1]) * t],
          [points[3][0] + (points[2][0] - points[3][0]) * t, points[3][1] + (points[2][1] - points[3][1]) * t],
        ], '#a2b3a8', 1);
      }
    });
    line(context, [[73, 715], [688, 715]], '#bdc6b9');
    label(context, 'Section details', 74, 750, '#7c887d', 16);
    for (let i = 0; i < 3; i++) {
      const y = 800 + i * 53;
      context.beginPath(); context.moveTo(92, y);
      context.bezierCurveTo(104, y - 38, 282, y - 15, 559, y);
      context.bezierCurveTo(251, y + 9, 95, y + 10, 92, y);
      context.strokeStyle = '#839689'; context.lineWidth = 1.4; context.stroke();
    }
    rectangle(context, 580, 924, 104, 40, '#d8dfd3');
    label(context, 'Design review', 589, 948, '#738377', 12);
  });

  const tablet = texture(960, 660, (context, width, height) => {
    rectangle(context, 0, 0, width, height, '#e8ede5');
    rectangle(context, 0, 0, width, 51, '#33423e');
    label(context, 'Design review', 29, 33, '#d4ded4', 17);
    label(context, 'Surface study', 39, 101, '#718277', 21);
    polygon(context, [[69, 324], [351, 194], [553, 248], [244, 437]], '#a8bfb1', '#799486');
    polygon(context, [[69, 324], [244, 437], [246, 455], [70, 337]], '#789c88', '#678b78');
    polygon(context, [[244, 437], [553, 248], [551, 265], [246, 455]], '#8cae9a', '#729380');
    for (let i = 1; i < 7; i++) {
      const t = i / 7;
      line(context, [[69 + 282 * t, 324 - 130 * t], [244 + 309 * t, 437 - 189 * t]], '#dae5d7', 1.1);
    }
    line(context, [[606, 131], [606, 543]], '#bccbc0');
    label(context, 'Review notes', 641, 167, '#7c8d7c', 16);
    for (let i = 0; i < 6; i++) {
      rectangle(context, 641, 197 + i * 24, i % 3 === 0 ? 188 : 258, 3, '#c5d0c2');
    }
    rectangle(context, 38, 582, 884, 29, '#d4dfcf');
  });

  const material = (color, roughness, metalness, extra = {}) => new THREE.MeshStandardMaterial({
    color, roughness, metalness, envMap: environment, envMapIntensity: 0.48, ...extra,
  });
  // Displays emit their own authored image. Studio illumination should not
  // wash away UI contrast or make their pixels look like a painted panel.
  const screen = map => new THREE.MeshBasicMaterial({ map, toneMapped: false });

  return {
    oak: material('#ffffff', 0.69, 0.02, { map: grain, bumpMap: grain, bumpScale: 0.0018 }),
    oakEdge: material('#ffffff', 0.72, 0.02, { map: endGrain }),
    black: material('#242e2e', 0.62, 0.4, { bumpMap: micro, bumpScale: 0.001 }),
    charcoal: material('#333c3c', 0.74, 0.1, { bumpMap: micro, bumpScale: 0.0008 }),
    aluminium: material('#aebbb9', 0.31, 0.82, { bumpMap: micro, bumpScale: 0.0006 }),
    chrome: material('#c8d2cf', 0.18, 0.95),
    rubber: material('#1c2828', 0.94, 0.01),
    fabric: material('#69716d', 0.95, 0, { map: weave, bumpMap: weave, bumpScale: 0.0013 }),
    mesh: material('#7a8681', 0.87, 0.06, {
      map: meshWeave, alphaTest: 0.35, alphaToCoverage: true, side: THREE.DoubleSide,
    }),
    paper: material('#ffffff', 0.95, 0, { map: plan }),
    leather: material('#46504a', 0.89, 0.01, { bumpMap: micro, bumpScale: 0.0013 }),
    ceramic: material('#e8e6dc', 0.32, 0.02),
    glass: new THREE.MeshPhysicalMaterial({
      color: '#d9e9e3', roughness: 0.12, metalness: 0, transparent: true, opacity: 0.23,
      depthWrite: false, side: THREE.DoubleSide, envMap: environment, envMapIntensity: 0.65,
      clearcoat: 1, clearcoatRoughness: 0.08,
    }),
    screenCAD: screen(cadScreen),
    screenFlow: screen(flowScreen),
    tabletScreen: screen(tablet),
    prototype: material('#b9cbc2', 0.36, 0.48),
    lampShade: material('#ebe9df', 0.41, 0.2),
    led: new THREE.MeshBasicMaterial({ color: '#f5e8ca', toneMapped: false }),
  };
}
