/**
 * Identify the separate engine and vertical-tail parts in the supplied aircraft.
 * Shared positions reconnect normal seams for classification only. The original
 * vertex positions, indices and normals are never changed.
 */
export function assignAircraftParts(THREE, geometry) {
  const existing = geometry.getAttribute('nablaAircraftPart');
  if (existing) return existing;

  const position = geometry.getAttribute('position');
  const index = geometry.getIndex();
  if (!position || position.itemSize < 3 || position.count === 0) {
    throw new TypeError('Aircraft geometry requires three-dimensional positions.');
  }
  const count = index ? index.count : position.count;
  if (count % 3 !== 0) throw new TypeError('Aircraft geometry requires complete triangles.');

  const parents = new Int32Array(position.count);
  const sizes = new Uint32Array(position.count);
  const sharedPositions = new Map();
  const find = (vertex) => {
    while (parents[vertex] !== vertex) {
      parents[vertex] = parents[parents[vertex]];
      vertex = parents[vertex];
    }
    return vertex;
  };
  const join = (a, b) => {
    let first = find(a);
    let second = find(b);
    if (first === second) return;
    if (sizes[first] < sizes[second]) [first, second] = [second, first];
    parents[second] = first;
    sizes[first] += sizes[second];
  };

  for (let vertex = 0; vertex < position.count; vertex++) {
    parents[vertex] = vertex;
    sizes[vertex] = 1;
    const x = position.getX(vertex);
    const y = position.getY(vertex);
    const z = position.getZ(vertex);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      throw new TypeError('Aircraft positions must be finite.');
    }
    const key = `${Math.round(x * 1e5)},${Math.round(y * 1e5)},${Math.round(z * 1e5)}`;
    const previous = sharedPositions.get(key);
    if (previous === undefined) sharedPositions.set(key, vertex);
    else join(vertex, previous);
  }

  for (let offset = 0; offset < count; offset += 3) {
    const a = index ? index.getX(offset) : offset;
    const b = index ? index.getX(offset + 1) : offset + 1;
    const c = index ? index.getX(offset + 2) : offset + 2;
    if (![a, b, c].every((vertex) => Number.isInteger(vertex) && vertex >= 0 && vertex < position.count)) {
      throw new TypeError('Aircraft triangle indices must reference valid vertices.');
    }
    join(a, b);
    join(a, c);
  }

  const components = new Map();
  for (let vertex = 0; vertex < position.count; vertex++) {
    const id = find(vertex);
    let part = components.get(id);
    if (!part) {
      part = { low: [Infinity, Infinity, Infinity], high: [-Infinity, -Infinity, -Infinity] };
      components.set(id, part);
    }
    const xyz = [position.getX(vertex), position.getY(vertex), position.getZ(vertex)];
    for (let axis = 0; axis < 3; axis++) {
      part.low[axis] = Math.min(part.low[axis], xyz[axis]);
      part.high[axis] = Math.max(part.high[axis], xyz[axis]);
    }
  }

  for (const part of components.values()) {
    const [left, bottom, near] = part.low;
    const [right, top, far] = part.high;
    const length = right - left;
    const height = top - bottom;
    const width = far - near;
    const distanceFromCentre = near * far > 0 ? Math.min(Math.abs(near), Math.abs(far)) : 0;
    // Bounds are in this CAD's normalized Y-up, nose -X coordinates. Classify
    // complete detached parts, rather than painting every surface below a height.
    part.engine = distanceFromCentre > 1.3 && length > 0.65 && length < 1.65
      && height > 0.35 && height < 0.65 && width > 0.30 && width < 0.65
      && top < 1.18 && left > -1.65 && right < 1.22;
    part.fin = left > 2.5 && bottom > 1.50 && top > 1.95 && height > 0.3 && width < 0.2
      && Math.max(Math.abs(near), Math.abs(far)) < 0.12;
  }

  const flags = new Uint8Array(position.count * 2);
  for (let vertex = 0; vertex < position.count; vertex++) {
    const part = components.get(find(vertex));
    flags[vertex * 2] = part.engine ? 255 : 0;
    flags[vertex * 2 + 1] = part.fin ? 255 : 0;
  }
  const attribute = new THREE.BufferAttribute(flags, 2, true);
  geometry.setAttribute('nablaAircraftPart', attribute);
  return attribute;
}
