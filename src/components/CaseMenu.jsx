import { Smartphone, Users, Radio, Plane, Lock, Radar, FolderOpen } from 'lucide-react';
import ObjectivesWidget from './ObjectivesWidget';

export default function CaseMenu({ episode, onSelectSection }) {
  const hasSections = episode.sections && episode.sections.length > 0;

  if (!hasSections) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-noir-black px-4 py-8">
      {/* Case header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Radio size={10} className="text-noir-red-light animate-pulse" />
          <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
            Investigație activă
          </span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-wide mb-2">
          {episode.case_name}
        </h1>
        <p className="text-xs text-noir-muted leading-relaxed max-w-sm mx-auto">
          {episode.description}
        </p>
      </div>

      {/* Plane icon */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border border-noir-red/20 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-2 rounded-full border border-noir-red/30 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Plane size={28} className="text-noir-red-light" style={{ transform: 'rotate(-45deg)' }} />
        </div>
      </div>

      {/* Section buttons */}
      <div className="w-full max-w-sm space-y-3">
        {/* Interrogation room */}
        <button
          onClick={() => onSelectSection('interogatoriu')}
          className="w-full group relative border border-noir-border rounded-xl p-5 bg-noir-card/50 hover:border-noir-red/50 hover:bg-noir-card transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-noir-red/20 border border-noir-red/30 flex items-center justify-center flex-shrink-0">
              <Users size={22} className="text-noir-red-light" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-sm font-bold text-white group-hover:text-noir-red-light transition-colors">
                SALA DE INTEROGATORIU
              </h3>
              <p className="text-[10px] font-mono text-noir-muted uppercase tracking-widest mt-0.5">
                {episode.suspects?.length || 0} suspecți disponibili
              </p>
              <p className="text-[11px] text-noir-muted mt-1.5 leading-relaxed">
                Interogatoriu cu suspecții legați de zborul XR-4057.
              </p>
            </div>
          </div>

          {/* Suspect avatars preview */}
          <div className="flex gap-2 mt-4 pl-16">
            {(episode.suspects || []).map((s) => (
              <div
                key={s.id}
                className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                  s.locked ? 'bg-noir-border/20 border-noir-border/40' : 'bg-noir-border/30 border-noir-border'
                }`}
              >
                {s.locked ? (
                  <Lock size={10} className="text-noir-muted/30" />
                ) : (
                  <span className="text-[10px] font-mono font-bold text-noir-muted">
                    {s.avatar_letter}
                  </span>
                )}
              </div>
            ))}
          </div>
        </button>

        {/* Phone */}
        <button
          onClick={() => onSelectSection('telefon')}
          className="w-full group relative border border-noir-border rounded-xl p-5 bg-noir-card/50 hover:border-green-700/50 hover:bg-noir-card transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: 'rgba(0, 255, 65, 0.08)',
                border: '1px solid rgba(0, 255, 65, 0.2)',
              }}
            >
              <Smartphone size={22} style={{ color: '#00ff41', filter: 'drop-shadow(0 0 4px rgba(0,255,65,0.3))' }} />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">
                TELEFONUL VICTIMEI
              </h3>
              <p className="text-[10px] font-mono text-noir-muted uppercase tracking-widest mt-0.5">
                {episode.phone?.model || 'Telefon mobil'} — Blocat cu PIN
              </p>
              <p className="text-[11px] text-noir-muted mt-1.5 leading-relaxed">
                Telefonul personal al lui Andrei Șerban. Necesită cod PIN.
              </p>
            </div>
          </div>

          {/* Lock indicator */}
          <div className="flex items-center gap-2 mt-4 pl-16">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full border"
                  style={{ borderColor: 'rgba(0,255,65,0.3)', backgroundColor: 'transparent' }}
                />
              ))}
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'rgba(0,255,65,0.4)' }}>
              PIN necesar
            </span>
          </div>
        </button>

        {/* Radar */}
        {episode.sections?.includes('radar') && (
          <button
            onClick={() => onSelectSection('radar')}
            className="w-full group relative border border-noir-border rounded-xl p-5 bg-noir-card/50 hover:border-amber-600/50 hover:bg-noir-card transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500/10 border border-amber-500/20">
                <Radar size={22} className="text-amber-400" style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.3))' }} />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  RADAR INVESTIGAȚIE
                </h3>
                <p className="text-[10px] font-mono text-noir-muted uppercase tracking-widest mt-0.5">
                  Hartă operațională — 3 puncte de interes
                </p>
                <p className="text-[11px] text-noir-muted mt-1.5 leading-relaxed">
                  Traseul zborului XR-4057 și locațiile cheie ale investigației.
                </p>
              </div>
            </div>

            {/* Radar indicator */}
            <div className="flex items-center gap-2 mt-4 pl-16">
              <div className="w-2 h-2 rounded-full bg-amber-500/50 animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500/40">
                Scanare activă
              </span>
            </div>
          </button>
        )}

        {/* Evidence Folder */}
        {episode.sections?.includes('probe') && (
          <button
            onClick={() => onSelectSection('probe')}
            className="w-full group relative border border-noir-border rounded-xl p-5 bg-noir-card/50 hover:border-purple-600/50 hover:bg-noir-card transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/10 border border-purple-500/20">
                <FolderOpen size={22} className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.3))' }} />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                  FOLDER PROBE
                </h3>
                <p className="text-[10px] font-mono text-noir-muted uppercase tracking-widest mt-0.5">
                  Documente, fotografii, audio
                </p>
                <p className="text-[11px] text-noir-muted mt-1.5 leading-relaxed">
                  Toate probele colectate din interogatorii și investigații.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pl-16">
              <FolderOpen size={10} className="text-purple-400/50" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400/40">
                Vizualizare completă
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Objectives Widget */}
      <ObjectivesWidget episodeId={episode.id} />

      {/* Footer hint */}
      <p className="text-[10px] font-mono text-noir-muted/40 uppercase tracking-widest mt-6 text-center">
        Obține PIN-ul din sala de interogatoriu
      </p>
    </div>
  );
}
