import { useId, type ComponentPropsWithRef } from 'react'
import fieldStyles from '../../styles/field.module.css'
import { cx } from '../../utils/cx'
import { describedBy } from '../../utils/describedby'

export interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'size'> {
  /** Always required: it names the field for everyone, even when `hideLabel` is set. */
  label: string
  hideLabel?: boolean
  description?: string
  /** Marks the field as invalid and explains how to fix it. */
  error?: string
}

export function Input({
  label,
  hideLabel = false,
  description,
  error,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className={cx(fieldStyles.field, className)}>
      <label htmlFor={inputId} className={hideLabel ? fieldStyles.hiddenLabel : fieldStyles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={fieldStyles.control}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(descriptionId, errorId)}
        {...props}
      />
      {description && (
        <p id={descriptionId} className={fieldStyles.description}>
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className={fieldStyles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
