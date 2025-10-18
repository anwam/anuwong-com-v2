# Astro Development Instructions

## File Structure and Organization

### Component Hierarchy
```typescript
// 1. Type definitions first
type Props = {
  title: string;
  description: string;
  imageUrl?: string;
};

// 2. Props destructuring with validation
const { title, description, imageUrl } = Astro.props;
```

### Import Patterns
```astro
---
// Standard Astro imports
import { Image } from "astro:assets";
import type { CollectionEntry } from "astro:content";

// Local components using @/ alias
import FormattedDate from "@/components/FormattedDate.astro";
import Profile from "@/modules/home/components/Profile.astro";

// Asset imports for images
import ProfileImg from "../assets/images/profile-pic-2.jpg";
---
```

## Component Structure Standards

### Props Interface Pattern
```astro
---
// Always define Props type interface
type Props = {
  post: CollectionEntry<"blog">;
  isFirst?: boolean; // Optional props with ?
};

const { post, isFirst } = Astro.props;
---
```

### CSS Class Management
Use `class:list` for dynamic classes with array syntax:
```astro
<div
  class:list={[
    "row-span-4 grid grid-rows-subgrid",
    "bg-gray-50 hover:bg-gray-100",
    "transition-all hover:shadow-lg",
    "p-3 md:p-4 rounded-2xl",
    { "border-gray-800": isActive }, // Conditional classes
  ]}
>
```

### Grid Layout Patterns
Use `grid-rows-subgrid` for nested grid alignment:
```astro
<article class="row-span-4 grid grid-rows-subgrid">
  <div>Content 1</div>
  <div>Content 2</div>
  <div>Content 3</div>
</article>
```

## Content Collection Patterns

### Blog Post Filtering
Always filter draft posts and sort by date:
```astro
---
const posts = (await getCollection("blog"))
  .filter((post) => !post.data.draft)
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
```

### Content Schema Validation
Enforce strict schema in `src/content/config.ts`:
- `tags` must be lowercase, kebab-case, no spaces
- `draft: true` excludes from build
- Use `image()` helper for preview images

## Image Handling

### Astro Image Component Usage
```astro
<Image
  src={post.data.preview}
  width={192}
  height={192}
  class="aspect-square h-[64px] w-[64px] rounded-lg"
  loading="lazy"
  alt={`${post.slug} preview`}
/>
```

### Asset Organization
- Static images: `public/` directory
- Component assets: `src/assets/images/`
- Blog post images: Co-located with content

## Tailwind CSS Conventions

### Typography Classes
```astro
<h4 class="text-pretty pt-2 font-bold text-gray-800">
<p class="line-clamp-2 text-sm text-gray-700 md:text-base">
<time class="text-xs text-gray-400">
```

### Interactive Elements
```astro
<div class="transition-all hover:shadow-lg cursor-pointer">
<a class="inline-flex rounded-full bg-gray-600 px-2 py-1 text-gray-100 hover:bg-gray-700">
```

## Script Integration

### Client-Side Scripts
```astro
<script>
  document.addEventListener("DOMContentLoaded", () => {
    // Event handling code
    document.querySelectorAll("[data-post-slug]").forEach((card) => {
      card.addEventListener("click", (e) => {
        // Handle interactions
      });
    });
  });
</script>
```

### Analytics Integration
```astro
<script is:inline type="text/partytown">
  // Third-party scripts with Partytown
</script>
```

## Layout Patterns

### Base Layout Structure
```astro
---
interface Props {
  title: string;
  description: string;
  imageUrl?: string;
}
---

<!doctype html>
<html lang="th">
  <head>
    <BaseHead {...props} />
    <slot name="head" />
  </head>
  <body>
    <Header />
    <slot />
    <Footer />
    <slot name="scripts" />
  </body>
</html>
```

### Slot Usage
- `<slot />` - Main content
- `<slot name="head" />` - Additional head elements
- `<slot name="scripts" />` - Page-specific scripts

## Modular Architecture

### Component Organization
```
src/modules/
├── blog/components/     # BlogItem.astro
├── home/components/     # Profile.astro, BlogSection.astro
└── projects/           # ProjectItem.astro
```

### Import Convention
```astro
import BlogSection from "@/modules/home/components/BlogSection.astro";
```

## Performance Optimizations

### Conditional Loading
```astro
{import.meta.env.PROD && <Analytics />}
```

### Image Optimization
- Use `loading="lazy"` for non-critical images
- Use `loading="eager"` for above-fold images
- Specify `width` and `height` for layout stability

## Thai Language Support

### Font Configuration
```css
font-family: ["IBM Plex Sans Thai", "Inter", ...defaultTheme.fontFamily.sans]
```

### Content Handling
- Mix of English and Thai content supported
- Use appropriate `lang` attributes when needed
- Consider text direction and typography

## Error Prevention

### Type Safety
- Always use TypeScript interfaces for Props
- Import types from `astro:content` for collections
- Use `CollectionEntry<"blog">` for blog posts

### Schema Validation
- Enforce tag naming conventions (lowercase, kebab-case)
- Validate required frontmatter fields
- Use Zod schema for content validation