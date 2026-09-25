type ClassValue = string | false | null | undefined

/** Joins the truthy class names: `cx('a', isActive && 'b')`. */
export function cx(...classNames: ClassValue[]): string {
  return classNames.filter(Boolean).join(' ')
}
