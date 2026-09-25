import type { Preview } from '@storybook/react-vite'
// The store's brand face, self-hosted (the app loads the same family with next/font).
import '@fontsource-variable/schibsted-grotesk'
import '../src/tokens/tokens.css'
import './preview.css'

export type Theme = 'light' | 'dark'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema de color',
      toolbar: {
        title: 'Tema',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Claro' },
          { value: 'dark', title: 'Oscuro' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      const theme: Theme = context.globals.theme === 'dark' ? 'dark' : 'light'
      document.documentElement.dataset.theme = theme
      return <Story />
    },
  ],
  parameters: {
    layout: 'centered',
    a11y: { test: 'error' },
    controls: { expanded: true },
  },
}

export default preview
