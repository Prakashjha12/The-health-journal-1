"use client"

import * as React from "react"
import { Stethoscope, Menu, X, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
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
            <div className="max-w-[1200px] mx-auto px-6 flex h-14 items-center justify-between" suppressHydrationWarning>
                <div className="flex items-center gap-8" suppressHydrationWarning>
                    <Link href="/" className="flex items-center space-x-2.5" suppressHydrationWarning>
                        <div className="h-8 w-8 rounded-md bg-foreground flex items-center justify-center" suppressHydrationWarning>
                            <Stethoscope className="h-4 w-4 text-background" />
                        </div>
                        <span className="font-bold text-base tracking-tight">The Health Journal</span>
                    </Link>
                    <nav className="hidden md:flex gap-5">
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
                            <Link
                                href="/dashboard"
                                className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Dashboard
                            </Link>
                        </SignedIn>
                    </nav>
                </div>

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
                            </UserButton.MenuItems>
                        </UserButton>
                    </SignedIn>
                </div>

                <button className="flex md:hidden p-2" onClick={toggleMenu} aria-label="Toggle menu">
                    {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            onClick={toggleMenu}
                            className="block text-sm text-muted-foreground hover:text-foreground py-1.5"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <SignedIn>
                        <Link
                            href="/dashboard"
                            onClick={toggleMenu}
                            className="block text-sm text-muted-foreground hover:text-foreground py-1.5"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/saved-articles"
                            onClick={toggleMenu}
                            className="block text-sm text-muted-foreground hover:text-foreground py-1.5"
                        >
                            My Saved Blogs
                        </Link>
                        {isSuperUser && (
                            <Link
                                href="/studio"
                                onClick={toggleMenu}
                                className="block text-sm text-muted-foreground hover:text-foreground py-1.5"
                            >
                                CMS
                            </Link>
                        )}
                    </SignedIn>
                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                        <ThemeToggle />
                        <SignedOut>
                            <Link href="/sign-in">
                                <Button variant="outline" size="sm" className="text-xs">Sign In</Button>
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            )}
        </header>
    )
}

