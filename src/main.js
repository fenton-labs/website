import { MathUtils, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import { createParticleField } from './sketches/particle-field.js';
import { createWireKnot } from './sketches/wire-knot.js';
import './styles.css';

const aboutButton = document.querySelector('.about-button');
const aboutPanel = document.querySelector('#about');

aboutButton.addEventListener('click', () => {
  aboutPanel.hidden = !aboutPanel.hidden;
  aboutButton.setAttribute('aria-expanded', String(!aboutPanel.hidden));
});

const canvas = document.querySelector('#artwork');
const context = canvas.getContext('webgl2', { alpha: true, antialias: true });

if (context) {
  startGallery(new WebGLRenderer({ canvas, context, alpha: true, antialias: true }));
} else {
  document.querySelector('.artwork-fallback').hidden = false;
}

function startGallery(renderer) {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 30);
  camera.position.z = 8;

  const knot = createWireKnot();
  const particles = createParticleField();
  particles.object.renderOrder = 1;
  scene.add(knot.object, particles.object);

  const label = document.querySelector('#sketch-name');
  const scrollHint = document.querySelector('.scroll-hint');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frameId;
  let previousTime;
  let knotTime = 0;
  let particleTime = 0;

  function requestFrame() {
    if (frameId === undefined && !document.hidden) {
      frameId = window.requestAnimationFrame(render);
    }
  }

  function render(now) {
    frameId = undefined;
    const delta = reducedMotion.matches || previousTime === undefined
      ? 0
      : Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;

    const root = document.documentElement;
    const scrollRange = root.scrollHeight - root.clientHeight;
    const progress = MathUtils.clamp(window.scrollY / Math.max(1, scrollRange), 0, 1);
    const blend = MathUtils.smoothstep(progress, 0.12, 0.88);

    knot.object.visible = blend < 1;
    particles.object.visible = blend > 0;

    if (knot.object.visible) {
      knotTime += delta;
      knot.object.material.opacity = 0.83 * (1 - blend);
      knot.update(knotTime);
    }

    if (particles.object.visible) {
      particleTime += delta;
      particles.object.material.opacity = blend;
      particles.update(particleTime);
    }

    const name = progress < 0.42 ? 'Wire Knot' : progress > 0.58 ? 'Particle Field' : 'Transition';
    if (label.textContent !== name) label.textContent = name;

    const hint = progress >= 0.88 ? 'Scroll back to revisit' : 'Scroll to explore';
    if (scrollHint.textContent !== hint) scrollHint.textContent = hint;

    renderer.render(scene, camera);
    if (!reducedMotion.matches) requestFrame();
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const aspect = width / height;
    const halfHeight = 3.2 / Math.min(1, aspect);

    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    particles.object.material.size = Math.max(1.25, Math.min(width, height) / 350);
    requestFrame();
  }

  function resetAnimation() {
    window.cancelAnimationFrame(frameId);
    frameId = undefined;
    previousTime = undefined;
    requestFrame();
  }

  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', resetAnimation);
  reducedMotion.addEventListener('change', resetAnimation);
  resize();
}
