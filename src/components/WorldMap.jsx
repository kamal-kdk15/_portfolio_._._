import { ArrowUpRight } from 'lucide-react';

export default function WorldMap({ nodes, projects, xp, visited, archiveReached, onNode, onProject }) {
  const revealed = archiveReached ? projects.filter(project => xp >= project.unlock) : [];

  return <div className="world-map">
    <div className="map-label top">FIELD INSTANCE / LOCAL ARCHIVE</div>
    <div className="map-axis x" /><div className="map-axis y" />
    <div className="orbit orbit-a" /><div className="orbit orbit-b" />
    <div className="map-path path-a" /><div className="map-path path-b" />

    <div className="character" style={{ left: visited.length ? `${nodes.find(n => n.id === visited[visited.length - 1])?.x || 50}%` : '50%', top: visited.length ? `${nodes.find(n => n.id === visited[visited.length - 1])?.y || 50}%` : '50%' }}>
      <div className="char-head" /><div className="char-body" /><div className="char-arm a" /><div className="char-arm b" /><div className="char-leg a" /><div className="char-leg b" /><span>YOU</span>
    </div>

    {nodes.map(node => { const Icon = node.icon; return <button key={node.id} className={`world-node ${visited.includes(node.id) ? 'visited' : ''} ${node.id === 'terminal' ? 'shell-node' : ''}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => onNode(node)}><span className="node-ring"><Icon size={18} /></span><span className="node-text"><strong>{node.label}</strong><small>{node.sub}</small></span></button>; })}

    {revealed.map((project, index) => <button key={project.id} className="case-node" style={{ left: `${20 + index * 22}%`, top: `${78 - (index % 2) * 18}%` }} onClick={() => onProject(project)}><span>CASE {String(index + 1).padStart(2, '0')}</span><b>{project.title}</b><ArrowUpRight size={13} /></button>)}

    {!archiveReached && <div className="map-discovery"><b>ARCHIVE NOT REACHED</b><span>Move through the field to reveal project case files.</span></div>}
    {archiveReached && <div className="map-discovery discovered"><b>{revealed.length} CASE FILE{revealed.length === 1 ? '' : 'S'} DISCOVERED</b><span>Reach new levels to recover more builds.</span></div>}
    <div className="map-help"><span>CLICK A NODE TO MOVE</span><span>EXPLORE · INTERACT · UNLOCK</span></div>
  </div>;
}
