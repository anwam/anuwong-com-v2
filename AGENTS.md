# AGENTS Quick Guide

Use this file for short, high-signal context.

## Core Rules

- Keep responses short and practical.
- Make minimal, focused changes.
- Reuse existing patterns before adding new structure.
- Do not create summary files.

## Project Facts

- Stack: Astro 5, Tailwind CSS, TypeScript, Cloudflare Pages Functions, Hono.
- Main API file: functions/api/[[route]].ts.
- Blog content path: src/content/blog/.

## Commands

- npm run dev
- npm run dev:pages
- npm run build
- npm run prettier

Use npm run dev:pages for KV and page-view API work.

## Load These First

- Project instructions: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Astro rules: [.github/instructions/astro.instructions.md](.github/instructions/astro.instructions.md)
- Tailwind compact rules: [.github/instructions/tailwind4-astro.instructions.md](.github/instructions/tailwind4-astro.instructions.md)
- API skill: [.github/skills/hono-cloudflare-workers-api/SKILL.md](.github/skills/hono-cloudflare-workers-api/SKILL.md)

## When Working On

- Astro or content pages: load Astro rules.
- UI styling: load Tailwind compact rules.
- API routes in functions/api: load Hono Cloudflare API skill.

## Defaults

- Mobile-first UI.
- Utility classes over custom CSS.
- Keep TypeScript strict.
- Filter draft posts and sort by date descending.
