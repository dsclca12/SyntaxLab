# SyntaxLab

Interactive learning for developers and exam candidates — learn by writing and practicing.

Demo: https://dsclca12.github.io/SyntaxLab/

SyntaxLab is a small, static learning workspace where you read a concept, edit examples, make mistakes, and get useful feedback. It runs entirely in the browser; progress is stored in localStorage.

## Features

- 15 short TOML lessons, from key/value pairs to `pyproject.toml`
- 7 introductory Computer Level 2 lessons covering public foundations, Word, Excel, PowerPoint, Python, and review habits
- A standalone 6-lesson Python Level 2 path, starting with installation, PATH verification, and the first runnable `.py` file
- Real TOML parsing and semantic exercise checks
- Complete, repair, and write-from-requirement exercises
- Progressive hints after failed attempts
- Local progress tracking with reset support
- Responsive three-panel desktop layout and mobile lesson navigation
- Light and dark themes
- Static GitHub Pages deployment

## Currently supported

- [x] TOML fundamentals
- [x] Computer Level 2 introduction
- [x] Python Level 2 path from environment setup to exam review
- [x] Interactive exercises
- [x] TOML validation
- [x] Local progress
- [ ] YAML
- [ ] Markdown
- [ ] C
- [ ] Python

## Local development

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

The application consumes a `LearningModule` made of lessons and exercises. TOML lives under `src/languages/toml`; Computer Level 2 content lives under `src/languages/computer`. TOML exercises use the parser, while the exam-introduction exercises use a text validator. A future module should add its content, config and validator/editor choice, then register the module in `src/App.tsx`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [维护指南](docs/MAINTAINING.md). Small, focused improvements and new exercises are welcome.

## License

MIT — see [LICENSE](LICENSE).
