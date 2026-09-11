import { ArrowUpRight } from 'lucide-react';
import { games } from '../data/games';

export default function GamesMenu({ open }) {
  return <><div className="window-kicker">PLAYROOM / SELECT</div><h3>Choose your <span>problem.</span></h3><div className="game-menu">
    {games.map(game=>{const Icon=game.icon;return <button key={game.id} onClick={()=>open(game.id)}><Icon size={19}/><span><b>{game.name}</b><small>{game.desc}</small></span><ArrowUpRight size={16}/></button>})}
  </div></>;
}
