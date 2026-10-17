"use client"

import { useSyncExternalStore } from "react"

interface FormattedDateProps {
  date: string | Date
  options?: Intl.DateTimeFormatOptions
  className?: string
}

const emptySubscribe = () => () => {}

export function FormattedDate({ 
  date, 
  options = { month: 'short', day: 'numeric', year: 'numeric' },
  className
}: FormattedDateProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const formatted = isMounted
    ? new Date(date).toLocaleDateString('en-US', options)
    : ""

  return (
    <span className={className} suppressHydrationWarning>
      {formatted || "..."}
    </span>
  )
}
