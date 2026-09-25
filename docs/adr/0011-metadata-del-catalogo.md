# ADR 0011: Metadata del catálogo en streaming y crawlers con `<head>` completo

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

La metadata del catálogo depende de la URL: el título, la descripción y el canonical cambian con la categoría (ADR 0004). Con Cache Components, `generateMetadata` lee `searchParams`, así que se resuelve en el request.

Next 16 transmite esa metadata en streaming. El shell prerenderizado sale sin esperarla, y el `<title>`, la descripción y el canonical se agregan al final del `<body>` cuando están listos. Los bots que Next considera _HTML-limited_ reciben un render bloqueante con la metadata en el `<head>`: la lista por defecto incluye Bingbot, los previews de Facebook, X, LinkedIn y WhatsApp, y `Chrome-Lighthouse` (PageSpeed Insights). Googlebot ejecuta JavaScript y recibe la versión en streaming; Next documenta que la interpreta correctamente.

Lighthouse, con el user agent de un navegador normal, marcó "Document does not have a meta description" en `/products`. Verificamos que, para un usuario, las etiquetas quedan en el `<body>` incluso después de hidratar.

## Decisión

**Mantener la configuración por defecto** (streaming para usuarios y `<head>` completo para los crawlers HTML-limited) y **verificar cada vista por separado**:

- **Escenario BDD:** un buscador (Bingbot) pide `/products?category=jewelery` y el `<head>` del HTML incluye el canonical de la categoría y su descripción.
- **Lighthouse en dos pasadas:**
  - rendimiento, accesibilidad y buenas prácticas con el user agent de un navegador, que es la experiencia real;
  - SEO con `Chrome-Lighthouse` en el user agent, como lo envía PageSpeed Insights, que es la vista de un crawler.

## Alternativas consideradas

- **`htmlLimitedBots: /.*/`** (desactivar el streaming de metadata): probado y descartado. Todas las respuestas pasan a `Cache-Control: no-store` y a render bajo demanda, incluidas las 20 PDP estáticas. Se pierde el prerender, y con la API caída la PDP deja de mostrarse (lo detectó el E2E de resiliencia).
- **Categoría en la ruta** (`/products/category/jewelery`) con `generateStaticParams`: metadata estática en el `<head>` para todos y páginas de categoría prerenderizadas. Es la evolución natural si el SEO por categoría fuera prioritario, pero cambia el modelo de URL del ADR 0004 (filtros combinables en query params) y queda fuera del alcance del reto.
- **Agregar más user agents a la lista de bots:** cada user agent agregado pierde el prerender. Hoy la lista por defecto ya cubre los crawlers relevantes.

## Consecuencias

- Los usuarios mantienen el shell prerenderizado y el TTFB bajo del catálogo.
- Los crawlers HTML-limited reciben el canonical por categoría en el `<head>`. Googlebot depende de su render con JavaScript, como documenta Next.
- Si Next cambia la lista de bots o el comportamiento del streaming de metadata, el escenario BDD y la pasada de SEO de Lighthouse lo detectan.
