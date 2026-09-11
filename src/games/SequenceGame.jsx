import { shuffled, randomInt } from './gameUtils';

export function makeSequenceRound(round = 0) {
  const type = randomInt(0, 2);
  let sequence;
  let answer;
  if (type === 0) { const start = randomInt(2, 9); const step = randomInt(2, 6); sequence = [start, start + step, start + step * 2, start + step * 3]; answer = start + step * 4; }
  else if (type === 1) { const start = randomInt(2, 5); sequence = [start, start * 2, start * 4, start * 8]; answer = start * 16; }
  else { const start = randomInt(1, 4); sequence = [start, start + 1, start + 3, start + 6, start + 10]; answer = start + 15; }
  return { round: round + 1, sequence, answer, options: shuffled([answer, answer - 1, answer + 2, Math.max(1, answer - 3)]) };
}

export default function SequenceGame({ game, answer }) {
  return <div className="game-view">
    <div className="game-head"><div><span>PATTERN LOCK</span><strong>ROUND {game.round}</strong></div><div><span>TIME</span><strong>{String(game.time).padStart(2, '0')}s</strong></div></div>
    <div className="sequence-board"><div className="sequence">{game.sequence?.map((n, i) => <span key={i}>{n}</span>)}<b>?</b></div><div className="answer-grid">{game.options?.map(o => <button key={o} onClick={() => answer(o)}>{o}</button>)}</div></div>
  </div>;
}
