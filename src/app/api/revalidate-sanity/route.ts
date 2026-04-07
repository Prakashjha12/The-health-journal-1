import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

type WebhookPayload = {
  _type: string
  slug?: {
    current?: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    )

    if (!isValidSignature) {
      return new Response('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new Response('Bad Request', { status: 400 })
    }

    if (body._type === 'post') {
      // Revalidate post listing + specific post page cache tag.
      // @ts-expect-error - Next.js 16 type definitions expect a second profile argument
      revalidateTag('posts')
      if (body.slug?.current) {
        // @ts-expect-error - Next.js 16 type definitions expect a second profile argument
        revalidateTag(`post:${body.slug.current}`)
      }
    } else {
      // Keep previous behavior for non-post document types.
      // @ts-expect-error - Next.js 16 type definitions expect a second profile argument
      revalidateTag(body._type)
    }

    return NextResponse.json({ 
      status: 200, 
      revalidated: true, 
      now: Date.now(), 
      type: body._type 
    })
  } catch (err: any) {
    console.error(err)
    return new Response(err.message, { status: 500 })
  }
}
