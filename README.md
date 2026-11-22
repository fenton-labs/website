# Fenton Labs

A small Three.js gallery with two generative sketches. Scroll to fade between Wire Knot and Particle Field.

## Local development

Use Node.js 24 LTS and npm.

```sh
npm install
npm run dev
```

Open `http://localhost:5173/website/`. To check the production build locally, run `npm run build` followed by `npm run preview` and open `http://localhost:4173/website/`.

## Deployment

In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. A push to `main` builds and publishes `dist/`. Check the **Deploy to GitHub Pages** workflow in the Actions tab for the deployment status.

The site is published at [fenton-labs.github.io/website/](https://fenton-labs.github.io/website/). Vite uses `/website/` as its base path.
