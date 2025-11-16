import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const defaultCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value, options = {}) {
  const amount = Number.parseFloat(value ?? 0)
  const safeAmount = Number.isFinite(amount) ? amount : 0

  if (!options || Object.keys(options).length === 0) {
    return defaultCurrencyFormatter.format(safeAmount)
  }

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  })

  return formatter.format(safeAmount)
}

export function formatNumberIN(value, options = {}) {
  const amount = Number.parseFloat(value ?? 0)
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  })
  return formatter.format(safeAmount)
}

