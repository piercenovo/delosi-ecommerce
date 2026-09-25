/**
 * Every story is a test: it renders in Chromium (real CSS), runs its `play` function
 * and must have no WCAG 2.2 AA violations, in both the light and the dark theme.
 */
import { composeStories, type composeStory } from '@storybook/react-vite'
import { afterEach, describe, expect, it } from 'vitest'
import { describeViolations, findAxeViolations } from './axe'

type StoriesModule = Parameters<typeof composeStories>[0]
type ComposedStory = ReturnType<typeof composeStory>

const storyModules = import.meta.glob<StoriesModule>('../**/*.stories.tsx', { eager: true })
const THEMES = ['light', 'dark'] as const

afterEach(() => {
  document.body.replaceChildren()
})

for (const [path, storyModule] of Object.entries(storyModules)) {
  describe(storyModule.default.title ?? path, () => {
    for (const theme of THEMES) {
      const stories = composeStories(storyModule, { initialGlobals: { theme } })

      for (const [name, Story] of Object.entries(stories) as [string, ComposedStory][]) {
        it(`${name} (${theme})`, async () => {
          const canvasElement = document.createElement('div')
          document.body.append(canvasElement)

          await Story.run({ canvasElement })
          expect(document.documentElement.dataset.theme).toBe(theme)

          const violations = await findAxeViolations(canvasElement)
          expect(violations, describeViolations(violations)).toEqual([])
        })
      }
    }
  })
}
