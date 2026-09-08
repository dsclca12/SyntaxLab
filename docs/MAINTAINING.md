# SyntaxLab 提交、部署与维护指南

这份文档给后来维护 SyntaxLab 的贡献者阅读。项目是 Vite + React + TypeScript 的纯静态网站，部署目标是 GitHub Pages。

## 1. 开始工作

需要 Node.js 20 或更高版本，以及 Git。

~~~bash
git clone https://github.com/dsclca12/SyntaxLab.git
cd SyntaxLab
npm install
npm run dev
~~~

本地开发地址通常是 http://localhost:5173/SyntaxLab/。仓库名包含在 Vite 的 base path 中。

## 2. 目录约定

~~~text
src/
├── core/                    # 共享类型、校验和状态逻辑
├── languages/toml/          # TOML 课程、练习和中文内容
├── languages/computer/      # 计算机二级入门课程、练习和中文内容
├── languages/python/        # Python 二级专项课程和练习
├── App.tsx                  # 工作区布局和状态组合
└── styles.css               # 全局视觉和响应式样式
.github/workflows/deploy.yml # GitHub Pages 自动部署
docs/                        # 面向贡献者的文档
~~~

新增语言时，优先在 src/languages/<language>/ 中增加课程数据、练习、语言配置和 validator adapter，不要在界面组件中堆积语言条件分支。

## 3. 提交前检查

~~~bash
npm run lint
npm run typecheck
npm test
npm run build
~~~

课程改动还要手动确认：练习可编辑；答案不依赖无意义的空格；非法 TOML 有可理解的提示；提示逐次增加但不会直接泄露答案；深色模式、移动端和刷新都正常。

## 4. Git 分支和提交

从最新的 main 创建分支：

~~~bash
git switch main
git pull --ff-only
git switch -c feat/add-yaml-lessons
~~~

提交保持小而明确，使用类似 Conventional Commits 的前缀：

~~~text
feat: add YAML learning module
fix: localize TOML parse errors
test: add array exercise cases
docs: update deployment guide
chore: update dependencies
~~~

提交前查看内容：

~~~bash
git status
git diff
git diff --cached
~~~

不要提交 node_modules/、dist/、.env、个人 IDE 配置、密钥、Cookie、Token 或本机绝对路径。gitignore 已覆盖常见情况，但提交前仍要检查 git status。

## 5. Pull Request

~~~bash
git push -u origin feat/add-yaml-lessons
~~~

PR 描述应包含：改了什么及原因、如何验证、是否修改课程答案、是否影响 Pages 路径、localStorage 或语言切换。

GitHub Actions 会在 main 推送后执行 lint、typecheck、测试和生产构建。贡献者应先通过本地检查再合并。

## 6. GitHub Pages 部署

工作流位于 .github/workflows/deploy.yml：

~~~text
push main / 手动触发
        ↓
npm ci
        ↓
lint + typecheck + test + build
        ↓
上传 dist artifact
        ↓
deploy-pages 发布
~~~

当前站点：https://dsclca12.github.io/SyntaxLab/。

仓库重命名或迁移后，检查：

1. vite.config.ts 的 base 是否仍为 /<仓库名>/；
2. README 中的 Demo 地址；
3. GitHub Settings → Pages → Source 是否为 GitHub Actions；
4. 最新 workflow 是否成功；
5. 线上 HTML 的 JS/CSS 路径是否包含正确的 base path。

页面部署成功但资源 404 时，优先检查 vite.config.ts 的 base。

## 7. 日常维护

依赖升级前后都要运行：

~~~bash
npm outdated
npm update
npm run lint
npm run typecheck
npm test
npm run build
~~~

涉及 Vite、React、TypeScript、CodeMirror 或 TOML parser 的大版本升级时，应单独开 PR，并手动走一遍课程和练习。

课程内容主要位于各模块的 config.ts；TOML 的本地化内容另在 i18n.ts 中维护。新增或修改练习时，应同步检查标题、题目、提示和章节正文。TOML 练习验证应比较解析后的结构；文字型模块可以使用规范化后的文本验证，但要保证答案不依赖多余空格。

学习进度只保存在浏览器 localStorage 中。修改进度字段时，要提供默认值，避免旧用户打开网站时报错。

## 8. 故障排查

- npm ci 失败：检查 package-lock.json 是否与 package.json 同步。
- lint 失败：本地运行 npm run lint。
- typecheck 失败：本地运行 npm run typecheck。
- test 失败：先单独运行 npm test。
- build 失败：本地运行 npm run build，注意 base path 和资源导入。
- Pages 空白或刷新 404：确认 base、Pages 配置和线上资源路径一致。
- 中文没有更新：确认 config.ts 和 i18n.ts 都已提交，并检查浏览器缓存和 localStorage 语言设置。

## 9. 安全原则

SyntaxLab 是公开仓库。不要把真实身份信息、学校信息、设备信息、服务器信息、私有域名、IP、SSH 配置、Token、API key、Cookie 或密码写入代码、Issue、PR、Commit 或 README。发现疑似泄露时，应立即撤销凭据并联系维护者，而不是只删除文件后继续使用原凭据。
