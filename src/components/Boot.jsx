import { ArrowUpRight } from 'lucide-react';
import ThemeDock from './ThemeDock';

export default function Boot({ onStart, theme, setTheme }) {
  return <div className="boot">
    <div className="boot-inner">
      <div className="boot-top">
        <span className="boot-logo">K/02</span>
        <span>FIELD SYSTEM / 2026</span>
        <span>READY</span>
      </div>

      <div className="boot-theme-corner">
        <span>DISPLAY MODE</span>
        <ThemeDock theme={theme} setTheme={setTheme} inline />
      </div>

      <div className="boot-title">
        <span>CREATIVE DEVELOPER / PERSONAL ARCHIVE</span>
        <strong>NEXUS</strong><i>/OS</i>
      </div>

      <div className="boot-info">
        <div><small>MEMORY CHECK</small><b>OK / 05 MODULES</b></div>
        <div><small>INTERACTION LAYER</small><b>ACTIVE</b></div>
        <div><small>ARCHIVE</small><b>PARTIAL / LOCKED</b></div>
      </div>

      <button className="initialize" onClick={onStart}>INITIALIZE FIELD <ArrowUpRight size={18}/></button>

      <div className="boot-footer">
        <span>LOCAL INSTANCE / NO ACCOUNT REQUIRED</span>
        <span>Some interfaces ask you to read. This one asks you to touch things.</span>
      </div>
    </div>
  </div>;
}
