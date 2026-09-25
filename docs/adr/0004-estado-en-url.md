# ADR 0004: Estado del catálogo en la URL con APIs nativas

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

El reto exige que los filtros persistan en la URL (search params), que el estado sea compartible y que sea compatible con la indexación. El catálogo se filtra, busca y ordena **en el servidor**, que entrega HTML listo. Los parámetros son tres: `category`, `q` y `sort`.

## Decisión

Manejar el estado en la URL sin librerías, con las APIs de la plataforma y Zod:

- `modules/products/url/catalog-search-params.ts`, compartido entre servidor y cliente y sin dependencias de Next:
  - `parseCatalogQuery` valida con Zod y descarta cada parámetro inválido por separado. Nunca lanza un error, así que una URL rota no rompe la página.
  - `buildCatalogHref` arma los links con `URLSearchParams`, con un orden estable (`category`, `q`, `sort`) para no generar URLs duplicadas del mismo estado.
- Una categoría inexistente se ignora en el caso de uso.
- Interfaz con mejora progresiva (Plan 4):
  - Las categorías son `<Link>` renderizados en el servidor: funcionan sin JavaScript y los buscadores los siguen.
  - La búsqueda y el orden viven en un `<form method="get">` que funciona sin JavaScript. Con JavaScript, se mejora con `router.replace` dentro de `useTransition` y un _debounce_ en la búsqueda.

## Alternativas consideradas

- **nuqs:** su valor principal es manejar estado de la URL en el cliente con _shallow routing_ (sin volver al servidor). Aquí el filtrado ocurre en el servidor, así que habría que desactivarlo (`shallow: false`). Sus parsers y su serializador ya los cubren Zod y `URLSearchParams`, y solo un componente cliente escribe en la URL. Con el alcance actual no aporta nada que se use; tendría sentido con muchos filtros, paginación o estado de URL compartido entre varios componentes cliente.
- **TanStack Query:** los datos se cargan en Server Components y se cachean con Cache Components. No hay estado de servidor que sincronizar en el cliente; agregarlo duplicaría la caché y sumaría JavaScript.
- **Estado en React (`useState`):** no es compartible, no se indexa y se pierde al recargar.

## Consecuencias

- Cero dependencias nuevas y menos JavaScript en el cliente.
- Los filtros funcionan aunque el JavaScript no haya cargado: mejor para SEO, accesibilidad y conexiones lentas.
- Mantenemos unas decenas de líneas propias, cubiertas por tests (incluido un test de ida y vuelta entre `buildCatalogHref` y `parseCatalogQuery`).
