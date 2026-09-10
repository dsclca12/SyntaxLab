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

  it('keeps the binary and hexadecimal source explanations intact in the app', () => {
    for (const module of [binaryModule, hexadecimalModule]) {
      expect(module.lessons.every((lesson) => (lesson.content?.length ?? 0) > 500), module.id).toBe(true)
      expect(module.lessons.reduce((total, lesson) => total + (lesson.content?.length ?? 0), 0), module.id).toBeGreaterThan(14_000)
      expect(module.lessons.some((lesson) => lesson.content?.includes('常见误区')), module.id).toBe(true)
      expect(module.lessons.every((lesson) => !lesson.content?.includes('自测题')), module.id).toBe(true)
    }
  })
})
