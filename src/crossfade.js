import { NoBlending, ShaderMaterial, WebGLRenderTarget } from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

export class Crossfade {
  constructor(renderer) {
    this.renderer = renderer;
    this.targetA = new WebGLRenderTarget();
    this.targetB = new WebGLRenderTarget();
    this.material = new ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        textureB: { value: null },
        progress: { value: 0 },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D textureA;
        uniform sampler2D textureB;
        uniform float progress;
        varying vec2 vUv;

        void main() {
          vec4 color = mix(texture2D(textureA, vUv), texture2D(textureB, vUv), progress);

          // Convert straight color to the canvas color space, then restore premultiplied alpha.
          // This lets the CSS background show through transparent areas of either sketch.
          gl_FragColor = vec4(color.rgb / max(color.a, 0.00001), color.a);
          #include <colorspace_fragment>
          #include <premultiplied_alpha_fragment>
        }
      `,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
      premultipliedAlpha: true,
      toneMapped: false,
    });
    this.quad = new FullScreenQuad(this.material);
  }

  resize(width, height) {
    this.targetA.setSize(width, height);
    this.targetB.setSize(width, height);
  }

  render(textureA, textureB, progress) {
    this.material.uniforms.textureA.value = textureA;
    this.material.uniforms.textureB.value = textureB;
    this.material.uniforms.progress.value = progress;

    this.renderer.setRenderTarget(null);
    this.quad.render(this.renderer);
  }

  dispose() {
    this.targetA.dispose();
    this.targetB.dispose();
    this.material.dispose();
    this.quad.dispose();
  }
}
