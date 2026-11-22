import { BufferAttribute, BufferGeometry, Color, Points, PointsMaterial } from 'three';

export function createParticleField() {
  const count = 1900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const indigo = new Color('#796bd3');
  const cyan = new Color('#ace9e4');
  const color = new Color();
  let seed = 28;

  // A fixed seed keeps the field consistent between visits.
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const radius = 0.14 + Math.pow(random(), 0.75) * 2.45;
    const spread = (random() - 0.5) * (0.7 + radius * 0.42);
    const angle = index % 3 * Math.PI * 2 / 3 + radius * 2.1 + spread;
    positions[offset] = Math.cos(angle) * radius;
    positions[offset + 1] = Math.sin(angle) * radius * 0.8;
    positions[offset + 2] = (random() - 0.5) * (0.86 - radius * 0.2);
    color.lerpColors(indigo, cyan, random()).multiplyScalar(0.35 + random() * 0.65);
    color.toArray(colors, offset);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));

  const material = new PointsMaterial({ size: 2, vertexColors: true, transparent: true, depthWrite: false });
  const object = new Points(geometry, material);

  return {
    object,
    update(elapsed) {
      object.rotation.set(0.42, -0.12, elapsed * 0.16);
    },
  };
}
