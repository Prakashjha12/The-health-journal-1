const usernameArg = process.argv[2] ?? "docofphysio"

const secretKey = process.env.CLERK_SECRET_KEY
if (!secretKey) {
  console.error("Missing CLERK_SECRET_KEY in environment.")
  process.exit(1)
}

async function clerkFetch(path, init = {}) {
  const url = new URL(`https://api.clerk.com/v1/${path.replace(/^\/+/, "")}`)
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Clerk API error (${res.status}): ${text || res.statusText}`)
  }

  if (res.status === 204) return null
  return await res.json()
}

async function findUserByUsername(username) {
  const list = await clerkFetch(
    `users?limit=10&username=${encodeURIComponent(username)}`
  )
  if (Array.isArray(list) && list.length > 0) return list[0]

  // Fallback: Clerk "query" search (covers username/email/name depending on account settings)
  const queryList = await clerkFetch(
    `users?limit=10&query=${encodeURIComponent(username)}`
  )
  if (Array.isArray(queryList) && queryList.length > 0) return queryList[0]

  return null
}

const user = await findUserByUsername(usernameArg)
if (!user) {
  console.error(`No Clerk user found for "${usernameArg}".`)
  process.exit(1)
}

const publicMetadata = user.public_metadata ?? {}
const nextPublicMetadata = {
  ...publicMetadata,
  role: "admin",
  isSuperUser: true,
}

await clerkFetch(`users/${encodeURIComponent(user.id)}/metadata`, {
  method: "PATCH",
  body: JSON.stringify({
    public_metadata: nextPublicMetadata,
  }),
})

console.log(
  `Super user set for ${usernameArg} (${user.id}). publicMetadata.role=admin, isSuperUser=true`
)
