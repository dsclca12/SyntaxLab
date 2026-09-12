# SyntaxLab

Interactive learning for developers and exam candidates — learn by writing and practicing.

Demo: https://dsclca12.github.io/SyntaxLab/

SyntaxLab is a small, static learning workspace where you read a concept, edit examples, make mistakes, and get useful feedback. It runs entirely in the browser; progress is stored in localStorage.

## Features

- 15 short TOML lessons, from key/value pairs to `pyproject.toml`
- 7 introductory Computer Level 2 lessons covering public foundations, Word, Excel, PowerPoint, Python, and review habits
- A standalone 10-lesson Python fundamentals path, with goals, worked examples, line-by-line walkthroughs, boundary checks, and a complete input-processing exercise
- Real TOML parsing and semantic exercise checks
- Complete, repair, and write-from-requirement exercises
- Progressive hints after failed attempts
- Python examples include guided tracing and hands-on checkpoints, not only syntax matching
- A five-lesson hexadecimal path after Binary Foundations, with generated conversion, byte, RGB, and code-notation exercises
- YAML and Markdown starter paths with browser-safe structural exercise checks
- Local progress tracking with reset support
- Responsive three-panel desktop layout and mobile lesson navigation
- Light and dark themes
- Static GitHub Pages deployment

## Currently supported

- [x] TOML fundamentals
- [x] Computer Level 2 introduction
- [x] Python fundamentals path from the first script to a small integrated problem
- [x] Hexadecimal foundations, including binary mapping and real-world byte notation
- [x] Interactive exercises
- [x] TOML validation
- [x] Local progress
- [x] YAML (learning subset)
- [x] Markdown (common authoring subset)
- [ ] C
- [x] Python syntax highlighting and structural exercise checks (browser-only)

## Local development

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Build and verify the project with:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architecture

The application consumes a `LearningModule` made of lessons and exercises. Computer foundations live under `src/languages/binary` and `src/languages/hexadecimal`; TOML lives under `src/languages/toml`; YAML and Markdown live under their matching language folders; Computer Level 2 content lives under `src/languages/computer`; Python fundamentals lives under `src/languages/python`. TOML, YAML and Markdown exercises use browser-safe parsers/structural validators, while the text-based learning paths use focused validators and syntax-highlighted editors. A future module should add its content, config and validator/editor choice, then register the module in `src/App.tsx`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [维护指南](docs/MAINTAINING.md). Small, focused improvements and new exercises are welcome.

## License

MIT — see [LICENSE](LICENSE).
