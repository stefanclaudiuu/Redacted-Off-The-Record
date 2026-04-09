import { useLocation, useNavigate } from 'react-router-dom';
import { Archive, ArrowLeft, Briefcase } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function Navbar({ title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, getAllEvidence } = useInventory();
  const isChat = location.pathname.startsWith('/chat');
  const evidenceCount = getAllEvidence().length;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-noir-black/90 backdrop-blur-md border-b border-noir-border">
      <div className="flex items-center gap-3">
        {isChat && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-noir-muted hover:text-noir-red-light transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-mono uppercase tracking-widest">Hub</span>
          </button>
        )}
        {!isChat && (
          <div className="flex items-center gap-2">
            <Briefcase size={20} className="text-noir-red" />
            <span className="font-mono text-sm font-bold tracking-[0.3em] uppercase text-white">
              Redacted
            </span>
            <span className="font-mono text-xs tracking-widest text-noir-muted uppercase">
              Hub
            </span>
          </div>
        )}
      </div>

      {title && isChat && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="font-mono text-xs tracking-widest text-noir-muted uppercase">
            {title}
          </span>
        </div>
      )}

      <button
        onClick={toggleSidebar}
        className="relative flex items-center gap-2 text-noir-muted hover:text-noir-red-light transition-colors cursor-pointer"
      >
        <Archive size={18} />
        <span className="text-xs font-mono uppercase tracking-widest hidden sm:inline">Probe</span>
        {evidenceCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-noir-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {evidenceCount}
          </span>
        )}
      </button>
    </nav>
  );
}
