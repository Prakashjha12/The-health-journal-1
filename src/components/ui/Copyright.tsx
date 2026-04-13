"use client"

import { useEffect, useState } from "react"

export function Copyright() {
  const [year, setYear] = useState<number | string>("—")

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <span suppressHydrationWarning>
      &copy; {year} — The Health Journal. All Rights Reserved.
    </span>
  )
}
