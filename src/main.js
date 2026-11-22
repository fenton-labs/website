import { MathUtils, WebGLRenderer } from 'three';
import { RendererUtil } from '../shared/3x-utils/lib/util-renderer.js';
import { Crossfade } from './crossfade.js';
import { ParticleField } from './sketches/particle-field/_main_.js';
import particleSettings from './sketches/particle-field/_settings_.js';
import { WireKnot } from './sketches/wire-knot/_main_.js';
import knotSettings from './sketches/wire-knot/_settings_.js';
import './styles.css';

// The fade covers the middle of the page, leaving each sketch fully visible at its end.
const FADE = .05

const FADE_START = FADE;
const FADE_END = 1 - FADE;

setupAboutPanel();
startGallery(document.querySelector('#artwork'));

function setupAboutPanel() {
  const button = document.querySelector('.about-button');
  const panel = document.querySelector('#about');

  button.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', String(!panel.hidden));
  });
}

function startGallery(canvas) {
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
  if (!context) {
    document.querySelector('.artwork-fallback').hidden = false;
    return;
  }

  // The gallery owns the WebGL context. Each sketch gets its own scene and camera.
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  const knot = new WireKnot(new RendererUtil(knotSettings, { renderer }));
  const particles = new ParticleField(new RendererUtil(particleSettings, { renderer }));
  const crossfade = new Crossfade(renderer);

  const label = document.querySelector('#sketch-name');
  const scrollHint = document.querySelector('.scroll-hint');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frameId;
  let previousTime;
  let knotTime = 0;
  let particleTime = 0;

  function render(now) {
    frameId = undefined;
    // Use milliseconds for the sketch clocks and cap the step after a slow frame.
    const delta = reducedMotion.matches || previousTime === undefined
      ? 0
      : Math.min(now - previousTime, 50);
    previousTime = now;

    const progress = getScrollProgress();
    const blend = MathUtils.clamp((progress - FADE_START) / (FADE_END - FADE_START), 0, 1);
    renderSketches(blend, delta);
    updateCaption(progress);

    // With reduced motion, scroll and resize events still request a frame.
    if (!reducedMotion.matches) requestFrame();
  }

  function getScrollProgress() {
    // Derive progress from the current scroll position so it tracks in either direction.
    const root = document.documentElement;
    const scrollRange = root.scrollHeight - root.clientHeight;
    return MathUtils.clamp(window.scrollY / Math.max(1, scrollRange), 0, 1);
  }

  function renderSketches(blend, delta) {
    // Each sketch keeps its own elapsed time. A hidden sketch resumes from where it paused.
    if (blend < 1) {
      knotTime += delta;
      knot.animate({ time: knotTime });
    }
    if (blend > 0) {
      particleTime += delta;
      particles.animate({ time: particleTime });
    }

    if (blend === 0) {
      knot.env.render(null);
    } else if (blend === 1) {
      particles.env.render(null);
    } else {
      // Only the overlap needs two offscreen renders and a full-screen blend.
      const textureA = knot.env.render(crossfade.targetA);
      const textureB = particles.env.render(crossfade.targetB);
      crossfade.render(textureA, textureB, blend);
    }
  }

  function updateCaption(progress) {
    // Show the transition label around the middle of the fade.
    let name = 'Transition';
    if (progress < 0.42) name = 'Wire Knot';
    if (progress > 0.58) name = 'Particle Field';
    if (label.textContent !== name) label.textContent = name;

    const hint = progress >= FADE_END ? 'Scroll back to revisit' : 'Scroll to explore';
    if (scrollHint.textContent !== hint) scrollHint.textContent = hint;
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    // Limit the drawing buffer size on high-density displays.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    crossfade.resize(canvas.width, canvas.height);
    knot.env.resize(width, height);
    particles.env.resize(width, height);
    particles.resize(width, height);
    requestFrame();
  }

  function requestFrame() {
    if (frameId === undefined && !document.hidden) {
      frameId = window.requestAnimationFrame(render);
    }
  }

  function resetAnimation() {
    window.cancelAnimationFrame(frameId);
    frameId = undefined;
    // Start the next frame with a fresh timestamp after a visibility or motion change.
    previousTime = undefined;
    requestFrame();
  }

  function disposeGallery(event) {
    // Keep the gallery alive when the browser caches the page for Back or Forward.
    if (event.persisted) return;

    listeners.abort();
    window.cancelAnimationFrame(frameId);
    knot.cleanup();
    particles.cleanup();
    knot.env.dispose();
    particles.env.dispose();
    crossfade.dispose();
    renderer.dispose();
  }

  // Use one signal so teardown removes all of the gallery's event listeners.
  const listeners = new AbortController();
  const { signal } = listeners;
  window.addEventListener('scroll', requestFrame, { passive: true, signal });
  window.addEventListener('resize', resize, { signal });
  document.addEventListener('visibilitychange', resetAnimation, { signal });
  reducedMotion.addEventListener('change', resetAnimation, { signal });
  window.addEventListener('pagehide', disposeGallery, { signal });
  resize();
}
