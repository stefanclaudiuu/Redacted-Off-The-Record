import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import objectivesData from '../data/objectives.json';

const ObjectivesContext = createContext();

const STORAGE_KEY = 'redacted-hub-objectives';

export function ObjectivesProvider({ children }) {
  const [completed, setCompleted] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const completeObjective = useCallback((episodeId, objectiveId) => {
    setCompleted(prev => {
      const episodeCompleted = prev[episodeId] || [];
      if (episodeCompleted.includes(objectiveId)) return prev;
      return {
        ...prev,
        [episodeId]: [...episodeCompleted, objectiveId],
      };
    });
  }, []);

  const isObjectiveCompleted = useCallback((episodeId, objectiveId) => {
    const episodeCompleted = completed[episodeId] || [];
    return episodeCompleted.includes(objectiveId);
  }, [completed]);

  const getEpisodeObjectives = useCallback((episodeId) => {
    const allObjectives = objectivesData[episodeId] || [];
    const episodeCompleted = completed[episodeId] || [];

    return allObjectives.map((obj, index) => {
      const isDone = episodeCompleted.includes(obj.id);
      const prevDone = index === 0 || episodeCompleted.includes(allObjectives[index - 1].id);

      let status;
      if (isDone) {
        status = 'completed';
      } else if (prevDone) {
        status = 'in_progress';
      } else {
        status = 'locked';
      }

      return { ...obj, status };
    });
  }, [completed]);

  const completeByTrigger = useCallback((episodeId, trigger) => {
    const allObjectives = objectivesData[episodeId] || [];
    const obj = allObjectives.find(o => o.trigger === trigger);
    if (obj) {
      completeObjective(episodeId, obj.id);
    }
  }, [completeObjective]);

  const getCompletedCount = useCallback((episodeId) => {
    return (completed[episodeId] || []).length;
  }, [completed]);

  const getTotalCount = useCallback((episodeId) => {
    return (objectivesData[episodeId] || []).length;
  }, []);

  return (
    <ObjectivesContext.Provider
      value={{
        completed,
        completeObjective,
        isObjectiveCompleted,
        getEpisodeObjectives,
        completeByTrigger,
        getCompletedCount,
        getTotalCount,
      }}
    >
      {children}
    </ObjectivesContext.Provider>
  );
}

export function useObjectives() {
  const context = useContext(ObjectivesContext);
  if (!context) {
    throw new Error('useObjectives must be used within an ObjectivesProvider');
  }
  return context;
}
