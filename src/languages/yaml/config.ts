import type { Exercise, LearningModule } from '../../core/types'
import { matchesObject, parseYaml } from '../../core/validator'

const exercise = (id: string, title: string, prompt: string, starter: string, solution: string, expected: Record<string, unknown>): Exercise => ({ id: `yaml-${id}`, kind: 'create', title, prompt, starter, solution, hints: ['Use a colon after each key.', 'Use two spaces for a nested value.', 'Check the parsed data shape.'], validate: (value) => matchesObject(typeof value === 'string' ? parseYaml(value).data : value, expected) })
const lessons = [
  { id: 'basics', number: '01', title: '键和值', eyebrow: 'BASICS', summary: '用缩进表达清晰的数据。', sections: [{ heading: '一行一个键', body: 'YAML 用冒号分隔键和值，文本通常不需要引号。注释以 # 开始。' }], example: 'name: SyntaxLab\nversion: 1', exercises: [exercise('basics-1', '写一个项目', '创建 name = SyntaxLab 和 version = 1。', '', 'name: SyntaxLab\nversion: 1', { name: 'SyntaxLab', version: 1 })] },
  { id: 'nested', number: '02', title: '嵌套与缩进', eyebrow: 'STRUCTURE', summary: '用空格表达对象之间的关系。', sections: [{ heading: '缩进就是结构', body: '同一层使用一致的空格数。YAML 不使用大括号，但缩进错误会改变数据结构。' }], example: 'server:\n  host: localhost\n  port: 8080', exercises: [exercise('nested-1', '配置服务器', '创建 server.host = localhost 和 server.port = 8080。', '', 'server:\n  host: localhost\n  port: 8080', { server: { host: 'localhost', port: 8080 } })] },
  { id: 'practice', number: '03', title: '阅读与检查', eyebrow: 'PRACTICE', summary: '在提交前检查类型和层级。', sections: [{ heading: '像程序一样阅读', body: '先看缩进，再看值的类型。true、false 和数字不是普通字符串。' }], example: 'enabled: true\nretries: 3', exercises: [exercise('practice-1', '写运行配置', '创建 enabled = true 和 retries = 3。', '', 'enabled: true\nretries: 3', { enabled: true, retries: 3 })] },
].map((lesson) => ({ ...lesson, goals: ['读懂键、值和缩进', '区分数字、布尔值与文本'], checkpoints: ['故意改变一级缩进，观察结构变化。'], resources: [], note: 'YAML 对缩进敏感；编辑时保持统一空格。' }))

export const yamlModule: LearningModule = { id: 'yaml', name: 'YAML', description: 'Readable data serialization.', lessons, available: true, language: 'YAML', editor: 'text', practiceRequired: true }
export { parseYaml }
