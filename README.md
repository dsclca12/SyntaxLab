# SyntaxLab

Interactive learning for developers — learn TOML by writing it.

Demo: https://dsclca12.github.io/SyntaxLab/

SyntaxLab is a small, static learning workspace where you read a concept, edit real TOML, make mistakes, and get useful feedback. It runs entirely in the browser; progress is stored in localStorage.

## Features

- 15 short TOML lessons, from key/value pairs to `pyproject.toml`
- Real TOML parsing and semantic exercise checks
- Complete, repair, and write-from-requirement exercises
- Progressive hints after failed attempts
- Local progress tracking with reset support
- Responsive three-panel desktop layout and mobile lesson navigation
- Light and dark themes
- Static GitHub Pages deployment

## Currently supported

- [x] TOML fundamentals
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

The application consumes a `LearningModule` made of lessons and exercises. TOML lives under `src/languages/toml`; parsing is provided through the core validator boundary, and the UI does not contain TOML-specific lesson logic. A future module adds its content, config and validator adapter, then registers the module.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [维护指南](docs/MAINTAINING.md). Small, focused improvements and new exercises are welcome.

## License

MIT — see [LICENSE](LICENSE).
