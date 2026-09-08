import { useEffect, useMemo, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { langs } from '@uiw/codemirror-extensions-langs'
import { oneDark } from '@codemirror/theme-one-dark'
import { Check, ChevronDown, ChevronRight, CircleCheck, Code2, Lightbulb, Menu, Moon, RotateCcw, Sun, Terminal, X } from 'lucide-react'
import { tomlModule } from './languages/toml/config'
import { parseToml } from './core/validator'
import type { Exercise } from './core/types'
import './styles.css'

const STORAGE_KEY = 'syntaxlab-progress-v1'
type Progress = { lessonId: string; completedLessons: string[]; completedExercises: string[]; dark: boolean }
const defaultProgress: Progress = { lessonId: 'intro', completedLessons: [], completedExercises: [], dark: true }
function loadProgress(): Progress { try { return { ...defaultProgress, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } } catch { return defaultProgress } }
function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [selectedId, setSelectedId] = useState(progress.lessonId)
  const [mobileNav, setMobileNav] = useState(false)
  const [showModules, setShowModules] = useState(false)
  const [output, setOutput] = useState<ReturnType<typeof parseToml> | null>(null)
  const selected = useMemo(() => tomlModule.lessons.find((lesson) => lesson.id === selectedId) ?? tomlModule.lessons[0], [selectedId])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); document.documentElement.dataset.theme = progress.dark ? 'dark' : 'light' }, [progress])
  const completedCount = progress.completedLessons.length
  const selectLesson = (id: string) => { setSelectedId(id); setProgress((p) => ({ ...p, lessonId: id })); setOutput(null); setMobileNav(false) }
  const markLesson = () => setProgress((p) => ({ ...p, completedLessons: p.completedLessons.includes(selected.id) ? p.completedLessons : [...p.completedLessons, selected.id] }))
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="."><span className="brand-mark">S</span><span>Syntax<span className="muted-brand">Lab</span></span></a><div className="top-actions"><span className="progress-label">{completedCount} / {tomlModule.lessons.length} lessons</span><button className="icon-button" aria-label="Toggle theme" onClick={() => setProgress((p) => ({ ...p, dark: !p.dark }))}>{progress.dark ? <Sun size={17} /> : <Moon size={17} />}</button><button className="menu-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Open lessons"><Menu size={19} /></button></div></header>
    <div className="layout">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}><div className="sidebar-head"><div><span className="overline">LEARNING PATH</span><h2>TOML</h2></div><button className="close-mobile" onClick={() => setMobileNav(false)}><X size={17} /></button></div><div className="progress-track"><span style={{ width: `${(completedCount / tomlModule.lessons.length) * 100}%` }} /></div><div className="lesson-list">{tomlModule.lessons.map((lesson) => <button className={`lesson-item ${selected.id === lesson.id ? 'active' : ''}`} key={lesson.id} onClick={() => selectLesson(lesson.id)}><span className="lesson-number">{lesson.number}</span><span className="lesson-title">{lesson.title}</span>{progress.completedLessons.includes(lesson.id) && <CircleCheck size={15} className="lesson-check" />}</button>)}</div><button className="reset-button" onClick={() => { if (confirm('Reset your SyntaxLab progress?')) setProgress(defaultProgress) }}><RotateCcw size={14} /> Reset progress</button></aside>
      <main className="main-content"><div className="content-wrap"><div className="breadcrumb"><span>SYNTAXLAB</span><ChevronRight size={13} /><span>TOML</span><ChevronRight size={13} /><span className="current">{selected.number} / 15</span></div><article className="lesson-content"><div className="eyebrow">{selected.eyebrow}</div><h1>{selected.title}</h1><p className="lead">{selected.summary}</p>{selected.sections.map((section) => <section key={section.heading}><h3>{section.heading}</h3><p>{section.body}</p></section>)}<div className="code-example"><div className="code-label"><Terminal size={14} /> Example</div><pre><code>{selected.example}</code></pre></div>{selected.note && <div className="note"><Lightbulb size={16} /><span>{selected.note}</span></div>}<div className="lesson-complete"><button className={`complete-button ${progress.completedLessons.includes(selected.id) ? 'done' : ''}`} onClick={markLesson}>{progress.completedLessons.includes(selected.id) ? <><Check size={16} /> Lesson complete</> : 'Mark lesson complete'}</button></div></article></div></main>
      <aside className="practice-panel"><div className="practice-head"><div><span className="overline">PRACTICE</span><h2>Write it yourself</h2></div><Code2 size={20} className="practice-icon" /></div><div className="practice-scroll">{selected.exercises.map((exercise, index) => <ExerciseCard key={exercise.id} exercise={exercise} index={index} completed={progress.completedExercises.includes(exercise.id)} onComplete={() => setProgress((p) => ({ ...p, completedExercises: p.completedExercises.includes(exercise.id) ? p.completedExercises : [...p.completedExercises, exercise.id] }))} onResult={setOutput} output={output} />)}</div></aside>
    </div><footer><button className="module-toggle" onClick={() => setShowModules(!showModules)}>Explore modules <ChevronDown size={14} /></button>{showModules && <div className="module-popover"><strong>More syntax, soon.</strong><span>YAML · Markdown · C · Python</span><small>Each module will use the same learning interface.</small></div>}<span>SyntaxLab is open source · Learn by writing.</span></footer>
  </div>
}

function ExerciseCard({ exercise, index, completed, onComplete, onResult, output }: { exercise: Exercise; index: number; completed: boolean; onComplete: () => void; onResult: (result: ReturnType<typeof parseToml>) => void; output: ReturnType<typeof parseToml> | null }) {
  const [value, setValue] = useState(exercise.starter)
  const [attempts, setAttempts] = useState(0)
  const [checked, setChecked] = useState(false)
  const [open, setOpen] = useState(index === 0)
  const result = checked ? output : null
  const check = () => { const parsed = parseToml(value); const next = parsed.valid && exercise.validate(parsed.data, value); setAttempts((a) => a + 1); setChecked(true); onResult(next ? { valid: true, data: parsed.data } : parsed); if (next) onComplete() }
  return <div className={`exercise ${open ? 'expanded' : ''} ${completed ? 'completed' : ''}`}><button className="exercise-summary" onClick={() => setOpen(!open)}><span className="exercise-index">0{index + 1}</span><span><strong>{exercise.title}</strong><small>{exercise.kind === 'complete' ? 'Complete the example' : exercise.kind === 'repair' ? 'Find and fix the error' : 'Write from a requirement'}</small></span>{completed ? <CircleCheck size={17} className="success-icon" /> : open ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</button>{open && <div className="exercise-body"><p>{exercise.prompt}</p><CodeMirror value={value} height="145px" extensions={[langs.toml()]} theme={document.documentElement.dataset.theme === 'dark' ? oneDark : undefined} onChange={setValue} basicSetup={{ lineNumbers: true, foldGutter: false }} /><div className="exercise-actions"><button className="check-button" onClick={check}><Check size={15} /> Check answer</button><button className="clear-button" onClick={() => { setValue(exercise.starter); setChecked(false) }}>Reset</button></div>{result && <div className={`result ${result.valid ? 'success' : 'error'}`}>{result.valid ? <><CircleCheck size={15} /><span>Correct. Nice work.</span></> : <><X size={15} /><span>{result.error ?? 'The structure does not match this exercise yet.'}</span></>}</div>}{checked && !result?.valid && attempts > 0 && <div className="hint"><Lightbulb size={15} /><span>{attempts >= 3 ? exercise.hints[2] : exercise.hints[attempts - 1]}</span></div>}</div>}</div>
}
export default App
