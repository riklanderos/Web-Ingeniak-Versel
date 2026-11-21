# Versión en inglés · qué revisar antes de publicar

Rama `ingk/version-ingles` (2026-11-20). Versión corta en inglés de ingeniak.mx en `/en/`.

## Qué incluye

- **8 páginas** con la misma imagen y animaciones que en español:
  - portada: `/en/`;
  - servicios: `/en/services/`;
  - Discovery Session con su agenda: `/en/discovery/`;
  - página de gracias: `/en/book/thank-you/`;
  - contacto: `/en/contact/`;
  - aviso de privacidad: `/en/privacy/`;
  - dos casos: `/en/case-studies/multi-brand-retail-kommo/` y `/en/case-studies/logistics-n8n/`.
- **Menú y pie de página en inglés**, con el enlace «ES» y «Versión en español». Cada página en español tiene ahora en el pie el enlace «English version».
- **El botón «Get a quote»** abre el mismo formulario, en inglés. Kommo recibe los mismos valores que siempre, más la etiqueta `pagina-en-<id>`, que dice que vino del sitio en inglés.
- **La agenda de la Discovery** funciona en inglés:
  - muestra la hora de México y la hora local del visitante;
  - lleva a `/en/book/thank-you/`;
  - en Kommo y en el calendario, el origen dice «Sitio en inglés».
- **WhatsApp:** todos los mensajes prellenados están en inglés y dicen que la persona viene del sitio en inglés. Así el equipo sabe en qué idioma responder.
- **Google:**
  - cada página indica cuál es su gemela en el otro idioma (`hreflang`), para que Google no las trate como duplicadas;
  - las páginas en inglés están en el sitemap y en `llms.txt`, en la sección «English version».
- **Tarjetas para compartir** propias en inglés (`public/img/og/en-*.jpg`).

## Lo que solo tú puedes decidir

1. **¿La Discovery Session se puede dar en inglés?** La página no lo promete ni lo niega. Si solo se da en español, hay que decirlo.
2. **El video de la Discovery está en español.** Opciones:
   - subtítulos en inglés;
   - un aviso de que el video está en español (hoy dice «Spanish (original audio)» en el control de subtítulos);
   - quitar la sección en inglés.
3. **¿Kain y el equipo responden en inglés por WhatsApp?**
4. **Partners.** En inglés, la portada y servicios dicen «official partners of Kommo, GoHighLevel, Google and Meta», como en español. También dicen «Official Kommo partner in LATAM». Confirma que eso no limita vender o implementar Kommo a clientes de Estados Unidos.
5. **Horario de respuesta.** «Within 2 business hours (Mexico time)»: confirma que se sostiene para clientes de Estados Unidos.
6. **Aviso de privacidad en inglés:**
   - lo debe revisar el abogado;
   - hay que decidir si se agrega una cláusula que diga que, si hay diferencias, manda la versión en español.
7. **Cargos del equipo en inglés:** Director of Sales Strategy, AI & Automation Architect, Creative Director, Performance Media, Project Manager, Sales Lead.
8. **Detalles de traducción:**
   - el lema «We put AI agents to work in your business.»;
   - la firma «We build free business owners, not exhausted heroes.»;
   - «GoHighLevel in Spanish» (puede sonar raro en Estados Unidos);
   - la talla de tenis del chat de retail («size 26», que es talla mexicana).

## Lo que se queda en español (a propósito)

- **Enlaces a páginas sin traducir** (servicios individuales, industrias, metodología, blog, nosotros): llevan a la página en español.
- **La invitación de Google Calendar:** es la nota que tú lees antes de la llamada, y el visitante también la recibe. Si quieres que le llegue en inglés, es un cambio aparte.
- **El buscador (⌘K):** no aparece en inglés, porque su índice es en español.

## Cada página trae su propia lista

Cada archivo `src/content/paginas/en-*.json` trae su lista `pendientes` con cada frase adaptada.
