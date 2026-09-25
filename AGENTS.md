# AGENTS.md

Guidance for AI coding agents and contributors working in this repository.

## Project

E-commerce storefront built with the Next.js App Router on top of the FakeStore API
(Delosi Frontend Senior technical challenge). pnpm + Turborepo monorepo:

- `apps/web`: Next.js storefront (`@delosi/web`)
- `packages/ui`: design system (`@delosi/ui`), CSS Modules + Storybook. Internal package without a build step: apps compile its sources (`transpilePackages`)
- `packages/config`: shared tsconfig and ESLint presets (`@delosi/config`)

## Commands (run from the repository root)

| Task                     | Command                                                       |
| ------------------------ | ------------------------------------------------------------- |
| Install                  | `nvm use && pnpm install`                                     |
| Dev server               | `pnpm dev`                                                    |
| Lint                     | `pnpm lint`                                                   |
| Type check               | `pnpm typecheck`                                              |
| Unit + integration tests | `pnpm test`                                                   |
| E2E (after `pnpm build`) | `pnpm --filter @delosi/web e2e`                               |
| Production build         | `pnpm build`                                                  |
| Storybook (dev / build)  | `pnpm --filter @delosi/ui storybook` / `pnpm build-storybook` |
| Format                   | `pnpm format`                                                 |

In non-interactive shells, load nvm first: `source ~/.nvm/nvm.sh && nvm use`.

## Architecture rules

- `src/app/` only composes: routing, layouts, metadata. No business logic there.
- Feature code lives in `src/modules/<domain>/`, split into `domain/`, `application/`, `infrastructure/` and `ui/`. Client state gets a `store/` layer (the cart: Zustand + persist, ADR 0003): it may use `domain/`, and only `ui/` uses it.
- `domain/` is pure TypeScript: no React, Next.js, `fetch` or browser APIs.
- `application/` depends only on `domain/`. `infrastructure/` implements the ports declared in `domain/`.
- `ui/` never imports from `infrastructure/`. Pages obtain repositories from `src/composition-root.ts`.
- Modules do not import each other's internals. The cart does not import `products` at all: pages pass product data as props (`CartProduct`).
- Next.js caching (`'use cache'`, `cacheTag`) lives in `src/composition-root.ts`, as module-level functions that decorate the repository (see ADR 0005).
- These rules are enforced by ESLint (`import/no-restricted-paths`, `no-restricted-imports`) and verified by `src/test/architecture.test.ts`. Do not disable them; change them only with an ADR.
- Validate every external input (API responses, search params, environment variables, `localStorage`) with Zod at the boundary.
- Server-only modules import `server-only` (e.g. `src/shared/config/server-env.ts`).
- Prefer Server Components. Add `'use client'` only for interactivity, as deep in the tree as possible.

## Conventions

- TypeScript strict mode (plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`). `any` is forbidden; use `unknown` and narrow.
- Styling: CSS Modules and design tokens (CSS custom properties from `@delosi/ui/tokens.css`). No inline styles and no hard-coded colors or spacing.
- Design system components: only what the store uses; props extend the native element props (`ComponentPropsWithRef<'button'>`) and merge `className` with `cx`. See `packages/ui/README.md` for the checklist to add one.
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
- In `packages/ui` every story is a test (`src/test/stories.test.tsx`): it runs in Chromium (Vitest browser mode), executes its `play` function and must pass axe (WCAG 2.2 AA) in light and dark themes. Add a story for each relevant state. Install Chromium once with `pnpm --filter @delosi/ui exec playwright install chromium`.
- APIs that prevent accessibility mistakes get type tests with `@ts-expect-error`.
- E2E (`apps/web/e2e/`, Playwright): the production build against the FakeStore mock, in Chromium, mobile and WebKit. Use the Page Objects in `e2e/pages/` and the fixtures in `e2e/fixtures.ts` (`makeAxeBuilder` for WCAG 2.2 AA). Locate by role and accessible name, wait for state (never `waitForTimeout`), and use `DOWN_APP_URL` for API-failure scenarios instead of toggling shared state.

## Definition of done

- `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass.
- New behavior is covered by tests at the level that matches its risk.
- A change to any architecture rule above is recorded as an ADR in `docs/adr/`.
