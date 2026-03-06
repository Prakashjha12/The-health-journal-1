"use client"

import { useCallback, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { flushSync } from "react-dom"
import { cn } from "@/lib/utils"

export function ThemeToggle({
    className,
    duration = 500,
    ...props
}: React.ComponentPropsWithoutRef<"button"> & { duration?: number }) {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const buttonRef = useRef<HTMLButtonElement>(null)

    const toggleTheme = useCallback(() => {
        if (!buttonRef.current) return

        const newTheme = resolvedTheme === "dark" ? "light" : "dark"

        const applyTheme = () => {
            setTheme(newTheme)
        }

        // Fallback for browsers without View Transitions API
        if (
            typeof document === "undefined" ||
            !("startViewTransition" in document)
        ) {
            applyTheme()
            return
        }

        const transition = (document as any).startViewTransition(() => {
            flushSync(applyTheme)
        })

        const ready = transition?.ready
        if (ready && typeof ready.then === "function") {
            ready.then(() => {
                const button = buttonRef.current
                if (!button) return

                const { top, left, width, height } = button.getBoundingClientRect()
                const x = left + width / 2
                const y = top + height / 2

                const maxRadius = Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y)
                )

                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${maxRadius}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration,
                        easing: "ease-in-out",
                        pseudoElement: "::view-transition-new(root)",
                    }
                )
            })
        }
    }, [resolvedTheme, setTheme, duration])

    return (
        <button
            ref={buttonRef}
            onClick={toggleTheme}
            className={cn(
                "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
                className
            )}
            title="Toggle theme"
            {...props}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
