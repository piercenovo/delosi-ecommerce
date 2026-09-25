# ADR 0012: Imágenes de producto remotas en producción y copia local sin red

- **Estado:** Aceptado
- **Fecha:** 2026-09-25
- **Corrige:** el supuesto sobre las imágenes del [ADR 0010](0010-snapshot-de-respaldo.md)

## Contexto

El reto evalúa la "optimización de imágenes externas" y la carga diferida. Hasta ahora, las fotos se servían siempre desde una copia en `public/images/products/`, porque el ADR 0010 asumió que las imágenes de FakeStore estaban detrás del mismo desafío de Cloudflare que la API.

Lo verificamos de nuevo el 2026-09-25:

| Request                                                      | Resultado                                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Función de Vercel → API (`/api/health`)                      | **403** (`cf-mitigated: challenge`): la API sigue bloqueada                      |
| Optimizador de `next/image` en Vercel → 3 fotos de FakeStore | **200**, convertidas a AVIF, `x-vercel-cache: MISS` (descargadas en ese momento) |
| IP residencial, `GET` a la API y a una foto                  | 200                                                                              |
| IP residencial, `HEAD` a la API y a una foto                 | 403                                                                              |

La protección contra bots de Cloudflare evalúa **cada request** (origen, tipo de cliente, método), no la ruta. Hoy bloquea las funciones de Vercel, pero no al optimizador de imágenes. **El supuesto del ADR 0010 sobre las imágenes era incorrecto**; el bloqueo de la API sí se confirma.

Además, había un bug latente: el carrito solo aceptaba imágenes con ruta local. Un producto con imagen remota (cualquier producto nuevo de FakeStore que no esté en el snapshot) funcionaba en memoria, pero al recargar la validación fallaba y **se descartaba el carrito entero**.

## Decisión

1. **Una sola regla de imágenes permitidas** en `src/shared/config/product-images.ts`:
   - `REMOTE_PRODUCT_IMAGES` es el patrón que `next.config.ts` pasa a `remotePatterns`: solo `https://fakestoreapi.com/img/**`.
   - `isAllowedProductImage` valida con la misma regla lo que viene de afuera. La URL se parsea, así que `..`, credenciales o un puerto no pueden esconder otro destino.
   - El carrito la usa en su esquema de `localStorage`. Así, la configuración y la validación no se pueden desalinear.
2. **`PRODUCT_IMAGES=remote|local`** (variable validada con Zod, `local` por defecto):
   - **`remote` en producción (Vercel):** las fotos se cargan desde FakeStore y las optimiza `next/image`: redimensiona según `sizes`, convierte a AVIF/WebP y cachea.
   - **`local` en desarrollo, CI, E2E y Lighthouse:** usan la copia de `public/`, porque corren sin red contra el mock y deben ser deterministas.
   - Se lee en el build: las páginas prerenderizadas conservan el modo con el que se generaron.
   - El mapper ya resolvía "copia local si existe; si no, la URL de la API". Con `remote`, el composition root simplemente no le pasa el mapa de copias locales.
3. **`minimumCacheTTL` de 31 días:** una foto de FakeStore nunca cambia en la misma URL. Así, cada tamaño se descarga de FakeStore una vez por mes como máximo, en lugar de cada 4 horas (el valor por defecto), y un bloqueo pasajero de Cloudflare no afecta a las imágenes ya optimizadas.
4. **Lazy loading explícito:** `next/image` carga en diferido por defecto. Solo las 4 primeras tarjetas del catálogo, candidatas a LCP, usan `loading="eager"` + `fetchPriority="high"`; la imagen del detalle usa `preload`. El resto (16 tarjetas, relacionados y carrito) es `lazy`.

## Alternativas consideradas

- **Mantener siempre la copia local:** es más simple y no depende de un tercero, pero no demuestra la optimización de imágenes externas que pide el reto, y deja la configuración de `remotePatterns` sin uso.
- **Siempre remotas, también en CI:** los E2E y Lighthouse dependerían de la red y de la protección de Cloudflare, que desafía de forma heurística. Perderían el determinismo.
- **Un loader o CDN de imágenes propio:** innecesario; el optimizador de Vercel ya resuelve el formato, el tamaño y la caché.

## Consecuencias

- En producción, las imágenes demuestran el criterio del reto: en la pestaña Network se ven requests a `/_next/image?url=https://fakestoreapi.com/img/...` en AVIF, y las de fuera del viewport se piden recién al hacer scroll.
- **Riesgo:** si Cloudflare empieza a desafiar al optimizador de Vercel, las fotos que no estén en caché fallarían. La mitigación es inmediata: `PRODUCT_IMAGES=local` y redesplegar.
- El primer visitante de cada tamaño paga la descarga desde FakeStore (un `MISS`); los siguientes reciben la versión cacheada. Lighthouse en CI mide el modo `local`, así que no refleja ese primer `MISS`.
- `og:image` y el JSON-LD usan la URL de FakeStore. Los crawlers de redes sociales la reciben directamente de FakeStore; Cloudflare suele permitir a los "verified bots", pero no se puede probar desde fuera de sus redes. Si fallara, se puede servir la imagen para compartir desde el dominio propio.
- La copia local (unos 4.6 MB) se mantiene: la usan el modo offline y el desarrollo.
