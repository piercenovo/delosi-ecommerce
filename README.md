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
- [ADR 0004: Estado del catálogo en la URL con APIs nativas](docs/adr/0004-estado-en-url.md)
- [ADR 0005: Caché del catálogo y revalidación bajo demanda](docs/adr/0005-cache-y-revalidacion.md)
- [ADR 0006: Design System acotado con CSS Modules y tokens](docs/adr/0006-design-system-css-modules.md)
- [ADR 0009: Política de dependencias y entorno de ejecución](docs/adr/0009-politica-de-dependencias.md)
- [ADR 0010: Snapshot versionado como respaldo de FakeStore](docs/adr/0010-snapshot-de-respaldo.md)
