import { RotateCcw, Timer } from 'lucide-react';

export default function ReactionGame({ game, start, hit }) {
  return <div className="game-view">
    <div className="game-head"><div><span>REFLEX FIELD</span><strong>{game.hits}/7</strong></div><div><span>TIME</span><strong>{String(game.time).padStart(2, '0')}s</strong></div></div>
    <div className="game-board reaction-board">
      {game.running ? <button className="target" style={{ left: `${game.target.x}%`, top: `${game.target.y}%` }} onClick={hit} aria-label="Hit target"><i /><i /><i /></button> : <div className="game-idle"><Timer size={30} /><b>{game.hits >= 7 ? 'FIELD CLEARED' : game.time === 0 ? 'TIME EXPIRED' : 'READY?'}</b><small>Seven targets. Ten seconds per run.</small><button onClick={() => start('reaction')}><RotateCcw size={14} /> START</button></div>}
    </div>
  </div>;
}
