# Investigación SEO / GEO / AEO: ingeniak.mx

Fecha: 18 de octubre de 2026. Las SERPs se consultaron con Firecrawl Search (ubicación: México). **No tengo datos de volumen de búsqueda.** En todas las keywords va "sin dato de volumen" y la prioridad se decidió por intención y por qué tan bien encajan con la oferta de Ingeniak. Antes de cerrar la arquitectura, valida los volúmenes en Google Keyword Planner, Ahrefs o Semrush.

---

## 0. Hallazgos críticos del sitio actual (revisado el 18/10/2026)

1. **El sitio actual es una SPA que se renderiza en el navegador.** El HTML de `https://ingeniak.mx/` trae `<div id="root"></div>` y ~12 palabras de texto; todo el contenido lo carga JavaScript. Según Vercel, ninguno de los principales crawlers de IA renderiza JavaScript, y eso incluye GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot y PerplexityBot. Gemini, en cambio, usa la infraestructura de Googlebot, que sí renderiza JS ([Vercel, The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler)). **Consecuencia: hoy ChatGPT, Claude y Perplexity no ven casi nada del sitio.** El rediseño tiene que salir con **SSR o SSG** (Next.js, Astro, etc.) y todo el texto en el HTML inicial.
2. **Los datos de la entidad no coinciden entre fuentes.** El `llms.txt` actual dice:
   - "con base en **Querétaro**", cuando el brief dice Tlajomulco de Zúñiga, Jalisco.
   - VKTOR = "**Visión, Knowledge, Trazado, Operación, Resultado**", cuando el brief dice Verify · Koncept · Transform · Operate · Rise.
   - Precios distintos: "IGNITE desde USD 4,500", "SCALE desde USD 12,000", "DOMINATE desde USD 30,000", contra USD 997/mes + USD 3,000 de setup, etc.

   Para GEO, que los datos coincidan en todas partes importa mucho: un LLM que encuentra dos versiones puede citar la equivocada. **Hay que corregir `llms.txt`, el schema, el sitio y los perfiles externos al mismo tiempo.**
3. El schema actual tiene el teléfono `+523321017799`. Confírmalo y úsalo en vez del placeholder `[TELÉFONO POR CONFIRMAR]`.
4. El `robots.txt` actual usa tokens viejos de Anthropic (`Claude-Web`, `anthropic-ai`). Los vigentes son `ClaudeBot`, `Claude-User` y `Claude-SearchBot` (ver §3).
5. Ya hay URLs indexables que conviene **conservar o redirigir con 301**: `/servicios/consultoria-ia-empresas`, `/servicios/agentes-ia`, `/servicios/crm-inteligente`, `/servicios/paginas-web`, `/servicios/paid-media`, `/servicios/seo`, `/servicios/desarrollo-software`, `/metodologia`, `/nosotros`, `/blog`, `/contacto`, `/cotiza` y `/licenciaskommo`.

---

## 1. Clusters de keywords (México / LATAM, español)

Prioridad: **A** = página propia ya, **B** = segunda ola, **C** = contenido de blog o apoyo. Todas: *sin dato de volumen*.

| Cluster | Keywords (variantes) | Intención | Prio | Página destino |
|---|---|---|---|---|
| Consultoría IA | consultoría en inteligencia artificial para empresas; consultoría de IA México; consultor de IA para empresas; asesoría en inteligencia artificial | Comercial | A | `/consultoria-ia` + home |
| Agencia IA (marca/local) | agencia de IA México; agencia de inteligencia artificial Guadalajara; agentes de IA Guadalajara; agencia IA Jalisco; IA para empresas Zapopan/Tlajomulco | Comercial/local | A | `/agentes-ia-guadalajara` |
| Agentes WhatsApp | agentes de IA para WhatsApp; agente de IA WhatsApp Business; chatbot WhatsApp con IA para negocios; bot de WhatsApp con IA para ventas; atención automática WhatsApp | Comercial/transaccional | A | `/servicios/agentes-ia-whatsapp` |
| Precio agentes / IA | cuánto cuesta un agente de IA para WhatsApp; precio chatbot WhatsApp México; cuánto cuesta una consultoría de IA | Comercial (investigación de precio) | A | `/precios` + artículo de blog |
| Kommo | partner Kommo México; implementación Kommo; Kommo CRM México; licencias Kommo; Kommo en español; Kommo + WhatsApp | Transaccional | A | `/kommo` |
| GoHighLevel | GoHighLevel México; GoHighLevel en español; implementación GoHighLevel; agencia GoHighLevel; qué es GoHighLevel | Comercial / informativa | A/B | `/gohighlevel` + guía de blog |
| CRM con IA | CRM con IA; CRM con inteligencia artificial; CRM para WhatsApp; Kommo vs GoHighLevel; mejor CRM para WhatsApp México | Comercial | B | `/servicios/crm-con-ia` + comparativa de blog |
| n8n / automatización | automatización con n8n; agencia n8n México; expertos n8n; n8n vs Zapier vs Make; automatización de procesos con IA | Comercial / informativa | B | `/servicios/automatizacion-n8n` |
| Verticales | agente de IA para clínicas dentales; IA para clínicas / salud; IA para restaurantes (HoReCa); IA para e-commerce; IA para inmobiliarias | Comercial (long tail) | B | `/casos/*` + landings por vertical |
| Informativo / definiciones | qué es un agente de IA; agente de IA vs chatbot; qué es n8n; qué es Kommo; cómo implementar IA en una pyme | Informativa | C | blog + bloques "¿Qué es…?" |
| Marca | Ingeniak; Ingeniak opiniones; VKTOR; kain IA | Navegacional | A | home, `/metodologia-vktor`, `/kain` |

### Qué rankea hoy (top resultados por consulta)

| Consulta | Quién rankea (orden aprox.) | Tipo de página y qué contiene | Lectura |
|---|---|---|---|
| consultoría en inteligencia artificial para empresas México | EY México, consultoresia.com, img-consultores.com.mx, celestialdynamics.io (listicle "Top empresas de IA en México 2026"), aloia.ai/consultoria-ia, magokoro.mx, IBM México, rfconsultoriaintegral.com.mx | Big 4 y grandes tecnológicas + páginas de servicio de pymes con proceso en pasos, FAQ y enlaces a guías ("¿Cuánto cuesta una consultoría de IA?") | Ganable con una página de servicio sólida y un cluster de guías. Además, entrar en listicles de terceros ayuda a GEO. |
| agencia de inteligencia artificial México | gob.mx, ANIA, celestialdynamics (listicle), xira.ai (listicle), mexia.gob.mx, brita.mx, Endeavor, editinnovation.com | Intención mezclada: institucional, rankings y algunas agencias | La keyword nacional genérica es difícil. Mejor ir por la versión local (Guadalajara/Jalisco) y por menciones en listicles. |
| agentes de IA para WhatsApp empresas | faq.whatsapp.com (Meta Business Agent), Jotform, visitoai.com (top 8 con tabla de precios), eGrow, respond.io (top 10), YouTube, Wassenger, chatbotwhatsapp.com | SaaS y comparativas con tablas de precios y "ideal para" | Meta ya tiene su propio agente: explica en tu página por qué un agente a la medida conectado al CRM es distinto. Las tablas comparativas funcionan. |
| chatbot WhatsApp con IA para negocios | **kommo.com/es/blog (guía, #1)**, chatbotwhatsapp.com, whatsappbusiness.com, Crisp, Zendesk MX, Jotform, whato.app | Guías largas con "¿Qué es…?" y FAQ | El blog de Kommo domina. Como partner, puedes enlazarla y escribir el ángulo "implementación en México". |
| partner Kommo México | kommo.com (programa de partners y directorio), **patatua.com/kommo** (Guadalajara), **planivagroup.com** ("Partner oficial Kommo LATAM: cómo verificar"), jesusgarcia.agency | Páginas de servicio de partners con FAQ y artículos tipo "cómo elegir partner" | **Keyword clave para Ingeniak.** Patatua (también de GDL) tiene ProfessionalService + FAQPage + llms.txt. |
| GoHighLevel en español México | gohighlevel.com/es (con ref de afiliado), YouTube, grupo de Facebook, kersagency.es ("qué es, cuánto cuesta"), togrowagencia.com, appcritic.es | Tutoriales, reseñas y grupos; casi no hay agencias mexicanas con página de servicio | **Hueco:** una página de implementación de GHL en español + una guía. |
| implementación GoHighLevel agencia México | togrowagencia.com, Instagram, hint.mx, efectonewton.com, grupos de Facebook, milybarahona.com | SERP débil, con contenido de blog | Igual que la anterior: fácil de atacar. |
| automatización con n8n agencia México | newemage.com.mx, **duotach.com** (LATAM), fastship.dev, Indeed, YouTube, adivor.com.mx, Glassdoor, datapath.ai | Servicio con el ángulo "alternativa a Zapier", plazos ("2–4 semanas") y precio | Competencia media. Diferénciate con casos (27 procesos automatizados). |
| agentes de IA Guadalajara Jalisco | grupotimexico.com, adivor.com.mx, agentesinteligentes.mx, agentes.ai (directorio), **nextwave.mx**, **ghspecialist.com** (landing por ciudad, "desde $12,000 MXN"), Indeed, **matterasystems.com** | Landings locales con FAQ y schema local | Competidores directos en Jalisco. Necesitas landing local + Google Business Profile. |
| CRM con IA ventas WhatsApp México | iventas.com, yupio.mx, sync-manager.com, Leadsales (YouTube y blog), cedigital.mx, aurorainbox.com (listicle), Bitrix24 | SaaS mexicanos y listicles "mejores CRM" | Posiciona Kommo + servicio, no como SaaS. |
| cuánto cuesta un agente de IA para WhatsApp México | **kosmo.com.mx** (guía de 6,700 palabras con precios en MXN, FAQ y schema), Zendesk, aurorainbox, wizard-ai.mx, be-genius.com, bdcai.com, uniamos.com | **Guías de precios con cifras concretas** | Ingeniak publica precios: es una ventaja para AEO. Haz una página o artículo de precios con tabla. |
| qué es un agente de IA | Google Cloud, IBM, AWS, Salesforce, Databricks, SAP, Snowflake | Glosarios de grandes marcas | No pelees el head term. Usa long tail ("…para WhatsApp", "…para ventas"). |

---

## 2. Competidores (snapshot)

Auditoría propia, hecha con un script que lee title, H1, tipos de JSON-LD, número de preguntas en FAQPage, `/llms.txt` y bots de IA en `robots.txt`.

| Sitio | Posicionamiento | Qué hace bien (SEO/AEO) | Huecos |
|---|---|---|---|
| **aloia.ai/consultoria-ia** | Consultoría de IA para empresas en México, "diagnóstico gratis" | FAQPage (9 preguntas), Organization + Service + Person + Breadcrumb, cluster de guías enlazadas (qué es, cómo elegir, cuánto cuesta, pymes), llms.txt, CTA por WhatsApp | No menciona bots de IA en robots.txt |
| **patatua.com/kommo** (GDL) | "Partner Kommo en México: licencias e implementación" | ProfessionalService + Service + FAQPage (5), llms.txt, robots.txt con GPTBot/ClaudeBot/PerplexityBot/Google-Extended, mensaje "Desde Guadalajara, para México" | Pocas cifras de resultados |
| **planivagroup.com** | Partner oficial de Kommo en LATAM | Artículo "cómo verificar que un partner es oficial" (buen contenido de decisión), Article schema, llms.txt | Sin FAQPage |
| **ghspecialist.com** | Chatbots WhatsApp, CRM Kommo y agentes de IA, con **landings por ciudad** | LocalBusiness + GeoCoordinates + Offer + FAQPage, precio "desde $12,000 MXN" en la meta, llms.txt | Contenido corto (~500 palabras) |
| **kosmo.com.mx** | Agente de IA para WhatsApp en plan SaaS (MXN) | Guía de precios de 6,700 palabras, tabla comparativa, FAQPage, BlogPosting + Person, robots.txt con todos los bots de IA, llms.txt | No es agencia, pero roba la intención de precio |
| **duotach.com** | Expertos en n8n en LATAM | Schema muy completo (ProfessionalService, OfferCatalog, PriceSpecification, FAQPage 6), plazos y "una sola oferta", llms.txt y bots de IA permitidos | Mensaje centrado en Argentina |
| **matterasystems.com** | Agencia de IA en Guadalajara | Service + City/State + FAQPage, sección "Lo que no hacemos" (muy citable), llms.txt y bots de IA | Contenido corto |
| **nextwave.mx** | Consultoría de IA en Guadalajara | FAQPage, H2 "Por qué una consultora local", "Sectores" | Sin llms.txt ni Organization |

**Patrón que se repite en los que rankean:** H1 = keyword exacta + ciudad o país; FAQPage visible; precio o "desde" a la vista; proceso en pasos; llms.txt; robots.txt que permite bots de IA. **Ninguno muestra tantas cifras de resultados como las que ya tiene Ingeniak.** Ese es tu diferenciador para que te citen.

---

## 3. GEO / AEO: que te citen ChatGPT, Perplexity, Google AI Overviews, Gemini y Claude

### Lo que dicen las fuentes

- **Google (AI Overviews / AI Mode):** no hay requisitos adicionales ni optimizaciones especiales para aparecer en AI Overviews o AI Mode; aplican las mismas buenas prácticas de SEO. Para aparecer como enlace de apoyo, la página tiene que estar indexada y ser elegible para mostrarse con snippet. Recomienda que el contenido importante esté en texto, que haya enlaces internos y que *el structured data coincida con el texto visible*. También aclara que **no necesitas archivos "AI text" ni schema especial** para estas funciones ([Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)). → El schema y el llms.txt sirven para otros motores y para que los datos sean consistentes, **no son un requisito de Google**.
- **FAQ rich results:** desde agosto de 2023 Google solo los muestra en sitios gubernamentales y de salud reconocidos y con autoridad ([changelog de Search Central](https://developers.google.com/search/docs/appearance/structured-data/faqpage)). → Un FAQPage **no** te va a dar el desplegable en Google. Aun así, conviene ponerlo: le da a los motores de respuesta pares pregunta-respuesta limpios (esto es recomendación nuestra, no una afirmación de Google).
- **JavaScript:** los crawlers de OpenAI, Anthropic, Meta, ByteDance y Perplexity no renderizan JS. Vercel recomienda renderizar en el servidor todo el contenido crítico ([Vercel](https://vercel.com/blog/the-rise-of-the-ai-crawler)).
- **OpenAI:** `OAI-SearchBot` es el que muestra sitios en ChatGPT search. Si lo bloqueas, no apareces en esas respuestas. `GPTBot` es para entrenamiento ([OpenAI: Overview of OpenAI Crawlers](https://platform.openai.com/docs/bots)).
- **Anthropic:** `ClaudeBot` (entrenamiento), `Claude-User` (consultas que hace el usuario) y `Claude-SearchBot` (calidad de búsqueda). Si deshabilitas los dos últimos, *pierdes visibilidad* ([Anthropic Help Center](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)).
- **Perplexity:** `PerplexityBot` sirve para mostrar y enlazar sitios en sus resultados (no entrena modelos). `Perplexity-User` se usa en las consultas de los usuarios ([Perplexity: Bots](https://docs.perplexity.ai/guides/bots)).
- **Google-Extended:** no es un crawler aparte, es un token de control. Decide si lo que Google rastrea se usa para entrenar Gemini y para *grounding* en la app de Gemini y en Vertex AI. No afecta a Google Search ([Google: common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)). → Permítelo si quieres aparecer en respuestas de Gemini con grounding.
- **llms.txt:** es una *propuesta* de archivo markdown en la raíz con contexto y enlaces para LLMs ([llmstxt.org](https://llmstxt.org/)). No es un estándar y Google dice que no lo necesita. Cuesta poco y otros asistentes y herramientas lo leen, así que vale la pena, pero tiene que coincidir con el sitio.
- **Investigación GEO:** el paper *GEO: Generative Engine Optimization* (Aggarwal et al., arXiv 2311.09735) reporta que optimizar el contenido puede subir la visibilidad en respuestas generativas **hasta 40%**, con efectos que cambian por dominio ([arXiv](https://arxiv.org/abs/2311.09735)).

### Recomendaciones concretas en la página

1. **SSR/SSG obligatorio.** Que cada sección del one-page y cada subpágina tenga su texto completo en el HTML inicial. Prueba con `curl https://ingeniak.mx/ | grep "agentes de IA"`.
2. **Bloques "¿Qué es…?"** de 40–60 palabras al inicio de cada página de servicio, con la definición en la primera oración. Ejemplo: "Un agente de IA para WhatsApp es…". Uno para cada tema: agente de IA para WhatsApp, Kommo, GoHighLevel, n8n, VKTOR™ y kain.
3. **"Ficha técnica" de la entidad,** visible en `/nosotros` y en el footer: nombre legal y comercial, sede (Av. Punto Sur 312, Tlajomulco de Zúñiga, Jalisco 45640), servicios, partner oficial de Kommo en LATAM, +73 sistemas en producción, 7 países (lista los países con nombre), paquetes y precios, email y teléfono. Usa los mismos datos en el schema, el `llms.txt`, Google Business Profile, LinkedIn y el directorio de partners de Kommo.
4. **Cifras con contexto, fáciles de citar:** "3.2× más citas en 90 días: clínica dental, Monterrey". Cifra + plazo + industria + ciudad en una sola oración. Una tarjeta por caso en `/casos` y una página por caso.
5. **FAQ visible** (§5) en la home y en `/preguntas-frecuentes`, con FAQPage que coincida palabra por palabra. Cada subpágina lleva 4–6 preguntas propias.
6. **Schema por tipo de página:**
   - Home: `Organization` + `ProfessionalService` + `WebSite` + `FAQPage` (bloque listo en §6).
   - Servicios: `Service` (`provider` → `#organization`, `areaServed`, `serviceType`) + `BreadcrumbList` + `FAQPage`.
   - `/metodologia-vktor`: `HowTo` con 5 `HowToStep` (Verify, Koncept, Transform, Operate, Rise). Google ya no muestra rich results de HowTo, pero sirve como estructura legible para máquinas.
   - `/nosotros`: `Person` por cada integrante (`name`, `jobTitle`, `worksFor` → `#organization`, `sameAs` a su LinkedIn, `knowsAbout`).
   - `/casos/*`: `Article` con autor `Person`, más el detalle de las métricas en el texto.
   - `/precios`: `OfferCatalog` con `Offer` y `UnitPriceSpecification`, y los mismos números a la vista.
7. **sameAs:** LinkedIn de empresa, Instagram, Facebook, YouTube, TikTok, Google Business Profile y la ficha en el directorio de partners de Kommo. Sin perfiles no hay sameAs: créalos o complétalos primero.
8. **robots.txt** (reemplaza el actual):
   ```
   User-agent: *
   Allow: /

   User-agent: OAI-SearchBot
   Allow: /
   User-agent: ChatGPT-User
   Allow: /
   User-agent: GPTBot
   Allow: /
   User-agent: ClaudeBot
   Allow: /
   User-agent: Claude-User
   Allow: /
   User-agent: Claude-SearchBot
   Allow: /
   User-agent: PerplexityBot
   Allow: /
   User-agent: Perplexity-User
   Allow: /
   User-agent: Google-Extended
   Allow: /

   Sitemap: https://ingeniak.mx/sitemap.xml
   ```
   (Si no quieres que se entrenen modelos con tu contenido, cambia `GPTBot` y `ClaudeBot` a `Disallow`. Los bots de búsqueda y de usuario son los que te dan citas.)
9. **llms.txt nuevo:** H1 "Ingeniak", un resumen de 2 líneas, la ficha técnica, los servicios con su URL, VKTOR™ con el nombre correcto de cada fase, precios iguales a los del sitio, casos con cifras y la FAQ. Si puedes, publica también la versión `.md` de cada página.
10. **Menciones de terceros:** los motores generativos citan listicles ("Top empresas de IA en México 2026", "mejores partners de Kommo"). Pide inclusión o haz PR para entrar en ellos, y mantén activa la ficha en el directorio de partners de Kommo.
11. **Fecha y autor visibles** en blog y casos ("Actualizado: …"), con autor real (`Person`).
12. **Google Business Profile** en Tlajomulco de Zúñiga, con la categoría "Consultor" o similar, con los mismos datos.

---

## 4. Arquitectura de información

### Home (one-page) con secciones, en orden

1. **Hero:** H1 "Consultoría de IA para empresas en México" + subtítulo con los servicios + CTA. Debajo, una línea de confianza: "Partner oficial de Kommo en LATAM · +73 sistemas en producción · 7 países".
2. **Qué es Ingeniak:** un párrafo definicional de 50 palabras que se pueda citar tal cual.
3. **Servicios** (tarjetas que enlazan a cada subpágina): Agentes de IA para WhatsApp · Kommo · GoHighLevel · Automatización n8n · CRM con IA · Paid media · Webs de alta conversión · Software a la medida · SEO.
4. **Resultados** (las 10 cifras confirmadas, cada una con industria y plazo).
5. **Metodología VKTOR™** (5 pasos en resumen, enlaza a `/metodologia-vktor`).
6. **Stack / herramientas** (logos de `materiales/logos-software/`; el badge de partner solo para Kommo).
7. **Paquetes** IGNITE / SCALE / DOMINATE con precio (enlaza a `/precios`).
8. **kain** (bloque corto que enlaza a `/kain` y a app.kain.mx).
9. **FAQ** (las 15 de §5).
10. **Contacto** + ficha técnica (dirección, email, teléfono) + mapa.

### Subpáginas recomendadas

Los títulos y metas ya están medidos: el número entre paréntesis son los caracteres.

| URL | Tipo | Keyword objetivo | Title (≤60) | Meta description (≤155) |
|---|---|---|---|---|
| `/` | Home (one-page con secciones) | consultoría en inteligencia artificial para empresas | Consultoría de IA para empresas en México \| Ingeniak (52) | Agentes de IA para WhatsApp, CRM con Kommo y GoHighLevel y automatización con n8n. Partner oficial de Kommo. Resultados medibles en 60–90 días. (143) |
| `/consultoria-ia` | Servicio pilar | consultoría de IA para empresas México | Consultoría en inteligencia artificial para empresas (52) | Detectamos dónde la IA te ahorra tiempo o te trae ventas, y la implementamos con la metodología VKTOR™. Desde Jalisco para México y LATAM. (138) |
| `/servicios/agentes-ia-whatsapp` | Servicio | agentes de IA para WhatsApp | Agentes de IA para WhatsApp Business \| Ingeniak (47) | Tu WhatsApp responde, califica y agenda 24/7 con un agente de IA conectado a tu CRM. Caso real: de 8 min a 12 s en tiempo de respuesta. (135) |
| `/kommo` | Servicio + partner | partner Kommo México / implementación Kommo | Partner oficial de Kommo en México y LATAM \| Ingeniak (53) | Licencias, implementación y automatización de Kommo con agentes de IA en WhatsApp. Somos partner oficial de Kommo en LATAM. Agenda tu diagnóstico. (146) |
| `/gohighlevel` | Servicio | GoHighLevel México / GoHighLevel en español | Implementación de GoHighLevel en español \| Ingeniak (51) | Configuramos GoHighLevel en español: CRM, embudos, calendarios y automatizaciones con IA para que tu equipo venda más sin perseguir leads. (138) |
| `/servicios/automatizacion-n8n` | Servicio | automatización con n8n | Automatización con n8n para empresas \| Ingeniak (47) | Conectamos tu CRM, WhatsApp, hojas de cálculo y sistemas con flujos en n8n. Caso real: 27 procesos automatizados en una empresa de logística. (141) |
| `/servicios/crm-con-ia` | Servicio | CRM con IA | CRM con inteligencia artificial: Kommo y GoHighLevel (52) | ¿Kommo o GoHighLevel? Te ayudamos a elegir e implementamos un CRM con IA que registra, califica y da seguimiento a cada lead por ti. (132) |
| `/servicios/paid-media` | Servicio | agencia de paid media / Meta Ads y Google Ads | Paid media con IA: Meta, Google y TikTok Ads \| Ingeniak (55) | Campañas en Meta, Google y TikTok conectadas a tu CRM para medir ventas, no clics. Caso real: ROAS de 4.8× en HoReCa. (117) |
| `/servicios/paginas-web` | Servicio | páginas web de alta conversión | Páginas web de alta conversión con IA \| Ingeniak (48) | Sitios rápidos, claros y conectados a tu CRM y WhatsApp, pensados para convertir visitas en citas y ventas. Desarrollo a la medida. (131) |
| `/servicios/software-a-medida` | Servicio | desarrollo de software a la medida con IA | Desarrollo de software a la medida con IA \| Ingeniak (52) | Cuando ninguna herramienta encaja, construimos el sistema que tu operación necesita, con IA integrada. +73 sistemas en producción. (130) |
| `/servicios/seo` | Servicio | SEO y posicionamiento en buscadores e IA | SEO y visibilidad en ChatGPT y Google \| Ingeniak (48) | SEO técnico, contenido y datos estructurados para aparecer en Google y en las respuestas de ChatGPT, Gemini, Perplexity y Claude. (129) |
| `/metodologia-vktor` | Metodología (HowTo) | metodología implementación IA | Metodología VKTOR™: cómo implementamos IA \| Ingeniak (52) | Verify, Koncept, Transform, Operate, Rise: las 5 fases con las que llevamos la IA de la idea a producción con resultados medibles. (130) |
| `/precios` | Precios / paquetes | precio consultoría IA / cuánto cuesta un agente de IA | Precios: IGNITE, SCALE y DOMINATE \| Ingeniak (44) | Paquetes desde USD 997/mes + USD 3,000 de setup. Compara IGNITE, SCALE y DOMINATE y elige según el tamaño de tu operación. (122) |
| `/casos` | Hub de casos | casos de éxito inteligencia artificial | Casos de éxito con IA y automatización \| Ingeniak (49) | Resultados reales: 3.2× más citas en 90 días, −58% en costo por lead, +340% en conversiones con Kommo + IA. Conoce cada caso. (125) |
| `/casos/clinica-dental-monterrey` | Caso | agente de IA para clínicas dentales | Clínica dental en Monterrey: 3.2× más citas con IA (50) | Cómo una clínica dental de Monterrey multiplicó por 3.2 sus citas en 90 días: el problema, lo que implementamos y los resultados. (129) |
| `/agentes-ia-guadalajara` | Landing local | agentes de IA Guadalajara / agencia de IA Jalisco | Agencia de IA en Guadalajara y Jalisco \| Ingeniak (49) | Agentes de IA para WhatsApp, CRM y automatización para empresas de Guadalajara, Zapopan y Tlajomulco. Oficina en Tlajomulco de Zúñiga. (134) |
| `/kain` | Producto (sub-marca) | plataforma de agentes de IA | kain: plataforma de agentes de IA de Ingeniak (45) | kain es la plataforma de Ingeniak para crear y operar agentes de IA. Conoce cómo funciona y accede en app.kain.mx. (114) |
| `/nosotros` | Equipo (Person schema) | Ingeniak equipo / quiénes somos | Nosotros: el equipo detrás de Ingeniak (38) | Consultoría de IA con sede en Tlajomulco de Zúñiga, Jalisco. +73 sistemas en producción en 7 países. Conoce al equipo. (118) |
| `/preguntas-frecuentes` | FAQ | preguntas sobre agentes de IA | Preguntas frecuentes sobre IA, Kommo y precios \| Ingeniak (57) | Respuestas directas sobre agentes de IA para WhatsApp, Kommo, GoHighLevel, n8n, tiempos de implementación y precios de Ingeniak. (128) |
| `/blog` | Blog hub | blog inteligencia artificial empresas | Blog de IA aplicada a ventas y operación \| Ingeniak (51) | Guías prácticas sobre agentes de IA, WhatsApp, Kommo, GoHighLevel, n8n y automatización para empresas en México y LATAM. (120) |

**Redirecciones 301 sugeridas desde las URLs actuales:**
- `/servicios/consultoria-ia-empresas` → `/consultoria-ia`
- `/servicios/agentes-ia` → `/servicios/agentes-ia-whatsapp`
- `/servicios/crm-inteligente` → `/servicios/crm-con-ia`
- `/servicios/desarrollo-software` → `/servicios/software-a-medida`
- `/metodologia` → `/metodologia-vktor`
- `/licenciaskommo` → `/kommo`

La alternativa es conservar las URLs actuales y solo cambiar títulos y contenido; es la opción con menos riesgo.

### Temas de blog (por orden de prioridad)

1. ¿Cuánto cuesta un agente de IA para WhatsApp en México? (con la tabla de paquetes de Ingeniak). *Comercial.*
2. Kommo vs GoHighLevel: ¿cuál conviene a tu empresa? *Comercial.*
3. Cómo verificar que una agencia es partner oficial de Kommo. *Comercial.* Planiva rankea con este ángulo.
4. Qué es un agente de IA para WhatsApp y en qué se diferencia de un chatbot. *Informativa.*
5. GoHighLevel en español: qué es, para quién es y cómo se implementa en México. *Informativa/comercial.*
6. n8n vs Zapier vs Make: cuál elegir para automatizar tu empresa. *Comercial.*
7. Meta Business Agent vs un agente de IA a la medida en WhatsApp. *Comercial.* Meta ya rankea con su FAQ.
8. Cómo una clínica pasó de 12 a 47 citas al mes con IA (caso de salud). *Caso.*
9. IA para restaurantes y hoteles (HoReCa): campañas con ROAS 4.8×. *Caso.*
10. Cómo implementar IA en una pyme en 90 días con VKTOR™. *Informativa.*

---

## 5. FAQ para AEO (tuteo, solo datos del brief)

Pon estas preguntas visibles en la home o en `/preguntas-frecuentes`, idénticas a las del FAQPage de §6. **Valida con el cliente** la traducción de cada fase de VKTOR™ (pregunta 7). Usé el verbo de cada fase sin inventar entregables.

**1. ¿Qué es Ingeniak?**
Ingeniak es una consultoría mexicana de inteligencia artificial con sede en Tlajomulco de Zúñiga, Jalisco. Implementamos agentes de IA para WhatsApp, CRM con Kommo y GoHighLevel, automatizaciones con n8n, paid media, sitios web de alta conversión, software a la medida y SEO. Tenemos más de 73 sistemas en producción en 7 países.

**2. ¿Qué es un agente de IA para WhatsApp?**
Es un asistente basado en modelos de lenguaje que atiende las conversaciones de tu WhatsApp Business: entiende lo que escribe el cliente, responde con la información de tu negocio, califica al prospecto y puede registrarlo en tu CRM o agendarle una cita. A diferencia de un chatbot de menús, no obliga al cliente a elegir entre opciones fijas.

**3. ¿En qué se diferencia un agente de IA de un chatbot tradicional?**
Un chatbot tradicional sigue un árbol de opciones y se atora cuando la pregunta se sale del guion. Un agente de IA interpreta lenguaje natural, consulta información como tu catálogo, tu agenda o tu CRM, y ejecuta acciones como crear un lead o agendar una cita. Por eso puede atender conversaciones reales de venta y servicio.

**4. ¿Ingeniak es partner oficial de Kommo?**
Sí. Ingeniak es partner oficial y distribuidor de Kommo en Latinoamérica. Te ayudamos con las licencias, la implementación del CRM, la conexión de WhatsApp y la automatización del seguimiento con agentes de IA.

**5. ¿Me conviene Kommo o GoHighLevel?**
Depende de cómo vendes. Kommo está pensado para vender por mensajería (WhatsApp, Instagram, TikTok) con embudos y automatizaciones dentro del chat. GoHighLevel es una plataforma todo en uno que junta CRM, embudos, páginas, calendarios y campañas. Trabajamos con los dos y te recomendamos uno según tu proceso comercial.

**6. ¿Qué puedo automatizar con n8n?**
n8n es una herramienta para conectar aplicaciones y crear flujos automáticos, incluidos flujos con agentes de IA. Con n8n conectamos tu CRM, WhatsApp, formularios, hojas de cálculo y sistemas internos para que la información se mueva sola y tu equipo deje de capturar datos a mano. En un caso de logística automatizamos 27 procesos.

**7. ¿Qué es la metodología VKTOR™?**
VKTOR™ es el método de Ingeniak para implementar IA en cinco fases: Verify (verificar), Koncept (conceptualizar), Transform (transformar), Operate (operar) y Rise (crecer). Ordena cada proyecto desde el diagnóstico hasta la operación en producción y el escalamiento, con métricas definidas desde el inicio.

**8. ¿Cuánto cuesta trabajar con Ingeniak?**
Tenemos tres paquetes en dólares: IGNITE, USD 997 al mes más USD 3,000 de setup; SCALE, USD 2,497 al mes más USD 8,000 de setup; y DOMINATE, USD 4,997 al mes más USD 25,000 de setup. El paquete adecuado depende del tamaño de tu operación y de cuántos procesos quieras automatizar.

**9. ¿En cuánto tiempo veo resultados?**
Nuestros proyectos están planteados para dar resultados medibles en 60 a 90 días. Por ejemplo, una clínica dental en Monterrey logró 3.2 veces más citas en 90 días, y un e-commerce en la Ciudad de México redujo 58% su costo por lead en 60 días.

**10. ¿Qué resultados han logrado sus clientes?**
Algunos resultados confirmados: 3.2× más citas en 90 días (clínica dental, Monterrey); tiempo de respuesta de 8 minutos a 12 segundos; −58% en costo por lead en 60 días (e-commerce, CDMX); +340% en conversiones con Kommo + IA (retail); ROAS de 4.8× (HoReCa); 27 procesos automatizados (logística); de 12 a 47 citas al mes (salud), y −60% de tiempo operativo.

**11. ¿Qué modelos de IA usan?**
Trabajamos con modelos de OpenAI, Anthropic (Claude) y Google (Gemini), y elegimos el que mejor resuelve cada proceso. Los integramos con herramientas como Kommo, GoHighLevel, n8n, Make, Zapier, Supabase y Stripe.

**12. ¿Solo trabajan con empresas de Guadalajara y Jalisco?**
No. Nuestra oficina está en Tlajomulco de Zúñiga, en la zona metropolitana de Guadalajara, pero trabajamos con empresas de 7 países. Tenemos casos en Monterrey y en la Ciudad de México, entre otros.

**13. ¿Qué es kain?**
kain es la sub-marca de Ingeniak dedicada a agentes de IA. Su plataforma está en app.kain.mx.

**14. ¿Además de IA, hacen publicidad y sitios web?**
Sí. Gestionamos paid media en Meta Ads, Google Ads y TikTok Ads, y hacemos sitios web de alta conversión, software a la medida y SEO. La idea es que la publicidad, el sitio, el CRM y los agentes de IA funcionen como un solo sistema. En un cliente de HoReCa logramos un ROAS de 4.8×.

**15. ¿Cómo empiezo a trabajar con Ingeniak?**
Escríbenos a contacto@ingeniak.mx. En la primera conversación revisamos tu proceso comercial y operativo, y te decimos qué servicios y qué paquete tienen sentido para tu empresa.

---

## 6. JSON-LD listo para pegar (`@graph`)

También está guardado en `materiales/seo/schema.json`. Antes de publicar:

- Cambia `[TELÉFONO POR CONFIRMAR]`. El sitio actual usa +523321017799; confírmalo.
- Cambia los `sameAs` `[POR-CONFIRMAR]` por los perfiles reales y borra los que no existan.
- Ajusta las URLs de `logo` y `image` a archivos reales.
- Si conoces la latitud y longitud de la oficina, agrega `geo` (`GeoCoordinates`).
- Las cifras y precios del schema tienen que aparecer igual en el texto visible.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://ingeniak.mx/#organization",
      "name": "Ingeniak",
      "alternateName": "INGENIAK",
      "url": "https://ingeniak.mx/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ingeniak.mx/logo.png"
      },
      "description": "Consultoría mexicana de inteligencia artificial. Agentes de IA para WhatsApp, CRM con Kommo y GoHighLevel, automatización con n8n, paid media, sitios web de alta conversión, software a la medida y SEO. Partner oficial y distribuidor de Kommo en Latinoamérica.",
      "email": "contacto@ingeniak.mx",
      "telephone": "[TELÉFONO POR CONFIRMAR]",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Av. Punto Sur 312",
        "addressLocality": "Tlajomulco de Zúñiga",
        "addressRegion": "Jalisco",
        "postalCode": "45640",
        "addressCountry": "MX"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "México"
        },
        {
          "@type": "Place",
          "name": "Latinoamérica"
        }
      ],
      "knowsAbout": [
        "Inteligencia artificial",
        "Agentes de IA",
        "WhatsApp Business",
        "Kommo",
        "GoHighLevel",
        "n8n",
        "Automatización de procesos",
        "CRM",
        "Paid media",
        "SEO"
      ],
      "brand": {
        "@type": "Brand",
        "name": "kain",
        "url": "https://app.kain.mx/",
        "description": "Sub-marca de Ingeniak dedicada a agentes de IA."
      },
      "sameAs": [
        "https://www.linkedin.com/company/[POR-CONFIRMAR]",
        "https://www.instagram.com/[POR-CONFIRMAR]",
        "https://www.facebook.com/[POR-CONFIRMAR]",
        "https://www.youtube.com/@[POR-CONFIRMAR]"
      ]
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://ingeniak.mx/#localbusiness",
      "name": "Ingeniak",
      "url": "https://ingeniak.mx/",
      "image": "https://ingeniak.mx/og-image.jpg",
      "logo": "https://ingeniak.mx/logo.png",
      "description": "Consultoría de inteligencia artificial para empresas en Tlajomulco de Zúñiga, Jalisco: agentes de IA para WhatsApp, implementación de Kommo y GoHighLevel, automatización con n8n y paid media.",
      "parentOrganization": {
        "@id": "https://ingeniak.mx/#organization"
      },
      "email": "contacto@ingeniak.mx",
      "telephone": "[TELÉFONO POR CONFIRMAR]",
      "priceRange": "USD 997–4,997 al mes",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Av. Punto Sur 312",
        "addressLocality": "Tlajomulco de Zúñiga",
        "addressRegion": "Jalisco",
        "postalCode": "45640",
        "addressCountry": "MX"
      },
      "areaServed": [
        {
          "@type": "AdministrativeArea",
          "name": "Jalisco"
        },
        {
          "@type": "Country",
          "name": "México"
        },
        {
          "@type": "Place",
          "name": "Latinoamérica"
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Paquetes Ingeniak",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Paquete IGNITE",
            "description": "Paquete de entrada.",
            "priceCurrency": "USD",
            "priceSpecification": [
              {
                "@type": "UnitPriceSpecification",
                "name": "Mensualidad",
                "price": 997,
                "priceCurrency": "USD",
                "unitCode": "MON",
                "unitText": "mes"
              },
              {
                "@type": "PriceSpecification",
                "name": "Setup (pago único)",
                "price": 3000,
                "priceCurrency": "USD"
              }
            ],
            "seller": {
              "@id": "https://ingeniak.mx/#organization"
            }
          },
          {
            "@type": "Offer",
            "name": "Paquete SCALE",
            "description": "Paquete intermedio.",
            "priceCurrency": "USD",
            "priceSpecification": [
              {
                "@type": "UnitPriceSpecification",
                "name": "Mensualidad",
                "price": 2497,
                "priceCurrency": "USD",
                "unitCode": "MON",
                "unitText": "mes"
              },
              {
                "@type": "PriceSpecification",
                "name": "Setup (pago único)",
                "price": 8000,
                "priceCurrency": "USD"
              }
            ],
            "seller": {
              "@id": "https://ingeniak.mx/#organization"
            }
          },
          {
            "@type": "Offer",
            "name": "Paquete DOMINATE",
            "description": "Paquete más completo.",
            "priceCurrency": "USD",
            "priceSpecification": [
              {
                "@type": "UnitPriceSpecification",
                "name": "Mensualidad",
                "price": 4997,
                "priceCurrency": "USD",
                "unitCode": "MON",
                "unitText": "mes"
              },
              {
                "@type": "PriceSpecification",
                "name": "Setup (pago único)",
                "price": 25000,
                "priceCurrency": "USD"
              }
            ],
            "seller": {
              "@id": "https://ingeniak.mx/#organization"
            }
          }
        ]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://ingeniak.mx/#website",
      "url": "https://ingeniak.mx/",
      "name": "Ingeniak",
      "inLanguage": "es-MX",
      "publisher": {
        "@id": "https://ingeniak.mx/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://ingeniak.mx/#faq",
      "inLanguage": "es-MX",
      "isPartOf": {
        "@id": "https://ingeniak.mx/#website"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Qué es Ingeniak?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ingeniak es una consultoría mexicana de inteligencia artificial con sede en Tlajomulco de Zúñiga, Jalisco. Implementamos agentes de IA para WhatsApp, CRM con Kommo y GoHighLevel, automatizaciones con n8n, paid media, sitios web de alta conversión, software a la medida y SEO. Tenemos más de 73 sistemas en producción en 7 países."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué es un agente de IA para WhatsApp?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Es un asistente basado en modelos de lenguaje que atiende las conversaciones de tu WhatsApp Business: entiende lo que escribe el cliente, responde con la información de tu negocio, califica al prospecto y puede registrarlo en tu CRM o agendarle una cita. A diferencia de un chatbot de menús, no obliga al cliente a elegir entre opciones fijas."
          }
        },
        {
          "@type": "Question",
          "name": "¿En qué se diferencia un agente de IA de un chatbot tradicional?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Un chatbot tradicional sigue un árbol de opciones y se atora cuando la pregunta se sale del guion. Un agente de IA interpreta lenguaje natural, consulta información como tu catálogo, tu agenda o tu CRM, y ejecuta acciones como crear un lead o agendar una cita. Por eso puede atender conversaciones reales de venta y servicio."
          }
        },
        {
          "@type": "Question",
          "name": "¿Ingeniak es partner oficial de Kommo?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí. Ingeniak es partner oficial y distribuidor de Kommo en Latinoamérica. Te ayudamos con las licencias, la implementación del CRM, la conexión de WhatsApp y la automatización del seguimiento con agentes de IA."
          }
        },
        {
          "@type": "Question",
          "name": "¿Me conviene Kommo o GoHighLevel?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Depende de cómo vendes. Kommo está pensado para vender por mensajería (WhatsApp, Instagram, TikTok) con embudos y automatizaciones dentro del chat. GoHighLevel es una plataforma todo en uno que junta CRM, embudos, páginas, calendarios y campañas. Trabajamos con los dos y te recomendamos uno según tu proceso comercial."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué puedo automatizar con n8n?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "n8n es una herramienta para conectar aplicaciones y crear flujos automáticos, incluidos flujos con agentes de IA. Con n8n conectamos tu CRM, WhatsApp, formularios, hojas de cálculo y sistemas internos para que la información se mueva sola y tu equipo deje de capturar datos a mano. En un caso de logística automatizamos 27 procesos."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué es la metodología VKTOR™?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "VKTOR™ es el método de Ingeniak para implementar IA en cinco fases: Verify (verificar), Koncept (conceptualizar), Transform (transformar), Operate (operar) y Rise (crecer). Ordena cada proyecto desde el diagnóstico hasta la operación en producción y el escalamiento, con métricas definidas desde el inicio."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cuánto cuesta trabajar con Ingeniak?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tenemos tres paquetes en dólares: IGNITE, USD 997 al mes más USD 3,000 de setup; SCALE, USD 2,497 al mes más USD 8,000 de setup; y DOMINATE, USD 4,997 al mes más USD 25,000 de setup. El paquete adecuado depende del tamaño de tu operación y de cuántos procesos quieras automatizar."
          }
        },
        {
          "@type": "Question",
          "name": "¿En cuánto tiempo veo resultados?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nuestros proyectos están planteados para dar resultados medibles en 60 a 90 días. Por ejemplo, una clínica dental en Monterrey logró 3.2 veces más citas en 90 días, y un e-commerce en la Ciudad de México redujo 58% su costo por lead en 60 días."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué resultados han logrado sus clientes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Algunos resultados confirmados: 3.2× más citas en 90 días (clínica dental, Monterrey); tiempo de respuesta de 8 minutos a 12 segundos; −58% en costo por lead en 60 días (e-commerce, CDMX); +340% en conversiones con Kommo + IA (retail); ROAS de 4.8× (HoReCa); 27 procesos automatizados (logística); de 12 a 47 citas al mes (salud), y −60% de tiempo operativo."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué modelos de IA usan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Trabajamos con modelos de OpenAI, Anthropic (Claude) y Google (Gemini), y elegimos el que mejor resuelve cada proceso. Los integramos con herramientas como Kommo, GoHighLevel, n8n, Make, Zapier, Supabase y Stripe."
          }
        },
        {
          "@type": "Question",
          "name": "¿Solo trabajan con empresas de Guadalajara y Jalisco?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Nuestra oficina está en Tlajomulco de Zúñiga, en la zona metropolitana de Guadalajara, pero trabajamos con empresas de 7 países. Tenemos casos en Monterrey y en la Ciudad de México, entre otros."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué es kain?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "kain es la sub-marca de Ingeniak dedicada a agentes de IA. Su plataforma está en app.kain.mx."
          }
        },
        {
          "@type": "Question",
          "name": "¿Además de IA, hacen publicidad y sitios web?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sí. Gestionamos paid media en Meta Ads, Google Ads y TikTok Ads, y hacemos sitios web de alta conversión, software a la medida y SEO. La idea es que la publicidad, el sitio, el CRM y los agentes de IA funcionen como un solo sistema. En un cliente de HoReCa logramos un ROAS de 4.8×."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cómo empiezo a trabajar con Ingeniak?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Escríbenos a contacto@ingeniak.mx. En la primera conversación revisamos tu proceso comercial y operativo, y te decimos qué servicios y qué paquete tienen sentido para tu empresa."
          }
        }
      ]
    }
  ]
}
</script>
```

---

## Fuentes consultadas

- Google Search Central, *AI features and your website*: https://developers.google.com/search/docs/appearance/ai-features
- Google Search Central, *FAQPage* (changelog 2023: FAQ solo para sitios de gobierno y salud): https://developers.google.com/search/docs/appearance/structured-data/faqpage
- Google, *Common crawlers* (Google-Extended): https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- OpenAI, *Overview of OpenAI Crawlers*: https://platform.openai.com/docs/bots
- Anthropic Help Center, crawlers: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- Perplexity, *Bots*: https://docs.perplexity.ai/guides/bots
- llms.txt (propuesta): https://llmstxt.org/
- Vercel, *The rise of the AI crawler*: https://vercel.com/blog/the-rise-of-the-ai-crawler
- Aggarwal et al., *GEO: Generative Engine Optimization*, arXiv 2311.09735: https://arxiv.org/abs/2311.09735
- SERPs de Firecrawl Search (México, 18/10/2026) y auditoría propia de las páginas de la competencia.
