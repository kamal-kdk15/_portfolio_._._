import { randomInt } from './gameUtils';

const colors = [
  { name: 'RED', value: '#d85b3e' },
  { name: 'BLUE', value: '#426b8e' },
  { name: 'YELLOW', value: '#c79a42' },
  { name: 'CREAM', value: '#eee7d8' }
];

export function makeSignalRound(round = 0) {
  const word = colors[randomInt(0, colors.length - 1)];
  let ink = colors[randomInt(0, colors.length - 1)];
  if (ink.name === word.name) ink = colors[(colors.indexOf(ink) + 1) % colors.length];
  return { round: round + 1, word, ink, answer: ink.name, options: colors.map(c => c.name) };
}

export default function SignalGame({ game, answer }) {
  return <div className="game-view">
    <div className="game-head"><div><span>SIGNAL DRIFT</span><strong>ROUND {game.round}</strong></div><div><span>TIME</span><strong>{String(game.time).padStart(2, '0')}s</strong></div></div>
    <div className="signal-board">
      <div className="rule-card"><b>IGNORE THE WORD.</b><span>Choose the <strong>INK COLOUR</strong>, not the word you read.</span></div>
      <div className="signal-word" style={{ color: game.ink?.value || 'var(--ink)' }}>{game.word?.name || 'READY'}</div>
      <div className="answer-grid">{game.options.map(o => <button key={o} onClick={() => answer(o)}>{o}</button>)}</div>
    </div>
  </div>;
}
