'use client'

import { IconButton } from '@delosi/ui'
import a11y from '@/shared/ui/a11y.module.css'
import { MAX_QUANTITY, MIN_QUANTITY } from '../domain/cart'
import styles from './QuantityStepper.module.css'
import { MinusIcon, PlusIcon } from './icons'

interface QuantityStepperProps {
  value: number
  /** Product name, so each control says which line it changes. */
  itemLabel: string
  onChange: (quantity: number) => void
}

/**
 * − / + within 1–99. At a limit the button is aria-disabled, not disabled: it keeps the
 * keyboard focus (a disabled button would drop it to <body>) and the click is ignored.
 * Going below 1 is not "remove": that is a separate, explicit button.
 */
export function QuantityStepper({ value, itemLabel, onChange }: QuantityStepperProps) {
  const atMin = value <= MIN_QUANTITY
  const atMax = value >= MAX_QUANTITY

  return (
    <div role="group" aria-label={`Cantidad de «${itemLabel}»`} className={styles.stepper}>
      <IconButton
        size="sm"
        aria-label={`Disminuir cantidad de «${itemLabel}»`}
        aria-disabled={atMin}
        onClick={() => {
          if (!atMin) onChange(value - 1)
        }}
      >
        <MinusIcon />
      </IconButton>
      <span role="status" className={styles.value}>
        <span aria-hidden="true">{value}</span>
        <span className={a11y.visuallyHidden}>
          {value} {value === 1 ? 'unidad' : 'unidades'}
        </span>
      </span>
      <IconButton
        size="sm"
        aria-label={`Aumentar cantidad de «${itemLabel}»`}
        aria-disabled={atMax}
        onClick={() => {
          if (!atMax) onChange(value + 1)
        }}
      >
        <PlusIcon />
      </IconButton>
    </div>
  )
}
