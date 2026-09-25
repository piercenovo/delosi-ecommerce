# ADR 0005: Caché del catálogo y revalidación bajo demanda

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

Un e-commerce con tráfico masivo necesita respuestas rápidas sin castigar a la API de origen, y a la vez poder reflejar cambios (por ejemplo, precios de una campaña) sin redeploy. Next.js 16 ofrece Cache Components (`'use cache'`, `cacheLife`, `cacheTag`) y Partial Prerendering. Las APIs se verificaron en la documentación incluida en Next 16.3.6 (`node_modules/next/dist/docs`).

## Decisión

**Qué se cachea:** las lecturas del repositorio, no las páginas ni los casos de uso.

| Lectura          | Vida                 | Tags                       |
| ---------------- | -------------------- | -------------------------- |
| `findAll`        | `cacheLife('hours')` | `products`                 |
| `findById(id)`   | `cacheLife('hours')` | `products`, `product:<id>` |
| `findCategories` | `cacheLife('days')`  | `categories`               |

- El filtrado, la búsqueda y el orden se aplican **en cada request sobre los datos cacheados**. Una sola entrada de caché (20 productos) sirve cualquier combinación de filtros, en lugar de una entrada por URL.
- **Dónde vive:** en `composition-root.ts`, como funciones `'use cache'` a nivel de módulo que decoran al repositorio. Lo que una función cacheada captura de un _closure_ entra en la clave de caché y debe ser serializable; una instancia de clase no lo es. Los casos de uso siguen sin conocer Next (ADR 0002).
- `/products` lee `searchParams` dentro de `<Suspense>` (no se pueden leer dentro de `'use cache'`). El resultado es **Partial Prerender**: el marco se sirve estático desde la CDN y la lista llega por streaming.

**Revalidación bajo demanda:** `POST /api/revalidate` con `{ "tag": "..." }` y el header `x-revalidate-secret`.

- Llama a `revalidateTag(tag, 'max')`: marca el dato como viejo y lo sigue sirviendo mientras obtiene el nuevo en segundo plano (_stale-while-revalidate_), el perfil recomendado por la documentación. Sin el segundo argumento la función está deprecated.
- Seguridad: el secreto se compara en tiempo constante (`timingSafeEqual` sobre hashes SHA-256), solo se aceptan los tags que la app usa, y sin `REVALIDATE_SECRET` el endpoint responde `503` (deshabilitado por defecto).
- La lógica es una función pura con sus dependencias inyectadas (`handleRevalidateRequest`), probada sin mockear Next; la ruta solo la conecta.

## Alternativas consideradas

- **Cachear la página completa por URL:** multiplica las entradas (una por combinación de filtros y búsquedas) y fragmenta la caché.
- **`updateTag`:** invalida de forma inmediata dentro de la misma request, pero solo está disponible en Server Actions; para una llamada externa desde un Route Handler corresponde `revalidateTag`.
- **Revalidación solo por tiempo:** simple, pero un cambio de precio tardaría hasta una hora en verse.
- **Decorar el repositorio con una clase cacheada:** no es viable con `'use cache'`, porque la instancia capturada no es serializable.

## Consecuencias

- La API de origen recibe como máximo una lectura por recurso y período de caché.
- Un cambio urgente se propaga con una llamada autenticada, sin redeploy.
- El filtrado por request tiene un costo mínimo con este volumen. Con catálogos grandes, el filtrado debería delegarse en la fuente de datos (búsqueda paginada) y la caché pasaría a ser por consulta.
