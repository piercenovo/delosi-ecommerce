# @delosi/ui

Design System de Delosi Store: tokens de diseño y los componentes que usa la tienda, con CSS Modules y documentados en Storybook.

- **Storybook:** https://delosi-ui.vercel.app
- **Decisiones:** [ADR 0006](../../docs/adr/0006-design-system-css-modules.md).

## Uso

```tsx
import '@delosi/ui/tokens.css' // una vez, en el layout raíz
import { Button, Card, Chip } from '@delosi/ui'
```

Es un **paquete interno sin paso de build**: exporta el código fuente (`.tsx` y `.module.css`). En Next.js se declara en `transpilePackages: ['@delosi/ui']`. React es una `peerDependency` (`^19.0.0`).

## Componentes

| Componente   | Para qué                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`     | Acciones (`primary`, `secondary`, `ghost` y `highlight` para confirmaciones), con estado `loading`; polimórfico (`as={Link}`) para navegar       |
| `IconButton` | Acción solo con ícono (`ghost`, `secondary`, `floating` sobre fotos y `highlight`; forma `square` o `circle`); `aria-label` obligatorio por tipo |
| `Badge`      | Etiquetas y contadores; `label` para dar contexto a lectores de pantalla                                                                         |
| `Chip`       | Filtros; polimórfico (`as={Link}`), con `aria-pressed` o `aria-current`                                                                          |
| `Input`      | Campo de texto con `label` obligatorio, descripción y error accesibles                                                                           |
| `Select`     | `<select>` nativo con estilos del sistema                                                                                                        |
| `Card`       | Tarjeta compuesta (`Media`, `Body`, `Title`, `Link`, `Footer`) sin borde, con caja de imagen fija, link estirado y `Card.Action` sobre la foto   |
| `Skeleton`   | Placeholders de carga (`text`, `rect`, `circle`)                                                                                                 |
| `EmptyState` | Estados vacíos con acción siguiente                                                                                                              |

## Comandos

| Comando                                                     | Qué hace                                      |
| ----------------------------------------------------------- | --------------------------------------------- |
| `pnpm --filter @delosi/ui storybook`                        | Storybook en http://localhost:6006            |
| `pnpm --filter @delosi/ui test`                             | Stories como tests en Chromium, con cobertura |
| `pnpm --filter @delosi/ui build-storybook`                  | Build estático en `storybook-static/`         |
| `pnpm --filter @delosi/ui exec playwright install chromium` | Descarga Chromium (una vez)                   |

## Agregar un componente

1. Confirmar que una pantalla de la tienda lo necesita (solo entra lo que se usa).
2. Crear `src/components/<Nombre>/` con:
   - `<Nombre>.tsx`: props tipadas que extienden las del elemento nativo (`ComponentPropsWithRef<'button'>`) y combinan `className` con `cx`.
   - `<Nombre>.module.css`: solo tokens; sin colores ni espaciados sueltos.
   - `<Nombre>.stories.tsx`: una story por estado relevante, con `play` para la interacción.
   - `index.ts`, y exportarlo en `src/index.ts`.
3. Si la API debe impedir un error (p. ej. un nombre accesible obligatorio), agregar un test de tipos con `@ts-expect-error`.
4. `pnpm --filter @delosi/ui test`: cada story se ejecuta en Chromium y pasa axe (WCAG 2.2 AA) en tema claro y oscuro.
