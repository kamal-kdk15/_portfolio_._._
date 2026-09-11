import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Mail, MousePointer2, Sparkles, Braces, MousePointer2 as CursorIcon, Activity } from 'lucide-react';
import { projects, nodes } from './data/content';
import { games } from './data/games';
import { makeSignalRound } from './games/SignalGame';
import { makeImpostorRound } from './games/ImpostorGame';
import { makeSequenceRound } from './games/SequenceGame';
import { makeMemoryRound } from './games/MemoryGame';
import Boot from './components/Boot';
import ThemeDock from './components/ThemeDock';
import WorldMap from './components/WorldMap';
import WindowManager from './components/WindowManager';
import './styles.css';
import { track } from './lib/analytics';
import AnalyticsDashboard from './components/AnalyticsDashboard';

gsap.registerPlugin(ScrollTrigger);

const blankGame = {
  id: null, running: false, hits: 0, time: 15, target: { x: 50, y: 50 }, round: 0,
  answer: null, options: [], word: null, ink: null, oddIndex: null, size: 25,
  sequence: null, selected: [], pattern: [], showing: false, revealIndex: -1
};
const GAME_TIME = 10;

function signature(item) { return `${item.type}:${item.project || ''}:${item.game || ''}`; }

function ProjectVisual({ project, index, unlocked }) {
  const visuals = [
    <div className="viz-ndc"><div className="viz-sidebar"><i/><i/><i/><i/></div><div className="viz-table"><span className="viz-title">NDC / REGISTRY</span><div className="viz-row head"><i>PRODUCT</i><i>PACKAGE</i><i>STATUS</i></div>{[1,2,3].map(i => <div className="viz-row" key={i}><i>70{100+i}</i><i>00{i}</i><b>{i === 3 ? 'ACTIVE' : 'READY'}</b></div>)}</div><div className="viz-cursor"><CursorIcon size={18}/></div></div>,
    <div className="viz-data"><div className="viz-axis"/><div className="viz-bars">{[52,76,44,88,63,96,58].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div><div className="viz-sparkline"><span/><span/><span/><span/><span/></div><small>PIPELINE / 07 SIGNALS</small></div>,
    <div className="viz-interaction"><div className="viz-panel p1"><Braces size={20}/><b>STATE</b><span>READY</span></div><div className="viz-panel p2"><MousePointer2 size={20}/><b>INPUT</b><span>LIVE</span></div><div className="viz-panel p3"><Activity size={20}/><b>MOTION</b><span>SYNC</span></div><div className="viz-beam"/></div>,
    <div className="viz-field"><span className="field-label">FIELD NOTES / 04</span><div className="field-box">{[0,1,2,3].map(i=><i key={i}/>)}</div><div className="field-mark">K</div><div className="field-caption">SMALL BUILDS / ODD IDEAS / TESTS</div></div>
  ];
  return <div className={`project-art visual-${index} ${unlocked ? 'unlocked-art' : 'locked-art'}`}>
    <span className="visual-index">{unlocked ? `0${index + 1}` : 'LOCK'}</span>
    {unlocked ? visuals[index] : <div className="locked-artwork"><span>ARCHIVE SEALED</span><b>REACH {project.unlock} XP</b><i/></div>}
  </div>;
}


function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    ['01', 'MOVE THROUGH THE FIELD', 'Click a node on the map. Your character travels there and marks the area as explored.'],
    ['02', 'EARN XP ONCE', 'Useful discoveries, project inspections and completed game milestones award XP. Repeating the same action does not farm XP.'],
    ['03', 'RECOVER THE ARCHIVE', 'Reach the ARCHIVE to reveal case files. More XP unlocks deeper project modules.'],
    ['04', 'USE THE DESKTOP', 'Windows can be dragged, split left or right, maximized, minimized and restored. You can keep several open together.']
  ];
  const item = steps[step];
  return <motion.div className="onboarding-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <motion.div className="onboarding-card" initial={{y:22,opacity:0}} animate={{y:0,opacity:1}}>
      <div className="onboarding-top"><span>FIELD BRIEFING</span><b>{item[0]} / 04</b></div>
      <div className="onboarding-mark">{item[0]}</div>
      <h2>{item[1]}</h2>
      <p>{item[2]}</p>
      <div className="onboarding-dots">{steps.map((_,i)=><i key={i} className={i===step?'active':''}/>)}</div>
      <div className="onboarding-actions"><button className="onboarding-skip" onClick={onDone}>SKIP BRIEFING</button>{step < steps.length-1 ? <button className="onboarding-next" onClick={()=>setStep(step+1)}>NEXT <ArrowUpRight size={15}/></button> : <button className="onboarding-next" onClick={onDone}>ENTER FIELD <ArrowUpRight size={15}/></button>}</div>
    </motion.div>
  </motion.div>;
}

export default function App() {
  if (window.location.pathname === '/analytics') {
    const [dashTheme, setDashTheme] = useState(() => localStorage.getItem('kamal-theme') || 'system');
    useEffect(() => { localStorage.setItem('kamal-theme', dashTheme); }, [dashTheme]);
    return <AnalyticsDashboard theme={dashTheme} setTheme={setDashTheme} />;
  }
  const [started, setStarted] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [windows, setWindows] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('kamal-theme') || 'system');
  const [awarded, setAwarded] = useState(new Set());
  const [toast, setToast] = useState('');
  const [scroll, setScroll] = useState(0);
  const [game, setGame] = useState(blankGame);
  const [visited, setVisited] = useState([]);
  const [archiveReached, setArchiveReached] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => localStorage.getItem('kamal-onboarding-seen') !== '1');
  const zRef = useRef(60);
  const idRef = useRef(0);

  const levelName = xp >= 75 ? 'ARCHITECT' : xp >= 50 ? 'BUILDER' : xp >= 25 ? 'MAKER' : 'SCOUT';

  useEffect(() => {
    const marker = sessionStorage.getItem('kamal-session-started');
    if (!marker) { track('session_start'); sessionStorage.setItem('kamal-session-started', '1'); }
  }, []);

  useEffect(() => { localStorage.setItem('kamal-theme', theme); }, [theme]);
  useEffect(() => { setLevel(xp >= 75 ? 4 : xp >= 50 ? 3 : xp >= 25 ? 2 : 1); }, [xp]);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!started) return;
    gsap.fromTo('.hero-word', { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out' });
    gsap.fromTo('.world-node', { scale: .75, opacity: 0 }, { scale: 1, opacity: 1, stagger: .08, duration: .7, delay: .25, ease: 'back.out(1.7)' });
    const reveals = gsap.utils.toArray('.reveal');
    reveals.forEach(el => gsap.fromTo(el, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 82%', once: true } }));
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [started]);

  useEffect(() => {
    if (!game.running) return;
    const timer = setInterval(() => setGame(g => g.time <= 1 ? { ...g, running: false, time: 0 } : { ...g, time: g.time - 1 }), 1000);
    return () => clearInterval(timer);
  }, [game.running, game.round]);

  useEffect(() => {
    if (!game.running || game.id !== 'memory' || !game.showing) return;
    if (game.revealIndex >= game.pattern.length - 1) {
      const finish = setTimeout(() => setGame(g => ({ ...g, showing: false, revealIndex: -1 })), 150);
      return () => clearTimeout(finish);
    }
    const reveal = setTimeout(() => setGame(g => ({ ...g, revealIndex: g.revealIndex + 1 })), 240);
    return () => clearTimeout(reveal);
  }, [game.running, game.id, game.showing, game.revealIndex, game.pattern.length]);

  function notify(message) { setToast(message); setTimeout(() => setToast(''), 1800); }
  function completeOnboarding() { localStorage.setItem('kamal-onboarding-seen', '1'); setOnboardingOpen(false); track('onboarding_complete'); award(3, 'onboarding', 'FIELD BRIEFING READ'); }

  function award(amount, key, msg) {
    setAwarded(old => {
      if (old.has(key)) return old;
      const next = new Set(old);
      next.add(key);
      setXp(value => Math.min(100, value + amount));
      notify(`+${amount} XP  /  ${msg}`);
      return next;
    });
  }

  function focusWindow(id) {
    zRef.current += 1;
    const next = zRef.current;
    setWindows(old => old.map(item => item.id === id ? { ...item, z: next } : item));
  }

  function openWindow(payload) {
    const key = signature(payload);
    const existing = windows.find(item => signature(item) === key);
    if (existing) { focusWindow(existing.id); return existing.id; }
    zRef.current += 1;
    const id = `${payload.type}-${++idRef.current}`;
    setWindows(old => [...old, { ...payload, id, z: zRef.current }]);
    return id;
  }

  function closeWindow(id) { setWindows(old => old.filter(item => item.id !== id)); }
  function navigateWindow(id, payload) { setWindows(old => old.map(item => item.id === id ? { ...item, ...payload } : item)); }

  function moveToNode(node) {
    track('map_node_open', { node: node.id, action: node.action });
    setVisited(old => old.includes(node.id) ? old : [...old, node.id]);
    if (node.action === 'projects') setArchiveReached(true);
    openPanel(node.action);
  }

  function openPanel(type) {
    const labels = { about: ['about', 'PROFILE DISCOVERED'], projects: ['archive', 'ARCHIVE ACCESSED'], contact: ['contact', 'CHANNEL OPEN'], terminal: ['shell', 'SHELL FOUND'], games: ['playroom', 'PLAYROOM FOUND'] };
    const id = openWindow({ type });
    if (labels[type]) award(5, labels[type][0], labels[type][1]);
    return id;
  }

  function openProject(project) {
    track('project_open', { project: project.id, unlock: project.unlock });
    if (xp < project.unlock) { notify(`LOCKED / NEED ${project.unlock} XP`); return; }
    openWindow({ type: 'project', project: project.id });
    award(3, `project:${project.id}`, 'BUILD INSPECTED');
  }

  function resetGameState(id) {
    if (id === 'reaction') return { ...blankGame, id, running: true, time: GAME_TIME, hits: 0, target: { x: 10 + Math.random() * 80, y: 12 + Math.random() * 76 }, round: 1 };
    if (id === 'signal') { const r = makeSignalRound(0); return { ...blankGame, id, running: true, time: GAME_TIME, round: r.round, word: r.word, ink: r.ink, answer: r.answer, options: r.options }; }
    if (id === 'impostor') { const r = makeImpostorRound(0); return { ...blankGame, id, running: true, time: GAME_TIME, round: r.round, oddIndex: r.oddIndex, size: r.size }; }
    if (id === 'sequence') { const r = makeSequenceRound(0); return { ...blankGame, id, running: true, time: GAME_TIME, round: r.round, sequence: r.sequence, answer: r.answer, options: r.options }; }
    const r = makeMemoryRound(0);
    return { ...blankGame, id, running: true, time: GAME_TIME, round: r.round, pattern: r.pattern, selected: [], showing: true, revealIndex: 0, length: r.length };
  }

  function launchGame(id) { track('game_open', { game: id }); openWindow({ type: 'game', game: id }); setGame(resetGameState(id)); }
  function nextRound(roundFactory) { const r = roundFactory(game.round); setGame(g => ({ ...g, time: GAME_TIME, round: r.round, ...r })); }
  function hitReaction() {
    if (!game.running || game.time <= 0) return;
    const hits = game.hits + 1;
    if (hits >= 7) { setGame(g => ({ ...g, hits, running: false })); award(10, 'game:reaction:complete', 'REFLEX FIELD CLEARED'); return; }
    setGame(g => ({ ...g, hits, time: GAME_TIME, target: { x: 8 + Math.random() * 84, y: 10 + Math.random() * 80 } }));
  }
  function signalAnswer(value) { track('game_answer', { game: 'signal', round: game.round, correct: value === game.answer }); if (!game.running || game.time <= 0) return; if (value === game.answer) { award(4, `signal:${game.round}`, 'SIGNAL CRACKED'); nextRound(makeSignalRound); } else notify('NOPE / THE WORD WAS THE DISTRACTION'); }
  function impostorAnswer(index) { track('game_answer', { game: 'impostor', round: game.round, correct: index === game.oddIndex }); if (!game.running || game.time <= 0) return; if (index === game.oddIndex) { award(5, `impostor:${game.round}`, 'IMPOSTOR FOUND'); nextRound(makeImpostorRound); } else notify('FALSE ALARM / KEEP LOOKING'); }
  function sequenceAnswer(value) { track('game_answer', { game: 'sequence', round: game.round, correct: Number(value) === Number(game.answer) }); if (!game.running || game.time <= 0) return; if (Number(value) === Number(game.answer)) { award(5, `sequence:${game.round}`, 'PATTERN CRACKED'); nextRound(makeSequenceRound); } else notify('PATTERN DENIED / YOUR BRAIN GOT CREATIVE'); }
  function memoryTap(index) {
    if (game.showing || !game.running || game.time <= 0) return;
    const expected = game.pattern[game.selected.length];
    if (index !== expected) { notify('TRACE BROKEN / START THIS ROUND AGAIN'); setGame(g => ({ ...g, selected: [] })); return; }
    const selected = [...game.selected, index];
    if (selected.length === game.pattern.length) { award(6, `memory:${game.round}`, 'MEMORY TRACE COMPLETE'); setGame(g => ({ ...g, selected, running: false })); return; }
    setGame(g => ({ ...g, selected }));
  }

  const actions = { openProject, hitReaction, signalAnswer, impostorAnswer, sequenceAnswer, memoryTap };

  return <div className={`site theme-${theme}`}>
    {!started ? <Boot onStart={() => setStarted(true)} theme={theme} setTheme={setTheme} /> : <>
      <header className="hud">
        <div className="brand"><span className="signal" /> KAMAL <span className="muted">/ FIELD 02</span></div>
        <div className="hud-center">LEVEL {String(level).padStart(2, '0')} <i>/</i> {xp}% XP</div>
        <div className="hud-right">{levelName} <i>/</i> SCROLL {String(scroll).padStart(2, '0')}</div>
      </header>

      <main>
        <section className="world section-grid">
          <div className="world-copy">
            <div className="eyebrow"><span>INTERACTIVE PORTFOLIO</span><b>FIELD ONLINE</b></div>
            <h1 className="hero-word">Build.<br /><em>Break.</em><br />Rebuild.</h1>
            <p className="hero-sub">A portfolio disguised as a small game. Explore the field, break a few things, and earn your way into the archive.</p>
            <div className="mission-line"><MousePointer2 size={15} /> MISSION 01 <span>Reach the archive. Recover the builds.</span></div>
            <div className="xp-card"><div><span>PLAYER XP</span><strong>{xp}/100</strong></div><div className="xp-track"><i style={{ width: `${xp}%` }} /></div><small>LEVEL {String(level).padStart(2, '0')} / {levelName}</small></div>
          </div>
          <WorldMap nodes={nodes} projects={projects} xp={xp} visited={visited} archiveReached={archiveReached} onNode={moveToNode} onProject={openProject} />
        </section>

        <section className="statement reveal">
          <div className="section-index">01 / OPERATOR NOTES</div>
          <div className="statement-grid"><div><h2>Interfaces<br />should <span>feel</span><br />alive.</h2></div><div className="statement-copy"><p className="big-copy">I build practical software with a slightly unreasonable amount of attention paid to how it feels to use.</p><p>React / Next.js / data systems / interaction design. Less decoration for decoration's sake. More behaviour that makes the interface memorable.</p></div></div>
          <div className="principles"><div><b>01</b><strong>Make it clear.</strong><span>Good interaction should not need a manual.</span></div><div><b>02</b><strong>Make it useful.</strong><span>The weirdness is fun. The underlying system still has to work.</span></div><div><b>03</b><strong>Make it yours.</strong><span>Small details are how a generic interface becomes a place.</span></div></div>
        </section>

        <section className="archive reveal" id="projects">
          <div className="archive-head"><div><span className="section-index">02 / RECOVERED BUILDS</span><h2>The archive.</h2></div><div className="archive-meta">{projects.filter(project => xp >= project.unlock).length} / {projects.length} UNLOCKED</div></div>
          <div className="project-grid">{projects.map((project, index) => { const unlocked = xp >= project.unlock; return <motion.button whileHover={unlocked ? { y: -5 } : undefined} key={project.id} className={`project-card card-${index} ${unlocked ? '' : 'locked'}`} onClick={() => openProject(project)}><ProjectVisual project={project} index={index} unlocked={unlocked} /><div className="project-info"><div className="project-top"><small>{project.kicker}</small>{unlocked ? <ArrowUpRight size={17} /> : <span>LOCKED</span>}</div><h3>{project.title}</h3><p>{unlocked ? project.tech : `Reach ${project.unlock} XP to recover this build.`}</p></div></motion.button>; })}</div>
        </section>

        <section className="play-section reveal">
          <div className="section-index">03 / PLAYROOM</div><div className="play-intro"><h2>Break your<br /><span>brain.</span></h2><p>Five tiny experiments designed to be easy to understand and annoyingly hard to stop playing.</p></div>
          <div className="game-list">{games.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => launchGame(item.id)}><span className="game-icon"><Icon size={20} /></span><span><b>{item.name}</b><small>{item.desc}</small></span><ArrowUpRight size={18} /></button>; })}</div>
        </section>

        <section className="comms reveal"><div className="section-index">04 / COMMS</div><h2>Make something<br /><span>worth opening.</span></h2><button className="big-action" onClick={() => openPanel('contact')}>OPEN CHANNEL <Mail size={20} /><ArrowUpRight size={20} /></button></section>
      </main>

      <div className="main-theme-chip"><ThemeDock theme={theme} setTheme={setTheme} compact /></div>
      <AnimatePresence>
        {windows.map(win => <WindowManager key={win.id} windowId={win.id} data={win} zIndex={win.z} focus={() => focusWindow(win.id)} close={() => closeWindow(win.id)} xp={xp} startGame={launchGame} game={game} actions={actions} navigate={navigateWindow} windows={windows} />)}
      </AnimatePresence>
      <AnimatePresence>{onboardingOpen && <Onboarding onDone={completeOnboarding} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="toast"><Sparkles size={14} />{toast}</motion.div>}</AnimatePresence>
      <footer><span>KAMAL / FIELD 02</span><span>BUILT WITH CURIOSITY / WARM SYSTEM</span><span>SCROLL TO EXPLORE ↓</span></footer>
    </>}
  </div>;
}
