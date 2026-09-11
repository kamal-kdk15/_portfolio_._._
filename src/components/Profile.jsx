import { useState } from 'react';
import { Download, Shield, Zap, Database, Code2, Brain, Briefcase, Crosshair, Wrench, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile } from '../data/profile';
import { track } from '../lib/analytics';

const icons = [Code2, Database, Brain, Zap, Shield, Briefcase];
const modes = [
  { id: 'build', label: 'BUILD MODE', icon: Wrench, note: 'Shipping systems, interfaces and practical software.' },
  { id: 'scan', label: 'SCAN MODE', icon: Eye, note: 'Tracing states, data and the details other people miss.' },
  { id: 'debug', label: 'DEBUG MODE', icon: Crosshair, note: 'Break it deliberately. Fix it properly.' }
];

export default function Profile() {
  const [mode, setMode] = useState('build');
  const activeMode = modes.find(item => item.id === mode) || modes[0];

  return <div className="profile-screen">
    <div className="window-kicker">PLAYER PROFILE / CHARACTER SHEET</div>

    <div className="profile-hero">
      <motion.div className={`character-card character-mode-${mode}`} whileHover={{ y: -4 }}>
        <motion.div className="character-glow" animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="rpg-character" animate={{ y: [0, -5, 0], rotate: [0, -1.5, 0, 1.5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="rpg-head" />
          <div className="rpg-hair" />
          <div className="rpg-body" />
          <div className="rpg-arm left" />
          <div className="rpg-arm right" />
          <div className="rpg-leg left" />
          <div className="rpg-leg right" />
          <div className="rpg-device" />
          <motion.div className="rpg-scanline" animate={{ y: [-72, 86] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }} />
        </motion.div>
        <div className="character-tag">LVL 02 / BUILDER</div>
        <div className="character-mode">{activeMode.label}</div>
      </motion.div>

      <div className="profile-copy">
        <span className="profile-class">{profile.className}</span>
        <h3>{profile.name}<span>.</span></h3>
        <p className="lead">{profile.bio}</p>

        <div className="profile-attributes">
          {profile.attributes.map(([name, value]) => <motion.div key={name} whileHover={{ y: -3 }}><span>{name}</span><strong>{value}</strong></motion.div>)}
        </div>

        <div className="loadout-strip">
          <span className="loadout-label">LOADOUT</span>
          <div>
            {modes.map(({ id, label, icon: Icon }) => <button key={id} className={mode === id ? 'active' : ''} onClick={() => setMode(id)}><Icon size={12} /> {label}</button>)}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode} className="mode-note" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: .18 }}>
            <span>//</span> {activeMode.note}
          </motion.div>
        </AnimatePresence>

        <a className="resume-button" href="/resume.pdf" download="Kamal-Resume.pdf" onClick={() => track('resume_download')}><Download size={15} /> DOWNLOAD RESUME</a>
      </div>
    </div>

    <div className="profile-divider"><span>SKILL TREE</span><small>STAT ALLOCATION / CURRENT BUILD</small></div>
    <div className="skill-tree">
      {profile.skills.map((skill, index) => {
        const Icon = icons[index % icons.length];
        return <motion.div className="skill-node" key={skill.name} whileHover={{ x: 5 }}>
          <div className="skill-icon"><Icon size={15} /></div>
          <div className="skill-info"><div><b>{skill.name}</b><span>{skill.stat}</span></div><div className="skill-bar"><motion.i initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: .8, delay: index * .06, ease: 'easeOut' }} /></div></div>
          <strong>{skill.level}</strong>
        </motion.div>;
      })}
    </div>

    <div className="profile-divider"><span>WORK LOG</span><small>RECORDED BUILDS / EXPERIENCE</small></div>
    <div className="experience-list">
      {profile.experience.map(item => <motion.article key={`${item.role}-${item.company}`} className="experience-item" whileHover={{ x: 5 }}>
        <span>{item.period}</span>
        <div><h4>{item.role}</h4><b>{item.company}</b><p>{item.body}</p></div>
      </motion.article>)}
    </div>
  </div>;
}
