import { useState } from 'react';
import { Shield, Scan } from 'lucide-react';
import { useEpisodes } from '../context/EpisodeContext';
import { useQRUnlock } from '../hooks/useQRUnlock';
import EpisodeCard from '../components/EpisodeCard';
import UnlockModal from '../components/UnlockModal';
import ObjectivesPanel from '../components/ObjectivesPanel';

export default function Dashboard() {
  useQRUnlock();
  const { episodes } = useEpisodes();
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const unlockedCount = episodes.filter(ep => ep.status !== 'locked').length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <div className="relative px-6 py-10 sm:py-16 border-b border-noir-border overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,0,0,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.01)_2px,rgba(255,255,255,0.01)_4px)]" />

        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-noir-border bg-noir-card/50">
            <Shield size={12} className="text-noir-red" />
            <span className="text-[10px] font-mono text-noir-muted uppercase tracking-[0.2em]">
              Nivel de acces: Agent
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            Centrala
          </h1>
          <p className="text-sm text-noir-muted max-w-md mx-auto leading-relaxed">
            Selectează un dosar activ sau scanează un cod QR pentru a debloca un nou episod de investigație.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <span className="block text-2xl font-bold font-mono text-white">{unlockedCount}</span>
              <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">Active</span>
            </div>
            <div className="w-px h-8 bg-noir-border" />
            <div className="text-center">
              <span className="block text-2xl font-bold font-mono text-noir-muted">{episodes.length - unlockedCount}</span>
              <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">Clasificate</span>
            </div>
            <div className="w-px h-8 bg-noir-border" />
            <div className="text-center">
              <span className="block text-2xl font-bold font-mono text-white">{episodes.length}</span>
              <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <ObjectivesPanel />

      {/* Episodes List */}
      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono text-noir-muted uppercase tracking-[0.2em]">
            Dosare disponibile
          </h2>
          <div className="flex items-center gap-2 text-noir-muted">
            <Scan size={14} />
            <span className="text-[10px] font-mono uppercase tracking-widest">
              Scanează pt. nou
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {episodes.map((episode, index) => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              index={index}
              onScanClick={() => setShowUnlockModal(true)}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-noir-border text-center space-y-2">
        <p className="text-[10px] font-mono text-noir-muted/50 uppercase tracking-widest">
          Redacted Hub v1.0 — Toate comunicările sunt criptate
        </p>
        <p className="text-[8px] font-mono text-noir-muted/30 leading-relaxed max-w-md mx-auto">
          Acesta este un produs de ficțiune. Orice asemănare cu persoane, instituții sau evenimente reale este pur coincidentală.
        </p>
      </div>

      {/* Unlock Modal */}
      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
      />
    </div>
  );
}
