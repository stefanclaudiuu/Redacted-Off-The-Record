import { CheckCircle, Circle, Lock, Target } from 'lucide-react';
import { useObjectives } from '../context/ObjectivesContext';

export default function ObjectivesWidget({ episodeId }) {
  const { getEpisodeObjectives, getCompletedCount, getTotalCount } = useObjectives();
  const objectives = getEpisodeObjectives(episodeId);
  const completedCount = getCompletedCount(episodeId);
  const totalCount = getTotalCount(episodeId);

  if (totalCount === 0) return null;

  return (
    <div className="w-full max-w-sm mt-6">
      <div className="border border-noir-border/50 rounded-xl bg-noir-card/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-noir-border/30">
          <div className="flex items-center gap-2">
            <Target size={12} className="text-noir-red-light" />
            <span className="text-[9px] font-mono text-noir-muted uppercase tracking-widest font-semibold">
              Obiective
            </span>
          </div>
          <span className="text-[9px] font-mono text-noir-red-light uppercase tracking-widest">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-2 pb-1">
          <div className="w-full h-1 bg-noir-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-noir-red rounded-full transition-all duration-700"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Objectives list */}
        <div className="px-4 py-2 space-y-1.5">
          {objectives.map((obj, i) => {
            const isCompleted = obj.status === 'completed';
            const isLocked = obj.status === 'locked';

            return (
              <div
                key={obj.id}
                className={`flex items-start gap-2.5 py-1.5 transition-all ${
                  isLocked ? 'opacity-30' : isCompleted ? 'opacity-60' : 'opacity-100'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle size={13} className="text-noir-red-light" />
                  ) : isLocked ? (
                    <Lock size={11} className="text-noir-muted/40 mt-0.5" />
                  ) : (
                    <Circle size={13} className="text-noir-muted animate-pulse" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-mono leading-tight ${
                    isCompleted ? 'text-noir-muted line-through' : isLocked ? 'text-noir-muted/40' : 'text-white'
                  }`}>
                    {isLocked ? '██████████' : obj.title}
                  </p>
                  {!isLocked && (
                    <p className={`text-[9px] font-mono leading-relaxed mt-0.5 ${
                      isCompleted ? 'text-noir-muted/50' : 'text-noir-muted/70'
                    }`}>
                      {obj.description}
                    </p>
                  )}
                </div>

                {/* Step number */}
                <span className={`text-[8px] font-mono flex-shrink-0 ${
                  isCompleted ? 'text-noir-red-light/50' : isLocked ? 'text-noir-muted/20' : 'text-noir-muted/40'
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
