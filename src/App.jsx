import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import InventorySidebar from './components/InventorySidebar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import { useEpisodes } from './context/EpisodeContext';
import AmbientAudio from './components/AmbientAudio';

function App() {
  const { activeEpisode } = useEpisodes();

  return (
    <div className="min-h-screen bg-noir-black flex flex-col">
      <Navbar title={activeEpisode?.case_name} />
      <InventorySidebar />
      <AmbientAudio />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat/:episodeId" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
}

export default App
