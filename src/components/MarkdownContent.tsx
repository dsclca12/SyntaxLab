import { useState, type ReactNode } from 'react'

type Block = { kind: 'heading'; depth: number; text: string } | { kind: 'code'; text: string } | { kind: 'table'; rows: string[][] } | { kind: 'list'; ordered: boolean; items: string[] } | { kind: 'paragraph'; text: string } | { kind: 'rule' }

const inline = (text: string): ReactNode[] => text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
  if (part.startsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>
  if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
  return part
})

const parse = (source: string): Block[] => {
  const lines = source.replace(/\r/g, '').split('\n')
  const blocks: Block[] = []
  for (let i = 0; i < lines.length;) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    if (line.startsWith('```') || line.startsWith('~~~')) { const fence = line.slice(0, 3); const code: string[] = []; i++; while (i < lines.length && !lines[i].startsWith(fence)) code.push(lines[i++]); i++; blocks.push({ kind: 'code', text: code.join('\n') }); continue }
    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    if (heading) { blocks.push({ kind: 'heading', depth: heading[1].length, text: heading[2] }); i++; continue }
    if (/^---+$/.test(line)) { blocks.push({ kind: 'rule' }); i++; continue }
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) { const rows: string[][] = []; const addRow = (value: string) => rows.push(value.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())); addRow(line); i += 2; while (i < lines.length && lines[i].includes('|')) addRow(lines[i++]); blocks.push({ kind: 'table', rows }); continue }
    const list = line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/)
    if (list) { const ordered = Boolean(list[2]); const items: string[] = []; while (i < lines.length) { const item = lines[i].match(/^\s*(?:[-*+]|(\d+)\.)\s+(.+)$/); if (!item || Boolean(item[1]) !== ordered) break; items.push(item[2]); i++ } blocks.push({ kind: 'list', ordered, items }); continue }
    const paragraph = [line]; i++; while (i < lines.length && lines[i].trim() && !/^(#{1,4})\s|^```|^~~~|^---+$|^\s*(?:[-*+]|\d+\.)\s+/.test(lines[i])) paragraph.push(lines[i++]); blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
  }
  return blocks
}

export function MarkdownContent({ source }: { source: string }) {
  const [copied, setCopied] = useState<number | null>(null)
  const copyCode = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(index)
      window.setTimeout(() => setCopied((current) => current === index ? null : current), 1600)
    } catch {
      // Clipboard access can be unavailable in an insecure preview. The code remains selectable.
    }
  }
  return <div className="markdown-content">{parse(source).map((block, index) => {
    if (block.kind === 'heading') { const Tag = (`h${Math.min(block.depth + 1, 4)}`) as 'h2'; return <Tag key={index}>{inline(block.text)}</Tag> }
    if (block.kind === 'code') return <div className="markdown-code" key={index}><button type="button" onClick={() => copyCode(block.text, index)}>{copied === index ? '已复制' : '复制'}</button><pre><code>{block.text}</code></pre></div>
    if (block.kind === 'rule') return <hr key={index} />
    if (block.kind === 'table') return <div className="markdown-table-wrap" key={index}><table><thead><tr>{block.rows[0].map((cell, cellIndex) => <th key={cellIndex}>{inline(cell)}</th>)}</tr></thead><tbody>{block.rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{inline(cell)}</td>)}</tr>)}</tbody></table></div>
    if (block.kind === 'list') { const Tag = block.ordered ? 'ol' : 'ul'; return <Tag key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>)}</Tag> }
    return <p key={index}>{inline(block.text)}</p>
  })}</div>
}
