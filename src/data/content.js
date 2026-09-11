import { UserRound, FolderOpen, Gamepad2, Mail, TerminalSquare } from 'lucide-react';

export const projects = [
  { id:'ndc', title:'NDC MANAGEMENT', kicker:'SYSTEM / WEB', tech:'Next.js · PostgreSQL · NextAuth · Vercel', unlock:0, body:'A full-stack NDC (National Drug Code) management system built during a Pharma IT internship at Sun Pharma — covering registry, audit trail and admin workflows end to end.', role:'Full-stack developer', status:'WORKING BUILD', highlights:['Google SSO login via NextAuth, with an admin panel for user and session management','Secure auth: bcrypt password hashing, login rate-limiting, failed-login audit logging','NDC registry and audit trail modules with Excel/CSV export'] , links:{github:'https://github.com/kamal-kdk15/stackblitz-ndc-management'} },
  { id:'novafold', title:'NOVAFOLD AI', kicker:'AI / RESEARCH', tech:'NovaFold AI · AlphaFold 2 · I-TASSER · Protean 3D', unlock:25, body:'Research and evaluation of NovaFold AI, DNASTAR\u2019s cloud-based protein structure prediction platform, carried out during a Pharma IT internship at Sun Pharma.', role:'Research / AI evaluation', status:'CASE STUDY', highlights:['Lets lab scientists predict 3D protein structures from amino acid sequences without specialized bioinformatics expertise','Cuts structure-determination time from weeks of traditional lab methods down to hours','Evaluated for pharma-relevant protein classes: membrane-bound proteins, GPCRs, fusion and multidomain proteins'] },
  { id:'resume-analyser', title:'AI RESUME ANALYSER', kicker:'AI / WEB APP', tech:'Next.js · Puter.js · Claude API · PostgreSQL', unlock:50, body:'A personal project: an AI-powered resume analyser that reviews resumes and generates structured feedback.', role:'Full-stack / AI integration', status:'PERSONAL PROJECT', highlights:['Integrated Claude via Puter.js to review resumes and generate feedback','Stored resumes, analysis history and scores in a PostgreSQL database','UI surfaces section-wise feedback and an overall resume score'] },
  { id:'devdo', title:'DEVDO', kicker:'WEB / SOCIAL PLATFORM', tech:'JavaScript · jQuery · Laravel · Bootstrap · AJAX', unlock:75, body:'A dynamic website inspired by LinkedIn and GitHub, letting developers, designers and companies connect and collaborate.', role:'Full-stack developer', status:'BUILD', highlights:['Role-based profiles with portfolios, job postings and applications','Social features including follow, like and comment','AJAX-driven interactions, styled with SCSS and Bootstrap for a responsive design'] }
];

export const nodes = [
  { id:'profile', label:'PROFILE', sub:'who is operating this?', x:17, y:31, icon:UserRound, action:'about' },
  { id:'archive', label:'ARCHIVE', sub:'recover the builds', x:66, y:27, icon:FolderOpen, action:'projects' },
  { id:'games', label:'PLAYROOM', sub:'break your brain', x:72, y:67, icon:Gamepad2, action:'games' },
  { id:'comms', label:'COMMS', sub:'open a channel', x:28, y:70, icon:Mail, action:'contact' },
  { id:'terminal', label:'SHELL', sub:'type something', x:48, y:49, icon:TerminalSquare, action:'terminal' }
];
