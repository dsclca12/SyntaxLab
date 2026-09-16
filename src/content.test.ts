import { describe, expect, it } from 'vitest'
import toml from 'toml'
import { computerModule } from './languages/computer/config'
import { pythonModule } from './languages/python/config'
import { tomlModule } from './languages/toml/config'
import { tomlChinese } from './languages/toml/i18n'
import { binaryModule } from './languages/binary/config'
import { hexadecimalModule } from './languages/hexadecimal/config'
import { markdownModule } from './languages/markdown/config'
import { yamlModule } from './languages/yaml/config'

describe('learning content contracts', () => {
  it('keeps TOML examples annotated and exercises intentionally small', () => {
    for (const lesson of tomlModule.lessons) {
      expect(lesson.example, lesson.id).toContain('#')
      expect(lesson.exercises.length, lesson.id).toBeLessThanOrEqual(2)
    }
  })

  it('keeps Chinese TOML content in sync with the exercise list', () => {
    for (const lesson of tomlModule.lessons) {
      const localized = tomlChinese[lesson.id]
      expect(localized, lesson.id).toBeDefined()
      expect(localized.example, lesson.id).toBeTruthy()
      expect(localized.goals?.length, lesson.id).toBeGreaterThan(0)
      expect(localized.checkpoints?.length, lesson.id).toBeGreaterThan(0)
      expect(Object.keys(localized.exercises).sort(), lesson.id).toEqual(lesson.exercises.map((exercise) => exercise.id).sort())
    }
  })

  it('accepts every configured TOML solution', () => {
    for (const lesson of tomlModule.lessons) {
      for (const exercise of lesson.exercises) {
        const parsed = toml.parse(exercise.solution)
        expect(exercise.validate(parsed, exercise.solution), exercise.id).toBe(true)
      }
    }
  })

  it('accepts every configured text or Python solution', () => {
    for (const module of [computerModule, pythonModule, markdownModule, yamlModule]) {
      for (const lesson of module.lessons) {
        for (const exercise of lesson.exercises) {
          expect(exercise.validate(exercise.solution, exercise.solution), exercise.id).toBe(true)
        }
      }
    }
  })

  it('keeps every Python topic in its own detailed chapter', () => {
    const chapters = pythonModule.lessons.map((lesson) => lesson.chapter)

    expect(pythonModule.lessons.length).toBeGreaterThanOrEqual(45)
    expect(new Set(chapters).size).toBe(pythonModule.lessons.length)
    for (const lesson of pythonModule.lessons) {
      expect(lesson.chapter, lesson.id).toContain(lesson.title)
      expect(lesson.sections.length, lesson.id).toBeGreaterThanOrEqual(3)
      expect(lesson.goals?.length, lesson.id).toBeGreaterThanOrEqual(3)
      expect(lesson.exercises.length, lesson.id).toBeGreaterThanOrEqual(2)
    }
  })

  it('explains Python operators one by one instead of only listing categories', () => {
    const operators = pythonModule.lessons.find((lesson) => lesson.id === 'operators')
    const lessonText = operators?.sections.map((section) => `${section.heading}\n${section.body}`).join('\n') ?? ''

    expect(operators?.sections.length).toBeGreaterThanOrEqual(20)
    expect(operators?.exercises.length).toBeGreaterThanOrEqual(5)
    for (const operator of ['+', '-', '*', '/', '//', '%', '**', '@', '==', '!=', '>=', '<=', 'and', 'or', 'not', 'in', 'is', '&', '|', '^', '~', '<<', '>>', '+=', ':=']) {
      expect(lessonText, operator).toContain(`\`${operator}\``)
    }
  })

  it('gives core Python syntax and methods individual explanations', () => {
    const requiredDepth: Record<string, string[]> = {
      values: ['`int`', '`float`', '`str`', '`bool`', '`input`', '`print`'],
      strings: ['索引', '切片', '`len`', 'f-string'],
      'string-tools': ['`strip`', '`find`', '`replace`', '`split`', '`join`'],
      'range-loop': ['`range(stop)`', '`range(start, stop)`', '`for ... else`'],
      'while-control': ['`while`', '`break`', '`continue`', '`while ... else`'],
      'list-methods': ['`append`', '`extend`', '`insert`', '`remove`', '`sort`', '`copy`'],
      'tuples-sets': ['单元素逗号', '`count`', '`set()`', '`add`', '并集', '子集'],
      'dict-basics': ['`mapping[key]`', '`setdefault`', '`popitem`', '字典推导式'],
      comprehensions: ['列表推导式', '集合推导式', '字典推导式', '生成器表达式'],
      functions: ['`def`', '形参与实参', '`/` 与 `*`', '`*args`'],
      files: ['`open`', '`read`', '`write`', '`tell`', '`with`'],
      'exceptions-detail': ['`try`', '`except', '`else`', '`finally`', '`raise`'],
      modules: ['`import module`', '`from module import name`', '`as`', '相对导入', '`__all__`'],
      classes: ['`class`', '`self`', '`__init__`', '类属性', '`@classmethod`'],
      'type-hints': ['容器泛型', '联合类型', '`Literal`', '`TypedDict`', '`Protocol`', '`Any`'],
    }

    for (const [lessonId, expectedHeadings] of Object.entries(requiredDepth)) {
      const lesson = pythonModule.lessons.find((candidate) => candidate.id === lessonId)
      const headings = lesson?.sections.map((section) => section.heading).join('\n') ?? ''
      expect(lesson, lessonId).toBeDefined()
      for (const heading of expectedHeadings) expect(headings, `${lessonId}: ${heading}`).toContain(heading)
    }
  })

  it('keeps the binary and hexadecimal source explanations intact in the app', () => {
    for (const module of [binaryModule, hexadecimalModule]) {
      expect(module.lessons.every((lesson) => (lesson.content?.length ?? 0) > 500), module.id).toBe(true)
      expect(module.lessons.reduce((total, lesson) => total + (lesson.content?.length ?? 0), 0), module.id).toBeGreaterThan(14_000)
      expect(module.lessons.some((lesson) => lesson.content?.includes('常见误区')), module.id).toBe(true)
      expect(module.lessons.every((lesson) => !lesson.content?.includes('自测题')), module.id).toBe(true)
    }
  })
})
