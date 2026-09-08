# Contributing to SyntaxLab

Thanks for helping make syntax learning clearer. Before opening a pull request:

1. Fork the repository and create a focused branch.
2. Run `npm install`, then `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
3. Keep lesson content short, concrete and runnable in the editor.
4. Add tests when changing parsing or exercise validation.

For a new language, keep content under `src/languages/<language>` and implement the existing learning module interfaces instead of adding language conditionals to the UI.
