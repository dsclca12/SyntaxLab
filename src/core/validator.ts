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
  return Object.entries(expected).every(([key, expectedValue]) => JSON.stringify((value as Record<string, unknown>)[key]) === JSON.stringify(expectedValue))
}
