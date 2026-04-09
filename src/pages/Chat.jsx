import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radio, Lock, Package, Eye, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useEpisodes } from '../context/EpisodeContext';
import { useInventory } from '../context/InventoryContext';
import { useObjectives } from '../context/ObjectivesContext';
import { getAIResponse } from '../services/ai';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import CaseMenu from '../components/CaseMenu';
import PhoneSimulator from '../components/PhoneSimulator';
import RadarMap from '../components/RadarMap';
import EvidenceFolder from '../components/EvidenceFolder';
import PostCreditsScreen from '../components/PostCreditsScreen';
import evidenceImport from '../data/evidence.json';

const MESSAGES_KEY = 'redacted-hub-messages';
const UNLOCK_KEY = 'redacted-hub-suspect-unlocks';

function getMsgKey(episodeId, suspectId) {
  return `${episodeId}::${suspectId}`;
}

function loadMessages(episodeId, suspectId) {
  try {
    const saved = localStorage.getItem(MESSAGES_KEY);
    if (saved) {
      const all = JSON.parse(saved);
      return all[getMsgKey(episodeId, suspectId)] || [];
    }
  } catch { /* ignore */ }
  return [];
}

function saveMessages(episodeId, suspectId, messages) {
  try {
    const saved = localStorage.getItem(MESSAGES_KEY);
    const all = saved ? JSON.parse(saved) : {};
    all[getMsgKey(episodeId, suspectId)] = messages;
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

function loadUnlocks(episodeId) {
  try {
    const saved = localStorage.getItem(UNLOCK_KEY);
    if (saved) {
      const all = JSON.parse(saved);
      return all[episodeId] || [];
    }
  } catch { /* ignore */ }
  return [];
}

function saveUnlocks(episodeId, unlocked) {
  try {
    const saved = localStorage.getItem(UNLOCK_KEY);
    const all = saved ? JSON.parse(saved) : {};
    all[episodeId] = unlocked;
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

function getContactedSuspects(episodeId, suspects) {
  try {
    const saved = localStorage.getItem(MESSAGES_KEY);
    if (!saved) return [];
    const all = JSON.parse(saved);
    return suspects.filter(s => {
      const msgs = all[getMsgKey(episodeId, s.id)] || [];
      return msgs.some(m => m.sender === 'user');
    }).map(s => s.id);
  } catch { return []; }
}

export default function Chat() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const { getEpisode, unlockEpisode, completeEpisode, setActiveEpisodeId } = useEpisodes();
  const { addEvidence } = useInventory();
  const { completeByTrigger } = useObjectives();
  const episode = getEpisode(episodeId);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const hasSections = episode?.sections && episode.sections.length > 0;
  const [activeSection, setActiveSection] = useState(() => hasSections ? null : 'interogatoriu');

  const suspects = episode?.suspects || [];
  const chain = episode?.suspect_unlock_chain || null;
  const initialSuspects = chain?.initial || suspects.map(s => s.id);

  const [unlockedSuspects, setUnlockedSuspects] = useState(() => {
    const saved = loadUnlocks(episodeId);
    return saved.length > 0 ? saved : [...initialSuspects];
  });

  const availableSuspects = suspects.filter(
    s => !s.locked || unlockedSuspects.includes(s.id)
  );

  const [activeSuspectId, setActiveSuspectId] = useState(
    availableSuspects[0]?.id || suspects[0]?.id || null
  );
  const activeSuspect = suspects.find(s => s.id === activeSuspectId) || availableSuspects[0];

  const [banner, setBanner] = useState(null);
  const [evidencePopup, setEvidencePopup] = useState(null);
  const evidencePopupTimer = useRef(null);
  const [cliffhangerActive, setCliffhangerActive] = useState(false);
  const [cliffhangerStage, setCliffhangerStage] = useState(0);
  const [postCredits, setPostCredits] = useState(false);

  const showBanner = (text) => {
    setBanner(text);
    setTimeout(() => setBanner(null), 5000);
  };

  const unlockSuspect = useCallback((suspectId) => {
    if (unlockedSuspects.includes(suspectId)) return;
    const updated = [...unlockedSuspects, suspectId];
    setUnlockedSuspects(updated);
    saveUnlocks(episodeId, updated);

    if (chain && chain[suspectId]) {
      showBanner(chain[suspectId].label);
    }
  }, [unlockedSuspects, episodeId, chain]);

  const handleTrigger = useCallback((trigger) => {
    completeByTrigger(episodeId, trigger);

    if (chain) {
      for (const [suspectId, config] of Object.entries(chain)) {
        if (suspectId === 'initial') continue;
        if (config.trigger === trigger) {
          unlockSuspect(suspectId);
        }
      }
    }

    if (trigger === 'note_decrypted_nota-criptata') {
      const allEvidence = evidenceImport['dosar-001'] || [];
      const zb011 = allEvidence.find(e => e.id === 'ZB-011');
      if (zb011) {
        addEvidence(episodeId, zb011);
        completeByTrigger(episodeId, 'evidence_ZB-011');
      }
    }
  }, [chain, episodeId, completeByTrigger, unlockSuspect, addEvidence]);

  useEffect(() => {
    if (!episode) {
      navigate('/', { replace: true });
      return;
    }

    if (episode.status === 'locked') {
      unlockEpisode(episodeId);
    }
    setActiveEpisodeId(episodeId);

    const saved = loadUnlocks(episodeId);
    const init = chain?.initial || suspects.map(s => s.id);
    setUnlockedSuspects(saved.length > 0 ? saved : [...init]);

    const epHasSections = episode.sections && episode.sections.length > 0;
    setActiveSection(epHasSections ? null : 'interogatoriu');
  }, [episodeId]);

  useEffect(() => {
    if (!activeSuspect) return;
    if (activeSuspect.locked && !unlockedSuspects.includes(activeSuspect.id)) return;

    const saved = loadMessages(episodeId, activeSuspect.id);
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      const initialMsg = {
        id: 'init-' + Date.now(),
        text: activeSuspect.initial_message,
        sender: 'character',
        timestamp: Date.now(),
      };
      setMessages([initialMsg]);
      saveMessages(episodeId, activeSuspect.id, [initialMsg]);
    }
  }, [episodeId, activeSuspectId, unlockedSuspects]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const switchSuspect = useCallback((suspectId) => {
    if (suspectId === activeSuspectId || isTyping) return;
    const suspect = suspects.find(s => s.id === suspectId);
    if (suspect?.locked && !unlockedSuspects.includes(suspectId)) return;
    setActiveSuspectId(suspectId);
  }, [activeSuspectId, isTyping, suspects, unlockedSuspects]);

  const handleSend = async (text) => {
    if (!activeSuspect) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      text,
      sender: 'user',
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    saveMessages(episodeId, activeSuspect.id, updated);

    setIsTyping(true);
    try {
      const result = await getAIResponse(episodeId, activeSuspect.id, updated);
      const replyText = typeof result === 'string' ? result : result.text;
      const evidence = typeof result === 'object' ? result.evidence : null;

      const reply = {
        id: 'char-' + Date.now(),
        text: replyText,
        sender: 'character',
        timestamp: Date.now(),
        evidenceId: evidence?.id || null,
      };
      const withReply = [...updated, reply];
      setMessages(withReply);
      saveMessages(episodeId, activeSuspect.id, withReply);

      const cliffhanger = typeof result === 'object' ? result.cliffhanger : false;
      const confession = typeof result === 'object' ? result.confession : false;

      if (confession && activeSuspect.id === 'mihai-costin') {
        handleTrigger('mihai_confession');
      }

      if (evidence) {
        addEvidence(episodeId, evidence);
        completeByTrigger(episodeId, `evidence_${evidence.id}`);
        if (evidencePopupTimer.current) clearTimeout(evidencePopupTimer.current);
        setEvidencePopup(evidence);
        evidencePopupTimer.current = setTimeout(() => setEvidencePopup(null), 4000);
      }

      if (cliffhanger) {
        completeByTrigger(episodeId, 'cliffhanger_triggered');
        setTimeout(() => {
          setCliffhangerActive(true);
          setCliffhangerStage(1);
          setTimeout(() => setCliffhangerStage(2), 3000);
          setTimeout(() => setCliffhangerStage(3), 6000);
          setTimeout(() => setCliffhangerStage(4), 9000);
        }, 3000);
      }

      const prevUserMessages = messages.filter(m => m.sender === 'user');
      const isFirstMessage = prevUserMessages.length === 0;

      if (activeSuspect.id === 'mihai-costin') {
        if (isFirstMessage) {
          handleTrigger('mihai_contacted');
        }

        if (replyText && (replyText.includes('medali') || replyText.includes('locul din avion') || replyText.includes('numărul locului'))) {
          handleTrigger('pin_clue_received');
        }
      }

      if (activeSuspect.id === 'elena-stewardesa') {
        if (isFirstMessage) {
          handleTrigger('elena_contacted');
        }

        const lowerText = text.toLowerCase();
        if (lowerText.includes('bani') || lowerText.includes('plat') || lowerText.includes('ordin') || lowerText.includes('cine te-a')) {
          handleTrigger('elena_keyword_bani');
        }
      }

      if (activeSuspect.id === 'victor-dragos-pilot') {
        if (isFirstMessage) {
          handleTrigger('victor_contacted');
        }
      }

      const allContacted = getContactedSuspects(episodeId, suspects);
      const unlockedCount = suspects.filter(
        s => !s.locked || unlockedSuspects.includes(s.id)
      ).length;
      if (allContacted.length >= unlockedCount && unlockedCount > 1) {
        completeByTrigger(episodeId, 'all_suspects_contacted');
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorReply = {
        id: 'char-' + Date.now(),
        text: '... [semnal pierdut] ... Conexiunea a fost întreruptă. Reîncearcă.',
        sender: 'character',
        timestamp: Date.now(),
      };
      const withError = [...updated, errorReply];
      setMessages(withError);
      saveMessages(episodeId, activeSuspect.id, withError);
    } finally {
      setIsTyping(false);
    }
  };

  if (!episode) return null;

  // POST-CREDITS SCREEN — Dramatic Finale
  if (postCredits) {
    return <PostCreditsScreen
      onComplete={() => {
        completeEpisode(episodeId);
        navigate('/');
      }}
    />;
  }

  // CLIFFHANGER SCREEN
  if (cliffhangerActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-noir-black relative overflow-hidden">
        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,0,0,0.03)_2px,rgba(255,0,0,0.03)_4px)] pointer-events-none z-10" />

        {/* Glitch flicker */}
        <div className="absolute inset-0 pointer-events-none z-20" style={{
          animation: 'pulse 0.3s infinite',
          backgroundColor: cliffhangerStage >= 2 ? 'rgba(139,0,0,0.05)' : 'transparent',
        }} />

        <div className="relative z-30 text-center px-8 max-w-md">
          {/* Stage 1: Mihai's desperate message */}
          {cliffhangerStage >= 1 && (
            <div className="animate-fade-in mb-6">
              <div className="border border-amber-700/40 bg-amber-950/20 rounded-lg px-6 py-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-amber-400">M</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400/60 uppercase tracking-widest">
                    Mihai Costin — Mesaj urgent
                  </span>
                </div>
                <p className="text-sm font-mono text-amber-400 leading-relaxed italic">
                  "Am găsit ceva în mailul lui Andrei... fugi, vin după noi!"
                </p>
              </div>
            </div>
          )}

          {/* Stage 2: System error */}
          {cliffhangerStage >= 2 && (
            <div className="animate-fade-in mb-6">
              <ShieldAlert size={48} className="text-red-600 mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(220,38,38,0.6))' }} />
              <div className="border border-red-900/60 bg-red-950/30 rounded-lg px-6 py-4">
                <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.3em] mb-2 animate-pulse">
                  ⚠ EROARE CRITICĂ DE SISTEM
                </p>
                <p className="text-xs font-mono text-red-400 leading-relaxed">
                  CONEXIUNE COMPROMISĂ — CANAL INTERCEPTAT
                </p>
              </div>
            </div>
          )}

          {/* Stage 3: Disconnection */}
          {cliffhangerStage >= 3 && (
            <div className="animate-fade-in mb-6">
              <div className="border border-red-800/40 bg-noir-card/50 rounded-lg px-6 py-4">
                <AlertTriangle size={20} className="text-red-500 mx-auto mb-3 animate-pulse" />
                <p className="text-[10px] font-mono text-red-500/80 uppercase tracking-widest mb-2">
                  Toate conexiunile au fost întrerupte
                </p>
                <p className="text-[11px] font-mono text-red-400/60 leading-relaxed">
                  Mihai Costin — <span className="text-red-500">DECONECTAT</span>
                </p>
                <p className="text-[11px] font-mono text-red-400/60 leading-relaxed">
                  Victor Dragoș — <span className="text-red-500">DECONECTAT</span>
                </p>
                <p className="text-[11px] font-mono text-red-400/60 leading-relaxed">
                  Elena Varga — <span className="text-red-500">DECONECTAT</span>
                </p>
              </div>
            </div>
          )}

          {/* Stage 4: Black box teaser + continue */}
          {cliffhangerStage >= 4 && (
            <div className="animate-fade-in">
              <div className="border border-noir-border/30 bg-noir-dark/50 rounded-lg px-6 py-4 mb-6">
                <p className="text-[9px] font-mono text-noir-muted uppercase tracking-[0.3em] mb-2">
                  Ultimul fragment interceptat
                </p>
                <p className="text-[11px] font-mono text-amber-400/80 italic leading-relaxed">
                  "Andrei... trebuia să asculți."
                </p>
                <p className="text-[9px] font-mono text-red-500/50 mt-2">
                  ⚠ SURSA: NECUNOSCUTĂ — PORTUL CONSTANȚA
                </p>
              </div>

              <button
                onClick={() => {
                  setCliffhangerActive(false);
                  setCliffhangerStage(0);
                  setPostCredits(true);
                }}
                className="px-6 py-2.5 border border-noir-border rounded-lg text-[10px] font-mono text-noir-muted uppercase tracking-widest hover:border-noir-red/50 hover:text-noir-red-light transition-all cursor-pointer"
              >
                Continuă
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show CaseMenu for episodes with sections when no section is selected
  if (hasSections && activeSection === null) {
    return (
      <div className="flex-1 flex flex-col bg-noir-black">
        <CaseMenu
          episode={episode}
          onSelectSection={(section) => setActiveSection(section)}
        />
      </div>
    );
  }

  // Show PhoneSimulator
  if (activeSection === 'telefon' && episode.phone) {
    return (
      <div className="flex-1 flex flex-col bg-noir-black">
        <PhoneSimulator
          phone={episode.phone}
          episodeId={episodeId}
          onBack={() => setActiveSection(null)}
          onTrigger={handleTrigger}
        />
      </div>
    );
  }

  // Show RadarMap
  if (activeSection === 'radar') {
    return (
      <div className="flex-1 flex flex-col bg-noir-black">
        <RadarMap
          onBack={() => setActiveSection(null)}
          unlockedSuspects={unlockedSuspects}
        />
      </div>
    );
  }

  // Show Evidence Folder
  if (activeSection === 'probe') {
    return (
      <div className="flex-1 flex flex-col bg-noir-black">
        <EvidenceFolder
          episodeId={episodeId}
          onBack={() => setActiveSection(null)}
        />
      </div>
    );
  }

  // Interrogation chat (default)
  return (
    <div className="flex-1 flex flex-col bg-noir-black">
      {/* Unlock banner */}
      {banner && (
        <div className="px-4 py-2.5 bg-noir-red/20 border-b border-noir-red/40 animate-fade-in">
          <p className="text-[10px] font-mono font-bold text-noir-red-light uppercase tracking-widest text-center">
            {banner}
          </p>
        </div>
      )}

      {/* Case Header */}
      <div className="px-4 py-3 bg-noir-card/80 backdrop-blur-md border-b border-noir-border">
        <div className="flex items-center gap-2 mb-0.5">
          <Radio size={10} className="text-noir-red-light animate-pulse" />
          <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
            {hasSections ? 'Sala de interogatoriu' : 'Canal securizat — Investigație activă'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-wide">
            {episode.case_name || episodeId}
          </h2>
          {hasSections && (
            <button
              onClick={() => setActiveSection(null)}
              className="text-[9px] font-mono text-noir-muted hover:text-noir-red-light uppercase tracking-widest transition-colors cursor-pointer"
            >
              ← Meniu dosar
            </button>
          )}
        </div>
      </div>

      {/* Suspect Tabs */}
      {suspects.length > 1 && (
        <div className="flex overflow-x-auto border-b border-noir-border bg-noir-dark/50 scrollbar-hide">
          {suspects.map((suspect) => {
            const isActive = suspect.id === activeSuspectId;
            const isLocked = suspect.locked && !unlockedSuspects.includes(suspect.id);
            const contacted = getContactedSuspects(episodeId, suspects);
            const hasMessages = contacted.includes(suspect.id);

            return (
              <button
                key={suspect.id}
                onClick={() => !isLocked && switchSuspect(suspect.id)}
                disabled={isTyping || isLocked}
                className={`
                  flex-1 min-w-[100px] flex items-center gap-2 px-3 py-3 transition-all relative
                  ${isLocked
                    ? 'opacity-40 cursor-not-allowed'
                    : isActive
                      ? 'bg-noir-card/60 cursor-pointer'
                      : 'hover:bg-noir-card/30 cursor-pointer'
                  }
                  ${isTyping && !isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {/* Avatar */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono
                  ${isLocked
                    ? 'bg-noir-border/20 border border-noir-border/50 text-noir-muted/30'
                    : isActive
                      ? 'bg-noir-red/20 border border-noir-red/40 text-noir-red-light'
                      : 'bg-noir-border/30 border border-noir-border text-noir-muted'
                  }
                `}>
                  {isLocked ? <Lock size={12} className="text-noir-muted/30" /> : suspect.avatar_letter}
                </div>

                {/* Info */}
                <div className="text-left min-w-0 flex-1">
                  <p className={`text-[11px] font-semibold truncate ${
                    isLocked ? 'text-noir-muted/30' : isActive ? 'text-white' : 'text-noir-muted'
                  }`}>
                    {isLocked ? '???' : suspect.name}
                  </p>
                  <p className={`text-[9px] font-mono uppercase tracking-wider truncate ${
                    isLocked ? 'text-noir-muted/20' : isActive ? 'text-noir-red-light' : 'text-noir-muted/50'
                  }`}>
                    {isLocked ? 'BLOCAT' : suspect.role}
                  </p>
                </div>

                {/* Status dot */}
                {!isLocked && hasMessages && (
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-noir-red' : 'bg-noir-muted/40'}`} />
                )}

                {/* Active indicator */}
                {isActive && !isLocked && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-noir-red" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Evidence popup */}
      {evidencePopup && (
        <div className="mx-4 mt-3 animate-fade-in">
          <div
            className="relative border border-amber-500/40 bg-amber-950/30 rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-amber-500/60 transition-all"
            onClick={() => setEvidencePopup(null)}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono text-amber-400/70 uppercase tracking-widest mb-0.5">Probă deblocată</p>
              <p className="text-xs font-semibold text-amber-200 truncate">{evidencePopup.name}</p>
              <p className="text-[10px] text-amber-400/50 font-mono uppercase tracking-wider">{evidencePopup.type} — {evidencePopup.id}</p>
            </div>
            <Eye size={14} className="text-amber-400/40 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isUser={msg.sender === 'user'}
            characterName={activeSuspect?.name || 'Unknown'}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-noir-card border border-noir-border rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="text-[10px] font-mono text-noir-red-light uppercase tracking-widest block mb-1">
                {activeSuspect?.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-noir-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-noir-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-noir-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
