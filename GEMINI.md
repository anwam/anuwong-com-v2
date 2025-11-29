# Project Context: anuwong-com-v2

## Overview
This project is the source code for [anuwong.com](https://www.anuwong.com), a personal website and blog built with **Astro**. It features a static site architecture with serverless capabilities provided by **Cloudflare Pages** and **Hono**.

## Key Technologies
- **Framework:** [Astro v5](https://astro.build)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Content:** Markdown & MDX (located in `src/content/blog`)
- **Serverless:** Cloudflare Pages Functions (using [Hono](https://hono.dev) in `functions/api`)
- **Optimization:** Partytown (3rd party scripts), Critters (Critical CSS), Astro Compress.
- **Package Manager:** npm (implied by `package-lock.json`)

## Project Structure
- `src/`
    - `content/blog/`: Blog posts in Markdown/MDX format.
    - `components/`: Reusable Astro components.
    - `layouts/`: Page layouts (e.g., `BaseLayout`, `BlogPost`).
    - `pages/`: Application routes.
    - `styles/`: Global styles.
- `functions/`: Cloudflare Pages Functions (Backend API).
    - `api/`: API routes handled by Hono.
- `public/`: Static assets.
- `astro.config.mjs`: Astro configuration.

## Development Workflow

### Prerequisites
- Node.js (version specified in `.nvmrc` if present, otherwise use LTS).
- `npm`

### Commands
| Command | Description |
| :--- | :--- |
| `npm install` | Install project dependencies. |
| `npm run dev` | Start the standalone Astro development server (Frontend only). |
| `npm run dev:pages` | **Recommended:** Start the dev server with Cloudflare Pages simulation (Wrangler). Includes KV bindings (`PAGE_VIEW`, `LIKES`) and API proxy. |
| `npm run build` | Build the project for production (outputs to `dist/`). |
| `npm run preview` | Preview the production build locally. |
| `npm run prettier` | Format code using Prettier. |

## Conventions
- **Styling:** Use Tailwind utility classes. Global CSS is minimal (`src/styles/global.css`).
- **Content:** Blog posts are organized by year/month/slug in `src/content/blog`.
- **API:** Backend logic resides in `functions/api` using Hono.
