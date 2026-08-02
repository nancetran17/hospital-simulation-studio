# Hospital Simulation Studio

Hospital Simulation Studio is an interactive planning app for testing hospital
space, staffing, layout, cost, throughput, and patient wait-time trade-offs.

The first version includes:

- simulation profiles for ED, imaging, perioperative, and inpatient units
- adjustable inputs for rooms, clinicians, arrivals, acuity, automation, service
  time, turnover, and operating cost
- a floor-plan heatmap for load and queue pressure
- comparison scenarios and an optimizer recommendation
- a GitHub Pages static deployment path

## Prerequisites

- Node.js `>=22.13.0`
- npm

## Local Development

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Validation

```bash
npm run build
npm test
npm run lint
```

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow at
`.github/workflows/deploy-github-pages.yml`.

After the project is pushed to GitHub:

1. Open the repository settings on GitHub.
2. Go to **Pages**.
3. Set **Build and deployment** to **GitHub Actions** if GitHub has not already
   selected it.
4. Push to `main`, or run the **Deploy GitHub Pages** workflow manually.

The workflow runs:

```bash
npm ci
npm run build:github
```

It publishes the generated `gh-pages-dist` folder to GitHub Pages.

## Current Private Deployment

The app is also deployed through Sites at:

https://hospital-space-simulator.mosaic-intel-3077.chatgpt.site
