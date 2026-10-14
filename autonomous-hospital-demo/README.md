# A Day on 4B: Autonomous Hospital demo

A presenter-led, single-file 3D demo (Three.js from a CDN, no build step).

1. **Today:** a day in the life of nurse Jordan Lee on unit 4B.
2. **Autonomous Hospital:** the same day replayed with the verifier layer, the new handoff and the five admin metrics.
3. **Roadmap:** Pilot, then steps 2, 3 and 4.

Use → / Space to advance, ← to go back, scroll to zoom, and click anything for an explanation. Future-side devices have a **See the hardware** button with a 3D close-up you can turn and take apart. **Street view** (top right) lets you drop in anywhere and walk around: click the floor to walk, drag to look, W A S D to move, Esc for the map.

Fictional nurse and patients. Numbers are illustrative; clinicians make every clinical call.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

## Deploy on Vercel

Import the repo at vercel.com/new, set **Root Directory** to `autonomous-hospital-demo`
and **Framework Preset** to **Other**. There's no build command; Vercel serves `index.html` as is.
