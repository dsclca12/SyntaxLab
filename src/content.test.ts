import { describe, expect, it } from 'vitest'
import toml from 'toml'
import { computerModule } from './languages/computer/config'
import { pythonModule } from './languages/python/config'
import { tomlModule } from './languages/toml/config'
import { tomlChinese } from './languages/toml/i18n'

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
    for (const module of [computerModule, pythonModule]) {
      for (const lesson of module.lessons) {
        for (const exercise of lesson.exercises) {
          expect(exercise.validate(exercise.solution, exercise.solution), exercise.id).toBe(true)
        }
      }
    }
  })
})
