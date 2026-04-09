import { useState, useEffect, useRef } from 'react';
import { ScanLine, Anchor, AlertTriangle } from 'lucide-react';

const TYPING_LINES = [
  { text: 'DOSAR #001: REZOLVAT. STATUS: COMPROMIS.', delay: 1500, color: 'text-red-400' },
  { text: 'SUSPECTUL PRINCIPAL NU A ACȚIONAT SINGUR.', delay: 4500, color: 'text-white' },
  { text: 'URMĂTORUL PUNCT DE INTERES: PORTUL CONSTANȚA — TERMINAL 7B.', delay: 8000, color: 'text-amber-400' },
];

function useTypingLine(text, active, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); return; }
    let i = 0;
    setDisplayed('');
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);
  return { displayed, done };
}

function useAlarmSound() {
  const ctxRef = useRef(null);
  const startedRef = useRef(false);

  const play = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;

      const playBeep = (time, freq, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      };

      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        playBeep(now + i * 0.6, 880, 0.15);
        playBeep(now + i * 0.6 + 0.2, 660, 0.15);
      }

      const noise = ctx.createBufferSource();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.05;
      noise.buffer = buf;
      const nGain = ctx.createGain();
      nGain.gain.value = 0.03;
      noise.connect(nGain);
      nGain.connect(ctx.destination);
      noise.start(now + 1.8);
    } catch {}
  };

  const stop = () => {
    try { ctxRef.current?.close(); } catch {}
  };

  return { play, stop };
}

export default function PostCreditsScreen({ onComplete }) {
  const [stage, setStage] = useState(0);
  const [line1Active, setLine1Active] = useState(false);
  const [line2Active, setLine2Active] = useState(false);
  const [line3Active, setLine3Active] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [redAlert, setRedAlert] = useState(false);
  const alarm = useAlarmSound();

  const typing1 = useTypingLine(TYPING_LINES[0].text, line1Active, 35);
  const typing2 = useTypingLine(TYPING_LINES[1].text, line2Active, 35);
  const typing3 = useTypingLine(TYPING_LINES[2].text, line3Active, 30);

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => { setStage(1); setLine1Active(true); }, 1500));
    timers.push(setTimeout(() => { setLine2Active(true); }, 4500));
    timers.push(setTimeout(() => {
      setLine3Active(true);
      setRedAlert(true);
      alarm.play();
    }, 8000));
    timers.push(setTimeout(() => { setShowCTA(true); }, 12500));
    return () => {
      timers.forEach(clearTimeout);
      alarm.stop();
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Red alert pulse */}
      {redAlert && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            animation: 'pulse 1.5s ease-in-out infinite',
            background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.08) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,0,0,0.02)_2px,rgba(255,0,0,0.02)_4px)] pointer-events-none z-10" />

      {/* Red border glow when alert */}
      {redAlert && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            boxShadow: 'inset 0 0 80px rgba(220,38,38,0.1), inset 0 0 200px rgba(220,38,38,0.05)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-30 w-full max-w-xl px-8">
        {/* Initial black screen with cursor */}
        {stage === 0 && (
          <div className="text-center">
            <span className="inline-block w-3 h-5 bg-red-500/60 animate-pulse" />
          </div>
        )}

        {/* Typing lines */}
        {stage >= 1 && (
          <div className="space-y-8 font-mono">
            {/* Line 1 */}
            <div className="min-h-[2rem]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] text-red-500/40 uppercase tracking-[0.3em]">
                  &gt; SYSTEM OUTPUT
                </span>
              </div>
              <p className={`text-base font-bold tracking-wider leading-relaxed ${TYPING_LINES[0].color}`}>
                {typing1.displayed}
                {!typing1.done && <span className="inline-block w-2 h-4 bg-red-400 ml-0.5 animate-pulse" />}
              </p>
            </div>

            {/* Line 2 */}
            {line2Active && (
              <div className="min-h-[2rem] animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={10} className="text-red-500/50" />
                  <span className="text-[8px] text-red-500/40 uppercase tracking-[0.3em]">
                    &gt; ALERT
                  </span>
                </div>
                <p className={`text-lg font-bold tracking-wider leading-relaxed ${TYPING_LINES[1].color}`}>
                  {typing2.displayed}
                  {!typing2.done && <span className="inline-block w-2 h-5 bg-white ml-0.5 animate-pulse" />}
                </p>
              </div>
            )}

            {/* Line 3 */}
            {line3Active && (
              <div className="min-h-[2rem] animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Anchor size={10} className="text-amber-400/50" />
                  <span className="text-[8px] text-amber-400/40 uppercase tracking-[0.3em]">
                    &gt; NEXT TARGET
                  </span>
                </div>
                <p className={`text-base font-bold tracking-wider leading-relaxed ${TYPING_LINES[2].color}`}>
                  {typing3.displayed}
                  {!typing3.done && <span className="inline-block w-2 h-4 bg-amber-400 ml-0.5 animate-pulse" />}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Separator */}
        {showCTA && (
          <div className="animate-fade-in mt-12">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-red-800/40 to-transparent mb-10" />

            {/* CTA Button — Metallic style */}
            <div className="flex justify-center">
              <button
                onClick={onComplete}
                className="group relative cursor-pointer"
              >
                {/* Glow behind button */}
                <div className="absolute -inset-1 rounded-xl opacity-60 blur-md group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.3), rgba(245,158,11,0.2))' }} />

                {/* Button body */}
                <div className="relative px-10 py-4 rounded-xl border border-red-800/50 overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #2a1a1a 0%, #1a0a0a 50%, #2a1a1a 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.3), 0 4px 20px rgba(220,38,38,0.2)',
                  }}
                >
                  {/* Metallic highlight */}
                  <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />

                  <div className="flex items-center gap-3">
                    <ScanLine size={18} className="text-red-400 group-hover:animate-pulse" />
                    <div className="text-left">
                      <p className="text-xs font-mono font-bold text-red-400 uppercase tracking-[0.15em] group-hover:text-red-300 transition-colors">
                        SCANEAZĂ CODUL PENTRU DOSARUL #002
                      </p>
                      <p className="text-[9px] font-mono text-red-500/40 uppercase tracking-widest mt-0.5">
                        Portul Constanța — Terminal 7B
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer text */}
            <p className="text-[8px] font-mono text-noir-muted/20 uppercase tracking-[0.3em] text-center mt-8">
              Conexiunea va fi întreruptă în curând. Acționează acum.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
