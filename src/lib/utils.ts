import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Block {
  _type: string
  children?: { text?: string }[]
}

export function calculateReadingTime(body: Block[] | unknown[] | undefined): number {
  if (!body) return 1
  let wordCount = 0
  for (const block of body as Block[]) {
    if (block._type === 'block' && block.children) {
      for (const child of block.children) {
        if (child.text) {
          wordCount += child.text.split(/\s+/).filter(Boolean).length
        }
      }
    }
  }
  return Math.max(1, Math.ceil(wordCount / 200))
}
