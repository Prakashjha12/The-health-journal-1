"use client"

import * as React from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import gsap from "gsap"
import "lenis/dist/lenis.css"

interface SmoothScrollProviderProps {
    children: React.ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    const lenisRef = React.useRef<LenisRef>(null)

    React.useEffect(() => {
        // Synchronize Lenis raf loop with GSAP's optimized ticker
        function update(time: number) {
            lenisRef.current?.lenis?.raf(time * 1000)
        }

        gsap.ticker.add(update)
        gsap.ticker.lagSmoothing(0)

        return () => {
            gsap.ticker.remove(update)
        }
    }, [])

    return (
        <ReactLenis
            ref={lenisRef}
            root
            options={{
                autoRaf: false,
                duration: 1.15,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                syncTouch: false, // Preserves natural responsive mobile touch momentum
                allowNestedScroll: true,
                anchors: true,
            }}
        >
            {children}
        </ReactLenis>
    )
}
