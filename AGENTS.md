# AGENTS.md

Guidance for AI coding agents and contributors working in this repository.

## Project

E-commerce storefront built with the Next.js App Router on top of the FakeStore API
(Delosi Frontend Senior technical challenge). pnpm + Turborepo monorepo:

- `apps/web`: Next.js storefront (`@delosi/web`)
- `packages/ui`: design system (`@delosi/ui`), CSS Modules + Storybook (added in a later phase)
- `packages/config`: shared tsconfig and ESLint presets (`@delosi/config`)

## Commands (run from the repository root)

| Task                     | Command                   |
| ------------------------ | ------------------------- |
| Install                  | `nvm use && pnpm install` |
| Dev server               | `pnpm dev`                |
| Lint                     | `pnpm lint`               |
| Type check               | `pnpm typecheck`          |
| Unit + integration tests | `pnpm test`               |
| Production build         | `pnpm build`              |
| Format                   | `pnpm format`             |

In non-interactive shells, load nvm first: `source ~/.nvm/nvm.sh && nvm use`.

## Architecture rules

- `src/app/` only composes: routing, layouts, metadata. No business logic there.
- Feature code lives in `src/modules/<domain>/`, split into `domain/`, `application/`, `infrastructure/` and `ui/`.
- `domain/` is pure TypeScript: no React, Next.js, `fetch` or browser APIs.
- `application/` depends only on `domain/`. `infrastructure/` implements the ports declared in `domain/`.
- `ui/` never imports from `infrastructure/`. Pages obtain repositories from `src/composition-root.ts`.
- Modules do not import each other's internals; they share domain types only.
- Next.js caching (`'use cache'`, `cacheTag`) lives in `src/composition-root.ts`, as module-level functions that decorate the repository (see ADR 0005).
- These rules are enforced by ESLint (`import/no-restricted-paths`, `no-restricted-imports`) and verified by `src/test/architecture.test.ts`. Do not disable them; change them only with an ADR.
- Validate every external input (API responses, search params, environment variables) with Zod at the boundary.
- Server-only modules import `server-only` (e.g. `src/shared/config/server-env.ts`).
- Prefer Server Components. Add `'use client'` only for interactivity, as deep in the tree as possible.

## Conventions

- TypeScript strict mode (plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`). `any` is forbidden; use `unknown` and narrow.
- Styling: CSS Modules and design tokens (CSS custom properties). No inline styles.
- Code, identifiers and commit messages in English. UI copy, README, ADRs and Gherkin features in Spanish.
- Conventional Commits (enforced by commitlint). Do not add `Co-Authored-By` trailers.
- Dependencies are pinned to exact versions. Pass a full version when pinning a major (`pnpm add -E eslint@9.39.5`); a range such as `eslint@9` is saved with `^`. Only `peerDependencies` of shared packages use ranges.
- pnpm settings live in `pnpm-workspace.yaml` (pnpm 11+ ignores `.npmrc` except for auth). New install scripts must be reviewed and listed in `allowBuilds`.
- Version ceilings (see ADR 0009): TypeScript 6.0.x (typescript-eslint requires `<6.1.0`) and ESLint 9.x (`eslint-config-next` plugins crash on ESLint 10).
- Node 24 (`.nvmrc`, `engines >=24.15.0`) and pnpm only.
- Next.js 16 APIs (caching, metadata) change often: read the docs bundled with the installed version in `node_modules/next/dist/docs/` before using them.

## Testing

- Write the failing test first for domain and application code.
- Unit and integration tests use Vitest + Testing Library, colocated as `*.test.ts(x)`.
- Mock HTTP with MSW, never by mocking `fetch` directly.
- Query elements by role and accessible name, not by class names or test ids.
- Reuse the fakes in `src/test/` (`inMemoryProductRepository`, `makeProduct`, `setupMswServer`).
- `pnpm test` runs with coverage; thresholds: 80% global, 95% for `domain/`. Routes and the composition root are covered by E2E tests.

## Definition of done

- `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass.
- New behavior is covered by tests at the level that matches its risk.
- A change to any architecture rule above is recorded as an ADR in `docs/adr/`.
