# Sam's Day, Two Ways: Autonomous Hospital demo

A single-file 3D demo (Three.js from a CDN, no build step). It follows one surgery in OR 2, from the patient coming in to the room being ready for the next patient, in six moments.

The screen is split down the middle. The left side is Sam, the circulating nurse, working today. The right side is the same surgery with our five products installed: Perception Kit: Granola + Eyes (cameras and mics that write the case record), Coding and billing, Ceiling rail boxes, a Robot picking arm, and a Cleaning robot. Each moment shows one or two products at work, with one plain sentence per side, a big callout in the room, and a "Sam's time" bar that splits Sam's minutes into hands-on care, typing, walking out of the room, and waiting. A summary at the end lists what each product changed.

Use Next or → / Space to advance, ← to go back. On a phone the two sides stack top and bottom.

Fictional nurse and patient. Times are illustrative; a pilot measures the real ones. The products, the story text and the numbers live in `PRODUCTS` and `STEPS` at the top of the script, so they can be edited without touching the 3D code.

## Hardware price estimate (results, "Our price")

These are estimates for one floor of 5 ORs. They come from public prices for similar hospital systems. The numbers are in the `ROI` object in the script.

| Item | Upfront | Basis |
|---|---|---|
| Ceiling rail, lifts and boxes | $600K | Large hospital pneumatic tube installs run about $420K to $700K ([latestcost.com](https://latestcost.com/pneumatic-tube-system-cost/)) |
| 5 sterile pass-through boxes with UV | $125K | $25K each, our guess (no public price found) |
| Picking arm cell on a track | $250K | Cobot arm about $37K plus $5K to $30K of add-ons ([Standard Bots](https://standardbots.com/guides/collaborative-robot-prices-the-ultimate-guide)); hospital-grade track, vision and software assumed to be several times that |
| 2 cleaning robots | $250K | Xenex UV robot about $100K to $125K each ([Healthcare Dive](https://www.healthcaredive.com/news/sutter-health-arms-sacramento-hospital-with-germ-zapping-robot/437707/), [San Antonio Report](https://sanantonioreport.org/xenex-hopes-disinfecting-robots-light-way-to-fewer-hospital-infections/)) |

Total about $1.23M upfront. Paid over 7 years at 8%, plus 10% a year for service, that's about $358K a year. Service at 10% is in line with UV robot warranties of CA$11.5K to CA$13.4K a year on a CA$125K to CA$142K device ([CADTH](https://cda-amc.ca/sites/default/files/hs-eh/en0018-robotic-systems-for-disinfecting-surfaces.pdf)). Delivery robots leased as a service run about $1,500 to $3,500 a month each, service included ([Computerworld](https://www.computerworld.com/article/1563100/robots-to-the-nurses-station-stat.html), [Robotomated](https://robotomated.com/explore/delivery/aethon-tug)).

## The older ICU demo

The earlier "A Day on 4B" ICU demo is kept at `icu/index.html` (served at `/icu` on the same Vercel site) and on the `icu` branch.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

## Deploy on Vercel

The Vercel project serves this folder as is (Output Directory `autonomous-hospital-demo`, no build). Merging to `main` updates the live link.
