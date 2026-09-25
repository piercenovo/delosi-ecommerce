# Delosi Store

Tienda e-commerce construida con **Next.js 16 (App Router)** sobre la [FakeStore API](https://fakestoreapi.com), como solución al reto técnico Frontend Senior de Delosi.

**Demo:** https://delosi-shop.vercel.app · **Design System (Storybook):** https://delosi-ui.vercel.app · **Estado de la fuente de datos:** [`/api/health`](https://delosi-shop.vercel.app/api/health)

> 🚧 En construcción. Este README se completa al cerrar cada fase.

## Requisitos

- Node.js 24 (≥ 24.15, definido en `.nvmrc`)
- pnpm 12 (versión fijada en `packageManager`, se activa con Corepack)

## Puesta en marcha

```bash
nvm use
corepack enable
pnpm install
pnpm --filter @delosi/ui exec playwright install chromium  # tests del Design System
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

La app queda disponible en http://localhost:3000.

## Scripts

| Comando                              | Descripción                                                  |
| ------------------------------------ | ------------------------------------------------------------ |
| `pnpm dev`                           | Servidor de desarrollo                                       |
| `pnpm build`                         | Build de producción de todos los paquetes                    |
| `pnpm build-storybook`               | Build estático de Storybook (`packages/ui/storybook-static`) |
| `pnpm --filter @delosi/ui storybook` | Storybook en desarrollo (http://localhost:6006)              |
| `pnpm lint`                          | ESLint                                                       |
| `pnpm typecheck`                     | Verificación de tipos                                        |
| `pnpm test`                          | Tests unitarios y de integración, con cobertura              |
| `pnpm format` / `pnpm format:check`  | Prettier                                                     |

Los E2E están escritos como **escenarios BDD en español** (`apps/web/e2e/features/*.feature`, Gherkin con `playwright-bdd`): catálogo, detalle, carrito, errores y accesibilidad. Corren contra el build de producción con un **mock de FakeStore** (`apps/web/e2e/mock-server.ts`), así que no usan red y los datos son siempre los del snapshot. Playwright levanta el mock y dos instancias de la app: una con la API sana y otra con la API caída, para los escenarios de error. La primera vez hay que descargar los navegadores: `pnpm --filter @delosi/web exec playwright install chromium webkit`.

## Fuente de datos

El catálogo viene de la FakeStore API. FakeStore está detrás de un desafío de Cloudflare que **bloquea las IPs de datacenter** (GitHub Actions, Vercel), por lo que la app usa un **snapshot versionado como respaldo** detrás del mismo puerto `ProductRepository` ([ADR 0010](docs/adr/0010-snapshot-de-respaldo.md)):

- En local se usan los datos en vivo; en CI y en Vercel, el snapshot.
- `GET /api/health` indica la fuente actual (`servedFrom: "live" | "snapshot"`).
- Las imágenes se sirven desde `apps/web/public/images/products/` y las optimiza `next/image`.

Para regenerar el snapshot (desde una conexión residencial):

```bash
pnpm --filter @delosi/web snapshot
```

## Caché y revalidación bajo demanda

Las lecturas del catálogo se cachean con Cache Components de Next.js (`'use cache'`) y se etiquetan con `products`, `categories` y `product:<id>`. El filtrado, la búsqueda y el orden se aplican en cada request sobre esos datos cacheados, así una sola entrada de caché sirve cualquier combinación de filtros.

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

- **Errores:** `error.tsx` por segmento, con "Intentar de nuevo" (vuelve a pedir los datos) y un link al catálogo; `global-error.tsx` y una página 404 propia. Los ids de producto mal formados (`/products/abc`) devuelven un **404 real** desde `proxy.ts`; un id inexistente devuelve la página 404 con `noindex` (con Cache Components, la página ya empezó a transmitirse).
- **SEO:** metadata por categoría y por producto (canonical, Open Graph, Twitter), JSON-LD de `Product` y `BreadcrumbList`, `sitemap.xml`, `robots.txt` y una imagen Open Graph generada para el catálogo.
- **Observabilidad** ([ADR 0008](docs/adr/0008-observabilidad-sin-proveedor.md)): los errores del servidor (`onRequestError`) y de los error boundaries, y las Web Vitals del navegador (`/api/vitals`), se registran como JSON estructurado. El `digest` une el error que vio el usuario con el log del servidor.
- **Todos los errores quedan en los logs:** los capturados en el navegador también se envían al servidor (`/api/errors`), así que en producción todos los errores quedan en los logs del proyecto en Vercel. En local se ven en la terminal donde corre la app.

**Ver la página de error en local:** compila la app y arráncala con el respaldo desactivado y la API apuntando a un puerto donde no hay nada escuchando (cualquier puerto libre), así cada request al catálogo falla:

```bash
pnpm --filter @delosi/web build
CATALOG_SNAPSHOT_FALLBACK=off PRODUCTS_API_BASE_URL=http://localhost:4010 pnpm --filter @delosi/web start -p 3001
```

En http://localhost:3001/products se muestra "No pudimos cargar los productos", con "Intentar de nuevo".

## Estructura

```
apps/web          Tienda Next.js
packages/ui       Design System (@delosi/ui): tokens, componentes y Storybook
packages/config   Presets compartidos de TypeScript y ESLint
docs/adr          Registro de decisiones de arquitectura
```

## Decisiones de arquitectura

- [ADR 0001: Monorepo con pnpm workspaces y Turborepo](docs/adr/0001-monorepo-turborepo.md)
- [ADR 0002: Arquitectura por módulos de dominio y capas](docs/adr/0002-arquitectura-por-modulos.md)
- [ADR 0003: Estado del carrito con Zustand, un reducer puro y persistencia](docs/adr/0003-estado-del-carrito.md)
- [ADR 0004: Estado del catálogo en la URL con APIs nativas](docs/adr/0004-estado-en-url.md)
- [ADR 0005: Caché del catálogo y revalidación bajo demanda](docs/adr/0005-cache-y-revalidacion.md)
- [ADR 0006: Design System acotado con CSS Modules y tokens](docs/adr/0006-design-system-css-modules.md)
- [ADR 0008: Observabilidad con puertos y un adaptador de consola](docs/adr/0008-observabilidad-sin-proveedor.md)
- [ADR 0009: Política de dependencias y entorno de ejecución](docs/adr/0009-politica-de-dependencias.md)
- [ADR 0010: Snapshot versionado como respaldo de FakeStore](docs/adr/0010-snapshot-de-respaldo.md)
