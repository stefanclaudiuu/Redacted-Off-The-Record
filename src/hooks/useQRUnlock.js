import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEpisodes } from '../context/EpisodeContext';
import { useObjectives } from '../context/ObjectivesContext';

export function useQRUnlock() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { unlockByCode, setActiveEpisodeId } = useEpisodes();
  const { completeByTrigger } = useObjectives();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const episode = unlockByCode(code);
      if (episode) {
        setActiveEpisodeId(episode.id);
        completeByTrigger(episode.id, 'episode_unlocked');
        setSearchParams({});
        navigate(`/chat/${episode.id}`, { replace: true });
      } else {
        setSearchParams({});
      }
    }
  }, [searchParams]);
}
