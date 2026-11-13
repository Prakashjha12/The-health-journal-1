import { describe, it, expect } from 'vitest'
import { portableTextToMarkdown } from './portabletext-to-markdown'

describe('portableTextToMarkdown', () => {
  describe('empty and invalid input handling', () => {
    it('returns empty string for null, undefined, and non-array inputs', () => {
      expect(portableTextToMarkdown(null)).toBe('')
      expect(portableTextToMarkdown(undefined)).toBe('')
      expect(portableTextToMarkdown('')).toBe('')
      expect(portableTextToMarkdown(123)).toBe('')
      expect(portableTextToMarkdown({})).toBe('')
      expect(portableTextToMarkdown([])).toBe('')
    })

    it('ignores non-block elements safely', () => {
      const input = [
        { _type: 'image', asset: { _ref: 'image-ref' } },
        { _type: 'customWidget', data: { id: 1 } },
      ]
      expect(portableTextToMarkdown(input)).toBe('')
    })

    it('skips empty text blocks', () => {
      const input = [
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: '   ' }] },
      ]
      expect(portableTextToMarkdown(input)).toBe('')
    })
  })

  describe('paragraph conversion', () => {
    it('converts normal text blocks to paragraphs', () => {
      const input = [
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: 'This is the first paragraph.' }],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: 'This is the second paragraph.' }],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe(
        'This is the first paragraph.\n\nThis is the second paragraph.'
      )
    })

    it('joins multiple spans within a block', () => {
      const input = [
        {
          _type: 'block',
          style: 'normal',
          children: [
            { _type: 'span', text: 'Hello ' },
            { _type: 'span', text: 'world from Health Journal!' },
          ],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe('Hello world from Health Journal!')
    })
  })

  describe('heading conversion', () => {
    it('converts h1, h2, h3, and h4 headings', () => {
      const input = [
        {
          _type: 'block',
          style: 'h1',
          children: [{ _type: 'span', text: 'Main Title' }],
        },
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Section Heading' }],
        },
        {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: 'Sub-section' }],
        },
        {
          _type: 'block',
          style: 'h4',
          children: [{ _type: 'span', text: 'Minor Heading' }],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe(
        '# Main Title\n\n## Section Heading\n\n### Sub-section\n\n#### Minor Heading'
      )
    })
  })

  describe('blockquote conversion', () => {
    it('formats single and multiline blockquotes', () => {
      const input = [
        {
          _type: 'block',
          style: 'blockquote',
          children: [{ _type: 'span', text: 'Prevention is better than cure.' }],
        },
        {
          _type: 'block',
          style: 'blockquote',
          children: [{ _type: 'span', text: 'Line one\nLine two' }],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe(
        '> Prevention is better than cure.\n\n> Line one\n> Line two'
      )
    })
  })

  describe('marks formatting (bold, italic, code, links)', () => {
    it('formats strong (bold) text', () => {
      const input = [
        {
          _type: 'block',
          style: 'normal',
          children: [
            { _type: 'span', text: 'This is ' },
            { _type: 'span', text: 'bold', marks: ['strong'] },
            { _type: 'span', text: ' text.' },
          ],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe('This is **bold** text.')
    })

    it('formats em (italic) text', () => {
      const input = [
        {
          _type: 'block',
          style: 'normal',
          children: [
            { _type: 'span', text: 'This is ' },
            { _type: 'span', text: 'italic', marks: ['em'] },
            { _type: 'span', text: ' text.' },
          ],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe('This is *italic* text.')
    })

    it('formats code text', () => {
      const input = [
        {
          _type: 'block',
          style: 'normal',
          children: [
            { _type: 'span', text: 'Check the ' },
            { _type: 'span', text: 'glucoseLevel', marks: ['code'] },
            { _type: 'span', text: ' variable.' },
          ],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe('Check the `glucoseLevel` variable.')
    })

    it('formats combined bold and italic marks', () => {
      const input = [
        {
          _type: 'block',
          style: 'normal',
          children: [
            { _type: 'span', text: 'Crucial', marks: ['strong', 'em'] },
            { _type: 'span', text: ' health note.' },
          ],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe('***Crucial*** health note.')
    })

    it('formats hyperlinks using markDefs', () => {
      const input = [
        {
          _type: 'block',
          style: 'normal',
          markDefs: [
            {
              _key: 'link-123',
              _type: 'link',
              href: 'https://thehealthjournal.in/about',
            },
          ],
          children: [
            { _type: 'span', text: 'Read ' },
            {
              _type: 'span',
              text: 'about our team',
              marks: ['link-123'],
            },
            { _type: 'span', text: ' here.' },
          ],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe(
        'Read [about our team](https://thehealthjournal.in/about) here.'
      )
    })

    it('formats bold text inside links', () => {
      const input = [
        {
          _type: 'block',
          style: 'normal',
          markDefs: [
            {
              _key: 'link-456',
              _type: 'link',
              href: 'https://thehealthjournal.in',
            },
          ],
          children: [
            {
              _type: 'span',
              text: 'Visit Home',
              marks: ['strong', 'link-456'],
            },
          ],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe('[**Visit Home**](https://thehealthjournal.in)')
    })
  })

  describe('list formatting', () => {
    it('formats bullet lists with *', () => {
      const input = [
        {
          _type: 'block',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Heart rate monitoring' }],
        },
        {
          _type: 'block',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Blood pressure tracking' }],
        },
        {
          _type: 'block',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Daily physical activity' }],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe(
        '* Heart rate monitoring\n* Blood pressure tracking\n* Daily physical activity'
      )
    })

    it('formats numbered lists sequentially starting at 1.', () => {
      const input = [
        {
          _type: 'block',
          listItem: 'number',
          children: [{ _type: 'span', text: 'Initial consultation' }],
        },
        {
          _type: 'block',
          listItem: 'number',
          children: [{ _type: 'span', text: 'Diagnostic imaging' }],
        },
        {
          _type: 'block',
          listItem: 'number',
          children: [{ _type: 'span', text: 'Rehabilitation therapy' }],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe(
        '1. Initial consultation\n2. Diagnostic imaging\n3. Rehabilitation therapy'
      )
    })

    it('resets number counter after a non-number block', () => {
      const input = [
        {
          _type: 'block',
          listItem: 'number',
          children: [{ _type: 'span', text: 'First phase' }],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: 'Intermission paragraph' }],
        },
        {
          _type: 'block',
          listItem: 'number',
          children: [{ _type: 'span', text: 'Second phase step 1' }],
        },
      ]
      expect(portableTextToMarkdown(input)).toBe(
        '1. First phase\n\nIntermission paragraph\n\n1. Second phase step 1'
      )
    })
  })
})
