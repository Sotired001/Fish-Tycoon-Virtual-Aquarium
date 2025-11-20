  <h1>Fish Tycoon: Virtual Aquarium</h2>

  <p>A relaxing aquarium simulator built with React + Vite. Feed fish, upgrade your tank, breed species, and earn coins.</p>

</div>

---

## Project overview

Fish Tycoon is a canvas-driven aquarium game where players:
- Feed fish using clicks/taps
- Earn currency (coins) and spend it in the shop
- Buy new species and upgrades
- Watch fish behave autonomously with simple AI

This repository contains a small playable prototype built with React, TypeScript and Vite.

## Features
- Canvas game loop with entity updates
- Fish lifecycle and hunger system
- Coins, upgrades, and a small in-game shop
- Save persistence via Zustand (localStorage)

## Tech stack
- React 19 + TypeScript
- Vite 6 for development
- Zustand for global state & persistence

## Requirements
- Node.js 18+ (recommended)
- npm, pnpm, or yarn

## Install & Run
Open a terminal and run:

```powershell
cd "c:\Users\ninja\Documents\Vs code projects\Fish\Fish-Tycoon-Virtual-Aquarium"
npm install
npm run dev
```

Then open the localhost URL printed by Vite (usually http://localhost:5173).

To build and preview the production bundle:

```powershell
npm run build
npm run preview
```

## Gameplay (How to play the prototype)
- Click / tap the canvas to drop food.
- Fish will seek food, eat and occasionally drop coins.
- Click coins to collect them and earn money.
- Open the shop to buy fish and upgrades.

## Project structure (key files)
- `App.tsx` – Root component
- `components/` – UI overlay, canvas, shop modal
- `services/` – Game store (Zustand)
- `constants.ts` – Game balancing values and species data
- `types.ts` – Shared types/interfaces
- `index.tsx` – App entry

If you plan to contribute, start by exploring `constants.ts` and `services/store.ts` to modify behavior and add species/upgrades.

## Contributing
Open issues or pull requests with focused changes. Good first steps:
- Add a new fish species in `constants.ts` with unique behavior.
- Improve the store save schema and add migration checks.
- Add a design doc in a `docs/` folder with the intended format.

This project also includes: 
- `CONTRIBUTING.md` for contribution guidelines
- `docs/` with `genetics-concept.md` and `water-chemistry.md` to capture design specs
- `.github/ISSUE_TEMPLATE/` with useful issue templates

## License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
