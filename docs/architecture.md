# Arquitectura

Vista general de cómo está armada la tienda. Cada decisión tiene su ADR en [`docs/adr/`](adr/); este documento las conecta.

**Diagrama interactivo:** [piercenovo.github.io/delosi-ecommerce/architecture.html](https://piercenovo.github.io/delosi-ecommerce/architecture.html), con vistas guiadas del catálogo, el carrito y la observabilidad, tema claro u oscuro y exportación. Se genera con [Archify](https://github.com/tt-a1i/archify) desde [`architecture.archify.json`](architecture.archify.json).

## 1. Monorepo

```mermaid
flowchart LR
  web["apps/web<br/>Next.js 16"] --> ui["packages/ui<br/>@delosi/ui"]
  web --> config["packages/config<br/>tsconfig + ESLint"]
  ui --> config
  sb["Storybook<br/>delosi-ui.vercel.app"] -.-> ui
```

- `@delosi/ui` no tiene build: la app compila sus fuentes (`transpilePackages`). Solo contiene lo que la tienda usa ([ADR 0006](adr/0006-design-system-css-modules.md)).
- Turborepo ordena y cachea las tareas (`lint`, `typecheck`, `test`, `build`) ([ADR 0001](adr/0001-monorepo-turborepo.md)).

## 2. Módulos y capas

Cada dominio vive en `src/modules/<dominio>/` con capas hexagonales. `src/app/` solo compone: rutas, layouts y metadata ([ADR 0002](adr/0002-arquitectura-por-modulos.md)).

```mermaid
flowchart TB
  subgraph app["src/app (rutas): solo compone"]
    pages["page.tsx / layout.tsx"]
  end
  root["composition-root.ts<br/>adaptadores + 'use cache'"]
  subgraph products["modules/products"]
    direction TB
    subgraph pin["adaptadores de entrada"]
      pui["ui/"]
      purl["url/<br/>search params"]
      pseo["seo/<br/>metadata, JSON-LD"]
    end
    subgraph pcore["núcleo"]
      papp["application/<br/>casos de uso"] --> pdom["domain/<br/>reglas y puertos"]
    end
    subgraph pout["adaptador de salida"]
      pinf["infrastructure/<br/>FakeStore, snapshot"]
    end
    pui --> purl
    pseo --> purl
    purl --> pdom
    pui --> pdom
    pseo --> pdom
    pinf -. implementa el puerto .-> pdom
  end
  subgraph cart["modules/cart"]
    direction TB
    cui["ui/"] --> cstore["store/<br/>Zustand"] --> cdom["domain/<br/>reducer puro"]
  end
  pages --> pui
  pages --> papp
  pages --> pseo
  pages --> purl
  pages --> cui
  pages --> root --> pinf
```

Las carpetas de un módulo son hermanas, pero las capas no son equivalentes: `domain/` y `application/` forman el **núcleo**; `ui/`, `url/` y `seo/` son **adaptadores de entrada** (traducen el navegador, la URL y los crawlers hacia el núcleo); `infrastructure/` es el **adaptador de salida** (implementa el puerto `ProductRepository`). Las dependencias solo apuntan hacia el núcleo.

Las reglas las hace cumplir ESLint (`import/no-restricted-paths` y `no-restricted-imports`) y las verifica [`architecture.test.ts`](../apps/web/src/test/architecture.test.ts): si alguien apaga una regla, ese test falla.

| Regla                                                                    | Por qué                                                                                |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `domain/` no importa ninguna otra capa, ni React, Next o Zustand         | La lógica de negocio se testea sin framework y sobrevive a un cambio de framework      |
| `application/` solo usa `domain/` y recibe los adaptadores por parámetro | Los casos de uso se testean con un repositorio en memoria                              |
| `ui/` no usa `infrastructure/`                                           | Los componentes no saben de dónde vienen los datos                                     |
| `url/` solo usa `domain/`, sin framework                                 | La conversión URL ↔ consulta se testea sola y la comparten `ui/`, `seo/` y las páginas |
| `seo/` solo usa `domain/` y `url/`                                       | La metadata se arma con datos que la página ya tiene: no pide datos ni renderiza       |
| `store/` no usa `ui/`                                                    | El estado del cliente no depende de cómo se muestra                                    |
| `cart` no importa `products`                                             | El carrito recibe `CartProduct` por props; la página compone ambos módulos con slots   |
| Los módulos no importan `src/app` ni `composition-root.ts`               | Solo la raíz de composición conoce las implementaciones concretas                      |

**Composición por slots:** `ProductCard` y `ProductDetail` exponen `action`/`actions` y `ProductGrid` expone `renderAction`. La página inserta ahí los botones del carrito y convierte el producto con `toCartProduct`, el único punto donde los dos módulos se tocan.

## 3. Request al catálogo

```mermaid
sequenceDiagram
  autonumber
  participant B as Navegador
  participant P as /products (RSC)
  participant C as composition-root
  participant F as FallbackRepository
  participant API as FakeStore API
  participant S as Snapshot JSON

  B->>P: GET /products?category=…&q=…&sort=…
  P-->>B: shell prerenderizado (header, skeleton)
  P->>C: findAll() / findCategories()
  alt caché vigente ('use cache', cacheTag)
    C-->>P: productos cacheados
  else cache miss
    C->>F: findAll()
    F->>API: fetch + validación Zod
    alt FakeStore responde
      API-->>F: JSON
    else error o bloqueo de Cloudflare
      F->>S: mismos datos, versionados
    end
    F-->>C: Product[]
  end
  P->>P: filtrar, buscar y ordenar (por request)
  P-->>B: resultados en streaming (Suspense)
```

- **PPR (Cache Components):** el shell estático sale al instante y los resultados llegan en streaming dentro del `<Suspense>` con `CatalogSkeleton`. Los filtros están en la URL (`searchParams`) y se leen dentro de ese límite ([ADR 0004](adr/0004-estado-en-url.md)).
- **Una sola entrada de caché para cualquier combinación de filtros:** se cachea la lista completa y el filtrado corre en cada request, que con 20 productos cuesta microsegundos ([ADR 0005](adr/0005-cache-y-revalidacion.md)).
- **Revalidación bajo demanda:** `POST /api/revalidate` con secreto invalida `products`, `categories` o `product:<id>`.
- **Resiliencia:** Cloudflare bloquea a FakeStore desde IPs de datacenter, así que `FallbackProductRepository` usa el snapshot si la API falla, y lo registra (`catalog.fallback_to_snapshot`) ([ADR 0010](adr/0010-snapshot-de-respaldo.md)).
- **Imágenes:** en producción, las fotos se cargan desde FakeStore y las optimiza `next/image` (`remotePatterns` acotado a `fakestoreapi.com/img/**`, AVIF/WebP, caché de 31 días). En CI y E2E se usa la copia local ([ADR 0012](adr/0012-imagenes-de-producto.md)). Solo las 4 primeras tarjetas cargan con prioridad; el resto es lazy.
- **Metadata:** en el catálogo va en streaming para los navegadores y completa en el `<head>` para los crawlers ([ADR 0011](adr/0011-metadata-del-catalogo.md)).

**El detalle (`/products/[id]`) no usa streaming, a propósito.** Todos los productos se prerenderizan en el build (`generateStaticParams`). Un id desconocido se renderiza bajo demanda y **bloqueando**, sin `loading.tsx` ni Suspense, para que `notFound()` corra antes de enviar el status: así se obtiene un **404 real** y los crawlers reciben el HTML completo. La página lo declara con `export const instant = false`.

## 4. Carrito

```mermaid
flowchart LR
  subgraph servidor["Servidor (SSR)"]
    ph["Placeholder del mismo tamaño<br/>(el servidor no conoce el carrito)"]
  end
  subgraph cliente["Navegador"]
    prov["CartProvider<br/>un store por Provider"]
    btn["AddToCartButton / QuickAddButton<br/>useAddToCart"]
    badge["CartBadge<br/>selector: total de unidades"]
    view["/cart<br/>líneas, cantidades, subtotal"]
    red["cartReducer (puro)"]
    ls[("localStorage<br/>delosi-cart v1")]
    other["Otra pestaña"]
  end
  ph -. hidratación .-> prov
  btn -->|add| prov
  view -->|setQuantity / remove / clear| prov
  prov --> red
  prov -->|selectores| badge
  prov -->|selectores| view
  prov <-->|persist + validación Zod| ls
  ls -. evento storage .-> other
```

Detalle y alternativas en el [ADR 0003](adr/0003-estado-del-carrito.md):

- **Predecible:** toda la lógica está en un reducer puro con cuatro acciones, cantidades de 1 a 99 y subtotal en centavos. Si nada cambia, devuelve el mismo objeto, así Zustand no notifica a nadie.
- **Eficiente:** cada componente se suscribe a un selector; el contador del Header solo se re-renderiza cuando cambia el total.
- **Seguro en SSR:** un store por Provider (no un singleton de módulo, que se compartiría entre requests), `skipHydration` + `rehydrate()` después del primer render, y un placeholder del mismo tamaño: sin diferencias de hidratación ni CLS.
- **Robusto:** el storage propio nunca lanza (modo privado, cuota o JSON corrupto) y lo guardado se valida con Zod antes de usarse.

## 5. Errores y observabilidad

```mermaid
sequenceDiagram
  autonumber
  participant B as Navegador
  participant N as Next.js (servidor)
  participant I as instrumentation.ts
  participant E as /api/errors
  participant L as Logs (JSON)

  B->>N: GET /products
  N--xN: error al renderizar
  N->>I: onRequestError(error, digest, ruta)
  I->>L: {"source":"server","digest":"abc123",…}
  N-->>B: error.tsx (solo el digest, sin detalles)
  B->>E: sendBeacon {digest:"abc123", message, stack truncado}
  E->>E: Zod + límite de 4 KB
  E->>L: {"source":"client","digest":"abc123",…}
  Note over L: el mismo digest une lo que vio el usuario<br/>con el error del servidor
```

- **Puertos, no proveedores:** `ErrorReporter` y `MetricsReporter` con un adaptador de consola que escribe JSON por línea. Cambiar a Sentry o Datadog es escribir otro adaptador ([ADR 0008](adr/0008-observabilidad-sin-proveedor.md)).
- **Web Vitals reales:** `WebVitalsReporter` envía CLS, FCP, INP, LCP y TTFB a `/api/vitals` (validado con Zod, límite de 2 KB).
- **Límites de error por segmento:** `error.tsx` con "Intentar de nuevo" (`retry()` vuelve a pedir los datos), `global-error.tsx` y un 404 propio.

## 6. Calidad

La estrategia de tests está en [`testing-strategy.md`](testing-strategy.md) ([ADR 0007](adr/0007-estrategia-de-testing.md)). En CI corren en paralelo: lint, formato y tipos; tests unitarios y de integración con cobertura; build; E2E en Chromium, mobile y WebKit; y presupuestos de Lighthouse.
