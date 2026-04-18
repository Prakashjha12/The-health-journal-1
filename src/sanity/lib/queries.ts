import { groq } from 'next-sanity'

export const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  _createdAt,
  image,
  categories[]->{ title },
  author->{
    name,
    "slug": slug.current,
    image,
    bio,
    profession,
    specializedIn,
    experience,
    linkedin,
    twitter,
    instagram,
    website
  },
  body
}`

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  summary,
  slug,
  publishedAt,
  _createdAt,
  _updatedAt,
  image,
  categories[]->{ title },
  author->{
    name,
    "slug": slug.current,
    image,
    bio,
    profession,
    specializedIn,
    experience,
    linkedin,
    twitter,
    instagram,
    website
  },
  reviewer->{
    name,
    "slug": slug.current,
    image,
    bio,
    profession,
    specializedIn,
    experience,
    linkedin,
    twitter,
    instagram,
    website
  },
  body,
  faqs[] {
    question,
    answer
  },
  tags
}`

export const recentPostsQuery = groq`*[_type == "post" && defined(slug.current) && slug.current != $slug] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  publishedAt,
  _createdAt,
  image,
  categories[]->{ title },
  author->{
    name,
    image
  },
  body
}`

export const searchPostsQuery = groq`*[_type == "post" && defined(slug.current) && 
  ($query == "" || title match $query + "*" || summary match $query + "*" || pt::text(body) match $query + "*") &&
  ($category == "All" || $category in categories[]->title)
] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  _createdAt,
  image,
  categories[]->{ title },
  body
}`

export const authorBySlugQuery = groq`*[_type == "author" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  image,
  bio,
  profession,
  specializedIn,
  experience,
  linkedin,
  twitter,
  instagram,
  website,
  "posts": *[_type == "post" && references(^._id)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    _createdAt,
    image,
    categories[]->{ title },
    body
  }
}`

export const allPostsQuery = groq`*[_type == "post" && defined(slug.current)] {
  slug,
  _updatedAt,
  publishedAt
}`

