import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, Radio, ScanLine, Users } from 'lucide-react';
import { useEpisodes } from '../context/EpisodeContext';

export default function EpisodeCard({ episode, index, onScanClick }) {
  const navigate = useNavigate();
  const { setActiveEpisodeId, episodes } = useEpisodes();
  const isLocked = episode.status === 'locked';
  const isCompleted = episode.status === 'completed';
  const isActive = episode.status === 'unlocked' && episode.progress > 0;
  const suspectCount = episode.suspects?.length || 0;

  const dosar001Completed = episodes.find(ep => ep.id === 'dosar-001')?.status === 'completed';
  const isNextTarget = isLocked && episode.id === 'dosar-002' && dosar001Completed;

  const handleClick = () => {
    if (isLocked) return;
    setActiveEpisodeId(episode.id);
    navigate(`/chat/${episode.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        animate-fade-in group relative border rounded-lg p-5 transition-all duration-300
        ${isNextTarget
          ? 'border-red-700/60 bg-noir-card/50 cursor-default opacity-100'
          : isCompleted
            ? 'border-green-800/40 bg-noir-card/40 cursor-pointer opacity-90'
            : isLocked
              ? 'border-noir-border/50 bg-noir-card/30 cursor-default opacity-70'
              : 'border-noir-border bg-noir-card hover:border-noir-red/50 hover:noir-glow cursor-pointer'
        }
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Red glow for next target */}
      {isNextTarget && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div className="absolute inset-0 animate-pulse" style={{
            boxShadow: 'inset 0 0 30px rgba(220,38,38,0.08), 0 0 20px rgba(220,38,38,0.1)',
          }} />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(220,38,38,0.02)_2px,rgba(220,38,38,0.02)_4px)]" />
        </div>
      )}

      {/* Scanline overlay for locked */}
      {isLocked && !isNextTarget && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)]" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left side: avatar + info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div className={`
            relative w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden
            ${isNextTarget
              ? 'bg-red-900/30 border border-red-700/40'
              : isCompleted
                ? 'bg-green-900/20 border border-green-800/30'
                : isLocked
                  ? 'bg-noir-border/50'
                  : 'bg-noir-red/20 border border-noir-red/30'
            }
          `}>
            {isNextTarget ? (
              <span className="text-2xl font-bold font-mono text-red-400 animate-pulse">
                {String(index + 1).padStart(2, '0')}
              </span>
            ) : isLocked ? (
              <Lock size={20} className="text-noir-muted" />
            ) : (
              <span className="text-2xl font-bold font-mono text-noir-red-light">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
                {episode.case_name ? episode.case_name.split(':')[0] : `Dosar #${String(index + 1).padStart(3, '0')}`}
              </span>
              {isActive && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-noir-red-light uppercase tracking-widest">
                  <Radio size={10} className="animate-pulse" />
                  În desfășurare
                </span>
              )}
            </div>

            <h3 className={`
              font-semibold text-base mb-1 truncate
              ${isNextTarget ? 'text-red-400' : isCompleted ? 'text-green-400/80' : isLocked ? 'text-noir-muted' : 'text-white group-hover:text-noir-red-light transition-colors'}
            `}>
              {isNextTarget ? (episode.case_name || episode.character_name) : isLocked ? '██████████' : (episode.case_name || episode.character_name)}
            </h3>

            <p className={`text-xs leading-relaxed line-clamp-2 ${isNextTarget ? 'text-red-400/70' : 'text-noir-muted'}`}>
              {isNextTarget
                ? 'ACCES DISPONIBIL — NECESITĂ COD PORT'
                : isCompleted
                  ? 'Investigație finalizată. Status: COMPROMIS.'
                  : isLocked
                    ? 'CLASIFICAT — Scanează codul QR pentru acces.'
                    : episode.description
              }
            </p>

            {/* Suspects count */}
            {!isLocked && suspectCount > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Users size={11} className="text-noir-muted" />
                <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
                  {suspectCount} {suspectCount === 1 ? 'suspect' : 'suspecți'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: status / arrow */}
        <div className="flex items-center self-center flex-shrink-0">
          {isNextTarget ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onScanClick?.();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-900/30 border border-red-700/50 rounded-lg hover:bg-red-900/50 hover:border-red-600/60 transition-all cursor-pointer group/scan animate-pulse"
              style={{ boxShadow: '0 0 15px rgba(220,38,38,0.15)' }}
            >
              <ScanLine size={16} className="text-red-400" />
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
                Scanează Cod
              </span>
            </button>
          ) : isLocked ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onScanClick?.();
              }}
              className="flex items-center gap-2 px-3 py-2 bg-noir-red/20 border border-noir-red/40 rounded-lg hover:bg-noir-red/30 hover:border-noir-red/60 transition-all cursor-pointer group/scan"
            >
              <ScanLine size={14} className="text-noir-red-light group-hover/scan:animate-pulse" />
              <span className="text-[10px] font-mono text-noir-red-light uppercase tracking-widest font-semibold">
                Scanează
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {episode.progress > 0 && (
                <div className="w-16 h-1 bg-noir-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-noir-red rounded-full transition-all duration-500"
                    style={{ width: `${episode.progress}%` }}
                  />
                </div>
              )}
              <ChevronRight
                size={18}
                className="text-noir-muted group-hover:text-noir-red-light group-hover:translate-x-1 transition-all"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
