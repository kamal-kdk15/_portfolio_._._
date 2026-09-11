import { RotateCcw } from 'lucide-react';
import { randomInt } from './gameUtils';

export function makeMemoryRound(round = 0) {
  const length = Math.min(7, 3 + Math.floor(round / 2));
  const picks = [];
  while (picks.length < length) {
    const n = randomInt(0, 8);
    if (!picks.includes(n)) picks.push(n);
  }
  return { round: round + 1, pattern: picks, showing: true, selected: [], length };
}

export default function MemoryGame({ game, tap, start }) {
  const done = game.selected?.length === game.pattern?.length;
  const visible = game.showing && game.revealIndex >= 0 ? game.pattern?.[game.revealIndex] : -1;
  return <div className="game-view">
    <div className="game-head"><div><span>MEMORY TRACE</span><strong>ROUND {game.round}</strong></div><div><span>TIME</span><strong>{String(game.time).padStart(2, '0')}s</strong></div></div>
    <div className="memory-board">
      <div className="memory-grid">{Array.from({ length: 9 }, (_, i) => <button key={i} className={`${visible === i ? 'memory-on' : ''} ${game.selected?.includes(i) ? 'memory-selected' : ''}`} onClick={() => tap(i)} disabled={game.showing}>{i + 1}</button>)}</div>
      {game.showing ? <div className="memory-message"><b>WATCH</b><small>One tile at a time. Remember the order.</small></div> : done ? <div className="memory-message"><b>TRACE COMPLETE</b><button onClick={() => start('memory')}><RotateCcw size={14} /> NEXT ROUND</button></div> : <div className="memory-message"><b>YOUR TURN</b><small>Tap the tiles in the exact order they flashed.</small></div>}
    </div>
  </div>;
}
