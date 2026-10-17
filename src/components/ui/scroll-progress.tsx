"use client"

import * as React from "react"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react"

import { cn } from "@/lib/utils"

export type ScrollProgressSection = { id: string; label: string }

const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const
const EASE_OUT = [0.22, 1, 0.36, 1] as const
const SIZE_SPRING = { type: "spring", bounce: 0.16, duration: 0.5 } as const
const LABEL_CROSSFADE = { duration: 0.22, ease: EASE_OUT } as const
const LAYER_FADE = { duration: 0.24, ease: EASE_IN_OUT } as const

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

type Size = { width: number; height: number }

export type ScrollProgressProps = React.ComponentProps<"div"> & {
  sections?: ScrollProgressSection[]
  containerRef?: React.RefObject<HTMLElement | null>
  offset?: number | "center"
}

const ScrollProgress = ({
  className,
  sections = [],
  containerRef,
  offset = "center",
  ...props
}: ScrollProgressProps) => {
  const layoutId = React.useId()
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : undefined
  )
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  })

  const [activeId, setActiveId] = React.useState(sections[0]?.id)
  const [open, setOpen] = React.useState(false)

  const scrollLock = React.useRef(false)
  const scrollLockTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => {
    const scroller = containerRef?.current ?? window

    const update = () => {
      if (scrollLock.current) return
      const containerHeight = containerRef?.current
        ? containerRef.current.clientHeight
        : window.innerHeight
      const containerTop =
        containerRef?.current?.getBoundingClientRect().top ?? 0
      const anchorOffset =
        offset === "center" ? containerHeight / 2 : offset
      const anchor = containerTop + anchorOffset

      const active = sections.findLast(({ id }) => {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        return top !== undefined && top <= anchor
      })
      setActiveId(active?.id ?? sections[0]?.id)
    }

    update()
    scroller.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      scroller.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [sections, containerRef, offset])

  const label = sections.find((s) => s.id === activeId)?.label


  const collapsedRef = React.useRef<HTMLDivElement>(null)
  const openRef = React.useRef<HTMLDivElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const [collapsedSize, setCollapsedSize] = React.useState<Size>()
  const [openSize, setOpenSize] = React.useState<Size>()
  const [labelWidth, setLabelWidth] = React.useState<number>()

  useIsoLayoutEffect(() => {
    const measure = () => {
      const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768
      const maxMobileLabelWidth = typeof window !== "undefined"
        ? Math.max(120, window.innerWidth - 110)
        : 260
      const maxMobilePillWidth = typeof window !== "undefined"
        ? Math.max(160, window.innerWidth - 32)
        : 320

      if (labelRef.current) {
        const naturalWidth = Math.ceil(labelRef.current.getBoundingClientRect().width)
        const finalWidth = isDesktop ? naturalWidth : Math.min(naturalWidth, maxMobileLabelWidth)
        setLabelWidth(finalWidth)
      }
      if (collapsedRef.current) {
        const naturalWidth = Math.ceil(collapsedRef.current.getBoundingClientRect().width)
        const finalWidth = isDesktop ? naturalWidth : Math.min(naturalWidth, maxMobilePillWidth)
        setCollapsedSize({
          width: finalWidth,
          height: Math.ceil(collapsedRef.current.getBoundingClientRect().height),
        })
      }
      if (openRef.current) {
        const naturalWidth = Math.ceil(openRef.current.getBoundingClientRect().width)
        const finalWidth = isDesktop ? naturalWidth : Math.min(naturalWidth, maxMobilePillWidth)
        setOpenSize({
          width: finalWidth,
          height: Math.ceil(openRef.current.getBoundingClientRect().height),
        })
      }
    }

    measure()
    const ro = new ResizeObserver(measure)
    if (labelRef.current) ro.observe(labelRef.current)
    if (collapsedRef.current) ro.observe(collapsedRef.current)
    if (openRef.current) ro.observe(openRef.current)
    document.fonts?.ready.then(measure).catch(() => {})
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [sections, label])

  React.useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  React.useEffect(() => () => clearTimeout(scrollLockTimer.current), [])

  const selectSection = (id: string) => {
    scrollLock.current = true
    clearTimeout(scrollLockTimer.current)
    scrollLockTimer.current = setTimeout(
      () => {
        scrollLock.current = false
      },
      reduceMotion ? 0 : 700
    )

    setActiveId(id)
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    })
  }

  const size = open ? openSize : collapsedSize
  const radius = open ? 28 : (collapsedSize?.height ?? 36) / 2
  const squircle = "[corner-shape:squircle]"

  return (
    <div
      ref={rootRef}
      data-slot="scroll-progress"
      className={cn("fixed bottom-6 left-1/2 z-50 -translate-x-1/2 md:bottom-8 max-w-[calc(100vw-2rem)] md:max-w-none", className)}
      {...props}
    >
      <div className="pointer-events-none invisible absolute left-0 top-0" aria-hidden>
        <div
          ref={collapsedRef}
          className="inline-flex items-center gap-2.5 py-1.5 pl-2 pr-4 md:gap-3.5 md:py-2.5 md:pl-3.5 md:pr-5 whitespace-nowrap"
        >
          <span className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
          <span
            ref={labelRef}
            className="whitespace-nowrap text-sm font-medium leading-none md:text-[15px] md:font-semibold"
          >
            {label}
          </span>
        </div>
        <div ref={openRef} className="w-max p-1.5 md:p-2 whitespace-nowrap">
          {sections.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium leading-none md:gap-3.5 md:px-4 md:py-2.5 md:text-[15px] whitespace-nowrap"
            >
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 shrink-0" />
              <span className="whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {size && (
        <motion.div
          data-slot="scroll-progress-surface"
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 overflow-hidden border border-border/60 bg-background/70 shadow-lg backdrop-blur-md max-w-[calc(100vw-2rem)] md:max-w-none",
            squircle
          )}
          initial={false}
          animate={{
            width: size.width,
            height: size.height,
            borderRadius: radius,
          }}
          transition={reduceMotion ? { duration: 0 } : SIZE_SPRING}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {open ? (
              <motion.ul
                key="list"
                className="absolute inset-0 flex flex-col p-1.5 md:p-2 overflow-y-auto max-h-[65vh]"
                initial={{
                  opacity: 0,
                  filter: reduceMotion ? undefined : "blur(4px)",
                }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  filter: reduceMotion ? undefined : "blur(4px)",
                }}
                transition={LAYER_FADE}
              >
                {sections.map((s, i) => {
                  const isActive = s.id === activeId
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => selectSection(s.id)}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left text-sm font-medium leading-none transition-colors md:gap-3.5 md:px-4 md:py-2.5 md:text-[15px] md:rounded-[16px] max-w-full overflow-hidden",
                          squircle,
                          isActive
                            ? "text-foreground"
                            : "text-foreground/55 hover:text-foreground/80"
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId={`${layoutId}-active`}
                            className={cn(
                              "absolute inset-0 rounded-[14px] md:rounded-[16px] bg-foreground/10",
                              squircle
                            )}
                            transition={
                              reduceMotion ? { duration: 0 } : SIZE_SPRING
                            }
                          />
                        )}
                        <motion.span
                          className={cn(
                            "relative h-1.5 w-1.5 md:h-2 md:w-2 shrink-0 rounded-full",
                            isActive ? "bg-foreground" : "bg-foreground/30"
                          )}
                          initial={
                            reduceMotion
                              ? undefined
                              : { opacity: 0, y: 4, filter: "blur(3px)" }
                          }
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{
                            duration: 0.3,
                            ease: EASE_IN_OUT,
                            delay: reduceMotion ? 0 : 0.04 + i * 0.03,
                          }}
                        />
                        <motion.span
                          className="relative whitespace-nowrap truncate max-w-[calc(100vw-120px)] md:max-w-none"
                          initial={
                            reduceMotion
                              ? undefined
                              : { opacity: 0, y: 4, filter: "blur(3px)" }
                          }
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{
                            duration: 0.3,
                            ease: EASE_IN_OUT,
                            delay: reduceMotion ? 0 : 0.04 + i * 0.03,
                          }}
                        >
                          {s.label}
                        </motion.span>
                      </button>
                    </li>
                  )
                })}
              </motion.ul>
            ) : (
              <motion.button
                key="pill"
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Show sections"
                className="absolute inset-0 flex items-center gap-2.5 py-1.5 pl-2 pr-4 md:gap-3.5 md:py-2.5 md:pl-3.5 md:pr-5"
                initial={{
                  opacity: 0,
                  filter: reduceMotion ? undefined : "blur(4px)",
                }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  filter: reduceMotion ? undefined : "blur(4px)",
                }}
                transition={LAYER_FADE}
              >
                <span className="shrink-0">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6 -rotate-90" aria-hidden>
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      strokeWidth="2.5"
                      className="stroke-foreground/15"
                    />
                    <motion.circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="stroke-foreground"
                      style={{ pathLength: progress }}
                    />
                  </svg>
                </span>

                <span
                  className="relative h-5 md:h-6 shrink-0 flex items-center overflow-hidden"
                  style={{ width: labelWidth }}
                >
                  <AnimatePresence initial={false}>
                    {label && (
                      <motion.span
                        key={label}
                        data-slot="scroll-progress-label"
                        className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-sm font-medium leading-none md:text-[15px] md:font-semibold text-foreground w-full truncate"
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, filter: "blur(1.5px)" }
                        }
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, filter: "blur(1.5px)" }
                        }
                        transition={LABEL_CROSSFADE}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export { ScrollProgress }
export default ScrollProgress
