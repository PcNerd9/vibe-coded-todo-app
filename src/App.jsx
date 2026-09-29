import { useEffect, useState } from 'react'
import Header from './components/Header'
import PlanView from './components/PlanView'
import ReportView from './components/ReportView'
import { useDays } from './useDays'

const THEME_KEY = 'dayflow.theme.v1'

function initialTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // storage unavailable — fall through to system preference
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const { days, mutateDay } = useDays()
  const [view, setView] = useState('plan')
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // non-fatal: theme just won't persist
    }
  }, [theme])

  return (
    <>
      <Header
        view={view}
        onViewChange={setView}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      {view === 'plan' ? (
        <PlanView days={days} mutateDay={mutateDay} />
      ) : (
        <ReportView days={days} />
      )}
    </>
  )
}
