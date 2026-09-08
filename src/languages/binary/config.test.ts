import { describe, expect, it } from 'vitest'
import { createBinaryExercises } from './config'

const lessonIds = ['overview', 'place-value', 'conversion', 'arithmetic', 'bytes', 'code']

describe('binary exercise generator', () => {
  it('generates answerable exercises for every lesson and seed', () => {
    for (const seed of [1, 2, 7, 19]) {
      for (const lessonId of lessonIds) {
        const exercises = createBinaryExercises(lessonId, seed)
        expect(exercises.length, `${lessonId}-${seed}`).toBeGreaterThan(0)
        for (const exercise of exercises) {
          expect(exercise.validate(exercise.solution, exercise.solution), exercise.id).toBe(true)
        }
      }
    }
  })

  it('changes numeric prompts when the question set is refreshed', () => {
    const first = createBinaryExercises('conversion', 1)
    const second = createBinaryExercises('conversion', 2)
    expect(first.map((exercise) => exercise.prompt)).not.toEqual(second.map((exercise) => exercise.prompt))
    expect(first.map((exercise) => exercise.id)).not.toEqual(second.map((exercise) => exercise.id))
  })
})
