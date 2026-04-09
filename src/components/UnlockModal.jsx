import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, KeyRound, AlertTriangle, Unlock, Camera, Keyboard, Shield } from 'lucide-react';
import { useEpisodes } from '../context/EpisodeContext';
import { useObjectives } from '../context/ObjectivesContext';

export default function UnlockModal({ isOpen, onClose }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [mode, setMode] = useState('choose');
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const { unlockByCode, setActiveEpisodeId } = useEpisodes();
  const { completeByTrigger } = useObjectives();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setMode('choose');
    }
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {});
      scannerInstanceRef.current.clear();
      scannerInstanceRef.current = null;
    }
    setScannerReady(false);
  };

  const startScanner = async () => {
    setMode('qr');
    setError('');

    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const scanner = new Html5Qrcode('qr-reader');
        scannerInstanceRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
            aspectRatio: 1,
          },
          (decodedText) => {
            handleCodeSubmit(decodedText.trim().toUpperCase());
            stopScanner();
          },
          () => {}
        );
        setScannerReady(true);
      } catch (err) {
        console.error('QR Scanner error:', err);
        setError('Nu s-a putut accesa camera. Folosește introducerea manuală.');
        setMode('manual');
      }
    }, 100);
  };

  const handleCodeSubmit = (inputCode) => {
    const codeToCheck = inputCode || code.trim();
    setError('');

    if (!codeToCheck) {
      setError('Introdu un cod de acces.');
      return;
    }

    const episode = unlockByCode(codeToCheck);
    if (episode) {
      setSuccess(episode);
      completeByTrigger(episode.id, 'episode_unlocked');
      stopScanner();
      setTimeout(() => {
        setActiveEpisodeId(episode.id);
        navigate(`/chat/${episode.id}`);
        handleClose();
      }, 2500);
    } else {
      setError('Cod invalid sau dosar deja deblocat.');
      setCode('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCodeSubmit(code.toUpperCase());
  };

  const handleClose = () => {
    stopScanner();
    setCode('');
    setError('');
    setSuccess(null);
    setMode('choose');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-sm bg-noir-dark border border-noir-border rounded-xl overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-noir-border">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-noir-red" />
              <h3 className="font-mono text-sm font-bold tracking-widest uppercase text-white">
                {success ? 'Acces Acordat' : mode === 'qr' ? 'Scanner QR' : mode === 'manual' ? 'Cod Manual' : 'Deblocare Dosar'}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-noir-muted hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {success ? (
              <div className="text-center py-6 animate-fade-in">
                {/* Noir success animation */}
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-noir-red/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border border-noir-red/50 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield size={32} className="text-noir-red-light" />
                  </div>
                </div>

                <p className="text-lg text-white font-bold mb-1 tracking-wide">DOSAR DEBLOCAT</p>
                <p className="text-sm text-noir-red-light font-mono uppercase tracking-widest mb-2">
                  {success.case_name}
                </p>
                <p className="text-xs text-noir-muted leading-relaxed max-w-xs mx-auto mb-4">
                  Canal securizat activat. Se inițializează conexiunea criptată...
                </p>

                {/* Animated progress */}
                <div className="w-full h-1.5 bg-noir-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-noir-red to-noir-red-light rounded-full transition-all duration-2000 ease-out"
                    style={{
                      width: '100%',
                      animation: 'grow-width 2s ease-out forwards',
                    }}
                  />
                </div>
                <p className="text-[9px] font-mono text-noir-muted mt-2 uppercase tracking-widest animate-pulse">
                  Conectare la informator...
                </p>
              </div>
            ) : mode === 'choose' ? (
              <div className="space-y-3">
                <p className="text-xs text-noir-muted mb-4 leading-relaxed text-center">
                  Alege metoda de introducere a codului de acces.
                </p>

                <button
                  onClick={startScanner}
                  className="w-full flex items-center gap-4 p-4 bg-noir-card border border-noir-border rounded-lg hover:border-noir-red/50 hover:bg-noir-card/80 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-noir-red/20 flex items-center justify-center group-hover:bg-noir-red/30 transition-colors">
                    <Camera size={18} className="text-noir-red-light" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white font-semibold">Scanează QR</p>
                    <p className="text-[10px] text-noir-muted font-mono uppercase tracking-widest">
                      Folosește camera telefonului
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setMode('manual')}
                  className="w-full flex items-center gap-4 p-4 bg-noir-card border border-noir-border rounded-lg hover:border-noir-red/50 hover:bg-noir-card/80 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-noir-border/50 flex items-center justify-center group-hover:bg-noir-border/70 transition-colors">
                    <Keyboard size={18} className="text-noir-muted" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-white font-semibold">Introdu manual</p>
                    <p className="text-[10px] text-noir-muted font-mono uppercase tracking-widest">
                      Tastează codul de acces
                    </p>
                  </div>
                </button>
              </div>
            ) : mode === 'qr' ? (
              <div>
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full rounded-lg overflow-hidden mb-4 bg-noir-black border border-noir-border"
                  style={{ minHeight: '250px' }}
                />

                {!scannerReady && !error && (
                  <div className="flex items-center justify-center gap-2 text-noir-muted py-2">
                    <div className="w-2 h-2 bg-noir-red rounded-full animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-widest">
                      Se activează camera...
                    </span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 animate-fade-in">
                    <AlertTriangle size={12} />
                    <span className="text-xs font-mono">{error}</span>
                  </div>
                )}

                <button
                  onClick={() => { stopScanner(); setMode('manual'); setError(''); }}
                  className="w-full mt-3 text-xs font-mono text-noir-muted uppercase tracking-widest py-2 hover:text-white transition-colors cursor-pointer"
                >
                  Sau introdu codul manual →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-xs text-noir-muted mb-4 leading-relaxed">
                  Introdu codul primit prin scanarea QR sau de la un informator.
                </p>

                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="COD DE ACCES"
                  autoFocus
                  className="w-full bg-noir-black border border-noir-border rounded-lg px-4 py-3 text-sm text-white placeholder-noir-muted font-mono tracking-widest text-center uppercase focus:outline-none focus:border-noir-red/50 transition-colors"
                />

                {error && (
                  <div className="flex items-center gap-2 mt-3 text-red-400 animate-fade-in">
                    <AlertTriangle size={12} />
                    <span className="text-xs font-mono">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-4 bg-noir-red hover:bg-noir-red-light text-white font-mono text-xs uppercase tracking-widest py-3 rounded-lg transition-colors cursor-pointer"
                >
                  Verifică Cod
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('choose'); setError(''); setCode(''); }}
                  className="w-full mt-2 text-xs font-mono text-noir-muted uppercase tracking-widest py-2 hover:text-white transition-colors cursor-pointer"
                >
                  ← Înapoi
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
