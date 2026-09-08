declare module 'toml' { export function parse(input: string): unknown; const toml: { parse: typeof parse }; export default toml }
