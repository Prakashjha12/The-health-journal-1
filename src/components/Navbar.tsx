"use client"

import * as React from "react"
import { Menu, X, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
import Image from "next/image"
import { UserButton, useAuth, useUser } from "@clerk/nextjs"

function SignedIn({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth()
    if (!isLoaded || !isSignedIn) return null
    return <>{children}</>
}

function SignedOut({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth()
    if (!isLoaded || isSignedIn) return null
    return <>{children}</>
}

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)
    const toggleMenu = React.useCallback(() => setIsMenuOpen(prev => !prev), [])

    const { user } = useUser()
    const isSuperUser = !!(
        user?.publicMetadata?.role === "admin" ||
        user?.publicMetadata?.isSuperUser === true
    )

    const menuItems = [
        { name: 'Home', href: '/' },
        { name: 'Articles', href: '/#articles' },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
            <div className="max-w-[1200px] mx-auto px-6 flex h-14 items-center justify-between relative" suppressHydrationWarning>
                <div className="flex items-center" suppressHydrationWarning>
                    <Link href="/" className="flex items-center space-x-2.5" suppressHydrationWarning>
                        <div className="relative h-8 w-8 flex items-center justify-center shrink-0 rounded-md overflow-hidden" suppressHydrationWarning>
                            <Image src="/LOGO.webp" alt="The Health Journal" width={32} height={32} className="object-contain" priority />
                        </div>
                        <span className="font-bold text-base tracking-loose">The  <span className="dark:text-white text-[#032660] font-extralight text-2xl uppercase hover:font-extrabold transition-all duration-300  hover:text-[#032660]"> Health </span> Journal</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-5">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <SignedIn>
                        {isSuperUser && (
                            <>
                                <Link
                                    href="/studio"
                                    className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Add/Edit-Blogs
                                </Link>
                                <Link
                                    href="https://www.sanity.io/@oNjfe3kMn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Sanity Dashboard
                                </Link>
                            </>
                        )}
                    </SignedIn>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />

                    <SignedOut>
                        <Link href="/sign-in">
                            <Button variant="ghost" size="sm" className="text-[13px] font-medium">Sign In</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button size="sm" className="text-[13px] font-medium">Sign Up</Button>
                        </Link>
                    </SignedOut>

                    <SignedIn>
                        <UserButton>
                            <UserButton.MenuItems>
                                <UserButton.Link
                                    label="My Saved Blogs"
                                    href="/dashboard/saved-articles"
                                    labelIcon={<Bookmark className="h-4 w-4" />}
                                />
                                {isSuperUser && (
                                    <UserButton.Link
                                        label="Add/Edit-Blogs"
                                        href="/studio"
                                        labelIcon={<Bookmark className="h-4 w-4" />}
                                    />
                                )}
                                {isSuperUser && (
                                    <UserButton.Link
                                        label="Sanity Dashboard"
                                        href="https://www.sanity.io/@oNjfe3kMn"
                                        labelIcon={<Bookmark className="h-4 w-4" />}
                                    />
                                )}
                            </UserButton.MenuItems>
                        </UserButton>
                    </SignedIn>
                </div>

                <div className="flex md:hidden items-center gap-1">
                    <ThemeToggle />
                    <button className="p-2" onClick={toggleMenu} aria-label="Toggle menu">
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <nav className="flex flex-col divide-y divide-border/50">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={toggleMenu}
                                className="flex items-center justify-between px-6 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                            >
                                {item.name}
                                <span className="text-muted-foreground/40">›</span>
                            </Link>
                        ))}
                        <SignedIn>
                            <Link
                                href="/dashboard/saved-articles"
                                onClick={toggleMenu}
                                className="flex items-center justify-between px-6 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                            >
                                My Saved Blogs
                                <span className="text-muted-foreground/40">›</span>
                            </Link>
                            {isSuperUser && (
                                <>
                                    <Link
                                        href="/studio"
                                        onClick={toggleMenu}
                                        className="flex items-center justify-between px-6 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                                    >
                                        Add/Edit-Blogs
                                        <span className="text-muted-foreground/40">›</span>
                                    </Link>
                                    <Link
                                        href="https://www.sanity.io/@oNjfe3kMn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={toggleMenu}
                                        className="flex items-center justify-between px-6 py-3.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                                    >
                                        Sanity Dashboard
                                        <span className="text-muted-foreground/40">›</span>
                                    </Link>
                                </>
                            )}
                        </SignedIn>
                    </nav>
                    {/* Account row */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <span className="text-xs text-muted-foreground font-medium">Account</span>
                        <div className="flex items-center gap-3">
                            <SignedOut>
                                <Link href="/sign-in">
                                    <Button variant="outline" size="sm" className="text-xs h-8">Sign In</Button>
                                </Link>
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

