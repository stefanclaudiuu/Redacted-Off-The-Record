import { Radio } from 'lucide-react';

export default function ChatHeader({ episode }) {
  if (!episode) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-noir-card/80 backdrop-blur-md border-b border-noir-border">
      {/* Avatar */}
      <div className="relative w-10 h-10 rounded-full bg-noir-red/20 border border-noir-red/30 flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold font-mono text-noir-red-light">
          {episode.character_name.charAt(0)}
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-noir-red rounded-full border-2 border-noir-card animate-pulse" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-white truncate">
          {episode.character_name}
        </h2>
        <div className="flex items-center gap-1.5">
          <Radio size={10} className="text-noir-red-light animate-pulse" />
          <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
            Canal securizat — Episod activ
          </span>
        </div>
      </div>

      {/* Progress */}
      {episode.progress > 0 && (
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-mono text-noir-muted">{episode.progress}%</span>
          <div className="w-20 h-1 bg-noir-border rounded-full overflow-hidden">
            <div
              className="h-full bg-noir-red rounded-full transition-all duration-500"
              style={{ width: `${episode.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
