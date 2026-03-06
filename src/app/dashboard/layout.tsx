import { Navbar } from "@/components/Navbar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1 bg-zinc-50 dark:bg-black py-10 px-6 sm:px-8 lg:px-12">
                <div className="max-w-[1200px] mx-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}
