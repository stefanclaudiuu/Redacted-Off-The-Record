import { useState } from 'react';
import { ArrowLeft, Package, Lock, Camera, Headphones, FileText, AlertTriangle, Mail, Code, KeyRound, Database, Eye, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
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

export default function EvidenceFolder({ episodeId, onBack }) {
  const { inventory } = useInventory();
  const [selectedProbe, setSelectedProbe] = useState(null);
  const [zoomed, setZoomed] = useState(false);

  const allEvidence = evidenceData[episodeId] || [];
  const unlockedIds = (inventory[episodeId] || []).map(e => e.id);
  const unlockedEvidence = allEvidence.filter(ev => unlockedIds.includes(ev.id));
  const lockedCount = allEvidence.length - unlockedEvidence.length;

  return (
    <div className="flex-1 flex flex-col bg-noir-black">
      {/* Header */}
      <div className="px-4 py-3 bg-noir-card/80 backdrop-blur-md border-b border-noir-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Package size={10} className="text-noir-red-light" />
              <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
                Folder probe — {unlockedEvidence.length}/{allEvidence.length} deblocate
              </span>
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              PROBE COLECTATE
            </h2>
          </div>
          <button
            onClick={onBack}
            className="text-[9px] font-mono text-noir-muted hover:text-noir-red-light uppercase tracking-widest transition-colors cursor-pointer"
          >
            ← Meniu dosar
          </button>
        </div>
      </div>

      {/* Evidence grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {unlockedEvidence.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-50">
            <Lock size={32} className="text-noir-muted" />
            <p className="text-xs font-mono text-noir-muted uppercase tracking-widest">
              Nicio probă colectată
            </p>
            <p className="text-xs text-noir-muted">
              Interoghează suspecții pentru a descoperi probe.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {unlockedEvidence.map(ev => {
                const IconComp = getIcon(ev.icon);
                return (
                  <button
                    key={ev.id}
                    onClick={() => { setSelectedProbe(ev); setZoomed(false); }}
                    className="relative rounded-xl p-4 border border-noir-red/20 bg-noir-card/60 hover:border-noir-red/50 hover:bg-noir-card transition-all cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-noir-red/15 border border-noir-red/25 flex items-center justify-center mb-3">
                      <IconComp size={18} className="text-noir-red-light" />
                    </div>
                    <h4 className="text-[11px] font-semibold text-white mb-1 leading-tight group-hover:text-noir-red-light transition-colors">
                      {ev.name}
                    </h4>
                    <p className="text-[9px] font-mono text-noir-muted uppercase tracking-wider">
                      {ev.type} — {ev.id}
                    </p>
                    <div className="absolute top-3 right-3">
                      <Eye size={10} className="text-noir-red-light/50" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Locked count */}
            {lockedCount > 0 && (
              <div className="flex items-center justify-center gap-2 py-3 border-t border-noir-border/30">
                <Lock size={10} className="text-noir-muted/40" />
                <p className="text-[9px] font-mono text-noir-muted/40 uppercase tracking-widest">
                  {lockedCount} probe clasificate rămase
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== LIGHTBOX MODAL ===== */}
      {selectedProbe && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedProbe(null)}
        >
          <div
            className="w-full max-w-lg bg-noir-dark border border-noir-border rounded-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Lightbox header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-noir-border flex-shrink-0">
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
                  <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
                    {selectedProbe.type} — {selectedProbe.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(selectedProbe.visual?.scene || selectedProbe.visual?.lines) && (
                  <button
                    onClick={() => setZoomed(!zoomed)}
                    className="w-7 h-7 rounded-lg bg-noir-card border border-noir-border flex items-center justify-center cursor-pointer hover:border-noir-red/50 transition-all"
                  >
                    {zoomed ? <ZoomOut size={12} className="text-noir-muted" /> : <ZoomIn size={12} className="text-noir-muted" />}
                  </button>
                )}
                <button
                  onClick={() => setSelectedProbe(null)}
                  className="w-7 h-7 rounded-lg bg-noir-card border border-noir-border flex items-center justify-center cursor-pointer hover:border-noir-red/50 transition-all"
                >
                  <X size={12} className="text-noir-muted" />
                </button>
              </div>
            </div>

            {/* Lightbox body */}
            <div className="flex-1 overflow-y-auto p-5">
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

                  <div className="p-4 relative">
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(139,0,0,0.02)_2px,rgba(139,0,0,0.02)_4px)] pointer-events-none" />

                    {/* IMAGE type */}
                    {selectedProbe.visual.scene && (
                      <div className="relative z-10 space-y-2">
                        <div className={`w-full rounded bg-noir-dark/80 border border-noir-border/50 flex items-center justify-center relative overflow-hidden mb-3 transition-all duration-300 ${zoomed ? 'h-56' : 'h-28'}`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-noir-red/5 to-transparent" />
                          <Camera size={zoomed ? 56 : 36} className="text-noir-red/20" />
                          <div className="absolute bottom-1 right-2">
                            <span className="text-[8px] font-mono text-noir-red-light/50">REC</span>
                          </div>
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

                    {/* AUDIO type */}
                    {selectedProbe.visual.transcript && (
                      <div className="relative z-10">
                        <div className="flex items-end gap-[2px] h-12 mb-3 px-1">
                          {Array.from({ length: 48 }).map((_, i) => {
                            const h = Math.sin(i * 0.4) * 30 + Math.random() * 20 + 10;
                            return (
                              <div key={i} className="flex-1 bg-noir-red/40 rounded-sm min-w-[2px]" style={{ height: `${Math.min(h, 100)}%` }} />
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
                            <p key={i} className="text-[11px] font-mono text-noir-text leading-relaxed">{line}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DOCUMENT type */}
                    {selectedProbe.visual.lines && (
                      <div className="relative z-10 space-y-1">
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
                    )}

                    {/* CODE type */}
                    {selectedProbe.visual.code && (
                      <div className="relative z-10">
                        <div className="bg-noir-dark/80 rounded p-3 border border-noir-border/50">
                          {selectedProbe.visual.code.map((line, i) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-[10px] font-mono text-noir-muted/30 select-none w-4 text-right flex-shrink-0">{i + 1}</span>
                              <pre className="text-[11px] font-mono text-green-400/80 leading-relaxed whitespace-pre-wrap">{line}</pre>
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
    </div>
  );
}
