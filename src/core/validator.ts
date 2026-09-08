import toml from 'toml'

export interface ParseResult { valid: boolean; data?: unknown; error?: string }
export function parseToml(source: string): ParseResult {
  if (!source.trim()) return { valid: false, error: 'Start by writing a TOML key and value.' }
  try { return { valid: true, data: toml.parse(source) } } catch (error) { return { valid: false, error: formatTomlError(error) } }
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
