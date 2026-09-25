import { describe, expectTypeOf, it } from 'vitest'
import { IconButton, type IconButtonProps } from './IconButton'

describe('IconButton types', () => {
  it('requires an accessible name', () => {
    expectTypeOf<IconButtonProps['aria-label']>().toEqualTypeOf<string>()

    // @ts-expect-error: an icon-only button without aria-label has no accessible name
    void (<IconButton>×</IconButton>)
  })
})
