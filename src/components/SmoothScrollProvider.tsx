"use client"

import * as React from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import gsap from "gsap"
import { usePathname } from "next/navigation"

interface SmoothScrollProviderProps {
    children: React.ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    const pathname = usePathname()
    const isStudio = pathname?.startsWith('/studio')
    const lenisRef = React.useRef<LenisRef>(null)

    React.useEffect(() => {
        if (isStudio) return

        function update(time: number) {
            lenisRef.current?.lenis?.raf(time * 1000)
        }

        gsap.ticker.add(update)
        gsap.ticker.lagSmoothing(0)

        return () => {
            gsap.ticker.remove(update)
        }
    }, [isStudio])

    if (isStudio) {
        return <>{children}</>
    }

    return (
        <ReactLenis
            ref={lenisRef}
            root
            options={{
                autoRaf: false,
                duration: 1.15,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                syncTouch: false,
                allowNestedScroll: true,
                anchors: true,
            }}
        >
            {children}
        </ReactLenis>
    )
}

