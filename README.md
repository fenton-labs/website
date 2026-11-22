# Fenton Labs

A small Three.js gallery with two generative sketches. Scroll to fade between Wire Knot and Particle Field.

## Local development

Use Node.js 24 LTS and npm. Your GitHub account needs read access to the `fenton-labs/3xperiments-utils` submodule.

```sh
git submodule update --init
npm install
npm run dev
```

Open `http://localhost:5173/website/`. To check the production build locally, run `npm run build` followed by `npm run preview` and open `http://localhost:4173/website/`.

## Sketches

Each sketch in `src/sketches/` has a Chromaton-style `_main_.js` class and `_settings_.js`. It adds objects through `env.addScene()`, updates through `animate(effectController)` with `effectController.time` in milliseconds, and releases its resources in `cleanup()`. The shared `RendererUtil` gives each sketch its own scene and camera on the gallery's single WebGL renderer. The sketches use `renderer.orbitControls: false` in their settings so touch gestures scroll the page.

The gallery renders a single sketch directly at either end of the scroll range. During the fade it renders both sketches offscreen and blends their textures. To enable independent postprocessing, set `post` in a sketch's `_settings_.js`, for example `post: { rgbShift: { amount: 0.002 } }`. During a fade the compositor uses each enabled composer's finished `readBuffer.texture`, which should stay in linear color with premultiplied alpha for blending.

## Deployment

In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Add the `UTILS_READ_TOKEN` Actions repository secret with a fine-grained GitHub token that has read-only **Contents** access to `fenton-labs/3xperiments-utils`. The workflow checks out the exact utilities commit recorded by the submodule. A push to `main` builds and publishes `dist/`. Check the **Deploy to GitHub Pages** workflow in the Actions tab for the deployment status.

The site is published at [fenton-labs.github.io/website/](https://fenton-labs.github.io/website/). Vite uses `/website/` as its base path.
