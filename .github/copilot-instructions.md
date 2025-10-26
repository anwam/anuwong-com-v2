# GitHub Copilot Instructions for anuwong-com-v2

## Agent Behavior Guidelines

**Important**: Do not create new summary markdown files (like `SUMMARY.md`, `CHANGES.md`, `UPDATES.md`) after each iteration or task completion. Work directly with the existing codebase and documentation structure.

- Use Git Conventional Commits for commit messages.

## Project Architecture

This is a personal blog site built with **Astro 5.x** using a modular architecture pattern. The project combines static site generation with Cloudflare Pages Functions for dynamic features.

### Key Technology Stack
- **Astro** - Main framework with MDX support for blog content
- **Tailwind CSS** - Styling with custom Thai font configuration
- **Cloudflare Pages Functions** - Backend API using Hono framework
- **TypeScript** - Strict typing throughout

## Development Workflows

### Essential Commands
```bash
npm run dev              # Development server at localhost:4321
npm run dev:pages        # Full Cloudflare environment with KV storage
npm run build            # Production build
npm run prettier         # Format all files
```

**Important**: Use `npm run dev:pages` when working with page view counters or any Cloudflare KV functionality.

### Content Management
Blog posts are organized in `src/content/blog/` with this strict structure:
- Year-based folders: `2024/`, `2023/`
- Date-prefix folders: `01/29-redis-watch/`
- Support both `index.md` and standalone `.md` files

**Content Schema** (defined in `src/content/config.ts`):
- `title`, `description`, `date` are required
- `tags` must be lowercase, kebab-case, no spaces
- `draft: true` excludes posts from build
- `preview` for featured images

## Modular Component Architecture

Components are organized by feature modules in `src/modules/`:

```
src/modules/
├── blog/components/     # BlogItem.astro
├── home/components/     # Profile.astro, BlogSection.astro
└── projects/           # ProjectItem.astro
```

**Pattern**: Import using `@/modules/[feature]/components/[Component].astro`

## Cloudflare Integration

### Page View Counter API
Located in `functions/api/[[route]].ts` using **Hono** framework:
- `GET /api/pages/:slug/views` - Get view count
- `PUT /api/pages/:slug/views` - Increment views
- Uses Cloudflare KV storage (`PAGE_VIEW` namespace)

### Deployment Context
- Site URL: `https://www.anuwong.com`
- Integrated with Cloudflare Pages
- Uses Partytown for analytics optimization

## Styling Conventions

### Tailwind Configuration
- **Custom fonts**: IBM Plex Sans Thai + Inter for sans-serif
- **Grid patterns**: Heavy use of CSS Grid with `grid-rows-subgrid`
- **Typography plugin**: Enabled for blog content
- **Component patterns**: Prefer utility classes over custom CSS

### Component Styling Example
```astro
<div class:list={[
  "row-span-4 grid grid-rows-subgrid",
  "bg-gray-50 hover:bg-gray-100",
  "transition-all hover:shadow-lg"
]}>
```

## File Conventions

### Import Patterns
- Use `@/` alias for `src/` directory
- Type-safe content queries: `getCollection("blog")`
- Component imports: `@/modules/[feature]/components/`

### Blog Post Filtering
Posts are filtered by `!post.data.draft` and sorted by date descending across the codebase.

### Static Assets
- Images in `public/` for static assets
- Use Astro's `Image` component for optimized images
- Blog images co-located with content in blog folders

## Performance Optimizations

- **Astro Critters**: Critical CSS inlining
- **Astro Compress**: Asset compression
- **Partytown**: Third-party script optimization
- **Sitemap + RSS**: SEO optimizations included

## Development Notes

- **Bilingual content**: Mix of English and Thai content
- **Date handling**: UTC timestamps, formatted display
- **Tag system**: Enforced lowercase kebab-case validation
- **Navigation**: Automatic prev/next post generation
- **Mobile-first**: Responsive design patterns throughout
