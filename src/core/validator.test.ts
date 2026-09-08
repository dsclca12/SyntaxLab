import { describe, expect, it } from 'vitest'
import { matchesObject, parseToml } from './validator'

describe('TOML validator', () => {
  it('parses valid TOML', () => expect(parseToml('[server]\nport = 8080').valid).toBe(true))
  it('rejects invalid TOML', () => expect(parseToml('[server\nport = 8080').valid).toBe(false))
  it('accepts semantic answers with different spacing', () => expect(matchesObject(parseToml('port=8080').data, { port: 8080 })).toBe(true))
  it('rejects empty input', () => expect(parseToml('').valid).toBe(false))
})
