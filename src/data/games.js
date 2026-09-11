import { Brain, Eye, Shuffle, Timer, Grid3X3 } from 'lucide-react';

export const games = [
  { id:'signal', name:'Signal Drift', desc:'Read the rule, ignore the distraction.', icon:Brain },
  { id:'impostor', name:'Impostor Matrix', desc:'Find the tile that breaks a nearly perfect pattern.', icon:Eye },
  { id:'sequence', name:'Pattern Lock', desc:'Crack the sequence before your brain overthinks it.', icon:Shuffle },
  { id:'memory', name:'Memory Trace', desc:'Watch the pattern. Rebuild it from memory.', icon:Grid3X3 },
  { id:'reaction', name:'Reflex Field', desc:'Catch seven targets before time catches you.', icon:Timer }
];
