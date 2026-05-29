---
description: "Use when editing Astro UI with Tailwind CSS 4. Enforces compact utility-first styling, token usage, and accessible responsive patterns."
name: "Astro Tailwind CSS 4 Compact"
applyTo: "**/*.astro, **/*.css, **/*.ts, **/*.js"
---

# Astro + Tailwind CSS 4 (Simple and Compact)

- Prefer utility classes in markup over custom CSS for one-off styling.
- Keep class lists compact and readable. Order classes as: layout, spacing, typography, color, effects, then state.
- Use design tokens from `@theme` in `src/styles/global.css`; avoid hardcoded color values in components.
- Extract repeated class patterns into a component when the same pattern appears 3 or more times.
- Use arbitrary values only when no token/scale exists.
- Build mobile-first with responsive variants (`sm:`, `md:`, `lg:`) and avoid redundant breakpoints.
- Include keyboard-visible focus states for interactive elements (`focus-visible:`).
- Respect reduced motion preferences for animations (`motion-reduce:`).
- Use CSS utilities/components (`@utility`, `@layer`) only for shared patterns, not one-off styling.
- Prefer static Astro rendering; add client-side JS only when interactivity requires runtime state.