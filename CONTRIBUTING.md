# Guía de contribución

## Flujo de trabajo

1. Crear una rama desde `main`: `feat/<tema>`, `fix/<tema>`, `chore/<tema>`, `docs/<tema>`.
2. Commits pequeños siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat(web): ...`, `fix(ui): ...`). commitlint lo valida en cada commit.
3. Abrir un Pull Request hacia `main` usando la plantilla. El CI debe estar en verde.
4. Merge por squash.

## Hooks de git

Se instalan solos con `pnpm install` (Husky):

- **pre-commit:** Prettier y ESLint sobre los archivos en stage (lint-staged).
- **commit-msg:** valida el mensaje con commitlint.

## Antes de abrir un PR

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Dependencias

- Versiones exactas (sin `^` ni `~`). Para fijar una versión mayor, indicar la versión completa: `pnpm add -E eslint@9.39.5`.
- La configuración de pnpm vive en `pnpm-workspace.yaml`.
- Si un paquete nuevo trae scripts de instalación, `pnpm install` falla: revisar qué hace el script y declararlo en `allowBuilds` (`true` si es necesario, `false` si no).

## Convenciones

Las reglas de arquitectura, estilo y testing están en [`AGENTS.md`](AGENTS.md) y aplican tanto a personas como a asistentes de IA. Cambiar una de esas reglas requiere un ADR en `docs/adr/`.
