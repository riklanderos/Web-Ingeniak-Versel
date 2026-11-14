# Blog de ingeniak.mx · cómo nace, se revisa y se publica un artículo

El repo es el CMS. Cada artículo del blog vive en dos archivos del repositorio y pasa por las
mismas puertas de calidad que el resto del sitio (los `scripts/check-*.mjs` fallan el deploy si
algo no cumple). Este documento es la guía interna; la guía para el equipo SEO (formato del brief,
reglas editoriales, checklist de revisión) está en `materiales/v2/blog/guia-blog-equipo-seo.html`
y su PDF.

## Las piezas

| Pieza | Dónde | Qué es |
|---|---|---|
| Brief | `materiales/briefs/AAAA-MM-DD-slug.md` | Lo que entrega el equipo SEO (formato: `materiales/briefs/_PLANTILLA.md`). |
| Entrada del sitemap | `src/data/sitemap.json` | SEO del artículo: título, meta, keywords, secciones, JSON-LD, enlaces internos. |
| Copy | `src/content/paginas/art-<id>.json` | El texto publicable, según `src/content/paginas/_ESQUEMA.md`. Nace en `estado: "borrador"`. |
| FAQ | `src/data/faq.json` | Banco único. Las preguntas nuevas entran con `validar: true` (no se publican hasta aprobarse). |
| Plantilla | `src/pages/blog/[slug].astro` + `ArticleTemplate` | Pinta todo artículo T-ARTICLE que tenga copy. El diseño nunca se toca por artículo. |

## El flujo (6 pasos)

1. **Brief.** El equipo SEO deja su brief en `materiales/briefs/` (o lo manda por el canal acordado
   y alguien lo guarda ahí). Un brief = un artículo = una keyword = una intención.
2. **Generar.** `node scripts/blog-nuevo.mjs materiales/briefs/<archivo>.md` valida el brief
   (medidas, respuesta directa de 40–60 palabras, fuentes con URL y fecha, cifras sin fuente) y
   crea las tres piezas. Con `--dry` solo valida y muestra el resumen.
3. **Redactar.** El agente (o quien redacte) completa `src/content/paginas/art-<id>.json` hasta el
   mínimo de palabras, respetando el texto del brief palabra por palabra donde venga redactado y
   usando tokens para toda cifra (`{{metric:ID}}`, `{{price}}`, `{{source}}`; ver `_ESQUEMA.md` §5).
   Datos de terceros: se describen y se enlazan a la fuente, nunca se copian cifras.
4. **Rama + PR.** Todo en una rama `blog/<slug>`; el PR a `main` dispara la vista previa de Vercel.
   Esa URL de preview es lo que revisa el equipo SEO con su checklist. Los cambios van por rondas
   en la misma rama.
5. **Aprobación.** Solo una persona de Ingeniak pasa `estado` a `"aprobado"` y pone su nombre en
   `aprobadoPor` (y aprueba las FAQ nuevas quitando `validar: true`). El equipo de construcción
   nunca cambia ese campo (R1).
6. **Publicar.** Merge a `main` → deploy. El artículo entra solo al sitemap XML, al hub `/blog/` y
   a los enlaces internos. Nada más que hacer.

## Portadas

- `/blog/` lista sola todo artículo publicado, del más reciente al más antiguo, con su portada. No hay que tocar `blog.json`.
- La portada es la placa del hero del artículo. Sin placa propia, el artículo usa la compartida y el índice le pone encima
  su nombre corto (el último breadcrumb), para que no haya dos portadas iguales.
- Para darle portada propia: registra la placa `<page.id>-hero` (`materiales/v2/placas/`, masters en `src/assets/cine/`,
  `node scripts/plates.mjs <id>`), apunta a ella el hero en `sitemap.json` y regenera su tarjeta con `npm run og -- <page.id>`.

### Portada con título (tarjeta del blog y redes)

- Además de la placa del hero, un artículo puede tener una **portada con título**: una imagen 16:9 diseñada con el título
  dentro (Kain juega con las letras). Se usa en la tarjeta del índice de `/blog/` y en la tarjeta para redes (OG).
  Dentro del artículo no se usa: ahí el título es el H1 real sobre la placa limpia.
- Master en `src/assets/portadas/<page.id>.jpg` (16:9, 2048 px o más) → `node scripts/portadas.mjs <page.id>` →
  `npm run og -- <page.id>`. Sin master, la tarjeta sigue usando la placa del hero, como antes.
- El texto de la imagen se revisa letra por letra (acentos, signos de apertura) antes de subirla.
- Guía completa (estilo, prompts, referencias, revisión y pasos): `materiales/v2/blog/guia-portadas-blog.md`.
  Para despejar el lado del texto en una placa del hero: `scripts/extender-placa.mjs`.

## Qué verifica el build (no negociable)

- `check-cifras`: ninguna cifra comercial escrita a mano; solo tokens. Tarifas de terceros, descritas y enlazadas.
- `check-contenido`: mínimo de palabras (1,200 en artículos generados) y similitud máxima entre artículos.
- `check-seo`: H1 = `sitemap.h1`, medidas de title/meta, JSON-LD.
- `check-pendientes`: nada de `[POR CONFIRMAR]`, `TODO`, `XX` en campos visibles.
- Importante: **en cuanto existe el JSON de copy, la página se construye y le aplican los checks.**
  Si la redacción está incompleta, el preview del PR falla: es la señal de que el artículo no está listo, no un bug.

## Mantenimiento

- **Actualizaciones**: un brief de actualización sigue el mismo flujo sobre el mismo archivo; al
  cambiar texto se actualiza `actualizado` (alimenta `dateModified`).
- **Mensual**: revisión conjunta en Google Search Console (impresiones/clics por artículo) para
  decidir qué se actualiza y qué sigue en el calendario.
- **Fuentes con tarifas** (Meta, CRMs): revisarlas cuando el proveedor cambia condiciones; la fecha
  de consulta de cada fuente vive en `fuentes.items[].consultado`.

## Reglas que nadie salta

- El equipo SEO **no toca el repo**: entrega briefs. El diseño es del sistema y es igual para todos los artículos.
- Nada inventado: ni testimonios, ni clientes, ni resultados, ni precios distintos de `{{price}}`.
- Toda cifra con fuente y fecha, o no se publica.
- `estado: "aprobado"` solo lo pone el cliente, con nombre. La automatización termina en el PR; la aprobación siempre es humana.

## Escenas con CTA dentro del artículo

Desde el 2026-11-14 un artículo puede invitar a agendar desde su cuerpo. Es un bloque `scene` en
`sections.cuerpo.blocks`, colocado al final de la sección H2 con la que conecta:

```json
{ "variant": "scene", "id": "escena-1",
  "plate": { "id": "<page.id>-escena-1", "layout": "subject-right", "mirror": false },
  "eyebrow": "Discovery Session", "title": "…", "text": "…",
  "links": [ { "label": "Agenda tu Discovery Session", "href": "/discovery/", "cta": "discovery" } ] }
```

- `cta: "discovery"` con `href: "/discovery/"` y `cta: "power-session"` con `href: "/power-session/"`: botón que lleva a
  la landing. Son las únicas páginas públicas que pueden enlazarlas (ESPEC §12.6, R17, apertura del 2026-11-14).
- `cta: "whatsapp"` con `waMessage`: botón de WhatsApp con Kain. El enlace lo arma el sitio con su número; el `href`
  del bloque no se usa.
- Sin `cta`, el enlace sale como texto con flecha, igual que antes.
- Los botones son de cristal, no azules: el único azul del sitio es "Cotizar proyecto".
- La nota de fuente de la escena solo aparece si trae cifra (`metricId` o un `{{metric:…}}` en el texto).
- La placa se registra como la del hero (sección "Placa del hero" de `materiales/v2/blog/guia-portadas-blog.md`),
  con Kain a la derecha y el 41 % izquierdo en penumbra. Si la placa no existe, se pinta una de respaldo.
- Cada clic en los dos primeros botones manda a GA4 el evento `cta_landing_click` con `destino`.
