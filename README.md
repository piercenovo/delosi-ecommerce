# Delosi Store

Tienda e-commerce construida con **Next.js 16 (App Router)** sobre la [FakeStore API](https://fakestoreapi.com), como solución al reto técnico Frontend Senior de Delosi.

- **Demo:** https://delosi-shop.vercel.app
- **Design System (Storybook):** https://delosi-ui.vercel.app
- **Diagrama de arquitectura interactivo:** https://piercenovo.github.io/delosi-ecommerce/architecture.html
- **Estado de la fuente de datos:** [`/api/health`](https://delosi-shop.vercel.app/api/health)

## Requisitos del reto y dónde están

### Mínimos

| Requisito                                           | Implementación                                                                                                                             | Evidencia                                                                                                                                                                                      |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PLP renderizada en el servidor                      | `/products` es un Server Component; filtra, busca y ordena en el servidor sobre lecturas cacheadas                                         | [`products/page.tsx`](apps/web/src/app/products/page.tsx), [`get-catalog.ts`](apps/web/src/modules/products/application/get-catalog.ts)                                                        |
| Filtros en la URL (search params)                   | `?category=…&q=…&sort=…` validados con Zod; formulario GET nativo que funciona sin JavaScript, con debounce de 300 ms                      | [`catalog-search-params.ts`](apps/web/src/modules/products/catalog-search-params.ts), [`catalogo.feature`](apps/web/e2e/features/catalogo.feature), [ADR 0004](docs/adr/0004-estado-en-url.md) |
| Búsqueda y orden                                    | Búsqueda que ignora acentos y mayúsculas; orden por precio, rating y nombre con estrategias puras                                          | [`filter-products.ts`](apps/web/src/modules/products/domain/filter-products.ts), [`sort-strategies.ts`](apps/web/src/modules/products/domain/sort-strategies.ts)                               |
| PDP en `/products/[id]`                             | Todos los productos prerenderizados; id inválido o inexistente → **404 real**                                                              | [`products/[id]/page.tsx`](apps/web/src/app/products/[id]/page.tsx), [`detalle.feature`](apps/web/e2e/features/detalle.feature)                                                                |
| Metadata dinámica y Open Graph                      | `generateMetadata` por producto y por categoría: título, descripción, canonical, Open Graph y Twitter; imagen OG generada para el catálogo | [`product-metadata.ts`](apps/web/src/modules/products/seo/product-metadata.ts), [`catalog-metadata.ts`](apps/web/src/modules/products/seo/catalog-metadata.ts)                                 |
| "Agregar al carrito" con estado global en el Header | Zustand con un reducer puro, persistido y sincronizado entre pestañas; contador en el Header                                               | [`modules/cart/`](apps/web/src/modules/cart/), [`carrito.feature`](apps/web/e2e/features/carrito.feature), [ADR 0003](docs/adr/0003-estado-del-carrito.md)                                     |

### Criterios de evaluación

| Criterio                         | Cómo se resolvió                                                                                                                                                                                                                                                                              | Evidencia                                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance                      | PPR con Cache Components, imágenes externas de FakeStore optimizadas con `next/image` (AVIF/WebP, `remotePatterns` acotado, lazy loading salvo las 4 candidatas a LCP), fuente self-hosted, sin CLS. Lighthouse desktop: 100 en todas las categorías; mobile (4G lento): 88–97 de rendimiento | [`lighthouse.ts`](apps/web/scripts/lighthouse.ts), job "Lighthouse budgets" en CI                                                                                       |
| Arquitectura                     | Módulos por dominio con capas hexagonales, reglas de dependencias en ESLint verificadas por un test, raíz de composición única                                                                                                                                                                | [`docs/architecture.md`](docs/architecture.md), [ADR 0002](docs/adr/0002-arquitectura-por-modulos.md), [`architecture.test.ts`](apps/web/src/test/architecture.test.ts) |
| Estrategia de estado del carrito | Zustand + selectores (predictibilidad y re-renders mínimos), un store por Provider (seguro en SSR), `localStorage` validado con Zod; alternativas comparadas                                                                                                                                  | [ADR 0003](docs/adr/0003-estado-del-carrito.md)                                                                                                                         |
| Testing                          | 384 tests unitarios y de integración (~98 % de cobertura en la app, 95 % mínimo en dominio), stories como tests con axe, 26 escenarios BDD en español en 3 navegadores                                                                                                                        | [`docs/testing-strategy.md`](docs/testing-strategy.md), [ADR 0007](docs/adr/0007-estrategia-de-testing.md)                                                              |

### Extras sugeridos

| Extra                  | Implementación                                                                                                                                                            | Evidencia                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Streaming con Suspense | El catálogo envía el shell al instante y los resultados en streaming con un skeleton del mismo tamaño; al filtrar, se atenúan los resultados actuales en vez de parpadear | [`CatalogSkeleton.tsx`](apps/web/src/app/products/CatalogSkeleton.tsx), [`catalog-navigation.tsx`](apps/web/src/modules/products/ui/catalog-navigation.tsx) |
| Resiliencia            | Reintentos con timeout, snapshot versionado si FakeStore falla, `error.tsx` por segmento con "Intentar de nuevo"                                                          | [ADR 0010](docs/adr/0010-snapshot-de-respaldo.md), [`errores.feature`](apps/web/e2e/features/errores.feature)                                               |
| Caché                  | `'use cache'` con `cacheLife` y etiquetas por producto; revalidación bajo demanda protegida con secreto                                                                   | [`composition-root.ts`](apps/web/src/composition-root.ts), [ADR 0005](docs/adr/0005-cache-y-revalidacion.md)                                                |

### Extras propios

- **Design System** (`@delosi/ui`) con tokens, modo oscuro, Storybook publicado y cada story como test de accesibilidad ([ADR 0006](docs/adr/0006-design-system-css-modules.md)).
- **Accesibilidad WCAG 2.2 AA** verificada con axe en componentes, en E2E y en Lighthouse (100); skip link, foco gestionado y anuncios con `aria-live`.
- **SEO técnico:** JSON-LD de `Product` y `BreadcrumbList`, `sitemap.xml`, `robots.txt` y metadata completa para crawlers ([ADR 0011](docs/adr/0011-metadata-del-catalogo.md)).
- **Observabilidad:** errores del servidor y del navegador, y Web Vitals reales, en JSON estructurado ([ADR 0008](docs/adr/0008-observabilidad-sin-proveedor.md)).
- **CI/CD** con 5 jobs en paralelo, despliegues de preview por PR y dependencias fijadas ([ADR 0009](docs/adr/0009-politica-de-dependencias.md)).

## Puesta en marcha

Requisitos: Node.js 24 (≥ 24.15, definido en `.nvmrc`) y pnpm 12 (versión fijada en `packageManager`, se activa con Corepack).

```bash
nvm use
corepack enable
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

La app queda disponible en http://localhost:3000.

## Scripts

| Comando                                | Descripción                                          |
| -------------------------------------- | ---------------------------------------------------- |
| `pnpm dev`                             | Servidor de desarrollo                               |
| `pnpm build`                           | Build de producción de todos los paquetes            |
| `pnpm lint` / `pnpm typecheck`         | ESLint / verificación de tipos                       |
| `pnpm test`                            | Tests unitarios y de integración, con cobertura      |
| `pnpm format` / `pnpm format:check`    | Prettier                                             |
| `pnpm --filter @delosi/web e2e`        | E2E (después de `pnpm build`)                        |
| `pnpm --filter @delosi/web e2e:ui`     | E2E en modo interactivo                              |
| `pnpm --filter @delosi/web e2e:report` | Abre el último informe de los E2E                    |
| `pnpm --filter @delosi/web lighthouse` | Presupuestos de Lighthouse (después de `pnpm build`) |
| `pnpm --filter @delosi/ui storybook`   | Storybook en desarrollo (http://localhost:6006)      |
| `pnpm build-storybook`                 | Build estático de Storybook                          |

La primera vez hay que descargar los navegadores de Playwright:

```bash
pnpm --filter @delosi/ui exec playwright install chromium
pnpm --filter @delosi/web exec playwright install chromium webkit
```

## Testing

Resumen de la [estrategia de testing](docs/testing-strategy.md):

- **Unitarios e integración** con Vitest, Testing Library y MSW. Cobertura mínima: 80 % global y 95 % en `domain/`.
- **Design System:** cada story es un test en Chromium con axe, en tema claro y oscuro.
- **E2E:** escenarios **BDD en español** (`apps/web/e2e/features/*.feature`) con Playwright y playwright-bdd, contra el build de producción y un **mock de FakeStore**, en Chromium, mobile y WebKit. Playwright levanta el mock y dos instancias de la app: una con la API sana y otra con la API caída.
- **Lighthouse** (`/products`, `/products/5` y `/cart`, mobile y desktop, mediana de 3 corridas). En desktop, los presupuestos son los umbrales "buenos" de Core Web Vitals; en mobile, una guardia contra regresiones. El SEO se mide aparte con el user agent de PageSpeed Insights.

## CI/CD

Cada PR corre en GitHub Actions ([`ci.yml`](.github/workflows/ci.yml)), con 5 jobs en paralelo:

1. Lint, formato y tipos.
2. Tests unitarios y de integración, con el informe de cobertura como artefacto.
3. Build.
4. E2E en Chromium, mobile y WebKit (el informe se sube si fallan).
5. Presupuestos de Lighthouse (tabla en el resumen del job e informes HTML).

Vercel despliega un preview por PR de la tienda y del Storybook, y producción al mergear a `main`. Cada cambio entró por un PR con squash merge y Conventional Commits (commitlint). Dependabot mantiene las dependencias, que están fijadas a versiones exactas.

## Fuente de datos

FakeStore está detrás de un desafío de Cloudflare que **bloquea las IPs de datacenter** (GitHub Actions, Vercel). Por eso la app usa un **snapshot versionado como respaldo** detrás del mismo puerto `ProductRepository` ([ADR 0010](docs/adr/0010-snapshot-de-respaldo.md)):

- En local se usan los datos en vivo; en CI y en Vercel, el snapshot.
- `GET /api/health` indica la fuente actual (`servedFrom: "live" | "snapshot"`).
- **Imágenes** ([ADR 0012](docs/adr/0012-imagenes-de-producto.md)): la API está bloqueada para Vercel, pero las fotos no. En producción (`PRODUCT_IMAGES=remote`) se cargan desde `fakestoreapi.com/img/` y las optimiza `next/image` (AVIF/WebP, tamaño según `sizes`, caché de 31 días). En el desarrollo, CI, E2E y Lighthouse se usa la copia de `apps/web/public/images/products/`, así corren sin red.
- **Carga diferida:** solo las 4 primeras tarjetas (candidatas a LCP) se piden con prioridad; el resto de las imágenes es `lazy` y se carga al hacer scroll.

Para regenerar el snapshot (desde una conexión residencial):

```bash
pnpm --filter @delosi/web snapshot
```

## Caché y revalidación bajo demanda

Las lecturas del catálogo se cachean con Cache Components (`'use cache'`) y se etiquetan con `products`, `categories` y `product:<id>`. El filtrado, la búsqueda y el orden se aplican en cada request sobre esos datos cacheados, así una sola entrada de caché sirve cualquier combinación de filtros.

Para invalidar una etiqueta (por ejemplo, tras un cambio de precios en una campaña), con `REVALIDATE_SECRET` configurado:

```bash
curl -X POST https://delosi-shop.vercel.app/api/revalidate \
  -H "content-type: application/json" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{"tag":"products"}'
```

Solo se aceptan las etiquetas anteriores. Sin secreto configurado, el endpoint responde `503` (deshabilitado).

## Carrito

Se agrega desde el detalle ("Agregar al carrito") o desde cada tarjeta del catálogo (botón rápido sobre la imagen). Ambos actualizan un estado global que se refleja en el contador del Header y en `/cart`: cantidades (1–99), eliminar, vaciar y subtotal. Detalles en el [ADR 0003](docs/adr/0003-estado-del-carrito.md):

- **Zustand** con suscripción por selector: el contador solo se re-renderiza cuando cambia el total. La lógica es un **reducer puro**, testeado sin React.
- **Persistencia** en `localStorage` (clave `delosi-cart`, versionada). Lo guardado se valida con Zod, un storage bloqueado no rompe nada y el carrito **se sincroniza entre pestañas**.
- **Sin diferencias de hidratación ni CLS:** el servidor no conoce el carrito, así que el contador y `/cart` muestran un placeholder del mismo tamaño hasta leerlo.
- `/cart` no se indexa (`noindex` y `robots.txt`). No hay checkout: el pago no forma parte de la demo.

## Errores, SEO y observabilidad

- **Errores:** `error.tsx` por segmento, con "Intentar de nuevo" (vuelve a pedir los datos) y un link al catálogo; `global-error.tsx` y una página 404 propia. Un producto inexistente o un id mal formado (`/products/999`, `/products/abc`) responde **404 real**: la página del producto no tiene límite de Suspense, así que llama a `notFound()` antes de enviar nada.
- **SEO:** metadata por categoría y por producto (canonical, Open Graph, Twitter), JSON-LD de `Product` y `BreadcrumbList`, `sitemap.xml`, `robots.txt` y una imagen Open Graph generada para el catálogo.
- **Observabilidad** ([ADR 0008](docs/adr/0008-observabilidad-sin-proveedor.md)): los errores del servidor (`onRequestError`) y de los error boundaries, y las Web Vitals del navegador (`/api/vitals`), se registran como JSON estructurado. El `digest` une el error que vio el usuario con el log del servidor.
- **Todos los errores quedan en los logs:** los capturados en el navegador también se envían al servidor (`/api/errors`), así que en producción quedan en los logs del proyecto en Vercel. En local se ven en la terminal donde corre la app.

**Ver la página de error en local:** compila la app y arráncala con el respaldo desactivado y la API apuntando a un puerto donde no hay nada escuchando, así cada request al catálogo falla:

```bash
pnpm --filter @delosi/web build
CATALOG_SNAPSHOT_FALLBACK=off PRODUCTS_API_BASE_URL=http://localhost:4010 pnpm --filter @delosi/web start -p 3001
```

En http://localhost:3001/products se muestra "No pudimos cargar los productos", con "Intentar de nuevo".

## Estructura

```
apps/web                Tienda Next.js
  src/app               Rutas: solo composición (layouts, páginas, metadata)
  src/modules/products  Catálogo: domain, application, infrastructure, seo, ui
  src/modules/cart      Carrito: domain, store, ui
  src/shared            Configuración, observabilidad y UI compartida
  src/composition-root  Adaptadores concretos y caché
  e2e                   Features BDD, pasos, Page Objects y mock de FakeStore
packages/ui             Design System (@delosi/ui): tokens, componentes y Storybook
packages/config         Presets compartidos de TypeScript y ESLint
docs                    Arquitectura, estrategia de testing y ADRs
```

La arquitectura completa, con diagramas, está en [`docs/architecture.md`](docs/architecture.md).

## Decisiones de arquitectura

- [ADR 0001: Monorepo con pnpm workspaces y Turborepo](docs/adr/0001-monorepo-turborepo.md)
- [ADR 0002: Arquitectura por módulos de dominio y capas](docs/adr/0002-arquitectura-por-modulos.md)
- [ADR 0003: Estado del carrito con Zustand, un reducer puro y persistencia](docs/adr/0003-estado-del-carrito.md)
- [ADR 0004: Estado del catálogo en la URL con APIs nativas](docs/adr/0004-estado-en-url.md)
- [ADR 0005: Caché del catálogo y revalidación bajo demanda](docs/adr/0005-cache-y-revalidacion.md)
- [ADR 0006: Design System acotado con CSS Modules y tokens](docs/adr/0006-design-system-css-modules.md)
- [ADR 0007: Estrategia de testing por riesgo, con BDD en español y un mock propio](docs/adr/0007-estrategia-de-testing.md)
- [ADR 0008: Observabilidad con puertos y un adaptador de consola](docs/adr/0008-observabilidad-sin-proveedor.md)
- [ADR 0009: Política de dependencias y entorno de ejecución](docs/adr/0009-politica-de-dependencias.md)
- [ADR 0010: Snapshot versionado como respaldo de FakeStore](docs/adr/0010-snapshot-de-respaldo.md)
- [ADR 0011: Metadata del catálogo en streaming y crawlers con `<head>` completo](docs/adr/0011-metadata-del-catalogo.md)
- [ADR 0012: Imágenes de producto remotas en producción y copia local sin red](docs/adr/0012-imagenes-de-producto.md)

## Uso de IA

Desarrollé este proyecto con **Claude Code** (Anthropic) como asistente de programación en pareja. Lo declaro porque forma parte de cómo trabajo, y porque lo que se evalúa es el criterio detrás del código.

**Cómo lo usé:**

- **Diseño:** partí de un spec y un plan por fase, escritos junto con el asistente y revisados por mí antes de implementar. Descarté propuestas cuando no se justificaban: por ejemplo, nuqs (el filtrado en servidor con search params nativos era suficiente), Sentry (puertos de observabilidad en su lugar) y un proxy para los 404, que reemplacé por un 404 real desde la página.
- **Implementación:** el asistente escribió buena parte del código y de los tests siguiendo TDD. Cada cambio entró en un PR pequeño que revisé antes de mergear.
- **Revisión:** usé al asistente para contrastar decisiones con la documentación de Next.js 16 incluida en `node_modules`, porque sus APIs cambian más rápido que cualquier conocimiento previo.

**Cómo lo verifiqué:**

- Todo pasa por CI: tipos estrictos, ESLint con reglas de arquitectura, 384 tests con umbrales de cobertura, E2E en tres navegadores y presupuestos de Lighthouse.
- Revisé la UI manualmente en el navegador y cada PR de UI pasó axe (tema claro y oscuro) sobre la página real. Problemas que detecté en esa revisión, como el contraste de "Quitar filtros" o el botón "Buscar" redundante, se corrigieron con un test que los reproducía primero.
- En desarrollo local revisé la consola: por ejemplo, un aviso de hidratación causado por una extensión del navegador que modifica el `<body>`.
- Cada decisión relevante tiene un ADR con alternativas, que puedo defender en la revisión de código.

**Decisiones propias:** el alcance, la arquitectura por módulos, la estrategia del carrito, el uso de BDD en español, el respaldo con snapshot, los presupuestos de rendimiento y qué quedó fuera (checkout, smoke test contra el preview) las tomé yo, a partir de las opciones y los trade-offs que discutimos.
