# One Case, Two Ways: Autonomous Hospital demo

A single-file 3D demo (Three.js from a CDN, no build step). It follows one gallbladder surgery in OR 2 of a four-OR surgery center, from pre-op check-in to the room being ready for the next patient.

The screen is split down the middle. The left side is how the circulating nurse works today. The right side is the same case with ceiling cameras, software and supply robots handling the record, the count check, the supplies and the reset calls. Both sides run on the same clock, with live counters for charting minutes, trips out of the room, phone calls and room reset minutes. A summary at the end compares the totals.

Use → / Space to advance, ← to go back, drag to move the view, scroll to zoom. On a phone the two sides stack top and bottom.

Fictional nurse and patient. Times and counts in the animation are illustrative; the pilot measures the real ones. The story text and numbers live in the `STEPS` list at the top of the script, so they can be edited without touching the 3D code.

## The older ICU demo

The earlier "A Day on 4B" ICU demo is kept at `icu/index.html` (served at `/icu` on the same Vercel site) and on the `icu` branch.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

## Deploy on Vercel

The Vercel project serves this folder as is (Output Directory `autonomous-hospital-demo`, no build). Merging to `main` updates the live link.
