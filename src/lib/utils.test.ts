import { describe, it, expect } from 'vitest'
import { calculateReadingTime, cn } from './utils'

describe('calculateReadingTime', () => {
  it('returns 1 for empty or missing body', () => {
    expect(calculateReadingTime(undefined)).toBe(1)
    expect(calculateReadingTime([])).toBe(1)
  })

  it('calculates reading time at approximately 200 words per minute', () => {
    const text200Words = Array(200).fill('health').join(' ')
    const body = [
      {
        _type: 'block',
        children: [{ text: text200Words }],
      },
    ]
    expect(calculateReadingTime(body)).toBe(1)

    const text500Words = Array(500).fill('medical').join(' ')
    const longBody = [
      {
        _type: 'block',
        children: [{ text: text500Words }],
      },
    ]
    expect(calculateReadingTime(longBody)).toBe(3)
  })

  it('safely handles non-block elements', () => {
    const mixedBody = [
      { _type: 'image', asset: {} },
      { _type: 'block', children: [{ text: 'Hello world' }] },
    ]
    expect(calculateReadingTime(mixedBody)).toBe(1)
  })
})

describe('cn', () => {
  it('combines class names and merges tailwind conflicts', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', false && 'text-blue-500', undefined)).toBe('text-red-500')
  })
})
