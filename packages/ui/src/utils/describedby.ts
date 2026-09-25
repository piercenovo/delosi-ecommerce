/** Builds an `aria-describedby` value from the ids that are present. */
export function describedBy(...ids: (string | false | undefined)[]): string | undefined {
  const present = ids.filter(Boolean)
  return present.length > 0 ? present.join(' ') : undefined
}
