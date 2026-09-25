# ADR 0009: Política de dependencias y entorno de ejecución

- **Estado:** Aceptado
- **Fecha:** 2026-09-24

## Contexto

Necesitamos builds reproducibles, upgrades conscientes y protección frente a ataques a la cadena de suministro de npm (como el compromiso de paquetes populares en 2025). Además, el ecosistema avanza a ritmos distintos: la última versión publicada de una herramienta no siempre es compatible con el resto.

## Decisión

### Entorno

1. **Node 24 LTS**, fijado en `.nvmrc` y en `engines` (`>=24.15.0 <25`) con `engineStrict: true`: la instalación falla con otra versión. El mínimo 24.15 lo exige jsdom 30. El CI toma la versión desde `.nvmrc`.
2. **pnpm 12**, fijado en `packageManager` (Corepack en local, `pnpm/setup` en CI). Toda la configuración de pnpm vive en `pnpm-workspace.yaml`: desde pnpm 11, `.npmrc` solo se usa para auth y registry.

### Versiones

3. **Versiones exactas** en `dependencies` y `devDependencies` (`saveExact: true`). El `package.json` refleja exactamente lo instalado y ninguna versión cambia sin un commit explícito.
4. **Rangos solo en `peerDependencies`** de los paquetes compartidos (`@delosi/ui`: `react: ^19.0.0`; `@delosi/config`: `eslint: ^9.0.0`): una librería no debe imponer una versión exacta a quien la consume.
5. **La última versión compatible, no la última publicada.** Cada techo se verificó y queda documentado:
   - **TypeScript 6.0.x**, no 7: `typescript-eslint` exige `typescript <6.1.0`.
   - **ESLint 9.x**, no 10: se probó ESLint 10 y `eslint-plugin-react` (incluido por `eslint-config-next` 16.3) falla al cargar sus reglas (`contextOrFilename.getFilename is not a function`). ESLint 9 ya no recibe soporte upstream; se acepta porque es una herramienta solo de desarrollo y es la versión que usa la plantilla oficial de `create-next-app` 16.3. Se revisará cuando `eslint-config-next` soporte ESLint 10.
6. **Menos dependencias cuando la plataforma ya lo resuelve:** no se usa `vite-tsconfig-paths` (deprecated), porque Vite 8 resuelve los alias de tsconfig de forma nativa (`resolve.tsconfigPaths`).
7. **Dependabot** semanal con PRs agrupados por dominio (Next/React, testing, Storybook, lint). Ignora TypeScript ≥ 6.1 y ESLint ≥ 10 mientras duren los techos del punto 5, y `@types/node` ≥ 25, porque los tipos de Node deben coincidir con la versión mayor del runtime (Node 24).

### Cadena de suministro

8. **`minimumReleaseAge: 1440`**: pnpm no instala versiones publicadas hace menos de 24 horas, ventana en la que suelen detectarse las publicaciones maliciosas. Es el valor por defecto desde pnpm 11; se declara explícitamente para documentar la decisión.
9. **`allowBuilds` + `strictDepBuilds`**: ningún paquete ejecuta scripts de instalación salvo los aprobados explícitamente, y un script nuevo sin revisar hace fallar la instalación. Por ejemplo, `unrs-resolver` se revisó y se denegó (`false`): su script solo vuelve a descargar un binario nativo que pnpm ya instala como dependencia opcional de la plataforma.
10. **CI con lockfile congelado** (`pnpm install --frozen-lockfile`) y pnpm descargado con verificación de firma de npm (`pnpm/setup`).

## Alternativas consideradas

- **Rangos `^` (por defecto de npm/pnpm):** el lockfile ya garantiza instalaciones reproducibles, pero `pnpm update` o regenerar el lockfile introduce versiones nuevas sin que quede visible en `package.json`.
- **Siempre la última versión mayor:** se descartó tras verificar las incompatibilidades del punto 5; habría dejado el lint roto.
- **Renovate en lugar de Dependabot:** más configurable, pero requiere instalar una app externa; Dependabot es nativo de GitHub y suficiente para este alcance.

## Consecuencias

- Cada upgrade es un PR visible y revisable, validado por el CI.
- Hay que atender los PRs de Dependabot con regularidad y revisar periódicamente los techos de TypeScript y ESLint.
- Un parche de seguridad publicado hace menos de 24 horas requiere instalarlo de forma explícita (con `minimumReleaseAgeExclude`).
- Un paquete nuevo con scripts de instalación obliga a revisarlo antes de poder instalarlo.
