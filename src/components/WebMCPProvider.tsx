"use client"

import { useEffect } from "react"

export function WebMCPProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const nav = navigator as unknown as { agent?: { registerTool?: (tool: unknown) => void } }
      const win = window as unknown as { webmcp?: { registerTool?: (tool: unknown) => void } }
      const register = win.webmcp?.registerTool?.bind(win.webmcp) || nav.agent?.registerTool?.bind(nav.agent)
      if (typeof register === "function") {
        try {
          register({
            name: "search_articles",
            description: "Search peer-reviewed medical and wellness articles on The Health Journal by health topic, symptom, or condition",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Medical topic, condition, symptom, or wellness keyword",
                },
              },
              required: ["query"],
            },
            execute: async ({ query }: { query: string }) => {
              const res = await fetch(`/api/tools/search?query=${encodeURIComponent(query)}`)
              return await res.json()
            },
          })
        } catch (err) {
          console.warn("WebMCP registration notice:", err)
        }
      }
    }
  }, [])

  return null
}
