import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string(),
      // Transform string to Date object
      date: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      updatedDate: z
        .string()
        .optional()
        .transform((str) => (str ? new Date(str) : undefined)),
      preview: image().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      lastmod: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val))
        .optional(),
    }),
})

export const collections = { blog }
