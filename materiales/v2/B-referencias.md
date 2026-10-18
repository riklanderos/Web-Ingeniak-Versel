# B · Lectura de referencias para Ingeniak v2

Fecha: 18 de octubre de 2026 · Insumo de diseño para el rebuild en Astro (GSAP 3.13 + ScrollTrigger + SplitText + Lenis 1.3.11).

Este documento hace tres cosas:

1. Lee una por una las 11 referencias que mandó el cliente, con 9 puntos cada una.
2. Revisa los insumos propios (Kain, renders de Magnific, fondos de identidad) para saber cuáles sirven como "escena integrada" y cuáles hay que regenerar.
3. Convierte todo en 12 decisiones de diseño para v2, con la técnica CSS y de motion de cada una, más una lista de lo que no se copia.

> **Requisito no negociable del cliente (textual):** "los HERO o las secciones que lleven texto + imagen: imágenes premium donde la imagen sea el background y la persona o personaje de un lado y del otro los textos o botones, pero la imagen se siente como parte de la misma sección y no como 2 secciones separadas."
>
> En este documento ese patrón se llama **Escena integrada** (decisión D1). Todo lo demás se subordina a él.

---

## Índice

- [0. Resumen en 10 líneas](#0-resumen-en-10-líneas)
- [1. Lectura de las 11 referencias (9 puntos cada una)](#1-lectura-de-las-11-referencias-9-puntos-cada-una)
- [2. Lo que se repite en las 11: el ADN común](#2-lo-que-se-repite-en-las-11-el-adn-común)
- [3. Insumos propios: qué sirve y qué no](#3-insumos-propios-qué-sirve-y-qué-no)
- [4. Las 12 decisiones de diseño para v2 (con CSS y motion)](#4-las-12-decisiones-de-diseño-para-v2-con-css-y-motion)
- [5. Qué NO copiar](#5-qué-no-copiar)
- [6. Brief de composición para las imágenes generadas (Magnific / Nano Banana Pro)](#6-brief-de-composición-para-las-imágenes-generadas-magnific--nano-banana-pro)
- [7. Lista de verificación de una escena integrada](#7-lista-de-verificación-de-una-escena-integrada)

---

## 0. Resumen en 10 líneas

1. Las 11 referencias comparten una regla: **la luz es el material**. Nada tiene borde; todo nace del negro azulado y se ilumina desde atrás o desde abajo.
2. El sujeto (persona, mano, robot, objeto) **se disuelve en el fondo**: su lado de sombra es del mismo color que el fondo de la página. Por eso la imagen no se lee como "caja".
3. El texto vive **sobre la zona oscura de la misma imagen**, no en una columna aparte (Lunetra, ref. 6; Reven, ref. 2).
4. Hay tres planos de profundidad: palabra gigante atrás, sujeto en medio, cristal y texto adelante (refs. 3, 5, 10).
5. El cristal (glassmorphism) siempre está **encima de algo que se ve borroso a través de él**. Cristal sobre negro plano no se ve premium (refs. 2, 3, 4, 9).
6. Los diagramas son **hub con ramas** (un centro y conexiones), que es literalmente el isotipo de Ingeniak (refs. 1, 4).
7. Las secciones no se cortan: terminan en un **horizonte de luz**, un fundido o una palabra gigante que entra desde el borde (refs. 7, 8, 10).
8. Paleta casi monocroma: negro azulado + un solo azul + un acento frío. Ninguna referencia usa más de dos colores de acento.
9. Tipografía grande, peso medio (no bold), interletrado apretado y **titulares en dos tonos**.
10. Para v2: construir cada hero y cada sección texto + imagen como una escena de capas (imagen a sangre con máscara + velo del lado del texto + brillo + grano + cristal), sobre un lienzo de página continuo sin fondos por sección.

---

## 1. Lectura de las 11 referencias (9 puntos cada una)

Los 9 puntos son siempre los mismos: (1) composición / retícula, (2) jerarquía tipográfica, (3) uso del color, (4) espacio en blanco, (5) tratamiento de imagen (cómo se funde el sujeto con el fondo), (6) formas y recursos, (7) densidad, (8) tono en 3 adjetivos, (9) movimiento implícito. Al final de cada una: qué tomamos para Ingeniak.

### Ref. 1 · AlpinaGPT (landing larga, hero + bento + hub de modelos)

| # | Lectura |
|---|---|
| 1. Composición | Hero centrado y simétrico: H1 de 2 líneas arriba, mockup de chat al centro y órbitas elípticas concéntricas que se abren hacia los lados con íconos montados sobre ellas. Sección 2 en split 40/60: texto a la izquierda centrado verticalmente contra un bento 3 + 2 a la derecha, con paginador vertical de puntos al margen. Sección 3: hub central (logo en círculo) con 5 tarjetas por lado unidas por líneas en codo. |
| 2. Tipografía | Sans geométrica de peso medio (no bold). H1 ~48 px, H2 ~40 px centrado, título de sección 28 px regular, subtítulo 14 px bold, cuerpo 14 px en lavanda apagado. La jerarquía la da el tamaño, no el peso. |
| 3. Color | Fondo #090A14 (negro azulado). Un solo acento índigo-violeta (#5D5FEF) en burbujas, chips y nodos. Brillos violeta radiales a los lados del hero. El CTA es blanco (máximo contraste) con una insignia índigo en la esquina. Logos de terceros a color, dentro de tarjetas oscuras. |
| 4. Espacio | Mucho entre secciones (160–200 px), poco dentro del bento (gap ~12 px). El hero respira; el bento es compacto. |
| 5. Tratamiento de imagen | No hay fotos. Una esfera de partículas 3D vive detrás del mockup de chat y se asoma por los lados; el mockup es semitransparente y la deja ver. Los brillos laterales caen a negro con degradado radial: no hay ningún borde visible. |
| 6. Formas y recursos | Órbitas elípticas de 1 px, nodos circulares con ícono, tarjetas con radio 16 px y borde 1 px índigo al 30 %, degradado interior sutil, líneas conectoras con codos redondeados y punto terminal, chips/pills, botón "+" por integración, estado "en desarrollo" atenuado por opacidad. |
| 7. Densidad | Media. Alta en el bento (micro-interfaces), baja en el hero. |
| 8. Tono | Ordenado, tecnológico, accesible. |
| 9. Movimiento implícito | Órbitas girando lento, íconos viajando sobre la órbita, chat que se escribe solo, curva y barras que se dibujan, líneas del hub que salen del centro hacia cada tarjeta, bento en cascada. |

**Para Ingeniak:** el hub de la sección 3 es el isotipo (pilar central + ramas). Úsalo para "Tu stack conectado": isotipo de cristal al centro y Kommo, GoHighLevel, n8n, Make, WhatsApp, Meta, Google, TikTok y los modelos de IA en tarjetas a los lados, con las ramas dibujándose al hacer scroll. Solo herramientas reales; nada de "en desarrollo".

### Ref. 2 · Reven / Reon / Opera (hero con persona en duotono + bento + wordmark)

| # | Lectura |
|---|---|
| 1. Composición | Hero: H1 centrado de 2 líneas arriba; sujeto (hombre de perfil con audífonos) centrado y cortado por el borde inferior (busto); cuatro satélites alrededor del sujeto, uno por esquina (prueba social arriba izquierda, tarjeta de cristal abajo izquierda, tarjeta "Now playing" arriba derecha, claim abajo derecha). Después, un bento sobre gris claro y un wordmark gigante centrado. |
| 2. Tipografía | Geométrica redondeada. H1 ~80 px medium con interletrado apretado; una palabra en degradado azul → blanco ("Connected"). Claim secundario 24 px; microtextos 11 px. |
| 3. Color | Carbón #1B1B1D (no azul), un solo azul eléctrico #1E6BFF como tinta, blanco para texto. Una tarjeta blanca sólida como golpe de contraste puntual. |
| 4. Espacio | Centro limpio, satélites en la periferia. El bento es compacto. |
| 5. Tratamiento de imagen | **Clave.** El sujeto está convertido a duotono azul (sombras negras, luces azules) y lo ilumina una luz azul desde abajo y desde atrás: el contraluz dibuja el perfil, la oreja y la diadema. El lado de sombra se funde con el carbón del fondo sin borde. Un brillo azul enorme y desenfocado detrás de la base del busto se derrama hasta el borde inferior. Hay una fuga de luz azul en la esquina superior izquierda (fuente fuera de cuadro). Una onda de audio fina pasa **detrás** de la cabeza: una línea gráfica entre el fondo y el sujeto que crea profundidad. El H1 se monta sobre la coronilla: texto y sujeto son una sola composición. La tarjeta de cristal esmerilado está encima del brillo azul, que se ve difuso a través de ella. |
| 6. Formas y recursos | Tarjeta de cristal (blur fuerte + borde blanco 40 %), avatares apilados, nav en pill, CTA en pill, ícono 3D brillante (esfera con rayo), malla 3D, wordmark en degradado. |
| 7. Densidad | Media-alta. |
| 8. Tono | Enérgico, comercial, audaz. |
| 9. Movimiento implícito | Onda de audio animada, brillo que respira, satélites flotando con parallax, brillo recorriendo la palabra en degradado. |

**Para Ingeniak:** el duotono azul con contraluz es el tratamiento para las fotos reales del equipo y para cualquier persona en una escena. Los satélites son chips de cristal con cifras confirmadas ("8 min → 12 s", "3.2x citas en 90 días") orbitando a Kain o a la persona.

### Ref. 3 · Forma AI (pricing con palabra gigante, objeto 3D y cristal)

| # | Lectura |
|---|---|
| 1. Composición | Palabra gigante "Pricing" centrada detrás de 3 tarjetas en fila. Orden de capas: palabra → objeto 3D → tarjetas. "Forma AI" montado sobre la palabra. Nav en pill flotante centrada; toggle abajo a la izquierda. |
| 2. Tipografía | Grotesca neutra. Palabra fantasma ~200 px bold en navy de bajo contraste; precios 28 px regular; listas 11 px. |
| 3. Color | Negro puro. La única fuente de color es el objeto 3D azul-cian. Palabra fantasma #14244A. La tarjeta destacada se marca con un borde interior cian luminoso, no con otro color de fondo. Botones blancos. |
| 4. Espacio | Compacto: las tarjetas ocupan casi todo el ancho. |
| 5. Tratamiento de imagen | **Clave.** Un objeto 3D abstracto (cinta de cristal satinado azul-cian) cruza el lienzo detrás de las tarjetas. Las tarjetas tienen `backdrop-filter` real: el objeto se ve nítido fuera y difuso dentro. Eso hace que las tarjetas "pertenezcan" a la imagen en lugar de flotar sobre negro. |
| 6. Formas y recursos | Cristal oscuro (tinte negro ~40 %, blur ~20 px, borde 1 px blanco 20 %), checks en círculo, botones pill, nav pill con botón de cerrar, toggle. |
| 7. Densidad | Alta dentro de las tarjetas, baja alrededor. |
| 8. Tono | Sobrio, premium, técnico. |
| 9. Movimiento implícito | Objeto 3D girando u ondulando (video en loop), tarjeta que se eleva y enciende su borde al pasar el mouse, palabra fantasma con parallax propio. |

**Para Ingeniak:** nada de tablas de precios (solo "desde USD 997 al mes"). Lo que sí se toma es la técnica **objeto detrás + cristal real encima**, con las ondas sedosas de marca (`fondo-ondas`) o el isotipo de cristal como objeto.

### Ref. 4 · Boltshift (hero centrado + orbe con 4 tarjetas conectadas)

| # | Lectura |
|---|---|
| 1. Composición | Hero centrado: H1 de 2 líneas, subtítulo, 2 CTA. Debajo, un diagrama simétrico: orbe central y 4 tarjetas (2 por lado) unidas con líneas cian ortogonales con nodos luminosos. |
| 2. Tipografía | Grotesca de display. H1 ~56 px regular con interletrado -2 %; subtítulo 16 px apagado. |
| 3. Color | Navy profundo #050B1F con un radial #0A1F4C arriba. Botón azul #2563FF con brillo exterior. Cian #4FD1FF en líneas y orbe. Texto blanco y gris azulado. |
| 4. Espacio | Aireado y centrado, con mucho margen superior. |
| 5. Tratamiento de imagen | El orbe 3D (esfera de líneas de luz) es la imagen. Su brillo ilumina una retícula de fondo que solo se ve cerca de él (retícula con máscara radial). El contenido de las tarjetas se corta y se desvanece en los bordes (marquee con máscara). |
| 6. Formas y recursos | Retícula de 1 px con máscara radial, líneas de conexión con nodos, chips con check, mini gráfica de barras, CTA primario con brillo + CTA secundario de cristal con ícono. |
| 7. Densidad | Baja-media. |
| 8. Tono | Limpio, confiable, SaaS. |
| 9. Movimiento implícito | Orbe girando, pulsos de luz que viajan por las líneas hacia las tarjetas, chips en marquee horizontal, barras que crecen. |

**Para Ingeniak:** el "pulso de datos" que viaja por las ramas del isotipo, y la retícula que solo aparece donde hay luz. El marquee con bordes desvanecidos sirve para la franja de herramientas.

### Ref. 5 · Presentación fintech (roadmap, mano con teléfono, retrato con titular)

| # | Lectura |
|---|---|
| 1. Composición | Tres láminas 16:9. (a) Roadmap: título centrado, 3 círculos punteados (un mes cada uno) y pills en diagonal. (b) Mano con teléfono que entra desde abajo al centro, palabra gigante "CORE SOLUTION" horizontal detrás a la altura del tercio inferior, tarjeta de cristal a la derecha y pill a la izquierda. (c) Titular gigante "Smart Finance / is Essential" cruzado con un retrato rectangular central y tarjetas de cristal en esquinas opuestas. |
| 2. Tipografía | Grotesca neutra, titulares de 64–90 px regular con interletrado -3 %. La segunda línea va en gris al ~40 %: jerarquía por tono. |
| 3. Color | Navy petróleo #0B1B2B a azul acero #2B6CB0 en los brillos. Casi monocromo, blancos suaves. |
| 4. Espacio | Amplio, mucha atmósfera. |
| 5. Tratamiento de imagen | **Clave en (b).** Mano y teléfono en contraluz azul desde abajo (luz de piso): la parte inferior del sujeto se funde en una nube de luz. La palabra gigante queda **detrás** de la mano (la mano tapa letras), en azul medio al ~50 %: tres planos de profundidad. Grano fino en todo el cuadro, viñeta y halo inferior. En (c) el retrato está en duotono azul con fundido inferior, pero sigue siendo un rectángulo: se lee como caja pegada y pierde integración. |
| 6. Formas y recursos | Círculos punteados, pills de cristal con punto blanco, tarjeta de cristal con anillo de progreso, línea de horizonte de luz, grano. |
| 7. Densidad | Baja. |
| 8. Tono | Sereno, financiero, cinematográfico. |
| 9. Movimiento implícito | Luz inferior que respira, palabra fantasma desplazándose en horizontal (marquee lento), anillo de progreso llenándose, pills que aparecen mes por mes. |

**Para Ingeniak:** la técnica (b) es la de Kain recortado delante de una palabra gigante ("AGENTES", "VKTOR", "SISTEMA"). La (c) es justo lo que el cliente rechazó: foto en caja. No se usa.

### Ref. 6 · Lunetra (4 stories verticales)

| # | Lectura |
|---|---|
| 1. Composición | Formato 9:16. (1) La persona (mujer de perfil mirando hacia arriba) ocupa la mitad derecha, cortada por el borde derecho y el inferior; texto y símbolo en la mitad izquierda, alineados a la izquierda, a media altura. (2) Degradado con línea diagonal fina y un nodo; texto alineado a la derecha abajo. (3) Símbolo centrado con desenfoque de movimiento y metadatos en las esquinas. (4) Haz de luz vertical que baja desde arriba al centro; wordmark abajo. |
| 2. Tipografía | Grotesca ligera. Cuerpo 13–14 px, titular 22 px regular, metadatos 9 px. Mucho aire. |
| 3. Color | Monocromo azul de #04070F a #3A7BD5. Blanco puro solo en el haz y en el texto. |
| 4. Espacio | Muy generoso: 60–70 % del cuadro es atmósfera. |
| 5. Tratamiento de imagen | **Clave, es el patrón que pide el cliente.** La persona está iluminada solo por luz azul fría frontal-superior (rostro y cuello). El resto del cuerpo cae a negro azulado y se disuelve en el fondo: el hombro se convierte en degradado, sin contorno. En la base del sujeto hay una niebla/bloom que suaviza el corte. El fondo no es negro plano: es un degradado del mismo azul que la luz del sujeto (color igualado). El texto vive sobre la zona oscura de ese mismo degradado: imagen y texto son una sola superficie. |
| 6. Formas y recursos | Símbolo tipo asterisco (pariente directo del asterisco de Kain y del isotipo), línea diagonal con nodo, haz volumétrico, reflejo de piso. |
| 7. Densidad | Muy baja. |
| 8. Tono | Calmado, elegante, confiable. |
| 9. Movimiento implícito | Luz que se enciende sobre el rostro, haz que se abre, símbolo que pasa de desenfocado a nítido, línea que se traza. |

**Para Ingeniak:** es la plantilla del hero obligatorio. Kain (o la persona) de un lado, iluminado en cian/azul y fundiéndose en #03040B; el texto en la mitad oscura del mismo cuadro. El asterisco de Kain cumple el papel del símbolo y el haz volumétrico sirve como cierre del CTA.

### Ref. 7 · Taurus (pitch deck con horizonte planetario)

| # | Lectura |
|---|---|
| 1. Composición | Portada con 2–3 arcos de horizonte planetario apilados y luz que nace del borde del planeta; logo centrado sobre el arco superior; una línea vertical de luz baja hasta un ícono de estrella. Interiores: láminas con círculos luminosos (borde de eclipse) que contienen texto, donut chart, tarjetas del equipo, QR dentro de un anillo. |
| 2. Tipografía | Grotesca 14–24 px, títulos pequeños arriba a la izquierda. Jerarquía discreta. |
| 3. Color | Navy #071431 a azul #1F6FEB; bordes de luz cian-blanco; fondos de lámina #0B1630. |
| 4. Espacio | Amplio en la portada, ordenado en interiores. |
| 5. Tratamiento de imagen | Casi no hay fotos; la imagen es la luz: el limbo planetario (arco con borde brillante y brillo difuso) y el eclipse (círculo oscuro con contraluz). Las fotos del equipo van en círculos con borde fino dentro de tarjetas de cristal. |
| 6. Formas y recursos | Arcos de horizonte, círculos con contraluz, línea vertical de luz, donut, partículas, QR en anillo. |
| 7. Densidad | Baja-media. |
| 8. Tono | Cósmico, épico, ordenado. |
| 9. Movimiento implícito | Arco que sube como amanecer, luz que baja por la línea vertical hasta el ícono, órbitas girando, donut dibujándose. |

**Para Ingeniak:** el arco de horizonte funciona como **costura entre secciones** (el hero termina en un horizonte y la siguiente sección nace de esa luz) y como base del CTA final. La línea vertical de luz es el pilar central del isotipo.

### Ref. 8 · Halo AI studio (Framer: forma desenfocada + palabra fantasma)

| # | Lectura |
|---|---|
| 1. Composición | Hero centrado: H1 de una línea en 2 tonos, subtítulo mínimo y 2 botones dentro de una cápsula. Detrás, una forma gigante hiper desenfocada que llena el hero. Sección 2: declaración centrada en 2 tonos sobre la palabra fantasma "Halo". Sección 3: título gigante alineado a la izquierda ("What we do") y tarjetas a 2 columnas con mockups. |
| 2. Tipografía | Grotesca de display. H1 ~90 px medium con interletrado -4 %; declaración 36 px; dos tonos blanco / celeste #8EC5FF. |
| 3. Color | Negro #0A0A0A, celeste #4AA3F0 en la mancha, texto blanco + celeste. |
| 4. Espacio | Generoso. |
| 5. Tratamiento de imagen | La "imagen" es una forma de marca desenfocada a ~120 px: atmósfera pura que no compite con el texto. Termina con un fundido inferior a negro antes de la siguiente sección (corte suave, mejor que borde duro, aunque todavía se nota). |
| 6. Formas y recursos | Cápsula de nav, cápsula de botones, palabra fantasma, mockups de chat dentro de tarjetas, insignia "Made in Framer" (se descarta). |
| 7. Densidad | Muy baja. |
| 8. Tono | Minimalista, moderno, seguro. |
| 9. Movimiento implícito | Mancha que deriva lentamente, palabra fantasma que se revela, titulares con revelado por palabra. |

**Para Ingeniak:** el isotipo de cristal desenfocado como atmósfera de las páginas internas que no llevan persona, y los titulares en dos tonos.

### Ref. 9 · Referral S-02 (tres tarjetas de cristal inclinadas con luz interna)

| # | Lectura |
|---|---|
| 1. Composición | Tres tarjetas apiladas al centro, cada una con rotación distinta (≈ -6°, 0°, +6°) y desplazamiento horizontal alterno (zigzag). Marco editorial con etiquetas en las 4 esquinas ("S-02", "Referral", "MA", número de página). |
| 2. Tipografía | Grotesca ligera. Título de tarjeta 20 px, cuerpo 13 px apagado, etiquetas 12 px. |
| 3. Color | Negro azulado #0B0B18; luz índigo-violeta #5B4BFF con núcleo cian dentro de las tarjetas; borde del ícono en violeta. |
| 4. Espacio | Mucho alrededor; las tarjetas van juntas. |
| 5. Tratamiento de imagen | **Clave para el método.** Cada tarjeta es cristal oscuro con una fuga de luz atrapada en su mitad superior, como si una lámpara estuviera detrás del vidrio. Una línea horizontal separa título y cuerpo. Detrás de todo, una franja vertical de luz tenue (eclipse) en el lado izquierdo. |
| 6. Formas y recursos | Cristal con luz interna, ícono en cuadro redondeado con borde luminoso, etiquetas de esquina, pill con ícono. |
| 7. Densidad | Baja. |
| 8. Tono | Lúdico, nocturno, preciso. |
| 9. Movimiento implícito | Tarjetas que caen y rotan hasta su ángulo con el scroll, luz interna que se enciende en secuencia, inclinación 3D leve con el mouse. |

**Para Ingeniak:** los 5 pasos de VKTOR™ (Verify · Koncept · Transform · Operate · Rise) como tarjetas de cristal con luz interna que se encienden una tras otra al hacer scroll. Luz cian/índigo, no violeta.

### Ref. 10 · VOID (palabra gigante + objeto 3D + etiquetas flotantes)

| # | Lectura |
|---|---|
| 1. Composición | Palabra gigante que cruza todo el ancho; objeto 3D (globo floral violeta) centrado delante de ella; etiquetas cuadradas oscuras flotando a distintas profundidades (FB, SEO, PPC, ASO, PUSH, NATIVE, IN-APP, UAC); retícula fina de fondo. Abajo a la izquierda, texto gigante cortado por el borde ("LET'S INTRODUCE OUR TEAM") que anuncia la siguiente sección. |
| 2. Tipografía | Grotesca en mayúsculas ~200 px; etiquetas 12–16 px en mayúsculas. |
| 3. Color | Negro puro; violeta/lavanda en el objeto; blanco-lavanda con brillo en la palabra. |
| 4. Espacio | Medio. |
| 5. Tratamiento de imagen | La palabra tiene un brillo blanco desenfocado (bloom) y el objeto se recorta contra esa luz. Las etiquetas son cuadros negros sólidos que tapan parte de la palabra (capas). El objeto 3D es un recorte sin fondo. |
| 6. Formas y recursos | Retícula, etiquetas cuadradas, línea fina con rótulos ("MAIN FOCUS — TIER1-TIER3"), texto que sangra fuera del lienzo. |
| 7. Densidad | Media-alta. |
| 8. Tono | Experimental, audaz, nocturno. |
| 9. Movimiento implícito | Objeto girando, etiquetas con parallax a distintas velocidades, palabra con desplazamiento horizontal, texto gigante entrando desde el borde. |

**Para Ingeniak:** los servicios como etiquetas flotantes alrededor de Kain o del isotipo, con parallax, y el texto gigante que sangra por el borde como transición a la siguiente sección. Violeta y globo floral se descartan.

### Ref. 11 · Producto IA (CTA "Book Meet", pasos con luz, lista con barras luminosas)

| # | Lectura |
|---|---|
| 1. Composición | (a) Tarjeta CTA centrada: titular de 2 líneas, subtítulo, input + botón en la misma línea. (b) Contenedor redondeado con título a la izquierda y 3 tarjetas de paso. (c) Split 50/50: texto con lista a la izquierda y dashboard inclinado que sangra por la derecha del contenedor. |
| 2. Tipografía | Grotesca bold compacta, titulares ~40 px con interletrado -4 % y degradado blanco → azul dentro de la palabra. Cuerpo 16 px. |
| 3. Color | Navy #10162A en la página, negro en los contenedores, azul #1F5BFF → cian #7FE3FF en degradados, botón azul con brillo. |
| 4. Espacio | Medio. |
| 5. Tratamiento de imagen | La luz es el borde: la tarjeta CTA tiene una línea cian en el borde inferior que se difunde hacia abajo. Las tarjetas de paso tienen manchas azul-cian difuminadas en distintas esquinas: la luz "camina" del paso 1 al 3. El dashboard tiene borde cian luminoso y perspectiva. |
| 6. Formas y recursos | Barras verticales luminosas como viñetas, input pill + botón con brillo, contenedores con radio ~32 px, ícono circular de línea. |
| 7. Densidad | Media. |
| 8. Tono | Directo, de producto, enérgico. |
| 9. Movimiento implícito | Luz recorriendo los pasos 1 → 3, barras que se encienden al leer, dashboard que entra con rotación 3D, borde inferior que respira. |

**Para Ingeniak:** la tarjeta de "Agenda tu Discovery Session" con contraluz inferior, y las barras luminosas como viñetas de beneficios. Ojo: la referencia está llena de lorem ipsum; en v2 todo el texto es real.

### Nota sobre las imágenes 12, 13 y 14 (insignias Kommo Partner)

No son referencias de estilo: son las insignias oficiales de Kommo Partner (versión azul con sello, versión de línea y versión con texto blanco sobre transparente). Uso en v2:

- Sobre fondo oscuro, la versión con texto blanco (14) dentro de un chip de cristal, en la franja de confianza y en el hero de `/kommo/`.
- No se recolorea ni se recorta. El sello amarillo es de Kommo; es la única excepción tolerada a la regla "ámbar solo para dolores", y debe ir pequeño para no competir.

---

## 2. Lo que se repite en las 11: el ADN común

| Patrón | Dónde aparece | Qué significa para v2 |
|---|---|---|
| Sujeto que emerge del negro con contraluz | 2, 5, 6 (y Kain en nuestros renders) | Toda escena con persona o Kain se ilumina desde atrás/abajo en cian-azul y su lado de sombra es #03040B. |
| Texto sobre la zona oscura de la misma imagen | 2, 6 | No hay columna de texto separada de la imagen. La imagen va a sangre y el texto se apoya en su lado vacío. |
| Tres planos: palabra gigante, sujeto, cristal | 3, 5, 10 | Profundidad sin 3D real: una palabra fantasma atrás, el sujeto recortado en medio, el cristal y la UI adelante. |
| Cristal sobre algo borroso | 2, 3, 4, 9, 11 | Solo se usa cristal cuando hay imagen o luz detrás que se vea difusa. Sobre negro plano se usa tarjeta sólida. |
| Hub con ramas | 1, 4 | Es el isotipo. Diagrama de integraciones, de servicios y de VKTOR. |
| Horizonte o fundido como cierre de sección | 5, 7, 8 | Ninguna sección termina en borde recto; termina en luz o en fundido al color de la página. |
| Monocromía + un acento | todas | #03040B + #0055FF (acción) + #00E5FF (luz). El índigo #455DFF solo como transición en degradados. |
| Titulares en dos tonos | 2, 5, 8, 11 | Primera parte blanca, segunda en degradado cian o en gris al 45 %. |
| Marco editorial con metadatos | 6, 9 | Etiquetas en JetBrains Mono en las esquinas de las escenas ("01 / 07", "VKTOR · V"). |

---

## 3. Insumos propios: qué sirve y qué no

Revisé `Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/`, `06_Elementos_Graficos/`, `materiales/magnific/`, `materiales/discovery/`, `materiales/equipo/` e `img/marca/`.

| Archivo | Lo que hay | ¿Sirve como escena integrada? | Acción |
|---|---|---|---|
| `materiales/discovery/kain-01-hero.png` (2048×1152) | Kain blanco de cuerpo completo a la derecha (~65 % x), mano abierta presentando **hacia la izquierda**, haz de luz vertical detrás, plataforma con anillo, niebla. La mitad izquierda es navy con niebla y está vacía. | **Sí, es la composición correcta tal cual.** El gesto apunta al texto. | Escalar ×2 a 4096 px de ancho (Magnific upscale), generar recorte con `images_remove_background` para la capa delantera y una versión 4:5 para móvil. Candidato al hero de Inicio. |
| `materiales/discovery/kain-03-cuatro-a.png` (2048×1152) | Kain a la izquierda-centro subiendo escalones de cristal que ascienden hacia la derecha. | Parcial. Sirve como escena de proceso (VKTOR) con texto arriba a la derecha, sobre la niebla. | Usar en la página de Metodología; los 4–5 escalones pueden alinearse con los pasos. |
| `materiales/discovery/kain-mobile-hero.png` | Busto de Kain con **viñeta blanca horneada** en los bordes. | **No.** El halo blanco no se puede quitar sobre fondo oscuro, y además rompe la regla "Kain siempre de cuerpo completo". | Regenerar en 4:5 con cuerpo completo. |
| `referencias/kain-login-portada-A…png` (1440×1800, 4:5) | Kain al centro, paneles holográficos y mini-Kains alrededor, texto en el 25 % inferior. | Sí como **modelo de composición móvil** (sujeto arriba/centro, zona oscura abajo para texto). | Pedir versión sin texto. No usar la que tiene texto horneado. |
| `referencias/magnific_cinematic-…5xMC` / `9RFU` / `tf3p` (1344×752) | Kain en haz de luz (pulgar arriba); Kain con 3 esferas holográficas; Kain caminando entre arcos (a la derecha). Todas con el logo "ingeniak" horneado. | No tal cual: resolución baja, logo horneado, y dos de tres tienen sujeto centrado. `tf3p` (sujeto a la derecha, arcos hacia la izquierda) es la mejor idea para "Transform". | Regenerar sin texto, a 16:9 grande, con Kain desplazado a un lado. |
| `referencias/kain-body-*.jpg` (1248×1872, fondo negro) | Kain blanco en 3 poses sobre negro liso. | Son las **referencias para Nano Banana** y fuente de recortes. | Adjuntar siempre como referencia de personaje. |
| `referencias/kain-doctor-recorte.png` | Kain con bata, brazos cruzados, ya recortado. | Sí, para la escena de Salud. | Componer sobre fondo de consultorio en navy, o regenerar la escena completa con la bata. |
| `referencias/kain-en-bodega.jpg` | Kain en bodega real con luz cálida. | Con cuidado: la paleta cálida rompe el sistema. | Para casos de logística/retail, regenerar en navy con contraluz cian o pasar por el gradado de D12. |
| `referencias/Kain_04_Paginas_Web.png` | Post social con texto horneado y humo naranja a la izquierda. | No (texto horneado y naranja fuera de regla). | Solo como idea para la página de Sitios web: Kain manipulando wireframes holográficos. |
| `materiales/magnific/b.png`, `c.png`, `isotipo-cristal-A.png` (1024²) | Isotipo de cristal 3D con brillo azul sobre negro azulado; `c` en perspectiva con reflejo de piso. | Sí como **centro del hub**, como atmósfera desenfocada (D10) y como cierre del CTA. | Ampliar el lienzo a 16:9 (`images_expand` / `outpaint`) y escalar. |
| `img/marca/fondo-ondas-1600.webp` | Ondas sedosas navy con filo azul. | Sí para secciones de solo texto con cristal encima (técnica de la ref. 3). | Pedir versión 2560 o 3200 px. |
| `materiales/equipo/team-hero…jpg` (1280×720) | Siluetas de 4 personas frente a un muro de pantallas azules, centradas. | Parcial: sujeto centrado y resolución baja. | Para Nosotros: escalar, extender lienzo a 21:9 y desplazar el grupo a la derecha; o usar a sangre con texto abajo a la izquierda sobre velo. |
| `06_Elementos_Graficos/sistemas_ingeniak/hero-*.png` | Renders isométricos (Kommo, n8n, etc.) dentro de una **viñeta circular blanca**. | **No a sangre:** el blanco está horneado. | Regenerar sobre #03040B o quitar fondo y componer dentro de cristal. |
| `06_Elementos_Graficos/hero-robot-ingeniak.webp` | KAIN negro/grafito (variante anterior). | No: la guía del personaje pide elegir la variante blanca y mantenerla. | No mezclar variantes. |
| `06_Elementos_Graficos/mapa-global.webp` | Mapa genérico con pines en África, China y Australia. | **No:** sugiere presencia en países donde no estamos. | Si se necesita mapa, generar uno con los 7 países reales (México sede, USA, Colombia, Argentina, España, Costa Rica, Ecuador). |
| `06_Elementos_Graficos/servicio-consultoria.webp` | Red de nodos cian con profundidad de campo. | Sí como fondo de sección sin persona (consultoría, automatización). | Escalar; usar con velo lateral. |

---

## 4. Las 12 decisiones de diseño para v2 (con CSS y motion)

Tokens base que asumen todos los fragmentos:

```css
:root {
  --ink: #03040B;            /* lienzo único de la página */
  --navy: #0A1F4C;
  --blue: #0055FF;           /* solo acciones y botones */
  --indigo: #455DFF;         /* transición en degradados */
  --cyan: #00E5FF;           /* luz de IA, líneas, estados activos */
  --text: #FFFFFF;
  --muted: #9EB0C7;
  --amber: #FFB547;          /* solo dolores */
  --ease-out: cubic-bezier(.16, 1, .3, 1);
}
html, body { background: var(--ink); color: var(--text); }
```

### D1 · Escena integrada: imagen a sangre, sujeto de un lado, texto del otro (LA obligatoria)

- **Origen:** Lunetra (6), Reven (2), mano con teléfono (5b), y nuestro `kain-01-hero.png`.
- **Qué es:** la sección no tiene dos columnas. Tiene **una imagen que ocupa toda la sección** (a sangre, detrás de todo) y una retícula de contenido encima. El sujeto está compuesto *dentro* de la imagen en el tercio opuesto al texto. Un velo oscuro que nace del lado del texto garantiza lectura. Los cuatro bordes de la imagen se funden con máscara hacia `--ink`, así nunca aparece un rectángulo.
- **Dónde:** hero de todas las páginas (Inicio, cada servicio, cada sector, Metodología, Nosotros, Discovery) y cualquier sección media de texto + imagen.
- **Capas, de atrás hacia adelante (z-index fijo para todo el sitio):**
  1. `scene__media` (z -5): `<picture>` con `<img>` real (no `background-image`, por LCP, `alt` y SEO), `object-fit: cover` y punto focal por breakpoint.
  2. `scene__fx` (z -4): velo del lado del texto + viñeta radial centrada en el sujeto.
  3. `scene__ghost` (z -3, opcional, D3): palabra gigante decorativa.
  4. `scene__glow` (z -2): brillo cian detrás del sujeto con `mix-blend-mode: screen` (lo anima GSAP).
  5. `scene__cutout` (z -1, opcional, D3): recorte del sujeto registrado sobre la plate.
  6. `scene__veil` (z 0): capa negra solo para la entrada ("se enciende la luz"); termina en opacidad 0.
  7. `scene__inner` (z 1): retícula de 12 columnas; el texto ocupa 1–6 (o 7–12 si el sujeto está a la izquierda); chips de cristal cerca del sujeto.
  8. Grano global en `body::after` (D12), igual en toda la página.

```html
<section class="scene" data-side="right"
  style="--fx:70%; --fy:42%; --fx-m:50%; --fy-m:12%;">
  <picture class="scene__media">
    <source media="(max-width: 1023px)" type="image/avif"
      srcset="/img/escenas/inicio-m-828.avif 828w, /img/escenas/inicio-m-1242.avif 1242w" sizes="100vw">
    <source media="(min-width: 1024px)" type="image/avif"
      srcset="/img/escenas/inicio-1600.avif 1600w, /img/escenas/inicio-2560.avif 2560w, /img/escenas/inicio-3200.avif 3200w" sizes="100vw">
    <img src="/img/escenas/inicio-2560.webp" width="2560" height="1440"
      alt="Kain, el agente de IA de Ingeniak, presenta con la mano abierta"
      fetchpriority="high" decoding="async">
  </picture>
  <div class="scene__fx" aria-hidden="true"></div>
  <div class="scene__glow" aria-hidden="true"></div>
  <div class="scene__veil" aria-hidden="true"></div>
  <div class="scene__inner">
    <div class="scene__copy">
      <p class="eyebrow">Consultoría de IA · Guadalajara</p>
      <h1 class="h-display">Agentes de IA que atienden, califican y agendan. <span class="tone">Tú diriges.</span></h1>
      <p class="lede">…</p>
      <div class="ctas">
        <a class="btn btn--primary" href="/discovery/">Agenda tu Discovery Session</a>
        <a class="btn btn--glass" href="https://wa.me/523321017799">Escríbele a Kain</a>
      </div>
    </div>
    <ul class="scene__chips" aria-label="Resultados confirmados">
      <li class="glass chip">Respuesta: 8 min → 12 s</li>
      <li class="glass chip">3.2x más citas en 90 días</li>
    </ul>
  </div>
</section>
```

```css
.scene {
  --side: 90deg;                     /* dirección del velo: el texto está a la izquierda */
  position: relative;
  isolation: isolate;
  overflow: clip;
  min-height: min(100svh, 1000px);
  display: grid;
  align-items: center;
  /* SIN background: la sección es transparente y deja ver el lienzo de la página */
}
.scene[data-side="left"] { --side: 270deg; }

.scene__media { position: absolute; inset: 0; z-index: -5; display: block; }
.scene__media img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: var(--fx, 70%) var(--fy, 45%);
  /* Funde los 4 bordes hacia el lienzo: la imagen deja de ser un rectángulo */
  -webkit-mask-image:
    linear-gradient(to bottom, transparent 0, #000 9%, #000 80%, transparent 100%),
    linear-gradient(to right,  transparent 0, #000 6%, #000 94%, transparent 100%);
  -webkit-mask-composite: source-in;
          mask-image:
    linear-gradient(to bottom, transparent 0, #000 9%, #000 80%, transparent 100%),
    linear-gradient(to right,  transparent 0, #000 6%, #000 94%, transparent 100%);
          mask-composite: intersect;
}

/* Velo del lado del texto + viñeta que concentra la luz en el sujeto */
.scene__fx {
  position: absolute; inset: 0; z-index: -4; pointer-events: none;
  background:
    linear-gradient(var(--side),
      rgb(3 4 11 / .94) 0%,
      rgb(3 4 11 / .78) 30%,
      rgb(3 4 11 / .30) 48%,
      rgb(3 4 11 / 0) 60%),
    radial-gradient(110% 85% at var(--fx) 45%, transparent 45%, rgb(3 4 11 / .55) 100%);
}

/* Contraluz cian detrás del sujeto (se suma a la luz de la imagen) */
.scene__glow {
  position: absolute; z-index: -2; pointer-events: none;
  left: calc(var(--fx) - 22vw); top: 8%;
  width: 44vw; aspect-ratio: 1;
  background: radial-gradient(closest-side, rgb(0 229 255 / .32), rgb(69 93 255 / .14) 55%, transparent 100%);
  filter: blur(30px);
  mix-blend-mode: screen;
}

/* Solo para la entrada: GSAP la lleva de .7 a 0 ("se enciende la luz") */
.scene__veil { position: absolute; inset: 0; z-index: 0; background: var(--ink); opacity: 0; pointer-events: none; }

.scene__inner {
  position: relative; z-index: 1;
  width: min(1240px, 100% - 2 * clamp(16px, 4vw, 48px));
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 24px;
}
.scene__copy { grid-column: 1 / span 6; }
.scene[data-side="left"] .scene__copy { grid-column: 7 / span 6; }

/* Monitores ultra anchos: la imagen no crece sin límite y el sujeto no se va al borde */
@media (min-width: 1800px) {
  .scene__media { inset: 0 max(0px, (100vw - 2200px) / 2); }
}

/* Tablet vertical y móvil: arte dirigido 4:5 / 9:16. El sujeto arriba, el texto encima de la parte baja */
@media (max-width: 1023px) {
  .scene { min-height: auto; align-items: end; padding-top: clamp(300px, 62svh, 640px); } /* padding-bottom lo pone D2 (--seam) */
  .scene__media img {
    object-position: var(--fx-m, 50%) var(--fy-m, 10%);
    -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 55%, transparent 88%);
            mask-image: linear-gradient(to bottom, #000 0, #000 55%, transparent 88%);
  }
  .scene__fx { background: linear-gradient(to top, var(--ink) 0 28%, rgb(3 4 11 / .7) 45%, rgb(3 4 11 / 0) 65%); }
  .scene__copy, .scene[data-side="left"] .scene__copy { grid-column: 1 / -1; }
  .scene__glow { left: calc(var(--fx-m) - 40vw); width: 80vw; top: 4%; }
}
```

- **Prueba de concepto (hecha):** el CSS de arriba, aplicado a `materiales/discovery/kain-01-hero.png` sin retoques, da el resultado de `materiales/v2/B-prueba-escena-1440.jpg`: sin bordes visibles, texto sobre la mitad oscura de la misma imagen y la siguiente sección empezando dentro del fundido. Dos aprendizajes de la prueba: (1) en móvil, recortar la imagen 16:9 deja a Kain fuera de cuadro, así que la versión 4:5 / 9:16 con arte dirigido es obligatoria y no opcional; (2) los chips de cristal no deben tapar al sujeto: van entre el texto y Kain, o junto a la mano que presenta, nunca sobre el cuerpo ni la cara.
- **Por qué se siente "una sola sección":** (a) la sección no tiene fondo propio, (b) la máscara funde los bordes contra el mismo `--ink` del lienzo, (c) el velo viene del mismo lado que el texto y es del mismo color, (d) la imagen está generada con fondo navy que cae a #03040B (sección 6), así que el velo no "pinta encima": continúa lo que ya hay.
- **Motion (GSAP):** la entrada es "se enciende la luz", no "aparece una foto".

```js
const scene = document.querySelector('.scene');
const split = SplitText.create('.scene .h-display', { type: 'lines', mask: 'lines' });
gsap.timeline({ defaults: { ease: 'power3.out' } })
  .from('.scene__media img', { scale: 1.08, duration: 2.2 })
  .fromTo('.scene__veil', { opacity: .7 }, { opacity: 0, duration: 1.6 }, 0)
  .from('.scene__glow', { opacity: 0, scale: .7, duration: 1.6 }, .3)
  .from(split.lines, { yPercent: 110, duration: 1, stagger: .08 }, .35)
  .from('.scene .ctas > *', { y: 16, opacity: 0, stagger: .08 }, .8)
  .from('.scene__chips .chip', { y: 24, opacity: 0, filter: 'blur(6px)', stagger: .12 }, 1);

gsap.to('.scene__media img', { yPercent: 6, ease: 'none',
  scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom top', scrub: true } });
gsap.to('.scene__copy', { y: -60, autoAlpha: 0, ease: 'none',
  scrollTrigger: { trigger: scene, start: 'center center', end: 'bottom top', scrub: true } });
```

  Nota: no animar `filter: brightness()` sobre la imagen LCP (es caro en pantallas grandes). Para el "encendido" se anima la opacidad de `.scene__veil`, que cuesta casi nada. GSAP no puede animar pseudo-elementos directamente: todo lo que se anime va en un elemento real o se controla con una variable CSS.

### D2 · Lienzo continuo: las secciones no tienen fondo y se solapan en una costura de luz

- **Origen:** Taurus (7), Halo (8), Fintech (5).
- **Qué es:** el `body` es el único que tiene color (#03040B + grano + un par de brillos fijos muy tenues). Ninguna sección pinta fondo. Cada escena termina con su máscara inferior y la siguiente sección **sube** sobre ese fundido (margen negativo), así el contenido de la siguiente empieza dentro de la luz de la anterior. Para cambios fuertes de capítulo se usa un **arco de horizonte** (Taurus) en vez de una línea recta.
- **Dónde:** todas las transiciones. Nunca una sección clara (ver "Qué NO copiar").

```css
/* La escena reserva abajo el mismo espacio que la siguiente sección le "pisa": así el solape
   nunca tapa los CTA (en la prueba sin esta reserva, en móvil la siguiente sección montaba sobre los botones). */
:root { --seam: clamp(80px, 12vh, 160px); }
.scene { padding-bottom: var(--seam); }
.scene + section { margin-top: calc(-1 * var(--seam)); position: relative; z-index: 1; }
@media (max-width: 1023px) { .scene { padding-bottom: calc(var(--seam) + 24px); } }

/* Horizonte planetario como costura (ref. 7) */
.horizon { position: relative; height: clamp(120px, 18vw, 260px); overflow: clip; pointer-events: none; }
.horizon::before {
  content: ""; position: absolute; left: 50%; top: 100%;
  width: 260vw; aspect-ratio: 1; translate: -50% -3.5%;
  border-radius: 50%;
  background: radial-gradient(closest-side, var(--ink) 98.6%, rgb(0 229 255 / .95) 99.2%, rgb(69 93 255 / .35) 99.7%, transparent 100%);
  box-shadow: 0 -40px 140px rgb(0 85 255 / .35);
}
.horizon::after { /* el amanecer: luz que nace del borde del arco */
  content: ""; position: absolute; inset: auto 20% -40% 20%; height: 120%;
  background: radial-gradient(50% 50% at 50% 100%, rgb(0 229 255 / .28), transparent 70%);
  filter: blur(20px); mix-blend-mode: screen;
}
```

- **Motion:** el arco sube 30–40 px y su brillo pasa de 0 a 1 con `scrub` al entrar al viewport; se siente como un amanecer entre capítulos.

### D3 · Texto detrás del sujeto: palabra fantasma + recorte registrado

- **Origen:** Fintech 5b ("CORE SOLUTION" detrás de la mano), Forma AI (3), VOID (10).
- **Qué es:** tres capas exactamente registradas: la imagen completa (plate), una palabra gigante decorativa, y el recorte del sujeto (PNG/WebP con alfa, mismas dimensiones en píxeles que la plate). Como ambas imágenes usan la misma caja, el mismo `object-fit` y el mismo `object-position`, el recorte cae exactamente encima del sujeto y la palabra queda "entre" el fondo y Kain.
- **Dónde:** hero de Inicio (palabra "AGENTES" o "SISTEMA"), Metodología ("VKTOR"), hero de la página de Kain/agentes.
- **Regla de accesibilidad y SEO:** la palabra fantasma es `aria-hidden="true"` y no es el H1. El H1 real vive en `scene__copy`.

```html
<picture class="scene__media">…plate…</picture>
<p class="scene__ghost" aria-hidden="true">AGENTES</p>
<picture class="scene__cutout" aria-hidden="true">
  <source media="(max-width: 1023px)" srcset="/img/escenas/inicio-m-recorte.webp">
  <img src="/img/escenas/inicio-recorte.webp" alt="" width="2560" height="1440">
</picture>
```

```css
.scene__cutout { position: absolute; inset: 0; z-index: -1; pointer-events: none; }
.scene__cutout img { width: 100%; height: 100%; object-fit: cover; object-position: var(--fx) var(--fy); }

.scene__ghost {
  position: absolute; z-index: -3; inset: auto 0 14% 0;
  font: 700 clamp(5rem, 19vw, 20rem)/.8 Lexend, sans-serif;
  letter-spacing: -.05em; text-align: center; white-space: nowrap;
  color: transparent;
  background: linear-gradient(180deg, rgb(69 93 255 / .55), rgb(10 31 76 / .15) 75%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-mask-image: linear-gradient(to bottom, #000 40%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 40%, transparent 100%);
}
@media (max-width: 1023px) {
  .scene__cutout img { object-position: var(--fx-m) var(--fy-m); }
  .scene__ghost { inset: 30% 0 auto 0; font-size: 26vw; }
}
```

- **Motion:** la palabra se desplaza en X (`xPercent: -8` con scrub) mientras plate y recorte quedan fijos entre sí. **Importante:** si se quiere parallax distinto entre fondo y sujeto, se necesita una *clean plate* (el mismo fondo sin Kain, generada con la misma semilla o con inpainting); si no, al moverse el recorte aparece el Kain "fantasma" de la plate debajo.

### D4 · Cristal sobre la escena, nunca sobre negro plano

- **Origen:** Reven (2), Forma AI (3), Boltshift (4), Referral (9). Además es el efecto que el cliente ya aprobó antes.
- **Qué es:** los chips y tarjetas de cristal se colocan encima de zonas con luz o imagen (el brillo detrás de Kain, la onda sedosa, el isotipo desenfocado) para que el `backdrop-filter` tenga algo que difuminar. Borde de 1 px con degradado (más brillante arriba-izquierda, cian abajo-derecha), reflejo interior superior y sombra profunda.
- **Dónde:** chips de cifras confirmadas en heros, tarjetas de servicios sobre fondo de ondas, tarjeta de Discovery, nav flotante.

```css
.glass {
  position: relative;
  border-radius: 22px;
  background: linear-gradient(150deg, rgb(255 255 255 / .13), rgb(255 255 255 / .04) 45%, rgb(69 93 255 / .10));
  -webkit-backdrop-filter: blur(18px) saturate(140%);
          backdrop-filter: blur(18px) saturate(140%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .32), 0 30px 80px rgb(0 0 0 / .5);
}
.glass::before {               /* borde de 1 px en degradado, sin border-image */
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
  background: linear-gradient(140deg, rgb(255 255 255 / .55), rgb(255 255 255 / .06) 40%, rgb(0 229 255 / .45));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
}
.glass--active { box-shadow: inset 0 0 0 1px rgb(0 229 255 / .55), inset 0 0 40px rgb(0 229 255 / .18), 0 0 60px rgb(0 229 255 / .25); } /* selección por luz, ref. 3 */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass { background: rgb(9 14 34 / .9); }
}
```

- **Trampas:** (a) un ancestro con `opacity < 1`, `filter`, `mask`, `clip-path` o `mix-blend-mode` crea una "raíz de fondo" y el cristal deja de ver la imagen: se ve plano. No poner máscaras ni animar opacidad en el contenedor del cristal; animar el cristal mismo. (b) Máximo ~6 elementos con `backdrop-filter` visibles a la vez, blur ≤ 24 px. (c) Sin `backdrop-filter` sobre video en reproducción.
- **Motion:** los chips flotan con un `y` senoidal muy lento (amplitud 6 px, 5–7 s, desfasados) y responden al mouse con un tilt de 4–6° como máximo (solo `pointer: fine`).

### D5 · Duotono navy-azul con contraluz para personas reales

- **Origen:** Reven (2), Lunetra (6), Fintech 5c.
- **Qué es:** las fotos del equipo (y cualquier persona real) pasan a duotono: sombras #03040B, medios #0055FF, luces casi blancas con un toque cian. Luego se les suma un contraluz desde un lado con un degradado en `screen`. Así fotos tomadas en condiciones distintas se ven como una sesión única y se funden con el lienzo.
- **Dónde:** Nosotros/Equipo, hero de Nosotros, firmas de autor en artículos.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <filter id="duo-ingeniak" color-interpolation-filters="sRGB">
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer>
      <feFuncR type="table" tableValues="0.012 0.000 0.80"/>
      <feFuncG type="table" tableValues="0.016 0.333 0.93"/>
      <feFuncB type="table" tableValues="0.043 1.000 1.00"/>
    </feComponentTransfer>
  </filter>
</svg>
```

```css
@property --r { syntax: "<percentage>"; inherits: true; initial-value: 75%; }
.person { position: relative; isolation: isolate; --r: 75%; }
.person img { filter: url(#duo-ingeniak) contrast(1.08);
  -webkit-mask-image: radial-gradient(var(--r) calc(var(--r) + 10%) at 55% 35%, #000 55%, transparent 100%);
          mask-image: radial-gradient(var(--r) calc(var(--r) + 10%) at 55% 35%, #000 55%, transparent 100%); }
.person::after { /* contraluz lateral */
  content: ""; position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen;
  background: radial-gradient(40% 60% at 85% 30%, rgb(0 229 255 / .35), transparent 70%);
}
```

- **Regla:** a las fotos reales del equipo no se les cambia la cara ni se "mejoran" con IA. Para escenas con personas genéricas (por ejemplo, una doctora en el hero de Salud) se generan personas con el mismo duotono, y nunca se presentan como clientes ni con nombre.
- **Motion:** al entrar, la máscara radial se abre (se anima `--r` de 30 % a 75 % con `@property`) y el contraluz sube de 0 a 1: la persona "sale de la oscuridad".

### D6 · Hub de conexiones = isotipo (integraciones, servicios, VKTOR)

- **Origen:** AlpinaGPT (1), Boltshift (4); y el isotipo mismo (pilar central + ramas + nodo superior).
- **Qué es:** un centro (isotipo de cristal 3D) con ramas SVG hacia tarjetas a ambos lados. Las líneas son el trazo del isotipo: verticales y diagonales, codos con radio, nodo cuadrado al final (no círculo, para que sea de la marca). Un pulso de luz recorre cada rama hacia su tarjeta.
- **Dónde:** "Tu stack conectado" en Inicio, página de Automatización (n8n/Make), página de CRM.

```css
.hub { position: relative; display: grid; grid-template-columns: 1fr minmax(220px, 28%) 1fr; align-items: center; gap: 32px; }
.hub__lines { position: absolute; inset: 0; z-index: -1; overflow: visible; }
.hub__lines path { fill: none; stroke: rgb(0 229 255 / .35); stroke-width: 1.25; vector-effect: non-scaling-stroke; }
.hub__lines .pulse { stroke: var(--cyan); stroke-width: 2; stroke-linecap: round; filter: drop-shadow(0 0 6px var(--cyan));
  stroke-dasharray: 14 400; stroke-dashoffset: 414; }
.hub__core img { filter: drop-shadow(0 0 60px rgb(0 85 255 / .55)); }
.hub__grid { /* retícula que solo se ve cerca del centro, ref. 4 */
  position: absolute; inset: -20%; z-index: -2;
  background-image: linear-gradient(rgb(158 176 199 / .08) 1px, transparent 1px), linear-gradient(90deg, rgb(158 176 199 / .08) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(40% 45% at 50% 50%, #000, transparent);
          mask-image: radial-gradient(40% 45% at 50% 50%, #000, transparent);
}
@media (max-width: 767px) { .hub { grid-template-columns: 1fr; } /* el centro arriba, ramas verticales hacia una lista */ }
```

- **Motion:** las ramas se dibujan desde el centro con `strokeDashoffset` (o DrawSVGPlugin, incluido sin costo en GSAP 3.13) en `scrub`; cuando una rama termina, su tarjeta se enciende (`.glass--active`) y queda un pulso en loop cada 3–4 s con `repeatDelay` aleatorio.

### D7 · VKTOR™ como cinco tarjetas de cristal con luz interna que se encienden en secuencia

- **Origen:** Referral (9) y pasos con luz (11b).
- **Qué es:** cinco tarjetas (V · K · T · O · R) con la letra grande en Lexend, el verbo ("Verificamos tu operación", "Diseñamos el concepto", "Transformamos", "Operamos junto con tu equipo", "Hacemos crecer los resultados") y una fuga de luz atrapada en la mitad superior. En desktop van fijas (pin) y la luz pasa de una a otra con el scroll; en móvil van apiladas con rotaciones leves alternas (-3°, 2°, -2°, 3°, -1°).
- **Dónde:** Inicio (resumen) y página de Metodología (completa, usando la escena de Kain subiendo escalones como fondo).

```css
.step { position: relative; overflow: clip; --glow: 0; --gx: 30%; }
.step::after {
  content: ""; position: absolute; inset: -30% -10% 45% -10%; pointer-events: none;
  background: radial-gradient(55% 60% at var(--gx) 70%, rgb(0 229 255 / .6), rgb(69 93 255 / .35) 40%, transparent 70%);
  filter: blur(26px); mix-blend-mode: screen; opacity: var(--glow);
}
.step__rule { height: 1px; background: linear-gradient(90deg, transparent, rgb(255 255 255 / .25), transparent); }
.step__letter { font: 600 clamp(3rem, 6vw, 5.5rem)/1 Lexend; letter-spacing: -.04em; color: transparent;
  -webkit-text-stroke: 1px rgb(255 255 255 / .35); transition: color .6s var(--ease-out); }
.step.is-on .step__letter { color: var(--text); -webkit-text-stroke-color: transparent; }
```

```js
const steps = gsap.utils.toArray('.step');
const tl = gsap.timeline({ scrollTrigger: { trigger: '.vktor', start: 'top top', end: '+=' + steps.length * 60 + '%', pin: true, scrub: .6 } });
steps.forEach((el, i) => {
  tl.to(el, { '--glow': 1, '--gx': '70%', duration: 1,
      onStart: () => el.classList.add('is-on'),
      onReverseComplete: () => el.classList.remove('is-on') }, i)
    .to(el, { '--glow': .25, duration: .6 }, i + 1);
});
// Móvil (< 1024 px): sin pin; cada tarjeta enciende su luz con su propio ScrollTrigger (start: 'top 70%').
```

  (Registrar `--glow` y `--gx` con `@property` para que interpolen en CSS si se usan transiciones; con GSAP no hace falta.)

### D8 · Jerarquía tipográfica: Lexend grande, peso medio, interletrado apretado, dos tonos

- **Origen:** Halo (8), Reven (2), Fintech (5), Producto IA (11).
- **Qué es:** titulares en Lexend 500 (no 700), muy grandes, con la segunda mitad en tono de luz. Cuerpo en Inter. Etiquetas y metadatos en JetBrains Mono con interletrado amplio.

```css
.h-display { font: 500 clamp(2.5rem, 1.1rem + 4.4vw, 5.5rem)/1.02 Lexend, sans-serif; letter-spacing: -.035em; text-wrap: balance; }
.h-section { font: 500 clamp(2rem, 1.2rem + 2.6vw, 3.5rem)/1.06 Lexend, sans-serif; letter-spacing: -.03em; text-wrap: balance; }
.tone { background: linear-gradient(92deg, #FFFFFF 0%, #A8F3FF 30%, var(--cyan) 65%, var(--indigo) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.tone--quiet { color: rgb(255 255 255 / .45); }                 /* variante ref. 5: segunda línea en gris */
.lede { font: 400 clamp(1.05rem, .95rem + .4vw, 1.25rem)/1.55 Inter, sans-serif; color: var(--muted); max-width: 52ch; text-wrap: pretty; }
.eyebrow, .meta { font: 500 .75rem/1 "JetBrains Mono", monospace; letter-spacing: .18em; text-transform: uppercase; color: var(--cyan); }
```

- **Motion:** SplitText 3.13 con `mask: 'lines'` (las líneas suben desde una máscara, sin `overflow: hidden` manual) y `autoSplit: true` para que se recalculen al cambiar el ancho. Un brillo recorre `.tone` una vez al entrar (animar `background-position` de un degradado al 200 %).

### D9 · Marco editorial: metadatos en las esquinas de cada escena

- **Origen:** Lunetra 3 (dominio y correo en esquinas), Referral (S-02, número de página).
- **Qué es:** cada escena lleva 2–4 rótulos en mono en sus esquinas: índice del capítulo ("02 / 09"), sección ("VKTOR · Transform"), dato técnico ("WhatsApp · Kommo · n8n"), ubicación ("GDL · MX"). Ordena, da sensación de producto serio y ayuda a orientar en un sitio de muchas páginas.
- **Dónde:** heros y escenas a sangre. No en tarjetas pequeñas.

```css
.scene__meta { position: absolute; inset: clamp(80px, 12vh, 120px) clamp(16px, 4vw, 48px) clamp(24px, 5vh, 48px); pointer-events: none;
  display: grid; grid-template: auto 1fr auto / auto 1fr auto; }
.scene__meta > :nth-child(1) { grid-area: 1 / 1; } .scene__meta > :nth-child(2) { grid-area: 1 / 3; }
.scene__meta > :nth-child(3) { grid-area: 3 / 1; } .scene__meta > :nth-child(4) { grid-area: 3 / 3; }
.scene__meta .meta { color: rgb(158 176 199 / .7); }
.pill-index { border: 1px solid rgb(0 229 255 / .35); border-radius: 999px; padding: .5em .9em; }
```

- **Motion:** los números del índice hacen un "scramble" corto (6–8 frames de caracteres aleatorios) al entrar. Con `prefers-reduced-motion` aparecen sin efecto.

### D10 · Atmósfera de marca: isotipo de cristal desenfocado + ondas sedosas para secciones sin persona

- **Origen:** Halo (8) y Forma AI (3).
- **Qué es:** cuando una sección no tiene sujeto (FAQ, listas de servicios, texto largo), el fondo no es negro vacío: es el isotipo de cristal a escala gigante, desenfocado 60–100 px, o la onda sedosa, en `mix-blend-mode: screen`, con parallax lento. Encima van las tarjetas de cristal (D4), que ahora sí tienen algo que difuminar.
- **Dónde:** índice de servicios, FAQ, casos, página de precio ("desde USD 997 al mes"), artículos.

```css
.aura { position: absolute; inset: -10% -20%; z-index: -2; pointer-events: none; }
.aura img { width: 100%; height: 100%; object-fit: contain; filter: blur(80px) saturate(130%); opacity: .55; mix-blend-mode: screen;
  transform: rotate(-12deg) scale(1.3); }
.aura--waves img { object-fit: cover; filter: none; opacity: .8;
  -webkit-mask-image: radial-gradient(70% 60% at 50% 50%, #000 30%, transparent 100%);
          mask-image: radial-gradient(70% 60% at 50% 50%, #000 30%, transparent 100%); }
```

- **Rendimiento:** el `filter: blur(80px)` es caro si se recalcula; mejor **exportar el isotipo ya desenfocado** como WebP pequeño (400–600 px; al ser borroso, se escala sin que se note) y no usar `filter` en vivo.
- **Motion:** rotación de 0 a 8° y `yPercent` de -10 a 10 con scrub; nada más. Lento.

### D11 · Haz volumétrico y horizonte para el cierre "Agenda tu Discovery Session"

- **Origen:** Lunetra 4 (haz de luz), Taurus (horizonte), Producto IA 11a (tarjeta CTA con contraluz inferior).
- **Qué es:** el cierre de cada página es una escena: haz de luz que baja desde arriba al centro, Kain de cuerpo completo debajo del haz (o el isotipo de cristal), y la tarjeta de cristal del CTA con su línea de luz inferior. El botón primario es azul #0055FF con brillo; el secundario, cristal con WhatsApp.

```css
.beam { position: absolute; inset: 0 0 auto 50%; width: min(900px, 120vw); height: 100%; translate: -50% 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(8% 12% at 50% 0%, rgb(255 255 255 / .9), transparent 100%),
    /* 0deg = arriba, 180deg = abajo: el cono abre ±8° alrededor de la vertical hacia abajo */
    conic-gradient(from 172deg at 50% 0%, transparent 0deg, rgb(0 229 255 / .55) 8deg, transparent 16deg);
  filter: blur(14px); mix-blend-mode: screen;
  -webkit-mask-image: linear-gradient(to bottom, #000 40%, transparent 95%);
          mask-image: linear-gradient(to bottom, #000 40%, transparent 95%); }
.cta-card { position: relative; padding: clamp(28px, 5vw, 56px); text-align: center; } /* se usa como class="glass cta-card" */
.cta-card::after { /* contraluz inferior, ref. 11 */
  content: ""; position: absolute; left: 8%; right: 8%; bottom: -1px; height: 2px; border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), transparent);
  box-shadow: 0 0 24px 4px rgb(0 229 255 / .55), 0 18px 60px 10px rgb(0 85 255 / .35);
}
.btn--primary { background: var(--blue); color: #fff; border-radius: 999px; padding: 1em 1.6em; font: 600 1rem/1 Inter;
  box-shadow: 0 0 0 1px rgb(255 255 255 / .12) inset, 0 10px 40px rgb(0 85 255 / .55); }
```

- **Motion:** el haz se abre (de `scaleX: .2` a 1) y su punto superior se enciende cuando la sección llega al 60 % del viewport; la línea inferior de la tarjeta respira (opacidad .6 ↔ 1, 3 s).

### D12 · Sistema de unificación: grano global + gradado de color + una sola luz por escena

- **Origen:** grano de la ref. 5, monocromía de todas.
- **Qué es:** las imágenes vienen de generaciones distintas (Magnific, renders previos, fotos). Para que todo parezca una sola dirección de arte: (a) grano global fijo en el `body`, (b) una capa de gradado `mix-blend-mode: color` muy suave sobre cada imagen de escena que empuja los medios tonos al navy (el blanco de Kain se queda blanco porque el modo `color` conserva la luminancia), (c) una sola fuente de luz por escena, siempre cian/azul y siempre desde atrás o desde abajo.

```css
body::after { content: ""; position: fixed; inset: -50%; z-index: 100; pointer-events: none; opacity: .06; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.scene__media::after { content: ""; position: absolute; inset: 0; pointer-events: none; mix-blend-mode: color; opacity: .28;
  background: linear-gradient(160deg, var(--navy), #02040E 70%); }
```

- **Regla:** el gradado en CSS es la red de seguridad. La corrección de color principal se pide en la generación (sección 6) para no depender de capas.

---

## 5. Qué NO copiar

1. **La sección gris clara del bento de Reven (ref. 2).** Rompe el lienzo oscuro y crea exactamente el "dos secciones separadas" que el cliente rechaza. Todo el sitio vive en #03040B.
2. **La foto rectangular del retrato (ref. 5c).** Foto en caja = lo que se rechazó. Toda persona va a sangre o con máscara radial (D1, D5).
3. **Tablas de precios con tres planes (ref. 3).** Ingeniak solo comunica "desde USD 997 al mes".
4. **Prueba social inventada ("70M+ Review", avatares genéricos, ref. 2).** Solo cifras confirmadas del brief. Nada de reseñas, estrellas ni logos de clientes que no tengamos autorizados.
5. **Violeta y lavanda como color dominante (refs. 1, 9, 10).** Se traduce a índigo #455DFF solo como paso intermedio de un degradado hacia cian. El violeta puro no está en la marca.
6. **Botón primario blanco (refs. 1, 3, 8).** Se ve premium, pero en Ingeniak las acciones son azul #0055FF. El blanco solo para un botón terciario puntual.
7. **Marcos de diapositiva con bordes redondeados y fondo de presentación (refs. 5, 7).** Son artefactos de Behance; en la web la escena va a sangre.
8. **El globo floral y la estética "agencia experimental" de VOID (ref. 10).** Se toma la técnica (capas, etiquetas con parallax), no el objeto ni el tono.
9. **Lorem ipsum y cifras de relleno (ref. 11), "En desarrollo" (ref. 1), insignia "Made in Framer" (ref. 8).**
10. **Palabras fantasma como contenido.** La palabra gigante es decoración (`aria-hidden`); el mensaje real está siempre en HTML legible, en el H1/H2.
11. **Texto encima de zonas brillantes de la imagen sin velo.** Si el haz o el contraluz quedan bajo el texto, se mueve el punto focal o se refuerza el velo. Texto apagado (#9EB0C7) solo donde el velo esté a ≥ 0.75.
12. **Cristal sobre negro plano y cristal por todos lados.** Si no hay nada detrás que se vea difuso, es una tarjeta sólida (#070B18) con borde, no cristal.
13. **Más de una fuente de luz o luz cálida en la misma escena** (la bodega de Kain, el humo naranja de `Kain_04_Paginas_Web`). El ámbar es solo para dolores.
14. **Los insumos con viñeta blanca horneada** (`kain-mobile-hero.png`, `sistemas_ingeniak/hero-*.png`) y **el mapa con pines falsos** (`mapa-global.webp`).
15. **Mezclar variantes de Kain** (blanco/cian y grafito/azul). Una sola: blanco con luces cian, siempre de cuerpo completo.
16. **Copiar retículas completas de una plantilla.** Se toman patrones (hub, bento, pasos), no la maqueta de AlpinaGPT o Boltshift tal cual.

---

## 6. Brief de composición para las imágenes generadas (Magnific / Nano Banana Pro)

Para que D1 funcione, la imagen tiene que **nacer** con la composición correcta; el CSS solo la remata.

### 6.1 Lienzos y zonas seguras

| Uso | Tamaño de entrega | Sujeto | Zona de texto (vacía, oscura, sin detalle) |
|---|---|---|---|
| Desktop hero / escena | 16:9 · 3200×1800 (mín. 2560×1440). Generar a 21:9 si se puede y recortar, para tener aire en monitores ultra anchos | Centro del sujeto entre 66 % y 74 % de ancho (o 26–34 % si va a la izquierda). Cabeza entre 18 % y 32 % de alto. Kain de cuerpo completo con los pies a ~80 % de alto y reflejo de piso debajo | 0–52 % de ancho, todo el alto. Navy muy oscuro con niebla suave; nada de objetos, paneles ni luces fuertes |
| Tablet vertical / móvil | 4:5 · 1242×1552, o 9:16 · 1080×1920 | Centrado, ocupando el 10–60 % superior del alto | 62–100 % de alto: degradado a #03040B |
| Recorte (capa delantera, D3) | Mismas dimensiones en píxeles que la plate correspondiente | Mismo sujeto, fondo transparente | — |
| Clean plate (opcional, para parallax real) | Mismas dimensiones | Sin sujeto | — |

```
DESKTOP 16:9 (sujeto a la derecha)
┌──────────────────────────────────────────────┐
│ meta                                   meta  │
│                                              │
│  ZONA DE TEXTO          │      ╭─╮  ← luz    │
│  (0–52 %)               │      │K│    detrás │
│  navy → #03040B         │      ╰┬╯           │
│  sin objetos            │      /│\  sujeto   │
│                         │      / \  66–74 %  │
│ meta                    │   ~~reflejo~~ meta │
└──────── los 4 bordes caen a #03040B ─────────┘
```

### 6.2 Reglas de luz y color para todas las escenas

- Fondo general **#03040B a #0A1F4C**; los bordes del cuadro caen a #03040B (así la máscara CSS no corta nada visible).
- **Una sola fuente de luz**: contraluz cian #00E5FF / azul #0055FF desde atrás o desde abajo del sujeto (rim light). El lado de sombra del sujeto se funde con el fondo.
- Niebla volumétrica baja y partículas finas solo del lado del sujeto.
- Sin texto, letras, logos, números, interfaces con letras ni paneles holográficos con texto (la guía del personaje ya lo pide).
- Kain: siempre de cuerpo completo, pies visibles, diseño exacto de las referencias `kain-body-*.jpg`. Gesto **hacia el lado del texto** (presentar con la mano abierta, señalar, mirar hacia el texto) para que la mirada del usuario cruce al titular.

### 6.3 Esqueleto de prompt (inglés, para Nano Banana Pro con referencias de Kain)

```
The white robot character from the reference images (exact same design: round glossy white helmet head,
two thin silver antennas, chrome ear pieces, dark glossy visor with glowing cyan oval eyes, small cyan mouth line,
square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints),
full body, feet visible, standing on the RIGHT THIRD of a wide 16:9 frame, [ACCIÓN: presenting with an open hand
toward the empty left side of the frame], in [LUGAR: a dark navy studio with a subtle reflective floor].
Lighting: a single cyan (#00E5FF) and electric blue (#0055FF) rim light from behind and below the robot,
soft volumetric haze around the robot only. The LEFT 55% of the frame is empty, very dark navy (#0A1F4C)
fading to near-black (#03040B), no objects, no light sources, no particles. All four edges of the frame fade
to near-black #03040B. Premium cinematic 3D render, shallow depth of field, high dynamic range.
No text, no letters, no numbers, no logos, no UI panels.
```

Variante para persona (sectores): sustituir el bloque del robot por la persona y añadir: `blue monochrome duotone grading, the shadow side of the person dissolves into the dark background, no hard edges`. No usar caras de personas reales ni presentarlas como clientes.

### 6.4 Mapa de escenas sugerido (ajustar a la arquitectura final de páginas)

| Página | Sujeto y acción | Lado del sujeto | Insumo base |
|---|---|---|---|
| Inicio | Kain presentando con la mano abierta bajo un haz de luz | Derecha | `kain-01-hero.png` (escalar + recorte + versión 4:5) |
| Agentes de IA / kain | Kain con un teléfono que proyecta burbujas de chat sin texto | Derecha | Nueva |
| CRM Kommo | Kain frente a un tablero de embudo holográfico sin letras | Izquierda | Nueva (el `hero-kommo.png` actual tiene viñeta blanca) |
| GoHighLevel | Kain conectando cables de luz entre nodos | Derecha | Nueva |
| Automatización n8n/Make | Kain frente a engranes de luz (idea de `kain-maquina-completa`) | Izquierda | Regenerar en 16:9 |
| Paid media | Kain con un "dial" holográfico y curvas ascendentes sin números | Derecha | Nueva |
| Sitios web | Kain armando wireframes holográficos (idea de `Kain_04`) | Derecha | Regenerar sin texto ni humo naranja |
| Software a medida / SEO-IA / Branding | Isotipo de cristal + atmósfera (D10), o Kain con objeto del servicio | Según página | `c.png` ampliado |
| Metodología VKTOR | Kain subiendo 5 escalones de cristal | Izquierda | `kain-03-cuatro-a.png` (ajustar a 5 escalones) |
| Sectores (Salud, Belleza, Nutrición, Finanzas, Inmobiliario, Industrial) | Kain con el vestuario o el objeto del sector (bata en Salud) en un espacio del sector en navy | Alternar izquierda/derecha | `kain-doctor-recorte.png` para Salud |
| Nosotros | Equipo real en duotono (D5) o siluetas frente al muro de pantallas | Derecha | `team-hero` extendido a 21:9 |
| Discovery | Kain junto a un monitor con una videollamada vacía (sin caras) | Derecha | Nueva |
| Cierre de todas las páginas | Haz volumétrico + Kain o isotipo | Centro (es la única escena centrada) | `kain-01-hero` / `c.png` |

---

## 7. Lista de verificación de una escena integrada

Antes de dar por buena cualquier sección texto + imagen:

- [ ] A 375, 768, 1024, 1440 y 1920 px de ancho **no se ve ningún borde recto** de la imagen. Ni arriba, ni abajo, ni a los lados.
- [ ] En la frontera con la sección siguiente no hay línea: el color de los últimos píxeles de la escena es #03040B (verificar con el cuentagotas del DevTools).
- [ ] El texto nunca toca al sujeto. En móvil, el sujeto queda arriba y el texto encima del fundido inferior.
- [ ] Contraste: titular ≥ 4.5:1 y texto apagado ≥ 4.5:1 medidos sobre el punto **más claro** que queda bajo el texto.
- [ ] Kain de cuerpo completo, pies visibles, diseño exacto. Sin letras ni logos inventados en la imagen.
- [ ] La imagen de la escena es un `<img>` en `<picture>` con `alt`, `width`/`height`, `fetchpriority="high"` solo en el primer hero de la página, AVIF + WebP, y `sizes="100vw"`.
- [ ] El primer hero se precarga con `<link rel="preload" as="image" imagesrcset="…" imagesizes="100vw" fetchpriority="high">`. Peso objetivo ≤ 220 KB en AVIF a 2560 px.
- [ ] Máximo ~6 `backdrop-filter` visibles a la vez, ninguno con ancestros que tengan máscara, filtro u opacidad animada.
- [ ] `prefers-reduced-motion: reduce`: sin parallax, sin SplitText, sin pulsos; solo fundidos de opacidad de 300 ms.
- [ ] La palabra fantasma, el grano, los brillos y el recorte son `aria-hidden`; el H1 y los CTA son texto real en el HTML inicial (Astro SSG).
- [ ] CTA primario visible sin scroll: "Agenda tu Discovery Session" (azul #0055FF) y secundario "Escríbele a Kain" (cristal, WhatsApp +52 33 2101 7799).
