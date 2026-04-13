"use client"

import { useEffect, useState } from "react"

interface FormattedDateProps {
  date: string | Date
  options?: Intl.DateTimeFormatOptions
  className?: string
}

export function FormattedDate({ 
  date, 
  options = { month: 'short', day: 'numeric', year: 'numeric' },
  className
}: FormattedDateProps) {
  const [formatted, setFormatted] = useState<string>("")

  useEffect(() => {
    setFormatted(new Date(date).toLocaleDateString('en-US', options))
  }, [date, options])

  // Return a placeholder or the raw date string to avoid layout shift, 
  // but suppressHydrationWarning if we render something different on server.
  return (
    <span className={className} suppressHydrationWarning>
      {formatted || "..."}
    </span>
  )
}
