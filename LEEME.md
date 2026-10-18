# Ingeniak · sitio web "Sistema conectado"

Sitio estático (HTML, CSS y JS sin compilar) listo para Vercel. Fecha de esta versión: 18 de octubre de 2026.

## Estructura

```
index.html                Página principal (14 secciones)
discovery/index.html      Discovery Session (contenido de agenda.ingeniak.tech/discovery con el nuevo diseño)
aviso-privacidad/         Aviso de privacidad (misma URL que el sitio anterior)
css/styles.css            Tokens de diseño y todos los estilos (cada sección marcada con INICIO / FIN)
js/main.js                Movimiento: Lenis, firma de la portada, revelados, contadores, líneas, videos
vendor/                   GSAP 3.13.0 (+ ScrollTrigger y SplitText) y Lenis 1.3.11, fijados
fonts/                    Lexend, Inter y JetBrains Mono (woff2 variables, servidos desde el sitio)
img/                      marca/, equipo/, casos/, sistema/, kain/, logos/ y las imágenes para compartir (og-*.jpg)
video/                    Motion graphics (Remotion e HyperFrames), clips de Kain y el video de la Discovery
favicon.svg, favicon-32.png, apple-touch-icon.png
robots.txt, sitemap.xml, llms.txt, vercel.json, .vercelignore
direccion-de-arte.html    Hoja de muestra aprobada (no se publica)
materiales/               Insumos: equipo, logos de software, SEO, Discovery, OG, renders de Magnific (no se publica)
motion/                   Proyectos fuente de los motion graphics (no se publica)
```

## Dirección de arte aprobada: "Sistema conectado"

Tu isotipo es el corazón del sitio; sus ramas conectan todo lo que haces.

| Token | Valor | Uso |
|---|---|---|
| `--bg` | #03040B | Fondo |
| `--brand` / `--cta` | #0055FF | Único color de botón (letra blanca, contraste 5.6 a 1) |
| `--brand-press` | #1A66FF | Hover del botón (se aclara para no perder contraste); presionado = escala .97 |
| `--cyan` | #00E5FF | Brillos de IA, líneas, nodos, etiquetas |
| `--indigo` | #455DFF | Transición en cristales y luces |
| `--navy` | #0A1F4C | Profundidad |
| `--muted` | #9EB0C7 | Texto secundario (contraste 9.2 a 1 sobre el fondo) |
| `--amber` | #FFB547 | Solo dolores (sección El problema y "Lo que no es") |

- Tipografía: Lexend 500 en títulos (manual de identidad 2025), Inter en texto, JetBrains Mono en etiquetas.
- Radios: 28 / 20 / 14 / 8 px.
- Movimiento (objeto `M` en `js/main.js`): `power3.out`, 0.95 s, recorrido 22 px, escalonado 0.06 s, sin rebote; cortinas y trazos `power3.inOut`; Lenis con inercia 0.085. Equivalente CSS: `--ease: cubic-bezier(.25,1,.5,1)`, `--ease-io: cubic-bezier(.76,0,.24,1)`.
- Firma: el isotipo se dibuja con un trazo cian (1.15 s), se vuelve cristal (render de Magnific), sus ramas se conectan con 4 chips (Agente IA, CRM, Automatización, Datos) y la luz recorre el borde del botón. Rima: el isotipo se vuelve a dibujar en el pie, el nodo cuadrado es viñeta y remate de líneas en todo el sitio.
- Elementos propios: isotipo de cristal, ramas (líneas con quiebre de 35° y pulsos de luz), nodo cuadrado, ondas del manual y tarjetas de cristal con fuga de luz que sigue al mouse.

## Motion graphics

| Pieza | Herramienta | Archivos | Cómo se vuelve a generar |
|---|---|---|---|
| El sistema (5 etapas, loop 12 s) | Remotion 4.0.536 | `video/sistema-1920.*`, `video/sistema-movil.*`, `img/motion-sistema-*.webp` | `motion/remotion-sistema/scripts/encode.sh` |
| Chat de Kain agendando una cita (loop 14 s) | HyperFrames 0.8.170 | `video/kain-chat.*`, `img/motion-kain-chat-poster.webp` | `bash motion/hyperframes-kain/render.sh` |
| Video de la Discovery (180 s, con audio) | Recomprimido con el ffmpeg de Remotion | `video/discovery-vsl-720.mp4` (12.8 MB) | — |

Los videos solo se descargan y reproducen cuando están en pantalla. Con "reducir movimiento" o modo ahorro de datos no se reproducen solos. Los clips de Kain con fondo transparente (WebM) no se ven transparentes en Safari: ahí se muestra la imagen fija de Kain.

HyperFrames se instaló como skill de Claude Code en `.claude/skills/` (20 skills) con `skills-lock.json`.

## Qué editar fácil

- Textos: directamente en `index.html` y `discovery/index.html`; cada sección está entre `<!-- ===== INICIO … ===== -->` y `<!-- ===== FIN … ===== -->`.
- Preguntas frecuentes: si cambias una pregunta visible, cámbiala también en el bloque `FAQPage` del `<head>` (deben decir lo mismo).
- WhatsApp: cada botón tiene su mensaje en el enlace `wa.me/523321017799?text=…` (portada, Kain, cada servicio, preguntas, pie).
- Agenda: todos los botones de /discovery llevan a `https://agenda.ingeniak.tech/discovery/agendar`.
- Cada vez que cambies CSS o JS, sube el número `?v=20261018e` en los tres HTML.

## De dónde salió cada dato

- Contenido, cifras y equipo: ingeniak.mx (revisado el 18 de octubre de 2026) y `01_Guia_de_Marca.md` del kit de marca.
- Cifras publicadas (datos internos de Ingeniak, octubre de 2026): 3.2× citas en 90 días (clínica dental, Monterrey), 8 min → 12 s, −58% CPL en 60 días (e-commerce, CDMX), +340% conversiones (retail, Kommo + IA), ROAS 4.8× (HoReCa), 27 procesos (logística), 12 → 47 citas/mes (salud), +73 sistemas, 7 países.
- Discovery: agenda.ingeniak.tech/discovery (18 de octubre de 2026), incluidas las 6 respuestas.
- Aviso de privacidad: ingeniak.mx/aviso-privacidad, versión del 1 de agosto de 2026, sin cambios de texto.
- Investigación SEO / GEO / AEO: `materiales/seo/investigacion-seo.md`. Logos y reglas de uso: `materiales/logos-software/LOGOS.md`.

## Por validar (lo que decidí yo)

1. Lexend en títulos (manual 2025) en lugar de Space Grotesk.
2. Titular "Agentizamos empresas." con "Consultoría de inteligencia artificial para empresas" dentro del mismo H1 (SEO).
3. Un solo botón azul en todo el sitio: Discovery Session. WhatsApp con Kain queda como acción secundaria.
4. VKTOR™ = Verify · Koncept · Transform · Operate · Rise, con los verbos del video de la Discovery.
5. Sede "Guadalajara, Jalisco" y dirección de Tlajomulco de Zúñiga en el pie y en los datos estructurados.
6. Que el WhatsApp +52 33 2101 7799 lo atiende Kain (los botones dicen "Escríbele a Kain").
7. Fusioné "Branding" y "Contenido" en un solo servicio y agregué "Automatización de procesos" a los 9 pilares.
8. La cifra −58% CPL se muestra en "Ingeniak en datos"; el caso de e-commerce de la cuadrícula es el de métricas unificadas (1 vista, 7 fuentes), porque no sé si son el mismo cliente.
9. Precio: solo "desde USD 997 al mes" en preguntas frecuentes y datos estructurados; no hay tabla de paquetes.
10. Redirecciones del sitio anterior (en `vercel.json`): /servicios/* y /licenciaskommo → #servicios, /nosotros → #equipo, /metodologia → #metodologia, /contacto y /cotiza → /discovery/, /blog → inicio (temporal).
11. Fotos del equipo: son las del sitio actual (traen el nombre impreso); Victor Ocampo se quitó.

## Pendientes antes de publicar

- [ ] **Testimonios**: los 3 son BORRADORES ligados a casos reales (etiqueta amarilla "Borrador"). Pide a cada cliente que apruebe la frase con nombre, cargo y empresa; reemplaza el texto y borra el `<span class="borrador">`. No publiques los borradores como si fueran reales.
- [ ] **Blog**: el sitio anterior tiene /blog. Por ahora redirige al inicio; si tiene artículos indexados, conviene migrarlos.
- [ ] Imágenes de casos y renders isométricos: son las del sitio actual y traen texto ilegible generado por IA; se pueden regenerar con Magnific.
- [ ] Revisar en un iPhone real (Safari) el chat de Kain y la Discovery.
- [ ] Google Search Console: enviar `sitemap.xml` cuando el dominio apunte a Vercel.
- [ ] Segunda fase de SEO: páginas propias para Kommo, GoHighLevel, Agentes de IA para WhatsApp y Agencia de IA en Guadalajara (títulos y metas ya están en la investigación).
- [ ] Sello Kommo Partner: usé el que enviaste; confirma que sea la versión vigente del Partner Portal.

## Publicar

1. **Git en esta Mac**: está bloqueado hasta aceptar la licencia de Xcode. En Terminal: `sudo xcodebuild -license accept` (pide tu contraseña).
2. Subir al repositorio `riklanderos/Web-Ingeniak-Versel` (rama `main`).
3. En Vercel: Add New → Project → importa el repositorio, framework "Other", sin comando de build, carpeta raíz `/`. `.vercelignore` deja fuera `materiales/`, `motion/` y la hoja de muestra.
4. Dominio: en Vercel → Settings → Domains agrega `ingeniak.mx` y `www.ingeniak.mx`, y cambia los DNS (los registros que apuntan tu dominio a un servidor) donde compraste el dominio, como te indique Vercel.
5. Al publicar, revisa la imagen para compartir en https://www.opengraph.xyz con `https://ingeniak.mx/` y `/discovery/`.

## Revisión técnica hecha (18 oct 2026)

`revisar-sitio.mjs` en celular (375 × 812), escritorio (1440 × 900), con "Reducir movimiento" y sin JavaScript: sin desborde lateral, sin imágenes rotas, consola sin errores, fuentes y librerías cargadas, botón principal completo en la primera pantalla en celular y escritorio. Único aviso: los brillos de hover de Servicios aparecen como "ocultos" (es intencional).
