import { createContext, useContext, useState, useEffect } from 'react';
import episodesData from '../data/episodes.json';

const EpisodeContext = createContext();

const STORAGE_KEY = 'redacted-hub-episodes';

export function EpisodeProvider({ children }) {
  const [episodes, setEpisodes] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return episodesData.map(ep => {
          const savedEp = parsed.find(s => s.id === ep.id);
          return savedEp ? { ...ep, status: savedEp.status, progress: savedEp.progress } : ep;
        });
      } catch {
        return episodesData;
      }
    }
    return episodesData;
  });

  const [activeEpisodeId, setActiveEpisodeId] = useState(null);

  useEffect(() => {
    const toSave = episodes.map(({ id, status, progress }) => ({ id, status, progress }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [episodes]);

  const unlockEpisode = (episodeId) => {
    setEpisodes(prev =>
      prev.map(ep =>
        ep.id === episodeId && ep.status === 'locked'
          ? { ...ep, status: 'unlocked', progress: 0 }
          : ep
      )
    );
  };

  const unlockByCode = (code) => {
    const normalizedCode = code.trim().toUpperCase();
    const episode = episodes.find(
      ep => ep.unlock_code && ep.unlock_code.toUpperCase() === normalizedCode && ep.status === 'locked'
    );
    if (episode) {
      unlockEpisode(episode.id);
      return episode;
    }
    return null;
  };

  const updateProgress = (episodeId, progress) => {
    setEpisodes(prev =>
      prev.map(ep =>
        ep.id === episodeId ? { ...ep, progress: Math.min(100, progress) } : ep
      )
    );
  };

  const completeEpisode = (episodeId) => {
    setEpisodes(prev =>
      prev.map(ep =>
        ep.id === episodeId ? { ...ep, status: 'completed', progress: 100 } : ep
      )
    );
  };

  const getEpisode = (episodeId) => {
    return episodes.find(ep => ep.id === episodeId) || null;
  };

  const activeEpisode = episodes.find(ep => ep.id === activeEpisodeId) || null;

  return (
    <EpisodeContext.Provider
      value={{
        episodes,
        activeEpisode,
        activeEpisodeId,
        setActiveEpisodeId,
        unlockEpisode,
        unlockByCode,
        updateProgress,
        completeEpisode,
        getEpisode,
      }}
    >
      {children}
    </EpisodeContext.Provider>
  );
}

export function useEpisodes() {
  const context = useContext(EpisodeContext);
  if (!context) {
    throw new Error('useEpisodes must be used within an EpisodeProvider');
  }
  return context;
}
