import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MessageSquare, Phone, FileText, Lock, Delete, ChevronRight, User, Heart } from 'lucide-react';

const PHONE_STORAGE_KEY = 'redacted-hub-phone';

function loadPhoneState(episodeId) {
  try {
    const saved = localStorage.getItem(PHONE_STORAGE_KEY);
    if (saved) {
      const all = JSON.parse(saved);
      return all[episodeId] || { unlocked: false, smsRead: false, callsRead: false, notesRead: false };
    }
  } catch { /* ignore */ }
  return { unlocked: false, smsRead: false, callsRead: false, notesRead: false };
}

function savePhoneState(episodeId, state) {
  try {
    const saved = localStorage.getItem(PHONE_STORAGE_KEY);
    const all = saved ? JSON.parse(saved) : {};
    all[episodeId] = state;
    localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

export default function PhoneSimulator({ phone, episodeId, onBack, onTrigger }) {
  const [phoneState, setPhoneState] = useState(() => loadPhoneState(episodeId));
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [screen, setScreen] = useState(phoneState.unlocked ? 'menu' : 'lock');
  const [selectedSms, setSelectedSms] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notePasswordInput, setNotePasswordInput] = useState('');
  const [noteDecrypted, setNoteDecrypted] = useState({});
  const [notePasswordError, setNotePasswordError] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [sofiaResponse, setSofiaResponse] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const MAX_ATTEMPTS = 3;
  const COOLDOWN_SECONDS = 30;

  useEffect(() => {
    savePhoneState(episodeId, phoneState);
  }, [phoneState, episodeId]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const triggerBanner = (text) => {
    setBannerText(text);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 4000);
  };

  const handlePinDigit = useCallback((digit) => {
    if (pinInput.length >= 4 || cooldown > 0) return;
    const newPin = pinInput + digit;
    setPinInput(newPin);
    setPinError(false);

    if (newPin.length === 4) {
      setTimeout(() => {
        if (newPin === phone.pin) {
          const newState = { ...phoneState, unlocked: true };
          setPhoneState(newState);
          setScreen('menu');
          setFailedAttempts(0);
          onTrigger?.('phone_unlocked');
          triggerBanner('TELEFON DEBLOCAT — ACCES LA SMS-URI ȘI CONTACTE');
        } else {
          const newAttempts = failedAttempts + 1;
          setFailedAttempts(newAttempts);
          setPinError(true);
          if (newAttempts >= MAX_ATTEMPTS) {
            setCooldown(COOLDOWN_SECONDS);
          }
          setTimeout(() => {
            setPinInput('');
            setPinError(false);
          }, 1000);
        }
      }, 300);
    }
  }, [pinInput, phone.pin, phoneState, onTrigger, failedAttempts, cooldown]);

  const handlePinDelete = useCallback(() => {
    if (cooldown > 0) return;
    setPinInput(prev => prev.slice(0, -1));
    setPinError(false);
  }, [cooldown]);

  const openSms = () => {
    setScreen('sms');
    if (!phoneState.smsRead) {
      const newState = { ...phoneState, smsRead: true };
      setPhoneState(newState);
      onTrigger?.('phone_sms_read');
    }
  };

  const handleSmsClick = (sms) => {
    setSelectedSms(sms);
    if (sms.id === 'sms-e' && !phoneState.smsERead) {
      const newState = { ...phoneState, smsERead: true };
      setPhoneState(newState);
      onTrigger?.('phone_sms_e_read');
    }
  };

  const openCalls = () => {
    setScreen('calls');
    if (!phoneState.callsRead) {
      const newState = { ...phoneState, callsRead: true };
      setPhoneState(newState);
    }
  };

  const openNotes = () => {
    setScreen('notes');
    if (!phoneState.notesRead) {
      const newState = { ...phoneState, notesRead: true };
      setPhoneState(newState);
      onTrigger?.('phone_notes_read');
    }
  };

  const openContacts = () => {
    setScreen('contacts');
  };

  const handleSofiaMessage = () => {
    setSofiaResponse(true);
    if (!phoneState.sofiaContacted) {
      const newState = { ...phoneState, sofiaContacted: true };
      setPhoneState(newState);
      onTrigger?.('phone_sofia_contacted');
    }
  };

  const greenGlow = 'drop-shadow(0 0 8px rgba(0, 255, 65, 0.4))';
  const greenColor = '#00ff41';
  const greenDim = '#00aa2a';
  const greenBg = 'rgba(0, 255, 65, 0.05)';

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-noir-black p-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 text-noir-muted hover:text-noir-red-light transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span className="text-xs font-mono uppercase tracking-widest">Înapoi la dosar</span>
      </button>

      {/* Unlock banner */}
      {showBanner && (
        <div
          className="w-full max-w-xs mb-3 px-4 py-2.5 rounded-lg text-center animate-fade-in"
          style={{ backgroundColor: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.3)' }}
        >
          <p className="text-[10px] font-mono font-bold tracking-widest" style={{ color: '#00ff41', filter: greenGlow }}>
            {bannerText}
          </p>
        </div>
      )}

      {/* Phone body */}
      <div
        className="w-full max-w-xs rounded-2xl border-2 border-noir-border bg-noir-dark overflow-hidden"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)' }}
      >
        {/* Phone header */}
        <div className="px-4 py-2 border-b border-noir-border/50 flex items-center justify-between">
          <span className="text-[9px] font-mono" style={{ color: greenDim }}>
            {phone.model}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: greenColor }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: greenColor, opacity: 0.6 }} />
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: greenColor, opacity: 0.3 }} />
          </div>
        </div>

        {/* Screen area */}
        <div
          className="mx-3 my-3 rounded-lg border border-noir-border/50 min-h-[380px] flex flex-col"
          style={{ backgroundColor: '#0a0a0a', boxShadow: `inset 0 0 30px rgba(0, 255, 65, 0.03)` }}
        >
          {/* LOCK SCREEN */}
          {screen === 'lock' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <Lock size={24} style={{ color: greenDim, filter: greenGlow }} className="mb-4" />
              <p className="text-xs font-mono mb-1" style={{ color: greenColor, filter: greenGlow }}>
                TELEFON BLOCAT
              </p>
              <p className="text-[9px] font-mono mb-6" style={{ color: greenDim }}>
                {phone.owner}
              </p>

              {/* PIN dots */}
              <div className="flex gap-3 mb-6">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border transition-all duration-200"
                    style={{
                      borderColor: pinError ? '#ff3333' : greenDim,
                      backgroundColor: i < pinInput.length
                        ? (pinError ? '#ff3333' : greenColor)
                        : 'transparent',
                      boxShadow: i < pinInput.length
                        ? (pinError ? '0 0 6px rgba(255,50,50,0.5)' : `0 0 6px rgba(0, 255, 65, 0.4)`)
                        : 'none',
                    }}
                  />
                ))}
              </div>

              {pinError && cooldown <= 0 && (
                <p className="text-[10px] font-mono text-red-500 mb-3 animate-pulse">
                  Cod incorect. Încercări rămase: {MAX_ATTEMPTS - failedAttempts}
                </p>
              )}

              {cooldown > 0 && (
                <div className="text-center mb-3">
                  <p className="text-[10px] font-mono text-red-500 mb-1 animate-pulse">
                    DISPOZITIV BLOCAT
                  </p>
                  <p className="text-[11px] font-mono font-bold" style={{ color: '#ff3333' }}>
                    Reîncercare în: {cooldown}s
                  </p>
                </div>
              )}

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2 w-48">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => {
                  if (key === null) return <div key={i} />;
                  if (key === 'del') {
                    return (
                      <button
                        key={i}
                        onClick={handlePinDelete}
                        className="h-11 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                        style={{ backgroundColor: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.15)' }}
                      >
                        <Delete size={14} style={{ color: greenDim }} />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handlePinDigit(String(key))}
                      className="h-11 rounded-lg font-mono text-sm font-bold transition-all cursor-pointer active:scale-95"
                      style={{
                        color: greenColor,
                        backgroundColor: 'rgba(0,255,65,0.05)',
                        border: '1px solid rgba(0,255,65,0.15)',
                        textShadow: `0 0 6px rgba(0,255,65,0.4)`,
                      }}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN MENU */}
          {screen === 'menu' && (
            <div className="flex-1 flex flex-col p-4">
              <p className="text-[9px] font-mono text-center mb-1" style={{ color: greenDim }}>
                {phone.owner}
              </p>
              <p className="text-xs font-mono text-center mb-6" style={{ color: greenColor, filter: greenGlow }}>
                MENIU PRINCIPAL
              </p>

              <div className="space-y-2">
                <button
                  onClick={openSms}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer"
                  style={{ backgroundColor: greenBg, border: '1px solid rgba(0,255,65,0.15)' }}
                >
                  <MessageSquare size={16} style={{ color: greenColor, filter: greenGlow }} />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-mono font-bold" style={{ color: greenColor }}>MESAJE SMS</p>
                    <p className="text-[9px] font-mono" style={{ color: greenDim }}>
                      {phone.sms.length} mesaje
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ color: greenDim }} />
                </button>

                <button
                  onClick={openCalls}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer"
                  style={{ backgroundColor: greenBg, border: '1px solid rgba(0,255,65,0.15)' }}
                >
                  <Phone size={16} style={{ color: greenColor, filter: greenGlow }} />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-mono font-bold" style={{ color: greenColor }}>REGISTRU APELURI</p>
                    <p className="text-[9px] font-mono" style={{ color: greenDim }}>
                      {phone.calls.length} apeluri
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ color: greenDim }} />
                </button>

                <button
                  onClick={openNotes}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer"
                  style={{ backgroundColor: greenBg, border: '1px solid rgba(0,255,65,0.15)' }}
                >
                  <FileText size={16} style={{ color: greenColor, filter: greenGlow }} />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-mono font-bold" style={{ color: greenColor }}>NOTE</p>
                    <p className="text-[9px] font-mono" style={{ color: greenDim }}>
                      {phone.notes.length} notițe
                    </p>
                  </div>
                  <ChevronRight size={14} style={{ color: greenDim }} />
                </button>

                {phone.contacts && (
                  <button
                    onClick={openContacts}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer"
                    style={{ backgroundColor: greenBg, border: '1px solid rgba(0,255,65,0.15)' }}
                  >
                    <User size={16} style={{ color: greenColor, filter: greenGlow }} />
                    <div className="flex-1 text-left">
                      <p className="text-xs font-mono font-bold" style={{ color: greenColor }}>CONTACTE</p>
                      <p className="text-[9px] font-mono" style={{ color: greenDim }}>
                        {phone.contacts.length} contacte
                      </p>
                    </div>
                    <ChevronRight size={14} style={{ color: greenDim }} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SMS LIST */}
          {screen === 'sms' && !selectedSms && (
            <div className="flex-1 flex flex-col p-4">
              <button
                onClick={() => setScreen('menu')}
                className="flex items-center gap-1 mb-4 cursor-pointer"
                style={{ color: greenDim }}
              >
                <ArrowLeft size={12} />
                <span className="text-[9px] font-mono uppercase tracking-widest">Meniu</span>
              </button>
              <p className="text-xs font-mono text-center mb-4" style={{ color: greenColor, filter: greenGlow }}>
                MESAJE PRIMITE
              </p>
              <div className="space-y-2 overflow-y-auto flex-1">
                {phone.sms.map((sms, i) => (
                  <button
                    key={i}
                    onClick={() => handleSmsClick(sms)}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                    style={{ backgroundColor: greenBg, border: sms.id === 'sms-e' ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(0,255,65,0.1)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold" style={{ color: greenColor }}>{sms.from}</span>
                      <span className="text-[9px] font-mono" style={{ color: greenDim }}>{sms.time}</span>
                    </div>
                    <p className="text-[10px] font-mono leading-relaxed truncate" style={{ color: greenDim }}>
                      {sms.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SMS DETAIL */}
          {screen === 'sms' && selectedSms && (
            <div className="flex-1 flex flex-col p-4">
              <button
                onClick={() => setSelectedSms(null)}
                className="flex items-center gap-1 mb-4 cursor-pointer"
                style={{ color: greenDim }}
              >
                <ArrowLeft size={12} />
                <span className="text-[9px] font-mono uppercase tracking-widest">Mesaje</span>
              </button>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold" style={{ color: greenColor, filter: greenGlow }}>
                  {selectedSms.from}
                </span>
                <span className="text-[9px] font-mono" style={{ color: greenDim }}>{selectedSms.time}</span>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: greenBg, border: '1px solid rgba(0,255,65,0.15)' }}
              >
                <p className="text-[11px] font-mono leading-relaxed" style={{ color: greenColor }}>
                  {selectedSms.text}
                </p>
              </div>
            </div>
          )}

          {/* CALLS LIST */}
          {screen === 'calls' && (
            <div className="flex-1 flex flex-col p-4">
              <button
                onClick={() => setScreen('menu')}
                className="flex items-center gap-1 mb-4 cursor-pointer"
                style={{ color: greenDim }}
              >
                <ArrowLeft size={12} />
                <span className="text-[9px] font-mono uppercase tracking-widest">Meniu</span>
              </button>
              <p className="text-xs font-mono text-center mb-4" style={{ color: greenColor, filter: greenGlow }}>
                REGISTRU APELURI
              </p>
              <div className="space-y-2 overflow-y-auto flex-1">
                {phone.calls.map((call, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2.5 rounded-lg ${call.highlight ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: call.highlight ? 'rgba(255,50,50,0.08)' : greenBg, border: call.highlight ? '1px solid rgba(255,50,50,0.3)' : '1px solid rgba(0,255,65,0.1)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded" style={{
                          color: call.type === 'missed' ? '#ff3333' : greenColor,
                          backgroundColor: call.type === 'missed' ? 'rgba(255,50,50,0.1)' : 'rgba(0,255,65,0.1)',
                          border: `1px solid ${call.type === 'missed' ? 'rgba(255,50,50,0.2)' : 'rgba(0,255,65,0.15)'}`,
                        }}>
                          {call.type === 'missed' ? 'RATAT' : call.type === 'incoming' ? 'PRIMIT' : 'EFECTUAT'}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono" style={{ color: greenDim }}>{call.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold" style={{ color: call.type === 'missed' ? '#ff6666' : greenColor }}>
                        {call.from || call.to}
                      </span>
                      {call.duration && (
                        <span className="text-[9px] font-mono" style={{ color: greenDim }}>{call.duration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES LIST */}
          {screen === 'notes' && !selectedNote && (
            <div className="flex-1 flex flex-col p-4">
              <button
                onClick={() => setScreen('menu')}
                className="flex items-center gap-1 mb-4 cursor-pointer"
                style={{ color: greenDim }}
              >
                <ArrowLeft size={12} />
                <span className="text-[9px] font-mono uppercase tracking-widest">Meniu</span>
              </button>
              <p className="text-xs font-mono text-center mb-4" style={{ color: greenColor, filter: greenGlow }}>
                NOTE SALVATE
              </p>
              <div className="space-y-2 overflow-y-auto flex-1">
                {phone.notes.map((note, i) => {
                  const isEncrypted = note.encrypted && !noteDecrypted[note.id];
                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedNote(note); setNotePasswordInput(''); setNotePasswordError(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                      style={{ backgroundColor: greenBg, border: isEncrypted ? '1px solid rgba(255,100,100,0.2)' : '1px solid rgba(0,255,65,0.1)' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {isEncrypted && <Lock size={10} style={{ color: '#ff6b6b' }} />}
                          <span className="text-[10px] font-mono font-bold" style={{ color: isEncrypted ? '#ff6b6b' : greenColor }}>{note.title}</span>
                        </div>
                        <span className="text-[9px] font-mono" style={{ color: greenDim }}>{note.time}</span>
                      </div>
                      <p className="text-[10px] font-mono leading-relaxed truncate" style={{ color: greenDim }}>
                        {isEncrypted ? '████████ NECESITĂ PAROLĂ ████████' : note.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* NOTE DETAIL */}
          {screen === 'notes' && selectedNote && (
            <div className="flex-1 flex flex-col p-4">
              <button
                onClick={() => setSelectedNote(null)}
                className="flex items-center gap-1 mb-4 cursor-pointer"
                style={{ color: greenDim }}
              >
                <ArrowLeft size={12} />
                <span className="text-[9px] font-mono uppercase tracking-widest">Note</span>
              </button>

              {/* Encrypted note — password gate */}
              {selectedNote.encrypted && !noteDecrypted[selectedNote.id] ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <Lock size={28} style={{ color: '#ff6b6b' }} />
                  <p className="text-[10px] font-mono text-center" style={{ color: '#ff6b6b' }}>
                    NOTĂ CRIPTATĂ — INTRODUCEȚI PAROLA
                  </p>
                  <div className="w-full max-w-[200px]">
                    <input
                      type="text"
                      value={notePasswordInput}
                      onChange={e => { setNotePasswordInput(e.target.value.toUpperCase()); setNotePasswordError(false); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (notePasswordInput === selectedNote.password) {
                            setNoteDecrypted(prev => ({ ...prev, [selectedNote.id]: true }));
                            setNotePasswordInput('');
                            onTrigger?.('note_decrypted_' + selectedNote.id);
                          } else {
                            setNotePasswordError(true);
                          }
                        }
                      }}
                      placeholder="PAROLA..."
                      className="w-full text-center text-xs font-mono px-3 py-2 rounded-lg bg-transparent outline-none"
                      style={{
                        color: notePasswordError ? '#ff6b6b' : greenColor,
                        border: notePasswordError ? '1px solid rgba(255,100,100,0.4)' : '1px solid rgba(0,255,65,0.2)',
                      }}
                    />
                    {notePasswordError && (
                      <p className="text-[9px] font-mono text-center mt-2" style={{ color: '#ff6b6b' }}>
                        PAROLĂ INCORECTĂ
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (notePasswordInput === selectedNote.password) {
                        setNoteDecrypted(prev => ({ ...prev, [selectedNote.id]: true }));
                        setNotePasswordInput('');
                        onTrigger?.('note_decrypted_' + selectedNote.id);
                      } else {
                        setNotePasswordError(true);
                      }
                    }}
                    className="text-[9px] font-mono uppercase tracking-widest px-4 py-1.5 rounded-lg cursor-pointer transition-all"
                    style={{ color: greenColor, border: '1px solid rgba(0,255,65,0.2)' }}
                  >
                    Decriptează
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold" style={{ color: greenColor, filter: greenGlow }}>
                      {selectedNote.encrypted ? '🔓 NOTĂ DECRIPTATĂ' : selectedNote.title}
                    </span>
                    <span className="text-[9px] font-mono" style={{ color: greenDim }}>{selectedNote.time}</span>
                  </div>
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: greenBg, border: '1px solid rgba(0,255,65,0.15)' }}
                  >
                    <p className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap" style={{ color: greenColor }}>
                      {selectedNote.text}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CONTACTS LIST */}
          {screen === 'contacts' && !selectedContact && (
            <div className="flex-1 flex flex-col p-4">
              <button
                onClick={() => setScreen('menu')}
                className="flex items-center gap-1 mb-4 cursor-pointer"
                style={{ color: greenDim }}
              >
                <ArrowLeft size={12} />
                <span className="text-[9px] font-mono uppercase tracking-widest">Meniu</span>
              </button>
              <p className="text-xs font-mono text-center mb-4" style={{ color: greenColor, filter: greenGlow }}>
                CONTACTE
              </p>
              <div className="space-y-2 overflow-y-auto flex-1">
                {(phone.contacts || []).map((contact, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedContact(contact); setSofiaResponse(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer"
                    style={{ backgroundColor: greenBg, border: contact.id === 'sofia-serban' ? '1px solid rgba(0,255,65,0.35)' : '1px solid rgba(0,255,65,0.1)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.2)' }}>
                        {contact.id === 'sofia-serban' ? (
                          <Heart size={12} style={{ color: greenColor }} />
                        ) : (
                          <User size={12} style={{ color: greenDim }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-mono font-bold" style={{ color: greenColor }}>{contact.name}</p>
                        <p className="text-[9px] font-mono" style={{ color: greenDim }}>{contact.number}</p>
                      </div>
                      <ChevronRight size={12} style={{ color: greenDim }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CONTACT DETAIL */}
          {screen === 'contacts' && selectedContact && (
            <div className="flex-1 flex flex-col p-4">
              <button
                onClick={() => { setSelectedContact(null); setSofiaResponse(false); }}
                className="flex items-center gap-1 mb-4 cursor-pointer"
                style={{ color: greenDim }}
              >
                <ArrowLeft size={12} />
                <span className="text-[9px] font-mono uppercase tracking-widest">Contacte</span>
              </button>

              <div className="flex flex-col items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)' }}>
                  {selectedContact.id === 'sofia-serban' ? (
                    <Heart size={20} style={{ color: greenColor, filter: greenGlow }} />
                  ) : (
                    <User size={20} style={{ color: greenColor, filter: greenGlow }} />
                  )}
                </div>
                <p className="text-xs font-mono font-bold" style={{ color: greenColor, filter: greenGlow }}>
                  {selectedContact.name}
                </p>
                <p className="text-[9px] font-mono" style={{ color: greenDim }}>{selectedContact.number}</p>
                {selectedContact.note && (
                  <p className="text-[9px] font-mono mt-1 px-2 py-0.5 rounded" style={{ color: greenColor, backgroundColor: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.15)' }}>
                    📝 {selectedContact.note}
                  </p>
                )}
              </div>

              {selectedContact.id === 'sofia-serban' ? (
                <div className="flex-1 flex flex-col">
                  {!sofiaResponse ? (
                    <button
                      onClick={handleSofiaMessage}
                      className="w-full px-4 py-3 rounded-lg transition-all cursor-pointer"
                      style={{ backgroundColor: greenBg, border: '1px solid rgba(0,255,65,0.25)' }}
                    >
                      <p className="text-[10px] font-mono font-bold text-center" style={{ color: greenColor }}>
                        TRIMITE MESAJ VOCAL
                      </p>
                    </button>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(0,255,65,0.05)', border: '1px solid rgba(0,255,65,0.15)' }}>
                        <p className="text-[9px] font-mono mb-2" style={{ color: greenDim }}>MESAJ TRIMIS — ACUM</p>
                        <p className="text-[10px] font-mono" style={{ color: greenColor }}>🎤 [Mesaj vocal — 0:03]</p>
                      </div>

                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,50,50,0.05)', border: '1px solid rgba(255,50,50,0.2)' }}>
                        <p className="text-[9px] font-mono mb-2" style={{ color: '#ff6666' }}>RĂSPUNS PRIMIT — ACUM</p>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-[10px] font-mono" style={{ color: '#ff6666' }}>🎤 [Mesaj vocal — 0:12]</p>
                        </div>
                        {/* Waveform */}
                        <div className="flex items-end gap-[1px] h-6 mb-2">
                          {Array.from({ length: 32 }).map((_, i) => {
                            const h = Math.sin(i * 0.5) * 40 + Math.random() * 30 + 15;
                            return (
                              <div key={i} className="flex-1 rounded-sm min-w-[2px]" style={{ height: `${Math.min(h, 100)}%`, backgroundColor: 'rgba(255,100,100,0.4)' }} />
                            );
                          })}
                        </div>
                        <p className="text-[9px] font-mono italic leading-relaxed" style={{ color: '#ff9999' }}>
                          [Transcriere automată]
                        </p>
                        <p className="text-[10px] font-mono italic leading-relaxed mt-1" style={{ color: '#ffaaaa' }}>
                          *plâns* ... Andrei... de ce nu ai... *plâns*... de ce nu m-ai ascultat... te-am rugat să nu te urci în avionul ăla... *pauză lungă* ...îmi e dor de tine...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[10px] font-mono text-center" style={{ color: greenDim }}>
                    Nu se poate efectua apelul.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phone bottom */}
        <div className="px-4 py-3 border-t border-noir-border/50 text-center">
          <span className="text-[8px] font-mono uppercase tracking-[0.3em]" style={{ color: greenDim }}>
            PROBĂ MATERIALĂ — {phone.owner}
          </span>
        </div>
      </div>
    </div>
  );
}
