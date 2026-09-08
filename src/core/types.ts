export type ExerciseKind = 'complete' | 'repair' | 'create'
export interface Exercise { id: string; kind: ExerciseKind; title: string; prompt: string; starter: string; solution: string; hints: string[]; validate: (value: unknown, source: string) => boolean }
export interface Lesson { id: string; number: string; title: string; eyebrow: string; summary: string; sections: { heading: string; body: string }[]; example: string; note?: string; goals?: string[]; exercises: Exercise[] }
export interface LearningModule { id: string; name: string; description: string; lessons: Lesson[]; available: boolean; language: string; editor: 'toml' | 'text' }
