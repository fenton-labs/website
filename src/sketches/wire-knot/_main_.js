import {
  BufferAttribute,
  Color,
  LineBasicMaterial,
  LineSegments,
  TorusKnotGeometry,
  WireframeGeometry,
} from 'three';
import { mapRange } from '../../../shared/3x-utils/lib/functions.js';
import settings from './_settings_.js';

export class WireKnot {
  constructor(env) {
    this.env = env;
    this.setupScene();
  }

  setupScene() {
    const knot = new TorusKnotGeometry(settings.radius, settings.tubeRadius, 144, 12);
    const geometry = new WireframeGeometry(knot);
    knot.dispose();

    const positions = geometry.getAttribute('position');
    const colors = new Float32Array(positions.count * 3);
    const bronze = new Color(settings.bronze);
    const gold = new Color(settings.gold);
    const color = new Color();

    for (let index = 0; index < positions.count; index += 1) {
      const wave = Math.sin(positions.getX(index) + positions.getZ(index));
      color.lerpColors(bronze, gold, mapRange(wave, -1, 1, 0, 1)).toArray(colors, index * 3);
    }

    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const material = new LineBasicMaterial({
      vertexColors: true,
      opacity: settings.opacity,
      transparent: true,
      depthWrite: false,
    });
    this.object = new LineSegments(geometry, material);
    this.env.addScene(this.object);
  }

  animate(effectController) {
    const elapsed = effectController.time / 1000;
    this.object.rotation.set(0.42 + elapsed * 0.19, -0.34 + elapsed * 0.27, 0.16);
  }

  cleanup() {
    this.object.removeFromParent();
    this.object.geometry.dispose();
    this.object.material.dispose();
  }
}
