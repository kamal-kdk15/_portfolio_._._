import { useState } from 'react';
import { projects } from '../data/content';

export default function Terminal() {
  const [lines,setLines] = useState(['KAMAL SHELL v1.0','Portfolio shell simulator. Type "help" to see commands.']);
  const [input,setInput] = useState('');

  function run() {
    const command = input.trim().toLowerCase();
    if (!command) return;
    if (command === 'clear') setLines([]);
    else if (command === 'help') setLines(old=>[...old,'help       show commands','whoami     show operator profile','projects   list recovered builds','skills     show current stack','status     show field status','clear      clear shell']);
    else if (command === 'whoami') setLines(old=>[...old,'Kamal / full-stack developer / web + data engineering + AI']);
    else if (command === 'projects') setLines(old=>[...old,...projects.map(p=>`${p.title} / ${p.tech}`)]);
    else if (command === 'skills') setLines(old=>[...old,'Next.js · Node.js (PERN) · PostgreSQL · Databricks · AI & Automation (n8n) · GSAP']);
    else if (command === 'status') setLines(old=>[...old,'FIELD ONLINE / ARCHIVE LOCAL / TERMINAL SIMULATED']);
    else setLines(old=>[...old,`command not found: ${command}`]);
    setInput('');
  }

  return <>
    <div className="window-kicker">SIMULATED SHELL / PORTFOLIO</div>
    <div className="terminal-note">This is not a real operating-system terminal. It is an interactive portfolio shell with commands wired to the site.</div>
    <div className="terminal-output">{lines.map((line,index)=><div key={index}>{line}</div>)}</div>
    <div className="terminal-input"><span>›</span><input autoFocus value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()} placeholder="type a command" /></div>
  </>;
}
