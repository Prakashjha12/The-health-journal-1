import { SignIn } from "@clerk/nextjs"
import { Metadata } from "next"

// THIS IS THE FIX: It tells all search engines to ignore this page
export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
}

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
            <div className="max-w-md w-full space-y-8">
                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200',
                            card: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl',
                            headerTitle: 'text-zinc-900 dark:text-zinc-50',
                            headerSubtitle: 'text-zinc-500 dark:text-zinc-400',
                            socialButtonsBlockButton: 'border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800',
                            dividerLine: 'bg-zinc-200 dark:bg-zinc-800',
                            dividerText: 'text-zinc-500 dark:text-zinc-400',
                            formFieldLabel: 'text-zinc-700 dark:text-zinc-300',
                            formFieldInput: 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-50',
                            footerActionText: 'text-zinc-500 dark:text-zinc-400',
                            footerActionLink: 'text-zinc-900 dark:text-zinc-50 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }
                    }}
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                />
            </div>
        </div>
    )
}
