import { IconCalendar, IconChart, IconMoon, IconSun } from './icons'

export default function Header({ view, onViewChange, theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-mark">DF</span>
          <span className="brand-name">DayFlow</span>
        </div>
        <nav className="nav" aria-label="Views">
          <button
            className={`nav-btn${view === 'plan' ? ' active' : ''}`}
            onClick={() => onViewChange('plan')}
          >
            <IconCalendar size={16} />
            Plan
          </button>
          <button
            className={`nav-btn${view === 'report' ? ' active' : ''}`}
            onClick={() => onViewChange('report')}
          >
            <IconChart size={16} />
            Reports
          </button>
        </nav>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
      </div>
    </header>
  )
}
