import { BufferAttribute, BufferGeometry, Color, Points, PointsMaterial } from 'three';
import { mapRange } from '../../../shared/3x-utils/lib/functions.js';
import settings from './_settings_.js';

export class ParticleField {
  constructor(env) {
    this.env = env;
    this.setupScene();
  }

  setupScene() {
    const { count } = settings;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const indigo = new Color(settings.indigo);
    const cyan = new Color(settings.cyan);
    const color = new Color();
    let seed = settings.seed;

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
      color.lerpColors(indigo, cyan, random()).multiplyScalar(mapRange(random(), 0, 1, 0.35, 1));
      color.toArray(colors, offset);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    const material = new PointsMaterial({ size: 2, vertexColors: true, transparent: true, depthWrite: false });
    this.object = new Points(geometry, material);
    this.env.scene.add(this.object);
  }

  animate(effectController) {
    const elapsed = effectController.time / 1000;
    this.object.rotation.set(0.42, -0.12, elapsed * 0.16);
  }

  resize(width, height) {
    this.object.material.size = Math.max(1.25, Math.min(width, height) / 350);
  }

  cleanup() {
    this.object.removeFromParent();
    this.object.geometry.dispose();
    this.object.material.dispose();
  }
}
