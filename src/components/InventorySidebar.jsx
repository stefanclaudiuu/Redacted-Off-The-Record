import { useState } from 'react';
import { X, Package, Lock, Camera, Headphones, FileText, AlertTriangle, Mail, Code, KeyRound, Database, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useEpisodes } from '../context/EpisodeContext';
import { useObjectives } from '../context/ObjectivesContext';
import evidenceData from '../data/evidence.json';

const ICON_MAP = {
  'camera': Camera,
  'headphones': Headphones,
  'file-text': FileText,
  'alert-triangle': AlertTriangle,
  'mail': Mail,
  'code': Code,
  'key-round': KeyRound,
  'database': Database,
};

function getIcon(iconName) {
  return ICON_MAP[iconName] || FileText;
}

export default function InventorySidebar() {
  const { isOpen, setIsOpen, inventory } = useInventory();
  const { episodes } = useEpisodes();
  const { completeByTrigger } = useObjectives();
  const [selectedProbe, setSelectedProbe] = useState(null);
  const [zoomed, setZoomed] = useState(false);

  const handleViewEvidence = (ev, episodeId) => {
    setSelectedProbe({ ...ev, episodeId });
    setZoomed(false);
    completeByTrigger(episodeId, `evidence_viewed_${ev.id}`);
    completeByTrigger(episodeId, 'evidence_viewed_any');
  };

  const unlockedEpisodes = episodes.filter(ep => ep.status === 'unlocked' || ep.status === 'completed');

  const isEvidenceUnlocked = (episodeId, evidenceId) => {
    const items = inventory[episodeId] || [];
    return items.some(e => e.id === evidenceId);
  };

  const getUnlockedEvidence = (episodeId, evidenceId) => {
    const items = inventory[episodeId] || [];
    return items.find(e => e.id === evidenceId) || null;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-96 max-w-[90vw] bg-noir-black border-l border-noir-border z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-noir-border bg-noir-dark">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-noir-red" />
            <h2 className="font-mono text-sm font-bold tracking-widest uppercase text-white">
              Probe Colectate
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-noir-muted hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4">
          {unlockedEpisodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-50">
              <Lock size={32} className="text-noir-muted" />
              <p className="text-xs font-mono text-noir-muted uppercase tracking-widest">
                Niciun dosar activ
              </p>
              <p className="text-xs text-noir-muted">
                Deblochează un episod pentru a începe să colectezi probe.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {unlockedEpisodes.map(episode => {
                const allEvidence = evidenceData[episode.id] || [];
                const collectedCount = (inventory[episode.id] || []).length;

                return (
                  <div key={episode.id}>
                    {/* Episode header */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-mono text-noir-red-light uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-noir-red rounded-full" />
                        {episode.case_name || episode.id}
                      </h3>
                      <span className="text-[10px] font-mono text-noir-muted">
                        {collectedCount}/{allEvidence.length}
                      </span>
                    </div>

                    {/* Evidence grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {allEvidence.map(ev => {
                        const unlocked = isEvidenceUnlocked(episode.id, ev.id);
                        const IconComp = getIcon(ev.icon);

                        return (
                          <div
                            key={ev.id}
                            onClick={() => unlocked && handleViewEvidence(ev, episode.id)}
                            className={`
                              relative rounded-lg p-3 border transition-all duration-200
                              ${unlocked
                                ? 'bg-noir-card border-noir-red/30 cursor-pointer hover:border-noir-red/60 hover:noir-glow'
                                : 'bg-noir-card/20 border-noir-border/30 cursor-not-allowed'
                              }
                            `}
                          >
                            {/* Icon */}
                            <div className={`
                              w-9 h-9 rounded-lg flex items-center justify-center mb-2
                              ${unlocked ? 'bg-noir-red/20' : 'bg-noir-border/20'}
                            `}>
                              {unlocked ? (
                                <IconComp size={16} className="text-noir-red-light" />
                              ) : (
                                <Lock size={14} className="text-noir-muted/40" />
                              )}
                            </div>

                            {/* Info */}
                            <h4 className={`text-[11px] font-semibold mb-0.5 leading-tight ${unlocked ? 'text-white' : 'text-noir-muted/30'}`}>
                              {unlocked ? ev.name : '████████'}
                            </h4>
                            <p className={`text-[9px] font-mono uppercase tracking-wider ${unlocked ? 'text-noir-muted' : 'text-noir-muted/20'}`}>
                              {unlocked ? ev.type : 'Clasificat'}
                            </p>

                            {/* Unlocked indicator */}
                            {unlocked && (
                              <div className="absolute top-2 right-2">
                                <Eye size={10} className="text-noir-red-light" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Evidence Detail Modal */}
      {selectedProbe && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedProbe(null)}
        >
          <div
            className="w-full max-w-md bg-noir-dark border border-noir-border rounded-xl overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-noir-border">
              <div className="flex items-center gap-3">
                {(() => {
                  const IconComp = getIcon(selectedProbe.icon);
                  return (
                    <div className="w-10 h-10 rounded-lg bg-noir-red/20 border border-noir-red/30 flex items-center justify-center">
                      <IconComp size={18} className="text-noir-red-light" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-sm font-semibold text-white">{selectedProbe.name}</h3>
                  <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">{selectedProbe.type} — {selectedProbe.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProbe(null)}
                className="text-noir-muted hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body - evidence visualization */}
            <div className="p-5">
              {/* Visual content area */}
              {selectedProbe.visual ? (
                <div className="w-full rounded-lg bg-noir-card border border-noir-border mb-4 overflow-hidden">
                  {/* File label */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-noir-border/50 bg-noir-dark/50">
                    {(() => {
                      const IconComp = getIcon(selectedProbe.icon);
                      return <IconComp size={12} className="text-noir-red-light" />;
                    })()}
                    <span className="text-[9px] font-mono text-noir-muted tracking-wider">
                      {selectedProbe.visual.label}
                    </span>
                  </div>

                  {/* Content body */}
                  <div className="p-4 relative">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(139,0,0,0.02)_2px,rgba(139,0,0,0.02)_4px)] pointer-events-none" />

                    {/* IMAGE type — scene description */}
                    {selectedProbe.visual.scene && (
                      <div className="relative z-10 space-y-2">
                        <div className={`w-full rounded bg-noir-dark/80 border border-noir-border/50 flex items-center justify-center relative overflow-hidden mb-3 transition-all duration-300 ${zoomed ? 'h-48' : 'h-24'}`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-noir-red/5 to-transparent" />
                          <Camera size={zoomed ? 48 : 32} className="text-noir-red/20" />
                          <div className="absolute bottom-1 right-2">
                            <span className="text-[8px] font-mono text-noir-red-light/50">REC</span>
                          </div>
                          <button
                            onClick={() => setZoomed(!zoomed)}
                            className="absolute top-2 right-2 w-6 h-6 rounded bg-noir-dark/80 border border-noir-border/50 flex items-center justify-center cursor-pointer hover:border-noir-red/50 transition-all z-20"
                          >
                            {zoomed ? <ZoomOut size={10} className="text-noir-muted" /> : <ZoomIn size={10} className="text-noir-muted" />}
                          </button>
                        </div>
                        {selectedProbe.visual.scene.map((line, i) => (
                          <p key={i} className={`font-mono leading-relaxed transition-all duration-300 ${
                            zoomed
                              ? (i === 0 ? 'text-sm text-white font-bold' : 'text-[13px] text-noir-text')
                              : (i === 0 ? 'text-[11px] text-white font-semibold' : 'text-[11px] text-noir-muted')
                          }`}>
                            {line}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* AUDIO type — transcript */}
                    {selectedProbe.visual.transcript && (
                      <div className="relative z-10">
                        {/* Waveform simulation */}
                        <div className="flex items-end gap-[2px] h-10 mb-3 px-1">
                          {Array.from({ length: 48 }).map((_, i) => {
                            const h = Math.sin(i * 0.4) * 30 + Math.random() * 20 + 10;
                            return (
                              <div
                                key={i}
                                className="flex-1 bg-noir-red/40 rounded-sm min-w-[2px]"
                                style={{ height: `${Math.min(h, 100)}%` }}
                              />
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-mono text-noir-muted">00:00</span>
                          <span className="text-[9px] font-mono text-noir-red-light">00:47</span>
                        </div>
                        <div className="space-y-1 border-t border-noir-border/30 pt-3">
                          <span className="text-[9px] font-mono text-noir-muted uppercase tracking-widest mb-2 block">Transcriere</span>
                          {selectedProbe.visual.transcript.map((line, i) => (
                            <p key={i} className="text-[11px] font-mono text-noir-text leading-relaxed">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DOCUMENT type — text lines */}
                    {selectedProbe.visual.lines && (
                      <div className="relative z-10">
                        <div className="flex items-center justify-end mb-2">
                          <button
                            onClick={() => setZoomed(!zoomed)}
                            className="w-6 h-6 rounded bg-noir-dark/80 border border-noir-border/50 flex items-center justify-center cursor-pointer hover:border-noir-red/50 transition-all"
                          >
                            {zoomed ? <ZoomOut size={10} className="text-noir-muted" /> : <ZoomIn size={10} className="text-noir-muted" />}
                          </button>
                        </div>
                        <div className="space-y-1">
                          {selectedProbe.visual.lines.map((line, i) => (
                            <p key={i} className={`font-mono leading-relaxed transition-all duration-300 ${
                              zoomed
                                ? (i === 0 ? 'text-sm text-white font-bold' : `text-[13px] ${line === '' ? 'h-4' : 'text-noir-text'}`)
                                : (i === 0 ? 'text-[11px] text-white font-semibold' : `text-[11px] ${line === '' ? 'h-3' : 'text-noir-text'}`)
                            }`}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CODE type — syntax block */}
                    {selectedProbe.visual.code && (
                      <div className="relative z-10">
                        <div className="bg-noir-dark/80 rounded p-3 border border-noir-border/50">
                          {selectedProbe.visual.code.map((line, i) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-[10px] font-mono text-noir-muted/30 select-none w-4 text-right flex-shrink-0">
                                {i + 1}
                              </span>
                              <pre className="text-[11px] font-mono text-green-400/80 leading-relaxed whitespace-pre-wrap">
                                {line}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-40 rounded-lg bg-noir-card border border-noir-border flex items-center justify-center mb-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(139,0,0,0.03)_2px,rgba(139,0,0,0.03)_4px)]" />
                  {(() => {
                    const IconComp = getIcon(selectedProbe.icon);
                    return <IconComp size={48} className="text-noir-red/30 relative z-10" />;
                  })()}
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-noir-text leading-relaxed mb-4">
                {selectedProbe.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between pt-3 border-t border-noir-border">
                <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
                  Probă #{selectedProbe.id}
                </span>
                <span className="text-[10px] font-mono text-noir-red-light uppercase tracking-widest">
                  Verificată
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
