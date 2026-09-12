import { describe, expect, it } from 'vitest'
import { matchesObject, parseMarkdown, parseToml, parseYaml } from './validator'

describe('TOML validator', () => {
  it('parses valid TOML', () => expect(parseToml('[server]\nport = 8080').valid).toBe(true))
  it('rejects invalid TOML', () => expect(parseToml('[server\nport = 8080').valid).toBe(false))
  it('accepts semantic answers with different spacing', () => expect(matchesObject(parseToml('port=8080').data, { port: 8080 })).toBe(true))
  it('rejects extra keys instead of accepting a partial object', () => expect(matchesObject(parseToml('port=8080\nhost="localhost"').data, { port: 8080 })).toBe(false))
  it('compares parsed dates with their stable ISO form', () => expect(matchesObject(parseToml('published = 1979-05-27T07:32:00Z').data, { published: '1979-05-27T07:32:00.000Z' })).toBe(true))
  it('rejects empty input', () => expect(parseToml('').valid).toBe(false))
  it('rejects duplicate keys and accepts TOML arrays with mixed types', () => {
    expect(parseToml('name = "a"\nname = "b"').valid).toBe(false)
    expect(parseToml('values = [1, "two"]').data).toEqual({ values: [1, 'two'] })
  })
})

describe('text validators', () => {
  it('parses nested YAML and preserves scalar types', () => {
    expect(parseYaml('server:\n  host: localhost\n  port: 8080').data).toEqual({ server: { host: 'localhost', port: 8080 } })
    expect(parseYaml('enabled: true').data).toEqual({ enabled: true })
  })
  it('rejects malformed YAML and unclosed Markdown fences', () => {
    expect(parseYaml('server\n  host: localhost').valid).toBe(false)
    expect(parseMarkdown('```js\nconst answer = 42').valid).toBe(false)
  })
})
