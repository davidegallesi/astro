// @ts-check
import { defineConfig } from 'astro/config';
import remarkWikilinks from './remark-wikilinks.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://davidegallesi.github.io/astro',
  base: '/astro',
  markdown: {
    remarkPlugins: [[remarkWikilinks, { base: '/astro' }]],
  },
});
