"use client"

export function Copyright() {
  const currentYear = new Date().getFullYear()

  return (
    <span suppressHydrationWarning>
      &copy; {currentYear} — The Health Journal. All Rights Reserved.
    </span>
  )
}
