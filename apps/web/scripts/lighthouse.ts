/**
 * Lighthouse budgets for the production build. Runs Lighthouse 13 (Node API) through the
 * Chromium that Playwright already installs, against `next start` backed by the FakeStore
 * mock (deterministic data, no network). For each page and profile it takes the median of
 * several runs, checks the budgets, writes HTML reports and fails when a budget is missed.
 *
 *   pnpm --filter @delosi/web build && pnpm --filter @delosi/web lighthouse
 *
 * Why not @lhci/cli: its last release (0.15.1, 2025-06) bundles Lighthouse 12.
 *
 * Two views of each page:
 * - performance, accessibility and best practices with a regular browser user agent: what
 *   people get (prerendered HTML, streamed content and streamed metadata);
 * - SEO with "Chrome-Lighthouse" in the user agent, as PageSpeed Insights sends it: Next.js
 *   treats it like other HTML-limited crawlers (Bingbot, social previews) and puts the
 *   metadata in <head>, which is what those crawlers read.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'
import { userAgents } from 'lighthouse/core/config/constants.js'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { computeMedianRun } from 'lighthouse/core/lib/median-run.js'

const APP_PORT = 3300
const MOCK_PORT = 4020
const DEBUG_PORT = 9223
const RUNS = Number(process.env.LH_RUNS ?? 3)
const APP_URL = `http://localhost:${APP_PORT}`
const REPORTS_DIR = new URL('../lighthouse-reports/', import.meta.url)

type Category = 'performance' | 'accessibility' | 'best-practices' | 'seo'

interface Budget {
  categories: Partial<Record<Category, number>>
  /** Upper bounds for metrics: ms, except CLS (unitless). */
  metrics: { lcp: number; cls: number; tbt: number }
}

const PAGES = [
  { name: 'Catálogo', path: '/products', seo: true },
  { name: 'Detalle', path: '/products/5', seo: true },
  // noindex on purpose: an SEO score would only measure that choice.
  { name: 'Carrito', path: '/cart', seo: false },
]

/*
 * Desktop budgets are the Core Web Vitals "good" thresholds. Mobile budgets are regression
 * guards set from measurements (2026-09-25: performance 88-94, LCP 3.2-4.0 s): Lighthouse
 * simulates slow 4G (1.6 Mbps, 150 ms RTT) and a 4x slower CPU, where Next.js + React's base
 * JavaScript (~255 KB) alone takes over a second to download, and the cart's LCP needs it
 * (the cart only exists in the browser). Field LCP (the 2.5 s target) comes from real users
 * through /api/vitals.
 */
const PROFILES = {
  mobile: {
    config: undefined,
    budget: {
      categories: { performance: 0.85, accessibility: 1, 'best-practices': 0.95, seo: 0.95 },
      metrics: { lcp: 4500, cls: 0.02, tbt: 600 },
    },
  },
  desktop: {
    config: desktopConfig,
    budget: {
      categories: { performance: 0.9, accessibility: 1, 'best-practices': 0.95, seo: 0.95 },
      metrics: { lcp: 2500, cls: 0.02, tbt: 200 },
    },
  },
} satisfies Record<string, { config: unknown; budget: Budget }>

function start(command: string, args: string[], env: Record<string, string>): ChildProcess {
  return spawn(command, args, { env: { ...process.env, ...env }, stdio: 'ignore' })
}

async function waitFor(url: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

type Lhr = NonNullable<Awaited<ReturnType<typeof lighthouse>>>['lhr']

function check(lhr: Lhr, seoLhr: Lhr | undefined, budget: Budget) {
  const failures: string[] = []
  const scores = {} as Record<Category, number | null>
  for (const [id, min] of Object.entries(budget.categories) as [Category, number][]) {
    if (id === 'seo' && !seoLhr) continue // pages that are noindex on purpose
    const score = (id === 'seo' ? seoLhr : lhr)?.categories[id]?.score ?? null
    scores[id] = score
    if (score === null || score < min) failures.push(`${id} ${score ?? '—'} < ${min}`)
  }
  const metric = (auditId: string) => lhr.audits[auditId]?.numericValue ?? Number.POSITIVE_INFINITY
  const metrics = {
    lcp: metric('largest-contentful-paint'),
    cls: metric('cumulative-layout-shift'),
    tbt: metric('total-blocking-time'),
  }
  for (const [name, max] of Object.entries(budget.metrics) as [keyof Budget['metrics'], number][]) {
    if (metrics[name] > max)
      failures.push(`${name.toUpperCase()} ${metrics[name].toFixed(3)} > ${max}`)
  }
  return { scores, metrics, failures }
}

const percent = (score: number | null) => (score === null ? '—' : String(Math.round(score * 100)))

async function main() {
  mkdirSync(REPORTS_DIR, { recursive: true })
  const mock = start('node', ['e2e/mock-server.ts'], { MOCK_PORT: String(MOCK_PORT) })
  const app = start('node', ['node_modules/next/dist/bin/next', 'start', '-p', String(APP_PORT)], {
    PRODUCTS_API_BASE_URL: `http://localhost:${MOCK_PORT}`,
  })
  const browser = await chromium.launch({
    channel: 'chromium', // full Chromium (new headless), as Lighthouse expects
    args: [`--remote-debugging-port=${DEBUG_PORT}`],
  })

  const rows: string[] = []
  let failed = false
  try {
    await waitFor(`http://localhost:${MOCK_PORT}/__health`)
    await waitFor(`${APP_URL}/api/health`)

    for (const [profile, { config, budget }] of Object.entries(PROFILES)) {
      for (const page of PAGES) {
        const url = `${APP_URL}${page.path}`
        const runs: { lhr: Lhr; html: string }[] = []
        for (let run = 0; run < RUNS; run += 1) {
          const result = await lighthouse(
            url,
            {
              port: DEBUG_PORT,
              logLevel: 'error',
              output: 'html',
              onlyCategories: ['performance', 'accessibility', 'best-practices'],
            },
            config,
          )
          if (result) runs.push({ lhr: result.lhr, html: String(result.report) })
        }
        const seoRun = page.seo
          ? await lighthouse(
              url,
              {
                port: DEBUG_PORT,
                logLevel: 'error',
                onlyCategories: ['seo'],
                emulatedUserAgent: `${userAgents[profile as keyof typeof userAgents]} Chrome-Lighthouse`,
              },
              config,
            )
          : undefined
        // Lighthouse's own median (by FCP and interactivity), not an average of scores.
        const median = computeMedianRun(runs.map(({ lhr }) => lhr))
        const report = runs.find(({ lhr }) => lhr === median)?.html ?? ''
        const slug = `${profile}${page.path.replaceAll('/', '-')}`
        writeFileSync(new URL(`${slug}.html`, REPORTS_DIR), report)

        const { scores, metrics, failures } = check(median, seoRun?.lhr, budget)
        failed ||= failures.length > 0
        rows.push(
          `| ${page.name} | ${profile} | ${percent(scores.performance)} | ${percent(scores.accessibility)} | ${percent(scores['best-practices'])} | ${page.seo ? percent(scores.seo) : 'n/a'} | ${(metrics.lcp / 1000).toFixed(2)} s | ${metrics.cls.toFixed(3)} | ${Math.round(metrics.tbt)} ms | ${failures.length ? `❌ ${failures.join('; ')}` : '✅'} |`,
        )
        console.info(`${profile} ${page.path}: ${failures.length ? failures.join('; ') : 'ok'}`)
      }
    }
  } finally {
    await browser.close()
    app.kill()
    mock.kill()
  }

  const table = [
    `### Lighthouse (mediana de ${RUNS} corridas)`,
    '',
    '| Página | Perfil | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS | TBT | Presupuesto |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n')
  console.info(`\n${table}`)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, table)
  if (failed) process.exitCode = 1
}

await main()
