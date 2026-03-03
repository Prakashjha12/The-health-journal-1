import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const basicAuth = request.headers.get('authorization')

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1]
        const [user, pwd] = atob(authValue).split(':')

        if (
            user === process.env.ADMIN_USER &&
            pwd === process.env.ADMIN_PASS
        ) {
            return NextResponse.next()
        }
    }

    return new NextResponse(
        `<html>
      <body style="font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; background: #fafafa; color: #18181b;">
        <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">Login!</h1>
        <p style="color: #71717a; margin-bottom: 2rem;">Studio CMS access requires authentication.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #000; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Log In
        </button>
      </body>
    </html>`,
        {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Studio CMS Area"',
                'content-type': 'text/html',
            },
        }
    )
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/studio/:path*',
}
