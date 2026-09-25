# ADR 0010: Snapshot versionado como respaldo de FakeStore

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

El primer build en GitHub Actions y el primer deploy en Vercel fallaron: FakeStore respondió **403** al pre-renderizar `/products`. Diagnóstico:

- FakeStore está detrás de Cloudflare con _managed challenge_ (`server: cloudflare`, `cf-mitigated: challenge`).
- Desde una IP residencial un `GET` responde 200; desde IPs de datacenter (runners de GitHub, Vercel) responde 403. El `User-Agent` no influye (probado con `node`, Chrome y vacío).
- Se asumió que las imágenes (`/img/*.png`) estaban detrás del mismo desafío. **Corregido en el [ADR 0012](0012-imagenes-de-producto.md):** al verificarlo, el optimizador de `next/image` en Vercel sí las descarga.

Evadir el desafío (proxies, rotación de IPs, simular un navegador) no es una opción: sería eludir un control anti-bots puesto por el dueño de la API, además de frágil.

## Decisión

Mantener FakeStore como fuente primaria y agregar un **snapshot versionado** como respaldo, detrás del mismo puerto `ProductRepository`:

- `scripts/snapshot-fakestore.ts` (`pnpm --filter @delosi/web snapshot`) captura desde una conexión residencial los productos, las categorías y las imágenes. Guarda el payload **crudo** de la API, así se valida y mapea con los mismos schemas Zod y el mismo mapper que las respuestas en vivo.
- `FakeStoreProductRepository`: API en vivo con timeout de 5 s, un reintento solo para errores transitorios (red, timeout, 5xx; nunca 4xx) y validación con Zod. Traduce cualquier fallo a `CatalogUnavailableError`.
- `SnapshotProductRepository`: sirve el snapshot validado.
- `FallbackProductRepository` (_Decorator_): lee del primario y, si falla, del respaldo, registrando el evento `catalog.fallback_to_snapshot`. Un `null` ("no existe") del primario es una respuesta válida y no activa el respaldo.
- `composition-root.ts` compone los tres; la UI y los casos de uso solo conocen el puerto.
- Las imágenes se copian en `public/images/products/`. Desde el [ADR 0012](0012-imagenes-de-producto.md), producción usa las URLs de FakeStore (`PRODUCT_IMAGES=remote`) y la copia local queda para el desarrollo, CI, E2E y Lighthouse.
- `/api/health` informa `servedFrom: "live" | "snapshot"` y responde 200 en ambos casos, porque la tienda sigue operativa.

## Alternativas consideradas

- **Evadir Cloudflare:** descartado (ver contexto).
- **Obtener los datos desde el navegador:** los navegadores superan el desafío, pero incumple el requisito de renderizar el catálogo en el servidor y perjudica SEO y rendimiento.
- **Solo mock en CI:** resuelve el CI pero no producción, porque Vercel también recibe 403.
- **Reemplazar FakeStore por datos estáticos:** perdería la integración real con la API que pide el reto; con el fallback, en local se usan datos en vivo.

## Consecuencias

- El build y la tienda funcionan aunque FakeStore bloquee o se caiga: el requisito de resiliencia se cumple por diseño.
- En Vercel el catálogo se sirve hoy desde el snapshot; `/api/health` lo hace visible.
- El snapshot puede quedar desactualizado: se regenera con un comando y el diff queda revisable en un PR. El dataset de FakeStore es estático, así que el riesgo es bajo.
- El repositorio versiona unos 4.6 MB de imágenes (fotos de producto del dataset público de demostración de FakeStore).
- Los tests de la integración con la API usan MSW; los del snapshot validan el archivo real, incluida la existencia de cada imagen.
