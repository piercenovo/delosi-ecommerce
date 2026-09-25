import { useId, type ComponentPropsWithRef } from 'react'
import fieldStyles from '../../styles/field.module.css'
import { cx } from '../../utils/cx'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'children' | 'size'> {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
}

/** Native `<select>` (keyboard and screen reader support for free), styled with tokens. */
export function Select({
  label,
  hideLabel = false,
  options,
  id,
  className,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={cx(fieldStyles.field, className)}>
      <label htmlFor={selectId} className={hideLabel ? fieldStyles.hiddenLabel : fieldStyles.label}>
        {label}
      </label>
      <div className={styles.wrapper}>
        <select id={selectId} className={cx(fieldStyles.control, styles.select)} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true" />
      </div>
    </div>
  )
}
