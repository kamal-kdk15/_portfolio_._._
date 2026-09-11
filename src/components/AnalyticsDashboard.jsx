import { useMemo, useState } from 'react';
import { ArrowLeft, Download, Trash2, RefreshCw, BarChart3, MousePointer2, FileDown, ExternalLink } from 'lucide-react';
import { exportEvents, clearEvents } from '../lib/analytics';
import { projects } from '../data/content';

function group(events, key) {
  const out = {};
  for (const event of events) {
    const value = event.payload?.[key] || event.event;
    out[value] = (out[value] || 0) + 1;
  }
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

export default function AnalyticsDashboard({ theme, setTheme }) {
  const [events, setEvents] = useState(() => exportEvents());

  function refresh() { setEvents(exportEvents()); }
  function wipe() {
    clearEvents();
    setEvents([]);
  }
  function download() {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `kamal-portfolio-events-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(href);
  }

  const projectOpens = group(events.filter(e => e.event === 'project_open'), 'project');
  const skills = group(events.filter(e => e.event === 'skill_open'), 'skill');
  const links = group(events.filter(e => e.event === 'project_link_click'), 'link');
  const games = group(events.filter(e => e.event === 'game_open'), 'game');
  const resumeDownloads = events.filter(e => e.event === 'resume_download' || e.event === 'resume_download_click').length;
  const sessions = new Set(events.map(e => e.payload?.sessionId).filter(Boolean)).size || (events.length ? 1 : 0);

  const projectNames = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p.title])), []);
  const maxProject = projectOpens[0]?.[1] || 1;
  const maxSkill = skills[0]?.[1] || 1;
  const maxGame = games[0]?.[1] || 1;

  return (
    <div className={`analytics-page theme-${theme}`}>
      <div className="analytics-shell">
        <header className="analytics-header">
          <div>
            <span className="analytics-kicker">KAMAL / PRIVATE FIELD REPORT</span>
            <h1>Portfolio analytics.</h1>
            <p>Local activity recorded by this browser. Hover the modules to see interest patterns; central analytics need an endpoint.</p>
          </div>
          <div className="analytics-actions">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>THEME</button>
            <button onClick={refresh}><RefreshCw size={16}/> REFRESH</button>
            <button onClick={download}><Download size={16}/> EXPORT</button>
            <button className="danger" onClick={wipe}><Trash2 size={16}/> CLEAR</button>
            <button onClick={() => { window.history.back(); }}><ArrowLeft size={16}/> BACK</button>
          </div>
        </header>

        <section className="analytics-grid stats">
          <article><small>EVENTS</small><strong>{events.length}</strong><span>Total interactions recorded here</span></article>
          <article><small>SESSIONS</small><strong>{sessions}</strong><span>Browser-local session estimate</span></article>
          <article><small>RESUME DOWNLOADS</small><strong>{resumeDownloads}</strong><span>High-intent action</span></article>
          <article><small>ENDPOINT</small><strong>{import.meta.env.VITE_ANALYTICS_ENDPOINT ? 'ON' : 'LOCAL'}</strong><span>{import.meta.env.VITE_ANALYTICS_ENDPOINT ? 'Events can be sent to your endpoint' : 'No remote endpoint configured'}</span></article>
        </section>

        <section className="analytics-grid analytics-columns">
          <article className="analytics-card">
            <div className="analytics-card-head"><span>PROJECT INTEREST</span><BarChart3 size={18}/></div>
            {projectOpens.length ? projectOpens.map(([id, count]) => <div className="metric-row" key={id}><div><span>{projectNames[id] || id}</span><i style={{width:`${(count/maxProject)*100}%`}}/></div><b>{count}</b></div>) : <div className="empty-metric">Open project case files to populate this.</div>}
          </article>

          <article className="analytics-card">
            <div className="analytics-card-head"><span>SKILL INTEREST</span><BarChart3 size={18}/></div>
            {skills.length ? skills.map(([skill, count]) => <div className="metric-row" key={skill}><div><span>{skill}</span><i style={{width:`${(count/maxSkill)*100}%`}}/></div><b>{count}</b></div>) : <div className="empty-metric">Skill interactions have not been recorded yet.</div>}
          </article>

          <article className="analytics-card">
            <div className="analytics-card-head"><span>PROJECT LINKS</span><ExternalLink size={18}/></div>
            {links.length ? links.map(([link, count]) => <div className="metric-row" key={link}><span>{link}</span><b>{count}</b></div>) : <div className="empty-metric">No project link clicks yet.</div>}
          </article>

          <article className="analytics-card">
            <div className="analytics-card-head"><span>PLAYROOM INTEREST</span><MousePointer2 size={18}/></div>
            {games.length ? games.map(([game, count]) => <div className="metric-row" key={game}><div><span>{game}</span><i style={{width:`${(count/maxGame)*100}%`}}/></div><b>{count}</b></div>) : <div className="empty-metric">No games opened yet.</div>}
          </article>
        </section>

        <section className="analytics-card timeline">
          <div className="analytics-card-head"><span>RECENT EVENTS</span><FileDown size={18}/></div>
          <div className="timeline-list">
            {events.slice().reverse().slice(0, 30).map((item, index) => <div className="timeline-row" key={`${item.at}-${index}`}><time>{new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><b>{item.event}</b><span>{JSON.stringify(item.payload || {})}</span></div>)}
            {!events.length && <div className="empty-metric">No events yet. Use the portfolio normally, then come back here.</div>}
          </div>
        </section>

        <section className="analytics-note">
          <strong>Important:</strong> this dashboard is intentionally local right now. It shows activity stored in <code>localStorage</code> on this browser only. To see what recruiters on other devices do, you still need a real analytics endpoint + database.
        </section>
      </div>
    </div>
  );
}
