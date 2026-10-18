// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ingeniak.mx',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { defaultStrategy: 'hover' },
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/dev/') }),
  ],
  devToolbar: { enabled: false },
});
