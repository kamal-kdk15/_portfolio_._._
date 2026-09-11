import { Monitor, Moon, Sun } from 'lucide-react';

export default function ThemeDock({ theme, setTheme, inline = false, compact = false }) {
  return <div className={`theme-dock ${inline ? 'theme-dock-inline' : ''} ${compact ? 'theme-dock-compact' : ''}`} aria-label="Theme selection">
    {!compact && <span>THEME</span>}
    {[['light', Sun, 'LIGHT'], ['dark', Moon, 'DARK'], ['system', Monitor, 'SYSTEM']].map(([value, Icon, label]) => (
      <button key={value} className={theme === value ? 'selected' : ''} onClick={() => setTheme(value)} title={`${label} theme`} aria-label={`${label} theme`}>
        <Icon size={compact ? 13 : 15} />
        {!compact && <small>{label}</small>}
      </button>
    ))}
  </div>;
}
