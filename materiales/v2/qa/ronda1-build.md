**Verificación v2 · Ingeniak (build, guardas y QA en dist)**

El build pasa, pero `npm run check` falla con 16 fallos y 50 avisos. Ninguna de las 5 páginas pasa limpia: todas están técnicamente sanas y cada una tiene defectos de guarda o visuales. No corregí nada.

**1) Fichas de placas → plates.json**
- Fusioné las 29 fichas válidas (ninguna inválida) en `src/data/plates.json`. El archivo no cambió de contenido: sigue con 30 placas y 61 407 bytes.
- `node scripts/plates.mjs`: 30 placas con master, 0 archivos nuevos (todo estaba al día) y ninguna placa sin master.

**2) `npx astro build`: OK (exit 0)**
- Se construyeron 9 páginas (incluye /dev/cine, /dev/nav, /dev/ui y /404) y `sitemap-index.xml`.
- Hay avisos que no impiden el build:
  - Colecciones `paginas` y `blog` autogeneradas sin archivos .md.
  - Vite avisa que `gsap` y `ScrollTrigger` se importan estáticamente en `src/scripts/cine.ts`, así que el import dinámico de `ui.ts` no los saca del bundle principal.

**3) Guardas (`node scripts/check.mjs` sobre dist): FALLA**

| Guarda | Resultado |
|---|---|
| cifras | ✗ 1 |
| seo | ✗ 4, ! 41 |
| pendientes | ✓, ! 7 |
| pesos | ✗ 11, ! 2 |
| contenido | ✓ |

Fallos:
- **cifras:** `/dev/cine/` tiene "+100 %" escrito a mano. Dueño: cine (`src/pages/dev/cine.astro:191`).
- **seo:** `/dev-movil/` se publica en dist sin entrada en sitemap, sin description, sin H1 y sin `.lit`. Dueño: orquestador (`public/dev-movil.html`). Las páginas `/dev/*` también llegan al build de producción (orquestador).
- **pesos, JS:** el JS pesa 65 KB gzip contra un límite de 60 en /404, el caso, /discovery/, la industria y el servicio. El bundle de BaseLayout pesa 62.9 KB gzip por el import estático de gsap. Dueño: cine (`src/scripts/cine.ts`) con el orquestador (`src/scripts/main.ts`).
- **pesos, imágenes:** hay `<img>` de rack sin width/height en la industria (3) y en el servicio (2). Dueño: cine (`ImageSection.astro:134`, `SharedTake.astro:21`, `DayTimeline.astro:14`).
- **pesos, grano:** `public/fx/noise.webp` pesa 7 KB contra un límite de 6. Dueño: orquestador.

Avisos:
- 35 de 39 páginas indexables siguen sin construir. La nav y el footer enlazan a más de 27 rutas que hoy dan 404, y `vercel.json` redirige a 10 destinos sin construir. Dueños: páginas, copy (puerta R12) y orquestador (`vercel.json`).
- Todo el copy está en "borrador" (R1). El caso tiene además pendiente la puerta R2, por eso queda fuera de `sitemap.xml` (4 URLs). Lo resuelven copy y la aprobación del cliente.
- El VSL `discovery-vsl-720.mp4` pesa 12.83 MB contra 12. Dueño: orquestador.
- No existen `check-escenas.mjs` ni `check-contraste.mjs`, así que el contraste AA sigue sin medirse.

**4) QA con `revisar-sitio.mjs` en http://127.0.0.1:4322**
- Las capturas están en `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/qa/<slug>/`, con slugs `home`, `servicio-agentes-ia-whatsapp`, `industria-salud`, `caso-clinica-dental-monterrey` y `discovery`.
- En las 5 páginas, a 375 y a 1440, con movimiento reducido y sin JS: sin desborde lateral, sin errores de consola, sin imágenes rotas y sin archivos fallidos. Sin JS no queda nada oculto.
- El contenido "oculto" que reporta el script se explica solo:
  - Los `p` ocultos coinciden con el número de respuestas de FAQ plegadas (6/6/5/0/6), es lo esperado.
  - Las burbujas de ChatSim siguen pendientes.
  - Las capas de la secuencia fijada están inactivas.
- Las franjas negras de las capturas completas y el reloj en 0:00 del caso son de las escenas fijadas. Lo comprobé con scroll real: la secuencia de home recorre los 5 pasos y el caso llega a 8:00 / 0:12.
- Escenas fijadas: home 2, industria 1, caso 1; en móvil, 0 en todas. Nunca hay dos botones azules visibles (390 y 1440). Los heroes y escenas de texto + imagen cumplen la placa a sangre con un solo lienzo, salvo lo que se lista abajo.

**Veredicto y problemas por página**

- **`/` — técnico ✓, visual ✗**
  - A 1440, la etiqueta vertical `.is__hud` se encima con el H2 en #problema ("RESPONDIDO