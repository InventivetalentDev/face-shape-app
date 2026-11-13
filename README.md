# Face shape

Upload a selfie to see your estimated face shape, a face outline, and four measurement
lines. Try on six SVG glasses styles that fit to your eyes. Drag the frames to move them,
or drag the handle to resize and rotate them. **Reset fit** restores their automatic fit.

## Run locally

Install the dependencies, then start the development server:

```sh
npm install
npm run dev
```

Run the unit tests with `npm test`. Build and preview the production app with its
Content Security Policy (CSP):

```sh
npm run build
npm run preview
```

The development and build scripts copy the installed MediaPipe WASM files into the
app's public assets. The face model is included in `public/models/face_landmarker.task`.

## Deploy

The app runs on Cloudflare Workers as static assets at https://whattheface.app. With
Wrangler logged in to the account that owns the domain, build and deploy with:

```sh
npm run deploy
```

`wrangler.jsonc` serves `dist/` with no Worker script and attaches the domain.

## Privacy and accuracy

Your photo never leaves this device. The browser orients and downscales it to at most
1600 pixels on its longest side, then runs detection locally. The app has no backend,
analytics, or persistence. All model and WASM requests use the app's own origin. The
production CSP blocks requests to other origins; it is omitted during development so
Vite's React Refresh script can run.

Use a well-lit, front-facing photo. Face-shape rules are a rough guide, not a science.
The classifier's constants are provisional, measured from 12 generated test faces.
