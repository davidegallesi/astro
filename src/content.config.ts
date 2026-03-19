import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stream = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stream' }),
  schema: z.object({
    date: z.coerce.date(),
    type: z.enum(['note', 'link', 'quote', 'image']).default('note'),
    // link posts
    url: z.string().url().optional(),
    linkTitle: z.string().optional(),
    // quote posts
    author: z.string().optional(),
    // image posts
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    // drafts
    published: z.boolean().default(true),
  }),
});

export const collections = { stream };
