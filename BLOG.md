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
