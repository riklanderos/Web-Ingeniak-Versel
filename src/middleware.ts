// Idioma de cada página (versión en inglés, 2026-11-20): /en/… → 'en'; el resto → 'es'. En el build estático corre una vez
// por página al prerenderizar. Los componentes lo leen con Astro.locals.lang (src/lib/i18n.ts).
import { defineMiddleware } from 'astro:middleware';
import { langOfPath, setCurrentLang } from './lib/i18n';

export const onRequest = defineMiddleware((context, next) => {
  const lang = langOfPath(context.url.pathname);
  (context.locals as any).lang = lang;
  setCurrentLang(lang);
  return next();
});
