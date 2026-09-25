# ADR 0001: Monorepo con pnpm workspaces y Turborepo

- **Estado:** Aceptado
- **Fecha:** 2026-09-24

## Contexto

La solución incluye una aplicación Next.js y un Design System reutilizable con Storybook. Ambos evolucionan juntos, comparten configuración de TypeScript y ESLint, y deben poder ser trabajados en paralelo por varias personas sin pisarse.

## Decisión

Usar un monorepo con **pnpm workspaces** y **Turborepo**:

- `apps/web`: la tienda.
- `packages/ui`: el Design System (`@delosi/ui`).
- `packages/config`: presets compartidos de tsconfig y ESLint.

Turborepo orquesta `build`, `lint`, `typecheck` y `test`, respeta el orden de dependencias entre paquetes y cachea resultados, de modo que solo se vuelve a ejecutar lo que cambió. Las variables de entorno que afectan al build se declaran en `turbo.json`, para que formen parte de la clave de caché.

## Alternativas consideradas

- **Aplicación única con carpeta `src/shared/ui`:** más simple, pero no hay un límite real entre el Design System y la app; es fácil que componentes de presentación terminen dependiendo de lógica de negocio.
- **Repositorios separados:** aislamiento máximo, pero cada cambio en un componente exige publicar una versión y actualizar la app. Costo desproporcionado para este alcance.
- **Nx:** más funcionalidades (generadores, grafo de proyecto), pero más configuración y conceptos de los que este proyecto necesita.

## Consecuencias

- El Design System tiene una API pública explícita (`exports` de `@delosi/ui`): la app solo puede usar lo que el paquete expone.
- Un solo PR puede cambiar un componente y su uso en la app, con un único CI.
- Hay más archivos de configuración que en una app única; se mitiga centralizándolos en `@delosi/config`.
