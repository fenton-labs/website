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

Each sketch in `src/sketches/` has a Chromaton-style `_main_.js` class and `_settings_.js`. The class adds its objects to the supplied `env.scene`, updates through `animate(effectController)` with `effectController.time` in milliseconds, and releases its resources in `cleanup()`. The gallery supplies the shared scene, camera, and renderer, and decides which sketches to animate from the scroll position.

## Deployment

In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Add the `UTILS_READ_TOKEN` Actions repository secret with a fine-grained GitHub token that has read-only **Contents** access to `fenton-labs/3xperiments-utils`. The workflow checks out the exact utilities commit recorded by the submodule. A push to `main` builds and publishes `dist/`. Check the **Deploy to GitHub Pages** workflow in the Actions tab for the deployment status.

The site is published at [fenton-labs.github.io/website/](https://fenton-labs.github.io/website/). Vite uses `/website/` as its base path.
