import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// RTL only auto-cleans with Vitest `globals: true`; unmount explicitly between tests.
afterEach(cleanup)
