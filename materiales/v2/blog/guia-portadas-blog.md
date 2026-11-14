# Portadas del blog de ingeniak.mx · guía para generarlas

Escrita el 2026-11-14 a partir de las 12 portadas que ya están publicadas. Sirve para quien genere una portada
nueva, sea una persona, el Estudio (SEO Studio) u otro agente. La regla general del blog está en `BLOG.md`.

## 1. Cada artículo lleva dos imágenes

| Imagen | Para qué | Lleva texto | Medidas del master | Dónde vive |
|---|---|---|---|---|
| **Placa del hero** (`<page.id>-hero`) | Encabezado del artículo, detrás del título real (H1) | No | 2752 × 1536 (escritorio) y 1536 × 1920 (celular, 4:5) | `src/assets/cine/<page.id>-hero.jpg` y `-hero-m.jpg` |
| **Portada con título** (`<page.id>`) | Tarjeta del índice de `/blog/` y tarjeta para redes (OG) | Sí, el título va dentro de la imagen | 16:9, 2688 × 1512 | `src/assets/portadas/<page.id>.jpg` |

Dentro del artículo nunca va la portada con título: ahí el título es texto real, que es lo que lee Google.
Si un artículo no tiene portada con título, su tarjeta usa la placa del hero; si tampoco tiene placa propia, usa la
compartida `home-sistema-2-atender`.

## 2. Estilo común (no cambia entre portadas)

- **Personaje:** Kain, un robot humanoide pequeño, blanco brillante, con dos antenas delgadas, visor oscuro con dos
  ojos ovalados cian que brillan y un asterisco cian luminoso en el pecho. Siempre con dos brazos y dos manos.
- **Escena:** fondo azul marino casi negro, neblina azul con volumen, luz de contorno cian y azul eléctrico, piso
  oscuro que refleja. Render 3D premium, poca profundidad de campo.
- **Objetos:** de cristal con bordes luminosos (fichas, tableros, esferas, letras). Iconos de línea simples.
- **Prohibido:** logotipos de marcas, nombres de marca dibujados como logotipo, símbolos de moneda, marcas de agua.
  Los nombres de producto (GoHighLevel, Kommo, WhatsApp, n8n) sí pueden ir como texto del título.
- **Referencias de imagen** (se mandan siempre al generador para que Kain salga igual):
  `src/assets/cine/home-hero.jpg` y `src/assets/cine/art-servicios-software-hero.jpg`.
  Como muestra del resultado esperado: cualquiera de `src/assets/portadas/*.jpg`.
- **Generador usado:** GPT Image 2.6 (`gpt_image_2_6`) en Higgsfield, calidad `high`, proporción 16:9.
  Placa del hero en `4k` (3840 × 2160); portada con título en `2k` (2688 × 1520).

## 3. Portada con título · "Kain juega con el título"

El título va en letras 3D de cristal, grandes, y Kain hace algo con ellas que cuenta el tema del artículo.

**Texto de la portada** (no es el H1 completo; se acorta para que se lea en una tarjeta chica):
- Título en dos líneas, de 2 a 4 palabras cada una.
- Subtítulo de una línea, en blanco y delgado, de 4 a 8 palabras.
- Ejemplos publicados:

| Artículo | Línea 1 | Línea 2 | Subtítulo | Qué hace Kain |
|---|---|---|---|---|
| art-agente-ia | Agente de IA | para WhatsApp | Qué es, cómo funciona y ejemplos | Se recarga en la última palabra y sostiene una burbuja de chat |
| art-gohighlevel-precios | GoHighLevel | precios en México | Planes, costos extra y cuándo conviene | Cuelga una etiqueta de precio de la última letra |
| art-gohighlevel-whatsapp | GoHighLevel | + WhatsApp | Cómo conectar la API oficial | Enchufa un cable de luz que une las dos palabras |
| art-kommo-precios | Kommo | precios 2026 | Planes, qué incluyen y costo en México | Sentado sobre la palabra, acomoda fichas de usuario |
| art-cuesta-software | ¿Cuánto cuesta el | software a la medida? | Precio en México y qué lo mueve | Mide una palabra con una cinta métrica |
| art-costo | ¿Cuánto cuesta un | agente de IA? | Para WhatsApp, en México | Sostiene una balanza con una burbuja y monedas |
| art-kommo-ghl | Kommo | vs GoHighLevel | Cuál conviene a tu empresa | Sentado en la última letra, pensando |
| art-agente-chatbot | Agente de IA | vs chatbot | Qué cambia y cuándo conviene cada uno | De pie junto a un robotito de juguete |
| art-partner-kommo | ¿Es partner oficial | de Kommo? | Cómo verificarlo paso a paso | Revisa las letras con una lupa y un sello de verificado |
| art-ghl-espanol | GoHighLevel | en español | Qué es, para qué sirve y cómo se implementa | Señala la ñ, que brilla más |
| art-n8n | n8n vs Zapier | vs Make | Cuál elegir para automatizar tu empresa | Conecta las palabras con nodos e hilos de luz |
| art-servicios-software | Servicios | como software | La nueva economía de los agentes de IA | Gira una manivela que mueve engranes en las letras |

**Plantilla del prompt** (en inglés; se cambia lo que va entre llaves):

```
Cinematic 16:9 blog cover in exactly the same character design and visual style as the reference images.
Kain is a small glossy white humanoid robot with two thin antennae, a dark visor face with two glowing cyan
oval eyes, and a glowing cyan asterisk emblem on his chest. Kain has exactly two arms and two hands.
Deep navy-black background with volumetric blue mist, cyan and electric-blue rim light, dark reflective floor.
Huge bold headline typography in a clean geometric sans-serif similar to Lexend, built as thick 3D
crystal-glass letters with glowing cyan edges standing on the floor, perfectly spelled in Spanish, exactly
two lines: first line "{LÍNEA 1}", second line "{LÍNEA 2}". Below the headline, a smaller thin white
subtitle, exactly: "{SUBTÍTULO}". {ESCENA: qué hace Kain con las letras, en una o dos oraciones}.
Every letter of the headline is fully visible and nothing covers the text. The headline fills the left and
center of the frame; keep all text inside the central 88% of the frame and leave the top-left corner empty.
Premium 3D render, shallow depth of field. No other text, no currency symbols, no logos, no watermark.
```

- La esquina superior izquierda queda vacía porque ahí va el imagotipo real en la tarjeta de redes (lo pone
  `scripts/og.mjs`; nunca se le pide el logotipo al generador).
- Con signos o letras delicadas (¿ ? ñ, acentos) conviene decirlo en el prompt: "including the opening and
  closing question marks", "the letter ñ with its tilde".

## 4. Placa del hero · sin texto

Kain a la derecha con un objeto de cristal que resume el tema; la mitad izquierda queda en penumbra para el título.

```
Cinematic 16:9 key art in exactly the same character design and visual style as the reference images.
Kain, a small glossy white humanoid robot with two thin antennae, a dark visor face with two glowing cyan
oval eyes, and a glowing cyan asterisk emblem on his chest, stands in the right third of the frame (between
72% and 92% of the width), full body visible, feet on a dark reflective floor, body slightly turned to the
left, one open hand presenting. In front of him, floating between 50% and 70% of the width,
{OBJETO DE CRISTAL que resume el tema, con iconos de línea simples y sin texto}.
The left 48% of the frame is deep, nearly empty darkness with faint blue haze, reserved for a headline.
Deep navy-black background, volumetric blue mist, cyan and electric-blue rim light, subtle floor
reflections, premium 3D render, shallow depth of field. No logos, no brand names, no letters, no numbers,
no watermark.
```

Objetos ya usados (no repetir): tablero con siete herramientas conectadas, esfera con burbuja y tres fichas,
tres tarjetas de plan con etiqueta y medidores, teléfono y tablero unidos por un cable, tablero con cinco fichas
de usuario, embudo, barras con monedas, burbujas en espiral, dos portales, anillo, ramas de luz, cuatro capas.

## 5. Revisión antes de aceptar una imagen (obligatoria)

Estos fallos ya ocurrieron y se corrigieron:

1. **Texto mal escrito.** Leer título y subtítulo letra por letra. Pasó con "español", que salió "espanbl".
2. **Anatomía de Kain.** Contar brazos y manos acercando la imagen. Pasó en una portada con tres manos.
3. **Letras tapadas.** Kain o un objeto no deben cubrir ninguna letra. Pasó con las piernas sobre la "v" de GoHighLevel.
4. **Margen.** Nada importante pegado a los bordes: la tarjeta de redes recorta un poco arriba y abajo.
5. **Sin logotipos ni marcas de agua.**

Para corregir sin perder la imagen: volver a mandarla como referencia y pedir solo el cambio
("Edit this exact image and keep everything else identical… Fix only…"). Si el texto salió mal, es mejor
generar de nuevo, con Kain lejos de las letras.

## 6. Cómo se integra en el repositorio

**Portada con título**
1. Guardar el master en `src/assets/portadas/<page.id>.jpg` (16:9, JPG de calidad 92).
2. `node scripts/portadas.mjs <page.id>` → crea `public/img/portadas/<page.id>-{640,1080,1280}.{avif,webp}`.
3. `npm run og -- <page.id>` → regenera `public/img/og/<page.id>.jpg` desde la portada, con el imagotipo.
4. No hay que tocar plantillas: `HubGuides.astro` usa la portada si existe el archivo `-1280.webp`.

**Placa del hero**
1. Si los objetos invaden el 41 % izquierdo, despejar con
   `node scripts/extender-placa.mjs <generada.png> src/assets/cine/<page.id>-hero.jpg 346 194`.
   Si no hace falta, basta reducir la generada a 2752 × 1536.
2. Celular: recortar de la generada una ventana de 2506 × 2160 con Kain y el objeto, y pasarla por
   `node scripts/reencuadre-movil.mjs <ventana.png> src/assets/cine/<page.id>-hero-m.jpg 0.45 0 0 0 0.33`
   (queda en 1536 × 1920 con el tercio superior limpio para el texto).
3. Ficha de registro en `materiales/v2/placas/<page.id>-hero.json`: copiar la de `art-cuesta-software-hero.json` y
   cambiar `alt`, `pose`, `safe`, `subject`, `anchors` (pecho y mano de Kain, en fracciones del ancho y alto),
   `deskNote` y `mobileNote`.
4. `node scripts/plates.mjs <page.id>-hero` → exporta los tamaños y actualiza `src/data/plates.json`.
5. En `src/data/sitemap.json`, la placa del `hero` del artículo pasa a `"id": "<page.id>-hero"`.
6. En el copy (`src/content/paginas/<page.id>.json`), la línea `PLACA ·` de `pendientes` queda como RESUELTO.

**Siempre al final:** `npm run build` (corre todas las revisiones) y `node --test "tests/**/*.test.mjs"`.
El índice del blog tiene un tope de 1.2 MB de imágenes en celular; con 12 portadas va en 826 KB.

## 7. Qué puede hacer hoy el Estudio y qué no

Desde el commit a6abf4f de seo-studio (2026-11-14), el Estudio genera las dos imágenes de cada artículo con esta guía.
Requiere que la actualización 0009 esté aplicada en Sitios.

**Qué entrega en el PR del artículo**
- Portada con título: `src/assets/portadas/<page.id>.jpg`, las 6 exportaciones de `public/img/portadas/` y
  `public/img/og/<page.id>.jpg`. Van en el PR porque el build de Vercel no corre `portadas.mjs` ni `og.mjs`.
- Placa del hero: `src/assets/cine/<page.id>-hero.jpg` y `-hero-m.jpg`, las 21 exportaciones de `public/img/cine/`,
  la ficha `materiales/v2/placas/<page.id>-hero.json` y `src/data/plates.json`.
- La placa del `hero` en `src/data/sitemap.json` y la línea `PLACA ·` de `pendientes` como RESUELTO.
- Al volver a publicar un artículo, el conector conserva la placa propia del hero (commit 7468cc0).

**En qué se diferencia de lo hecho a mano**
- Genera a 2560 × 1440, no en 4k. Los rellenos de `extender-placa.mjs` (346/194 sobre 3840) y la ventana de celular
  (2506 sobre 3840) se escalan a ese tamaño. Los masters salen igual: 2752 × 1536 y 1536 × 1920.
- La ficha copia la geometría de `art-kommo-precios-hero` (`safe`, `subject`, `anchors`). Si Kain sale fuera de esa
  zona, la ficha se ajusta a mano en este repositorio.
- El panel no deja publicar sin marcar los cinco puntos de la revisión de la sección 5.

**Qué revisar al recibir el primer PR con imágenes generadas**
Al escribir esto, el Estudio solo se había probado con la portada y la placa reales de `art-kommo-precios`, no con una
generación nueva. En el primer PR real: abrir las dos imágenes y pasar la sección 5, ver el hero del artículo en
computadora y en celular (que Kain no tape el título), y correr `npm run build` y los tests.
