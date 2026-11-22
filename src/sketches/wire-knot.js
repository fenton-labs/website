import {
  BufferAttribute,
  Color,
  LineBasicMaterial,
  LineSegments,
  TorusKnotGeometry,
  WireframeGeometry,
} from 'three';

export function createWireKnot() {
  const knot = new TorusKnotGeometry(1.14, 0.33, 144, 12);
  const geometry = new WireframeGeometry(knot);
  knot.dispose();

  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const bronze = new Color('#8e4d2e');
  const gold = new Color('#f9cb87');
  const color = new Color();

  for (let index = 0; index < positions.count; index += 1) {
    const blend = 0.5 + 0.5 * Math.sin(positions.getX(index) + positions.getZ(index));
    color.lerpColors(bronze, gold, blend).toArray(colors, index * 3);
  }

  geometry.setAttribute('color', new BufferAttribute(colors, 3));

  const material = new LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false });
  const object = new LineSegments(geometry, material);

  return {
    object,
    update(elapsed) {
      object.rotation.set(0.42 + elapsed * 0.19, -0.34 + elapsed * 0.27, 0.16);
    },
  };
}
