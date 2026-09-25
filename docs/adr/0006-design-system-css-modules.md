# ADR 0006: Design System acotado con CSS Modules y tokens

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

La tienda necesita componentes consistentes, accesibles y reutilizables, y la oferta valora Design Systems, Storybook y CSS escalable. A la vez, el foco del reto es Next.js, así que el Design System no debe convertirse en un proyecto en sí mismo.

## Decisión

**Alcance:** `@delosi/ui` contiene solo lo que la tienda usa: `Button`, `IconButton`, `Badge`, `Chip`, `Input`, `Select`, `Card`, `Skeleton` y `EmptyState`. Sin theming configurable, sin publicar en npm y sin versionado independiente.

**Estilos:**

- **CSS Modules** con clases en camelCase: estilos aislados por componente y costo cero en runtime.
- **Tokens como CSS custom properties** (`tokens.css`): color semántico, tipografía, espaciado de 4 px, radios, sombras, foco, área táctil y duraciones. Los componentes solo usan tokens.
- **Temas:** claro por defecto; oscuro con `prefers-color-scheme` o forzado con `data-theme="dark"`. `prefers-reduced-motion` anula duraciones y animaciones.
- **Paleta:** neutros fríos, un único acento morado ("chicha morada", `#5B2A86`) y amarillo "maracuyá" reservado para el contador del carrito. Todos los pares de texto superan 4.5:1 (AA) en ambos temas.

**Paquete interno sin paso de build:** exporta el código fuente; Next lo compila con `transpilePackages` y Storybook con Vite. No hay bundler que mantener ni artefactos que publicar. React es `peerDependency` (`^19.0.0`).

**APIs que previenen errores:**

- `IconButton` exige `aria-label` por tipo; `Input` y `Select` exigen `label`.
- `Chip` y `Card.Link` son polimórficos con genéricos (`as={Link}`): las props se infieren del elemento que se renderiza.
- `Card.Media` saca la imagen del flujo dentro de una caja de proporción fija, para que ninguna imagen cambie el tamaño de la tarjeta (sin CLS).
- Los tests de tipos (`@ts-expect-error`) garantizan que el compilador siga rechazando los usos incorrectos.

**Las stories son los tests:**

- `src/test/stories.test.tsx` recorre todas las stories con `composeStories` (portable stories, API oficial de Storybook) y en **Vitest 5 browser mode con Chromium** ejecuta cada una, incluido su `play`, y corre **axe (WCAG 2.2 AA)** en tema claro y oscuro.
- Al correr en un navegador real, se verifican cosas que jsdom no puede: contraste, tamaños medidos (área táctil de 44 px, caja de imagen sin CLS) y CSS Modules reales.
- Se validó con una prueba negativa: un botón sin nombre, un texto de bajo contraste y un `play` falso hicieron fallar el test.
- Durante el desarrollo, estos tests encontraron un bug real: `aspect-ratio` dejaba que una imagen vertical agrandara la tarjeta.

## Alternativas consideradas

- **`@storybook/addon-vitest`:** es la integración oficial, pero la versión 10.6 solo soporta Vitest 3 y 4. Usarla obligaba a una alpha (11.0) o a dos versiones de Vitest en el monorepo. Las portable stories dan el mismo resultado con una sola versión de Vitest.
- **Tests en jsdom:** más rápidos, pero sin estilos reales: axe no puede verificar contraste y no se pueden medir tamaños.
- **Tailwind CSS:** productivo, pero mezcla estilos en el marcado y la oferta pide CSS escalable (BEM, CSS Modules, Sass). CSS Modules con tokens mantiene el CSS legible y revisable.
- **CSS-in-JS en runtime (styled-components, Emotion):** agrega JavaScript en el cliente y tiene fricción con Server Components.
- **Paquete con build (tsup o Vite library mode):** necesario solo si se publicara fuera del monorepo.

## Consecuencias

- Agregar una story agrega un test de interacción y de accesibilidad en los dos temas.
- CI necesita Chromium; se instala con una action reutilizable y se cachea por versión de Playwright (la misma que usarán los E2E).
- Cambiar la marca o un tema se hace en `tokens.css`, sin tocar componentes.
- El paquete no es consumible fuera del monorepo sin agregar un paso de build (decisión consciente, ver alcance).
