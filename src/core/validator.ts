import toml from 'toml'

export interface ParseResult { valid: boolean; data?: unknown; error?: string }
export function parseToml(source: string): ParseResult {
  if (!source.trim()) return { valid: false, error: 'Start by writing a TOML key and value.' }
  try { return { valid: true, data: toml.parse(source) } } catch (error) { return { valid: false, error: formatTomlError(error) } }
}

/** A deliberately small, browser-safe YAML subset for learning exercises. */
export function parseYaml(source: string): ParseResult {
  if (!source.trim()) return { valid: false, error: 'Start by writing a YAML key and value.' }
  try {
    const result: Record<string, unknown> = {}
    const stack: Array<{ indent: number; value: Record<string, unknown> }> = [{ indent: -1, value: result }]
    for (const rawLine of source.replace(/\r/g, '').split('\n')) {
      if (!rawLine.trim() || /^\s*#/.test(rawLine)) continue
      const match = rawLine.match(/^(\s*)([^:#][^:]*):(?:\s*(.*))?$/)
      if (!match) throw new Error('Each YAML entry needs an indented key followed by a colon.')
      const indent = match[1].length
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop()
      const parent = stack[stack.length - 1].value
      const key = match[2].trim()
      if (key in parent) throw new Error(`Duplicate key: ${key}`)
      const rawValue = match[3]?.trim() ?? ''
      if (!rawValue) { const child: Record<string, unknown> = {}; parent[key] = child; stack.push({ indent, value: child }); continue }
      parent[key] = rawValue === 'true' ? true : rawValue === 'false' ? false : /^-?\d+(?:\.\d+)?$/.test(rawValue) ? Number(rawValue) : rawValue.replace(/^(['"])(.*)\1$/, '$2')
    }
    return { valid: true, data: result }
  } catch (error) { return { valid: false, error: error instanceof Error ? error.message : 'Invalid YAML syntax.' } }
}

export function parseMarkdown(source: string): ParseResult {
  if (!source.trim()) return { valid: false, error: 'Start by writing a Markdown heading or paragraph.' }
  const lines = source.replace(/\r/g, '').split('\n')
  if (lines.some((line) => line.startsWith('```') && lines.filter((item) => item.startsWith('```')).length % 2 !== 0)) return { valid: false, error: 'A fenced code block is not closed.' }
  return { valid: true, data: source }
}
function formatTomlError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Invalid TOML syntax.'
  return message.replace(/^Error:\s*/i, '').replace(/\s+at\s+line.*$/i, '')
}
export function matchesObject(value: unknown, expected: Record<string, unknown>): boolean {
  if (!value || typeof value !== 'object') return false
  return stableJson(value) === stableJson(expected)
}

function stableJson(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString())
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}
