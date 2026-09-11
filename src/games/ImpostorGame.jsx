import { randomInt } from './gameUtils';

export function makeImpostorRound(round = 0) {
  const size = 25;
  return { round: round + 1, oddIndex: randomInt(0, size - 1), size };
}

export default function ImpostorGame({ game, answer }) {
  return <div className="game-view">
    <div className="game-head"><div><span>IMPOSTOR MATRIX</span><strong>ROUND {game.round}</strong></div><div><span>TIME</span><strong>{String(game.time).padStart(2, '0')}s</strong></div></div>
    <div className="impostor-board">{Array.from({ length: game.size || 25 }, (_, i) => <button key={i} onClick={() => answer(i)} aria-label={`Tile ${i + 1}`}><span className={i === game.oddIndex ? 'impostor-dot odd' : 'impostor-dot'} /></button>)}</div>
    <p className="game-hint">Find the one tile with a subtly different dot. The difference stays small on purpose.</p>
  </div>;
}
