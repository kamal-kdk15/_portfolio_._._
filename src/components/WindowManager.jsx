import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minus, X, RotateCcw, Columns2 } from 'lucide-react';
import { projects } from '../data/content';
import { track } from '../lib/analytics';
import GamesMenu from './GamesMenu';
import Terminal from './Terminal';
import ReactionGame from '../games/ReactionGame';
import SignalGame from '../games/SignalGame';
import ImpostorGame from '../games/ImpostorGame';
import SequenceGame from '../games/SequenceGame';
import MemoryGame from '../games/MemoryGame';
import Profile from './Profile';

export default function WindowManager({ windowId, data, close, focus, zIndex, xp, startGame, game, actions, navigate, windows = [] }) {
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [snap, setSnap] = useState(() => data.layout === 'left' || data.layout === 'right' ? data.layout : null);
  const [snapPreview, setSnapPreview] = useState(null);
  const [pos, setPos] = useState(() => ({ x: Math.max(18, Math.min(window.innerWidth - 760, window.innerWidth * .18)), y: 78 }));
  const drag = useRef(null);
  const title = data.type === 'about' ? 'PROFILE.TXT' : data.type === 'project' ? `${data.project.toUpperCase()}.MOD` : data.type === 'game' ? `${data.game.toUpperCase()}.RUN` : `${data.type.toUpperCase()}.TXT`;

  useEffect(() => {
    setMinimized(false);
    setMaximized(false);
    setSnap(data.layout === 'left' || data.layout === 'right' ? data.layout : null);
    setSnapPreview(null);
  }, [data.type, data.project, data.game]);

  function beginDrag(e) {
    if (maximized || e.target.closest('button')) return;
    focus();
    setSnap(null);
    drag.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function moveDrag(e) {
    if (!drag.current) return;
    const width = Math.min(720, window.innerWidth - 30);
    const height = Math.min(window.innerHeight - 70, 760);
    const nextX = drag.current.px + e.clientX - drag.current.sx;
    const nextY = drag.current.py + e.clientY - drag.current.sy;
    setPos({ x: Math.max(8, Math.min(window.innerWidth - width - 8, nextX)), y: Math.max(42, Math.min(window.innerHeight - height - 8, nextY)) });

    if (e.clientX <= 28) setSnapPreview('left');
    else if (e.clientX >= window.innerWidth - 28) setSnapPreview('right');
    else if (e.clientY <= 48) setSnapPreview('max');
    else setSnapPreview(null);
  }

  function endDrag(e) {
    if (!drag.current) return;
    drag.current = null;
    if (snapPreview === 'left' || snapPreview === 'right') { setSnap(snapPreview); navigate(windowId, { layout: snapPreview }); }
    if (snapPreview === 'max') { setMaximized(true); navigate(windowId, { layout: 'max' }); }
    setSnapPreview(null);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
  }

  function toggleMax() { const next = !maximized; setSnap(null); setMaximized(next); setMinimized(false); navigate(windowId, { layout: next ? 'max' : null }); focus(); }
  function splitWindow() {
    setMaximized(false);
    const siblingLayouts = windows.filter(item => item.id !== windowId).map(item => item.layout);
    const leftTaken = siblingLayouts.includes('left');
    const rightTaken = siblingLayouts.includes('right');
    let next;
    if (!leftTaken) next = 'left';
    else if (!rightTaken) next = 'right';
    else next = snap === 'left' ? 'right' : 'left';
    setSnap(next);
    navigate(windowId, { layout: next });
    focus();
  }

  if (minimized) {
    return <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="window-taskbar" style={{ right: `${20 + ((zIndex - 60) % 4) * 170}px` }}>
      <button onClick={() => { setMinimized(false); focus(); }}><RotateCcw size={13} /><span>{title}</span><small>RESTORE</small></button>
    </motion.div>;
  }

  const className = `window ${maximized ? 'max' : ''} ${snap === 'left' ? 'snap-left' : ''} ${snap === 'right' ? 'snap-right' : ''} ${data.type === 'terminal' ? 'window-terminal' : ''}`;

  return <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} className={className} style={!maximized && !snap ? { left: pos.x, top: pos.y, zIndex } : { zIndex }} onMouseDown={focus}>
    {snapPreview && <div className={`snap-preview ${snapPreview}`} />}
    <div className="window-bar" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onDoubleClick={toggleMax}>
      <div className="window-controls">
        <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => close()} aria-label="Close"><X size={13} /></button>
        <button type="button" onPointerDown={e => e.stopPropagation()} onClick={() => setMinimized(true)} aria-label="Minimize"><Minus size={13} /></button>
        <button type="button" onPointerDown={e => e.stopPropagation()} onClick={splitWindow} aria-label="Split left"><Columns2 size={12} /></button>
        <button type="button" onPointerDown={e => e.stopPropagation()} onClick={toggleMax} aria-label={maximized ? 'Restore' : 'Maximize'}><Maximize2 size={12} /></button>
      </div>
      <b>{title}</b><span>LOCAL</span>
    </div>
    <div className="window-body">
      {data.type === 'about' && <Profile />}
      {data.type === 'projects' && <Projects xp={xp} openProject={actions.openProject} />}
      {data.type === 'contact' && <Contact />}
      {data.type === 'terminal' && <Terminal />}
      {data.type === 'games' && <GamesMenu open={startGame} />}
      {data.type === 'project' && <ProjectDetail id={data.project} />}
      {data.type === 'game' && <GameView id={data.game} game={game} start={startGame} actions={actions} backToGames={() => navigate(windowId, { type: 'games' })} />}
    </div>
  </motion.div>;
}

function Projects({ xp, openProject }) { return <><div className="window-kicker">ARCHIVE INDEX</div><h3>Recovered <span>builds.</span></h3>{projects.map(p => <button className={`module-row clickable ${xp >= p.unlock ? '' : 'locked-row'}`} key={p.id} onClick={() => openProject(p)}><span>{xp >= p.unlock ? 'OPEN' : 'LOCKED'}</span><b>{p.title}</b><small>{xp >= p.unlock ? 'AVAILABLE' : `${p.unlock} XP`}</small></button>)}</>; }
function ProjectDetail({ id }) {
  const p = projects.find(x => x.id === id);
  if (!p) return null;
  const links = p.links || {};
  const bullets = p.highlights || ['Problem → system design → implementation', 'Interaction details treated as part of the product', 'Built to be understandable, not merely impressive'];
  const index = projects.findIndex(x => x.id === id);
  return <div className="project-detail">
    <div className="window-kicker">PROJECT MODULE / {p.kicker}</div>
    <div className="project-detail-head"><div><h3>{p.title.split(' ')[0]} <span>{p.title.split(' ').slice(1).join(' ')}.</span></h3><p className="lead">{p.body}</p></div><div className="project-detail-code">{String(p.unlock).padStart(2,'0')} XP</div></div>
    <div className="project-detail-visual-wrap"><ProjectVisualMini index={index} title={p.title} /></div>
    <div className="project-detail-grid">
      <div className="project-detail-block"><small>STACK</small><b>{p.tech}</b></div>
      <div className="project-detail-block"><small>ROLE</small><b>{p.role || 'BUILD / DESIGN / SYSTEMS'}</b></div>
      <div className="project-detail-block"><small>STATUS</small><b>{p.status || 'ARCHIVED BUILD'}</b></div>
    </div>
    <div className="project-detail-section"><div className="window-kicker">FIELD NOTES</div>{bullets.map((x,i)=><div className="project-note" key={i}><span>0{i+1}</span><p>{x}</p></div>)}</div>
    <div className="project-detail-footer"><div><small>LINKS</small><div className="project-links">{links.github ? <a href={links.github} target="_blank" rel="noreferrer" onClick={() => track('project_link_click', { project: p.id, link: 'github' })}>GITHUB ↗</a> : <span>GITHUB / ADD REPO</span>}{links.live ? <a href={links.live} target="_blank" rel="noreferrer" onClick={() => track('project_link_click', { project: p.id, link: 'live' })}>LIVE ↗</a> : <span>LIVE / NO PUBLIC URL</span>}</div></div><div className="project-status-chip">MODULE OPEN</div></div>
  </div>;
}

function ProjectVisualMini({ index, title }) {
  const stamps = [
    ['REGISTRY', 'LABEL / PRODUCT  /  PACKAGE', 'ACTIVE', 'L-P-P'],
    ['PIPELINE', 'EXTRACT  →  TRANSFORM  →  LOAD', '07 SIGNALS', 'DATA'],
    ['MOTION', 'STATE  /  INPUT  /  FEEDBACK', 'SYNC', 'UI'],
    ['FIELD NOTE', 'SMALL BUILDS  /  ODD IDEAS', 'OPEN', 'K/04']
  ];
  const item = stamps[index] || stamps[0];
  return <div className={`project-detail-visual pdv-${index}`}><div className="pdv-top"><span>{String(index+1).padStart(2,'0')} / {item[0]}</span><b>{item[2]}</b></div><div className="pdv-main"><strong>{item[3]}</strong><span>{item[1]}</span></div><div className="pdv-title">{title}</div><i/><i/><i/></div>;
}

function Contact() { return <><div className="window-kicker">CHANNEL READY</div><h3>Let's build<br /><span>something.</span></h3><p className="lead">A good interface is a conversation. This is the part where yours starts.</p><a className="contact-link" href="mailto:kamalkdk15@gmail.com">kamalkdk15@gmail.com ↗</a></>; }

function GameView({ id, game, start, actions, backToGames }) {
  const back = <button className="game-back" onClick={backToGames}>← BACK TO PLAYROOM</button>;
  if (game.time === 0 && !game.running) return <>{back}<div className="game-timeout"><div className="game-timeout-inner"><b>TIME EXPIRED</b><small>The round ended. Human concentration remains under investigation.</small><button onClick={() => start(id)}>RETRY ROUND</button></div></div></>;
  if (id === 'reaction') return <>{back}<ReactionGame game={game} start={start} hit={actions.hitReaction} /></>;
  if (id === 'signal') return <>{back}<SignalGame game={game} answer={actions.signalAnswer} /></>;
  if (id === 'impostor') return <>{back}<ImpostorGame game={game} answer={actions.impostorAnswer} /></>;
  if (id === 'sequence') return <>{back}<SequenceGame game={game} answer={actions.sequenceAnswer} /></>;
  return <>{back}<MemoryGame game={game} tap={actions.memoryTap} start={start} />;</>;
}
