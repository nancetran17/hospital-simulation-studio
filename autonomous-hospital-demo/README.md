# Sam's Day, Two Ways: Autonomous Hospital demo

A single-file 3D demo (Three.js from a CDN, no build step). It follows one surgery in OR 2, from the patient coming in to the room being ready for the next patient, in six moments.

The screen is split down the middle. The left side is Sam, the circulating nurse, working today. The right side is the same surgery with our five products installed: Perception Kit: Granola + Eyes (cameras and mics that write the case record), Coding and billing, Ceiling rail boxes, a Robot picking arm, and a Cleaning robot. Each moment shows one or two products at work, with one plain sentence per side, a big callout in the room, and a "Sam's time" bar that splits Sam's minutes into hands-on care, typing, walking out of the room, and waiting. A summary at the end lists what each product changed.

Use Next or → / Space to advance, ← to go back. On a phone the two sides stack top and bottom.

Fictional nurse and patient. Times are illustrative; a pilot measures the real ones. The products, the story text and the numbers live in `PRODUCTS` and `STEPS` at the top of the script, so they can be edited without touching the 3D code.

## The older ICU demo

The earlier "A Day on 4B" ICU demo is kept at `icu/index.html` (served at `/icu` on the same Vercel site) and on the `icu` branch.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

## Deploy on Vercel

The Vercel project serves this folder as is (Output Directory `autonomous-hospital-demo`, no build). Merging to `main` updates the live link.
