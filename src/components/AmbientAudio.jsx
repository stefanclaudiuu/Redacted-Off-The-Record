import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const AMBIENT_KEY = 'redacted-hub-muted';

export default function AmbientAudio() {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(AMBIENT_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [started, setStarted] = useState(false);
  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(AMBIENT_KEY, String(muted));
  }, [muted]);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = muted ? 0 : 0.15;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55;

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 82;

    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 110;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 1;

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gain);

    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 120;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.06;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gain);

    sourceRef.current = { osc1, osc2, osc3, lfo, noiseSource };

    const startAll = () => {
      if (ctx.state === 'suspended') ctx.resume();
      if (!started) {
        try {
          osc1.start();
          osc2.start();
          osc3.start();
          lfo.start();
          noiseSource.start();
          setStarted(true);
        } catch { /* already started */ }
      }
    };

    const handler = () => startAll();
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });

    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
      try { osc1.stop(); } catch {}
      try { osc2.stop(); } catch {}
      try { osc3.stop(); } catch {}
      try { lfo.stop(); } catch {}
      try { noiseSource.stop(); } catch {}
      ctx.close();
    };
  }, []);

  useEffect(() => {
    if (gainRef.current) {
      const ctx = ctxRef.current;
      if (ctx) {
        gainRef.current.gain.setTargetAtTime(muted ? 0 : 0.15, ctx.currentTime, 0.3);
      }
    }
  }, [muted]);

  return (
    <button
      onClick={() => setMuted(m => !m)}
      className="fixed bottom-4 right-4 z-50 w-9 h-9 rounded-full bg-noir-card/80 border border-noir-border hover:border-noir-red/50 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm group"
      title={muted ? 'Activează sunetul' : 'Dezactivează sunetul'}
    >
      {muted ? (
        <VolumeX size={14} className="text-noir-muted group-hover:text-noir-red-light transition-colors" />
      ) : (
        <Volume2 size={14} className="text-noir-red-light group-hover:text-white transition-colors" />
      )}
    </button>
  );
}
