/**
 * Smooth display pipework with tangent circular elbows. Straight spans need
 * few rings; every elbow receives its own angular sampling budget. Shared by
 * the solid plumbing and its animated thermal overlay to keep them aligned.
 */
export function createDataCentrePipeGeometry(THREE, points, radius, {
  bend = 0.1,
  routeRadius = radius,
} = {}) {
  const epsilon = 1e-8;
  const vectors = [];
  for (const point of points) {
    const vector = new THREE.Vector3(...point);
    if (!vectors.length || vectors[vectors.length - 1].distanceToSquared(vector) > epsilon * epsilon) vectors.push(vector);
  }
  if (vectors.length < 2 || radius <= 0 || routeRadius <= 0) throw new Error("A pipe needs distinct endpoints and a positive radius.");

  // Canonical direction makes local simplification and transported frames
  // identical when a thermal route runs opposite to the physical pipe.
  const first = vectors[0], last = vectors[vectors.length - 1];
  const reversed = first.x !== last.x ? first.x > last.x : first.y !== last.y ? first.y > last.y : first.z > last.z;
  if (reversed) vectors.reverse();
  const minimumRadius = routeRadius * 1.6;

  // A sub-diameter zigzag cannot contain a non-pinching elbow. Omit only such
  // interior guide points; endpoints, manifold anchors and long runs stay put.
  let simplified = true;
  while (simplified && vectors.length > 2) {
    simplified = false;
    for (let i = 1; i < vectors.length - 1; i++) {
      const incoming = vectors[i].clone().sub(vectors[i - 1]);
      const outgoing = vectors[i + 1].clone().sub(vectors[i]);
      const lengthIn = incoming.length(), lengthOut = outgoing.length();
      incoming.normalize(); outgoing.normalize();
      const angle = Math.acos(THREE.MathUtils.clamp(incoming.dot(outgoing), -1, 1));
      const needed = minimumRadius * Math.tan(angle * 0.5);
      const available = Math.min(lengthIn, lengthOut) * 0.45;
      if (angle < 0.001 || needed > available + epsilon) {
        vectors.splice(i, 1);
        simplified = true;
        break;
      }
    }
  }

  const sections = [];
  let cursor = vectors[0].clone();
  let actualMinimumRadius = Infinity;
  function straight(to) {
    const direction = to.clone().sub(cursor);
    const length = direction.length();
    if (length > epsilon) sections.push({ kind: "line", from: cursor.clone(), to: to.clone(), tangent: direction.divideScalar(length), length });
    cursor.copy(to);
  }
  for (let i = 1; i < vectors.length - 1; i++) {
    const before = vectors[i - 1], corner = vectors[i], after = vectors[i + 1];
    const incoming = corner.clone().sub(before).normalize();
    const outgoing = after.clone().sub(corner).normalize();
    const angle = Math.acos(THREE.MathUtils.clamp(incoming.dot(outgoing), -1, 1));
    if (angle < 0.001) continue;
    const halfTangent = Math.tan(angle * 0.5);
    const available = Math.min(before.distanceTo(corner), after.distanceTo(corner)) * 0.45;
    const cutback = Math.min(Math.max(bend, minimumRadius * halfTangent), available);
    const elbowRadius = cutback / halfTangent;
    const axis = incoming.clone().cross(outgoing).normalize();
    const entry = corner.clone().addScaledVector(incoming, -cutback);
    const exit = corner.clone().addScaledVector(outgoing, cutback);
    const centre = entry.clone().addScaledVector(axis.clone().cross(incoming), elbowRadius);
    straight(entry);
    sections.push({ kind: "arc", centre, radial: entry.clone().sub(centre), tangent: incoming,
      axis, angle, to: exit, length: elbowRadius * angle });
    actualMinimumRadius = Math.min(actualMinimumRadius, elbowRadius);
    cursor.copy(exit);
  }
  straight(vectors[vectors.length - 1]);

  const centres = [sections[0].from.clone()];
  const tangents = [sections[0].tangent.clone()];
  const distances = [0];
  let travelled = 0;
  for (const section of sections) {
    if (section.kind === "line") {
      travelled += section.length;
      centres.push(section.to.clone());
      tangents.push(section.tangent.clone());
      distances.push(travelled);
    } else {
      const steps = Math.max(3, Math.ceil(section.angle / (Math.PI / 30)));
      for (let step = 1; step <= steps; step++) {
        const angle = section.angle * step / steps;
        centres.push(step === steps ? section.to.clone() : section.centre.clone().add(section.radial.clone().applyAxisAngle(section.axis, angle)));
        tangents.push(section.tangent.clone().applyAxisAngle(section.axis, angle).normalize());
        distances.push(travelled + section.length * step / steps);
      }
      travelled += section.length;
    }
  }

  const radialSegments = routeRadius < 0.025 ? 12 : 20;
  const stride = radialSegments + 1;
  const vertexCount = centres.length * stride;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uv = new Float32Array(vertexCount * 2);
  const indices = [];
  const tangent = tangents[0];
  const axis = Math.abs(tangent.x) <= Math.abs(tangent.y) && Math.abs(tangent.x) <= Math.abs(tangent.z)
    ? new THREE.Vector3(1, 0, 0) : Math.abs(tangent.y) <= Math.abs(tangent.z) ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
  const normal = tangent.clone().cross(axis).normalize();
  const transport = new THREE.Quaternion();
  const binormal = new THREE.Vector3();
  const radial = new THREE.Vector3();
  const position = new THREE.Vector3();
  for (let ring = 0; ring < centres.length; ring++) {
    if (ring) normal.applyQuaternion(transport.setFromUnitVectors(tangents[ring - 1], tangents[ring])).normalize();
    binormal.crossVectors(tangents[ring], normal).normalize();
    const fraction = distances[ring] / travelled;
    for (let edge = 0; edge <= radialSegments; edge++) {
      const angle = edge / radialSegments * Math.PI * 2;
      radial.copy(normal).multiplyScalar(Math.cos(angle)).addScaledVector(binormal, Math.sin(angle)).normalize();
      position.copy(centres[ring]).addScaledVector(radial, radius);
      const vertex = ring * stride + edge;
      positions.set(position.toArray(), vertex * 3);
      normals.set(radial.toArray(), vertex * 3);
      uv[vertex * 2] = reversed ? 1 - fraction : fraction;
      uv[vertex * 2 + 1] = edge / radialSegments;
      if (ring < centres.length - 1 && edge < radialSegments) {
        const a = vertex, b = vertex + stride, c = b + 1, d = a + 1;
        indices.push(a, d, b, b, d, c);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.userData.pipe = {
    radius, routeRadius, minimumElbowRadius: Number.isFinite(actualMinimumRadius) ? actualMinimumRadius : null,
    rings: centres.length, radialSegments, controls: vectors.map(point => point.toArray()),
    centreline: centres.map(point => point.toArray()),
  };
  return geometry;
}
