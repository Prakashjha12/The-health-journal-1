import { groq } from 'next-sanity'

export const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc)`

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0]`

export const recentPostsQuery = groq`*[_type == "post" && defined(slug.current) && slug.current != $slug] | order(publishedAt desc)[0...3]`
