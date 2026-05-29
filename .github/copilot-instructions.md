# Copilot Instructions for anuwong-com-v2

## Core Rules

- Do not create summary files like SUMMARY.md, CHANGES.md, or UPDATES.md.
- Work in existing files and folders.
- Use Conventional Commits.

## Project Snapshot

- Astro 5 blog site.
- Tailwind CSS for styling.
- Cloudflare Pages Functions with Hono for API.
- TypeScript across the project.

## Commands

```bash
npm run dev
npm run dev:pages
npm run build
npm run prettier
```

- Use `npm run dev:pages` for anything related to KV or page views.

## Content Rules

- Blog content lives in `src/content/blog/`.
- Use year/month/date-slug structure when applicable.
- Required frontmatter: `title`, `description`, `date`.
- `tags` must be lowercase kebab-case.
- `draft: true` means do not publish.

## Code and File Conventions

- Use `@/` import alias for `src/`.
- Keep components under `src/modules/[feature]/`.
- Prefer utility classes over custom CSS.
- Reuse existing patterns before adding new structure.

## API Notes

- API entrypoint is `functions/api/[[route]].ts`.
- Existing page view endpoints:
  - `GET /api/pages/:slug/views`
  - `PUT /api/pages/:slug/views`
- KV namespace: `PAGE_VIEW`.

## Practical Defaults

- Mobile-first styling.
- Keep TypeScript strict.
- Filter drafts from blog listings.
- Sort posts by date descending.
