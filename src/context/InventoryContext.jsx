import { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

const STORAGE_KEY = 'redacted-hub-inventory';

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState(() => {
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

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  const addEvidence = (episodeId, evidence) => {
    setInventory(prev => {
      const episodeInventory = prev[episodeId] || [];
      const exists = episodeInventory.some(e => e.id === evidence.id);
      if (exists) return prev;
      return {
        ...prev,
        [episodeId]: [...episodeInventory, { ...evidence, foundAt: Date.now() }],
      };
    });
  };

  const getEpisodeEvidence = (episodeId) => {
    return inventory[episodeId] || [];
  };

  const getAllEvidence = () => {
    return Object.entries(inventory).reduce((acc, [episodeId, items]) => {
      return [...acc, ...items.map(item => ({ ...item, episodeId }))];
    }, []);
  };

  const toggleSidebar = () => setIsOpen(prev => !prev);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        isOpen,
        setIsOpen,
        toggleSidebar,
        addEvidence,
        getEpisodeEvidence,
        getAllEvidence,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
