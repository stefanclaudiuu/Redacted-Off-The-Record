import { Target, CheckCircle2, Lock, Circle } from 'lucide-react';
import { useObjectives } from '../context/ObjectivesContext';
import { useEpisodes } from '../context/EpisodeContext';

export default function ObjectivesPanel() {
  const { episodes } = useEpisodes();
  const { getEpisodeObjectives, getCompletedCount, getTotalCount } = useObjectives();

  const unlockedEpisodes = episodes.filter(ep => ep.status === 'unlocked' || ep.status === 'completed');

  if (unlockedEpisodes.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 pb-6">
      <div className="flex items-center gap-2 mb-4">
        <Target size={14} className="text-noir-red" />
        <h2 className="text-xs font-mono text-noir-muted uppercase tracking-[0.2em]">
          Obiective Episod
        </h2>
      </div>

      <div className="space-y-4">
        {unlockedEpisodes.map(episode => {
          const objectives = getEpisodeObjectives(episode.id);
          const completedCount = getCompletedCount(episode.id);
          const totalCount = getTotalCount(episode.id);
          const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <div
              key={episode.id}
              className="border border-noir-border rounded-lg bg-noir-card/50 overflow-hidden"
            >
              {/* Episode objective header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-noir-border/50">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-noir-red rounded-full" />
                  <span className="text-[11px] font-mono text-white font-semibold uppercase tracking-widest">
                    {episode.case_name || episode.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-noir-muted">
                  {completedCount}/{totalCount}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-0.5 bg-noir-border">
                <div
                  className="h-full bg-noir-red transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Objectives list */}
              <div className="p-3 space-y-1">
                {objectives.map((obj, index) => (
                  <div
                    key={obj.id}
                    className={`
                      flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${obj.status === 'completed'
                        ? 'bg-green-950/20'
                        : obj.status === 'in_progress'
                          ? 'bg-noir-red/5 border border-noir-red/20'
                          : 'opacity-40'
                      }
                    `}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {obj.status === 'completed' ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : obj.status === 'in_progress' ? (
                        <Circle size={16} className="text-noir-red-light animate-pulse" />
                      ) : (
                        <Lock size={14} className="text-noir-muted/40" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${
                          obj.status === 'completed'
                            ? 'text-green-500'
                            : obj.status === 'in_progress'
                              ? 'text-noir-red-light'
                              : 'text-noir-muted/40'
                        }`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {obj.status === 'completed' && (
                          <span className="text-[8px] font-mono text-green-500 uppercase tracking-widest bg-green-500/10 px-1.5 py-0.5 rounded">
                            Finalizat
                          </span>
                        )}
                        {obj.status === 'in_progress' && (
                          <span className="text-[8px] font-mono text-noir-red-light uppercase tracking-widest bg-noir-red/10 px-1.5 py-0.5 rounded">
                            În lucru
                          </span>
                        )}
                        {obj.status === 'locked' && (
                          <span className="text-[8px] font-mono text-noir-muted/40 uppercase tracking-widest">
                            Blocat
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-semibold mt-1 ${
                        obj.status === 'completed'
                          ? 'text-green-400/80 line-through'
                          : obj.status === 'in_progress'
                            ? 'text-white'
                            : 'text-noir-muted/30'
                      }`}>
                        {obj.status === 'locked' ? '██████████████' : obj.title}
                      </h4>

                      {obj.status !== 'locked' && (
                        <p className={`text-[11px] mt-0.5 leading-relaxed ${
                          obj.status === 'completed' ? 'text-noir-muted/60' : 'text-noir-muted'
                        }`}>
                          {obj.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
