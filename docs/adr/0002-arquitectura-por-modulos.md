# ADR 0002: Arquitectura por módulos de dominio y capas

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

El reto evalúa una estructura orientada al dominio que permita que varias personas trabajen en paralelo sin pisarse, con SOLID y Clean Code. Next.js no impone una arquitectura: sin reglas explícitas, la lógica de negocio termina mezclada con rutas, `fetch` y componentes.

## Decisión

El código de negocio vive en `apps/web/src/modules/<dominio>/`, dividido en capas (arquitectura hexagonal, puertos y adaptadores):

| Capa              | Contenido                                                                                                  | Puede depender de                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `domain/`         | Tipos, reglas puras (filtro, búsqueda, orden), errores y puertos (`ProductRepository`)                     | Nada más del proyecto; sin React ni Next |
| `application/`    | Casos de uso (`getCatalog`, `getProductDetail`, `getRelatedProducts`) que reciben el puerto como parámetro | `domain/`                                |
| `infrastructure/` | Adaptadores: FakeStore, snapshot, fallback, tags de caché, revalidación                                    | `domain/`                                |
| `ui/`             | Componentes del módulo                                                                                     | `domain/` (tipos), `@delosi/ui`          |

Además:

- `src/app/` solo compone: rutas, layouts y metadata. Llama a los casos de uso con el repositorio que expone `src/composition-root.ts`.
- `src/composition-root.ts` es el único lugar que conoce las implementaciones concretas: arma el repositorio (FakeStore → snapshot) y le agrega la caché de Next.
- Un módulo no importa los internos de otro; comparten tipos de dominio.

**Patrones:** Repository y puertos/adaptadores, Adapter/Mapper (DTO → dominio), Decorator (`FallbackProductRepository` y el repositorio cacheado), Strategy (`SORT_STRATEGIES`), inyección de dependencias (los casos de uso reciben el repositorio) y Composition Root.

**Cumplimiento automático:** las reglas no dependen de la disciplina de cada persona.

- `import/no-restricted-paths` prohíbe las dependencias entre capas en la dirección incorrecta y que un módulo importe rutas o el composition root.
- `no-restricted-imports` impide usar `react`, `react-dom` y `next` en `domain/` y `application/`.
- `src/test/architecture.test.ts` lintea fragmentos de código en cada capa y verifica el mensaje exacto de cada regla. Si alguien desactiva o rompe una regla, el CI falla.

**Cobertura:** umbral global del 80 % y del 95 % en `domain/`, verificado en CI. Las rutas (`src/app/**`) y el composition root se excluyen de la cobertura unitaria: son cableado de Next y se validan con los tests E2E.

## Alternativas consideradas

- **Estructura por tipo técnico** (`components/`, `services/`, `utils/`): simple al inicio, pero dispersa cada funcionalidad y no expresa límites.
- **Feature-Sliced Design completo:** más capas y convenciones de las que necesita este alcance.
- **Lógica directamente en Server Components:** menos archivos, pero no se puede probar sin Next y acopla el negocio al framework.

## Consecuencias

- El dominio y los casos de uso se prueban en milisegundos con un repositorio en memoria, sin Next ni red.
- Cambiar la fuente de datos (otra API, una base de datos) solo requiere un nuevo adaptador y tocar el composition root.
- Hay más archivos que en una app sin capas; es un costo explícito a cambio de límites verificables.
