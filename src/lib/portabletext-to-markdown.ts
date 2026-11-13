export interface PortableTextMarkDef {
  _key: string
  _type: string
  href?: string
  [key: string]: unknown
}

export interface PortableTextSpan {
  _key?: string
  _type?: string
  text?: string
  marks?: string[]
  [key: string]: unknown
}

export interface PortableTextBlock {
  _key?: string
  _type: string
  style?: string
  children?: PortableTextSpan[]
  markDefs?: PortableTextMarkDef[]
  listItem?: 'bullet' | 'number' | string
  level?: number
  [key: string]: unknown
}

function formatSpan(span: unknown, markDefs: PortableTextMarkDef[] = []): string {
  if (!span || typeof span !== 'object') return ''
  const s = span as PortableTextSpan
  let text = typeof s.text === 'string' ? s.text : ''
  if (!text) return ''

  const marks = Array.isArray(s.marks) ? s.marks : []
  if (marks.length === 0) return text

  // 1. Code
  if (marks.includes('code')) {
    text = `\`${text}\``
  }
  // 2. Italic / Emphasis
  if (marks.includes('em')) {
    text = `*${text}*`
  }
  // 3. Bold / Strong
  if (marks.includes('strong')) {
    text = `**${text}**`
  }
  // 4. Link markDef
  for (const mark of marks) {
    const def = markDefs.find((d) => d._key === mark)
    if (def && typeof def.href === 'string') {
      text = `[${text}](${def.href})`
      break
    }
  }

  return text
}

export function portableTextToMarkdown(blocks: unknown): string {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return ''
  }

  const output: string[] = []
  let prevWasList = false
  let numberIndex = 1

  for (const rawBlock of blocks) {
    if (!rawBlock || typeof rawBlock !== 'object') continue
    const block = rawBlock as PortableTextBlock

    // Only process _type === 'block'
    if (block._type !== 'block') continue

    const markDefs = Array.isArray(block.markDefs) ? block.markDefs : []
    const spans = Array.isArray(block.children) ? block.children : []
    const inlineContent = spans.map((span) => formatSpan(span, markDefs)).join('')

    // Skip empty blocks that are not list items
    if (!inlineContent.trim() && !block.listItem) {
      continue
    }

    const isBullet = block.listItem === 'bullet'
    const isNumber = block.listItem === 'number'
    const isListItem = Boolean(block.listItem)

    let blockText = ''

    if (isListItem) {
      const indent =
        typeof block.level === 'number' && block.level > 1
          ? '  '.repeat(block.level - 1)
          : ''

      if (isBullet) {
        blockText = `${indent}* ${inlineContent.trim()}`
        numberIndex = 1
      } else if (isNumber) {
        blockText = `${indent}${numberIndex}. ${inlineContent.trim()}`
        numberIndex++
      } else {
        blockText = `${indent}* ${inlineContent.trim()}`
        numberIndex = 1
      }
    } else {
      numberIndex = 1
      const style = block.style || 'normal'
      switch (style) {
        case 'h1':
          blockText = `# ${inlineContent.trim()}`
          break
        case 'h2':
          blockText = `## ${inlineContent.trim()}`
          break
        case 'h3':
          blockText = `### ${inlineContent.trim()}`
          break
        case 'h4':
          blockText = `#### ${inlineContent.trim()}`
          break
        case 'h5':
          blockText = `##### ${inlineContent.trim()}`
          break
        case 'h6':
          blockText = `###### ${inlineContent.trim()}`
          break
        case 'blockquote':
          blockText = inlineContent
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n')
          break
        case 'normal':
        default:
          blockText = inlineContent.trim()
          break
      }
    }

    if (!blockText) continue

    if (output.length === 0) {
      output.push(blockText)
    } else {
      // If current is list and previous was list, join with single newline
      if (isListItem && prevWasList) {
        output[output.length - 1] += `\n${blockText}`
      } else {
        output.push(blockText)
      }
    }

    prevWasList = isListItem
  }

  return output.join('\n\n')
}
