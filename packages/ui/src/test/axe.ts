import axe from 'axe-core'

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** Runs axe (WCAG 2.2 AA rules) against a rendered element in the real browser. */
export async function findAxeViolations(context: Element): Promise<axe.Result[]> {
  const results = await axe.run(context, {
    runOnly: { type: 'tag', values: WCAG_AA_TAGS },
    resultTypes: ['violations'],
  })
  return results.violations
}

export function describeViolations(violations: axe.Result[]): string {
  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(' ')).join(', ')
      return `[${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help} → ${targets}`
    })
    .join('\n')
}
