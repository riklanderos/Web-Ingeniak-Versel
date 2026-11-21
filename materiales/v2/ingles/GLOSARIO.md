# Versión en inglés · guía de traducción

Rama `ingk/version-ingles` (2026-11-20). Versión corta en inglés de ingeniak.mx, para clientes de Estados Unidos y Canadá.

## Páginas y direcciones

| Página en español | id en inglés | Dirección en inglés |
|---|---|---|
| `/` (home) | `en-home` | `/en/` |
| `/servicios/` (servicios) | `en-servicios` | `/en/services/` |
| `/discovery/` (discovery) | `en-discovery` | `/en/discovery/` |
| `/agendar/gracias/` (agendar-gracias) | `en-agendar-gracias` | `/en/book/thank-you/` |
| `/contacto/` (contacto) | `en-contacto` | `/en/contact/` |
| `/aviso-privacidad/` (aviso) | `en-aviso` | `/en/privacy/` |
| `/casos/retail-multimarca-kommo/` (caso-retail) | `en-caso-retail` | `/en/case-studies/multi-brand-retail-kommo/` |
| `/casos/logistica-n8n/` (caso-logistica) | `en-caso-logistica` | `/en/case-studies/logistics-n8n/` |

**Enlaces internos:**
- Si la página de destino está en esta tabla, el enlace usa su dirección en inglés. Ejemplos: `/contacto/#cotizar` → `/en/contact/#cotizar`, `/discovery/#agenda` → `/en/discovery/#agenda`.
- Si no está en la tabla, se queda la dirección en español (la página sigue existiendo en español).
- Las anclas (`#…`) no se traducen. El ancla `#cotizar` se queda así: es el id del formulario.

## Tono

- **Inglés de Estados Unidos, de negocios, directo y cálido.** Segunda persona ("you"). Frases cortas y verbos fuertes.
- **Traducción natural, no literal:** reescribe la idea como la diría un consultor estadounidense. Conserva el sentido, la promesa y el nivel de detalle.
- **Nada de inventar:** sin datos, clientes, cifras, premios, plazos ni promesas que no estén en el original.
- **Lo que es mexicano se queda como es:** la sede en Guadalajara, Jalisco, México; los casos de clientes mexicanos; Kommo como único partner. No sugieras oficinas ni clientes en Estados Unidos.
- **Fuera de jerga de agencia:** nada de "your digital partner", "innovative solutions" ni "cutting-edge".

## Términos fijos

| Español | Inglés |
|---|---|
| Cotizar proyecto (botón principal) | Get a quote |
| Cotizar (versión corta) | Quote |
| Sin compromiso · Te contactamos por WhatsApp y correo | No commitment · We'll reach out by WhatsApp and email |
| Escríbele a Kain | Message Kain |
| Agendar mi Discovery Session | Book my Discovery Session |
| Agendar (versión corta) | Book |
| Discovery Session, Power Session | Sin traducir |
| kain (agente de IA, logotipo en minúsculas) | Kain en el texto, igual que en español |
| VKTOR™ (metodología) | VKTOR™ |
| Partner oficial de Kommo | Official Kommo partner |
| agente de IA para WhatsApp | AI agent for WhatsApp / WhatsApp AI agent |
| hora del centro de México | Central Mexico time (CST, UTC−6) |
| pyme / pymes | small and midsize business(es), SMBs |
| dueño de negocio | business owner |
| Agentizamos empresas. (lema) | We put AI agents to work in your business. |

**Mensajes de WhatsApp prellenados (`waMessage`):** en inglés, y deben decir que la persona viene del sitio en inglés. Así el equipo sabe en qué idioma responder. Ejemplo: "Hi, I'm coming from the English site (Discovery Session page) and have a question before booking."

## Formato de los archivos de texto

- **Archivo:** `src/content/paginas/<id en inglés>.json`. Misma estructura y mismas llaves que el archivo en español; solo cambian los valores visibles.
- **Llaves que empiezan con `_`** (notas internas como `_componente`): pueden quedarse igual. No se imprimen.
- **Llaves `pageId` y `url`:** el id y la dirección en inglés de la tabla.
- **`pendientes`:** en español, con lo que Rik debe revisar. Cada punto empieza con `INGLÉS ·`. Incluye frases que adaptaste, cualquier duda y lo que tenga implicación legal.
- **Tokens (`{{metric:…}}`, `{{price}}`, `{{Price}}`, `{{price:…}}`, `{{offer:…}}`, `{{source}}`):** se quedan exactamente igual. El sitio los convierte en la cifra en inglés.
- **Marcadores de plantilla como `{nombre}`, `{when}`, `{email}`, `{wa}`:** se quedan igual; el código los sustituye.
- **`lit`:** cuando un título trae `lit` (la palabra que se resalta), `lit` debe ser una palabra o frase que aparezca tal cual dentro del `text` traducido.
- **Precios:** ya están en dólares (USD) y salen de tokens. No escribas montos a mano.
