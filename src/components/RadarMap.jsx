import { useState, useEffect } from 'react';
import { MapPin, Navigation, Lock, Crosshair, Plane, Anchor, AlertTriangle, Clock, X } from 'lucide-react';

const MARKERS = [
  {
    id: 'crash',
    label: 'A',
    name: 'Poziția Prăbușirii',
    coords: '44°18\'42"N  28°37\'15"E',
    top: '28%',
    left: '62%',
    pulse: true,
    locked: false,
    color: '#ff3333',
    icon: 'alert',
    tooltip: 'Ultimul semnal radar: 22:14. Altitudine: 0. Impact detectat. Cutia neagră: LIPSĂ.',
    modal: {
      title: 'ZBOR XR-4057 — PUNCT DE IMPACT',
      subtitle: 'Ultimul semnal radar: 22:14',
      stats: [
        { label: 'Ultimul semnal', value: '22:14 UTC+3' },
        { label: 'Altitudine', value: '0 ft — Impact' },
        { label: 'Rază de debris', value: '2.3 km' },
        { label: 'Cutia neagră', value: 'LIPSĂ la fața locului' },
      ],
      description: 'Echipajele de salvare nu au găsit supraviețuitori. Fragmentele epavei sugerează o coborâre necontrolată în ultimele 47 de secunde. Analiza CVR-ului indică prezența unei voci neautorizate în cockpit.',
      warning: 'Cauza oficială: "Eroare de pilotaj" — CONTESTATĂ',
    },
  },
  {
    id: 'airport',
    label: 'B',
    name: 'Aeroportul Internațional',
    coords: '44°34\'08"N  26°05\'01"E',
    top: '45%',
    left: '30%',
    pulse: false,
    locked: false,
    color: '#00ff41',
    icon: 'plane',
    tooltip: 'Zbor XR-4057. Decolare: 21:00. Pilot: Andrei Șerban. Status: Confirmat.',
    modal: {
      title: 'AEROPORT — GATE 14B',
      subtitle: 'Zbor XR-4057 — Confirmat',
      stats: [
        { label: 'Zbor', value: 'XR-4057' },
        { label: 'Decolare', value: '21:00 UTC+3' },
        { label: 'Pilot', value: 'Andrei Șerban' },
        { label: 'Status', value: 'CONFIRMAT' },
      ],
      description: 'Andrei Șerban a trecut prin check-in la 18:15. Camerele CCTV arată că a făcut un ocol neautorizat prin zona de marfă la 20:47, timp de 12 minute. A revenit la gate cu 8 minute înainte de îmbarcare.',
      warning: null,
    },
  },
  {
    id: 'port',
    label: 'C',
    name: 'TERMINAL 7B — PORT',
    lockedName: '[DATE RESTRICȚIONATE]',
    coords: '44.1488° N  28.6575° E',
    top: '74%',
    left: '78%',
    pulse: true,
    lockedKey: 'victor-dragos-pilot',
    color: '#ff3333',
    icon: 'anchor',
    tooltip: 'Locația containerelor suspecte identificată. Necesită acces fizic (Dosarul #002).',
    modal: {
      title: 'TERMINAL 7B — PORTUL CONSTANȚA',
      subtitle: 'Containerul 7B — Locație identificată',
      stats: [
        { label: 'Container suspect', value: '7B — nedeclarat' },
        { label: 'Greutate declarată', value: '+200kg discrepanță' },
        { label: 'Mențiuni SMS', value: 'Elena → Andrei, 21:47' },
        { label: 'Acces', value: 'NECESITĂ DOSAR #002' },
      ],
      description: 'Locația containerelor suspecte identificată. Containerul 7B apare pe manifestul de zbor dar greutatea declarată nu corespunde. Surse indică legături cu rețeaua lui Victor Dragoș. Necesită acces fizic.',
      warning: 'Acces complet necesită Dosarul #002: CONTAINERELE',
    },
  },
];

const GPS_DATA = [
  { time: '18:15', lat: '44°34\'08"N', lon: '26°05\'01"E', label: 'Aeroport — Check-in' },
  { time: '20:47', lat: '44°10\'33"N', lon: '28°39\'48"E', label: 'Poartă marfă (CCTV)' },
  { time: '21:00', lat: '44°34\'08"N', lon: '26°05\'01"E', label: 'Decolare XR-4057' },
  { time: '22:11', lat: '44°24\'19"N', lon: '27°51\'44"E', label: 'Ultimul semnal radar' },
  { time: '22:14', lat: '44°18\'42"N', lon: '28°37\'15"E', label: '⚠ SEMNAL PIERDUT' },
];

function usePastClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const past = new Date(now.getTime());
      past.setFullYear(2024);
      past.setMonth(4);
      past.setDate(4);
      const h = String(past.getHours()).padStart(2, '0');
      const m = String(past.getMinutes()).padStart(2, '0');
      const s = String(past.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

function useTypingEffect(text, active, speed = 40) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);
  return displayed;
}

function MarkerIcon({ type, size = 14, className, style }) {
  if (type === 'alert') return <AlertTriangle size={size} className={className} style={style} />;
  if (type === 'plane') return <Plane size={size} className={className} style={{ ...style, transform: 'rotate(-45deg)' }} />;
  if (type === 'anchor') return <Anchor size={size} className={className} style={style} />;
  return <MapPin size={size} className={className} style={style} />;
}

const PORT_COORDS_TEXT = '44.1488° N, 28.6575° E — PORTUL CONSTANȚA';

export default function RadarMap({ onBack, unlockedSuspects = [] }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showCoords, setShowCoords] = useState(false);
  const [coordsRevealed, setCoordsRevealed] = useState(false);
  const pastClock = usePastClock();
  const typedCoords = useTypingEffect(PORT_COORDS_TEXT, showCoords, 35);

  const isMarkerLocked = (marker) => {
    if (!marker.lockedKey) return false;
    return !unlockedSuspects.includes(marker.lockedKey);
  };

  const handleCoordsClick = () => {
    setSelectedMarker(null);
    if (!showCoords) {
      setShowCoords(true);
      setCoordsRevealed(false);
      setTimeout(() => setCoordsRevealed(true), 800);
    } else {
      setShowCoords(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-noir-black">
      {/* Header */}
      <div className="px-4 py-3 bg-noir-card/80 backdrop-blur-md border-b border-noir-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Navigation size={10} className="text-amber-400 animate-pulse" />
              <span className="text-[10px] font-mono text-noir-muted uppercase tracking-widest">
                Radar investigație — Zbor XR-4057
              </span>
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              HARTĂ OPERAȚIONALĂ
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* LIVE FEED indicator */}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-mono text-red-400/80 uppercase tracking-widest animate-pulse">
                LIVE FEED
              </span>
              <span className="text-[8px] font-mono text-noir-muted/40">—</span>
              <span className="text-[8px] font-mono text-amber-400/50 uppercase tracking-wider">
                ENCRYPTED
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={10} className="text-noir-red-light" />
              <span className="text-[10px] font-mono text-noir-red-light tracking-widest tabular-nums">
                {pastClock}
              </span>
            </div>
            <button
              onClick={onBack}
              className="text-[9px] font-mono text-noir-muted hover:text-noir-red-light uppercase tracking-widest transition-colors cursor-pointer"
            >
              ← Meniu
            </button>
          </div>
        </div>
      </div>

      {/* Radar area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(165,32,32,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(165,32,32,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }} />

        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none z-40 opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }} />

        {/* Grain/noise overlay */}
        <div className="absolute inset-0 pointer-events-none z-40 opacity-[0.04] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />

        {/* Concentric radar circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[100, 180, 260, 340].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: size,
                height: size,
                borderColor: `rgba(165, 32, 32, ${0.12 - i * 0.02})`,
              }}
            />
          ))}
          <div className="w-1.5 h-1.5 rounded-full bg-noir-red/50" />
        </div>

        {/* Rotating scan line */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="absolute w-[1px] origin-bottom"
            style={{
              height: '50%',
              bottom: '50%',
              left: '50%',
              background: 'linear-gradient(to top, rgba(165,32,32,0.5), transparent)',
              animation: 'spin 6s linear infinite',
            }}
          />
          <div
            className="absolute"
            style={{
              width: '50%',
              height: '50%',
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(165,32,32,0.06) 25deg, transparent 50deg)',
              animation: 'spin 6s linear infinite',
              borderRadius: '50%',
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Flight path lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <line x1="30%" y1="45%" x2="62%" y2="28%"
            stroke="rgba(165,32,32,0.3)" strokeWidth="1.5" strokeDasharray="6,4" />
          {!isMarkerLocked(MARKERS[2]) && (
            <line x1="30%" y1="45%" x2="55%" y2="72%"
              stroke="rgba(165,32,32,0.15)" strokeWidth="1" strokeDasharray="3,6" />
          )}
        </svg>

        {/* Markers */}
        {MARKERS.map((marker) => {
          const locked = isMarkerLocked(marker);
          const isSelected = selectedMarker?.id === marker.id;

          return (
            <button
              key={marker.id}
              onClick={() => {
                if (!locked) {
                  setSelectedMarker(isSelected ? null : marker);
                  setShowCoords(false);
                }
              }}
              disabled={locked}
              className={`absolute z-10 group transition-all duration-300 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ top: marker.top, left: marker.left, transform: 'translate(-50%, -50%)' }}
            >
              {marker.pulse && !locked && (
                <>
                  <div className="absolute rounded-full animate-ping"
                    style={{ width: 44, height: 44, top: -14, left: -14,
                      backgroundColor: `${marker.color}10`, border: `1px solid ${marker.color}25` }} />
                  <div className="absolute rounded-full animate-pulse"
                    style={{ width: 30, height: 30, top: -7, left: -7,
                      backgroundColor: `${marker.color}08`, border: `1px solid ${marker.color}15` }} />
                </>
              )}

              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  locked ? 'opacity-15' : isSelected ? 'scale-150' : 'hover:scale-125'
                }`}
                style={{
                  borderColor: locked ? '#555' : marker.color,
                  backgroundColor: locked ? '#333' : `${marker.color}30`,
                  boxShadow: locked ? 'none' : `0 0 16px ${marker.color}50`,
                }}
              >
                {locked ? (
                  <Lock size={6} className="text-noir-muted/30" />
                ) : (
                  <span className="text-[7px] font-mono font-bold" style={{ color: marker.color }}>
                    {marker.label}
                  </span>
                )}
              </div>

              <div className={`absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-300 ${
                locked ? 'opacity-40' : 'opacity-100'
              }`}>
                <p className="text-[8px] font-mono text-center font-bold" style={{ color: locked ? '#666' : marker.color }}>
                  {locked ? (marker.lockedName || '???') : marker.name}
                </p>
                {!locked && marker.tooltip && (
                  <p className="text-[7px] font-mono text-center text-noir-muted/60 mt-0.5 max-w-[140px] leading-tight">
                    {marker.tooltip.split('.')[0]}.
                  </p>
                )}
              </div>
            </button>
          );
        })}

        {/* ===== MARKER DETAIL MODAL ===== */}
        {selectedMarker && (
          <div className="absolute inset-0 z-30 flex items-end justify-center p-4 animate-fade-in"
            onClick={() => setSelectedMarker(null)}>
            <div
              className="w-full max-w-md bg-noir-dark/98 backdrop-blur-md border rounded-2xl overflow-hidden"
              style={{ borderColor: `${selectedMarker.color}30` }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="px-5 py-4 border-b" style={{ borderColor: `${selectedMarker.color}20`, backgroundColor: `${selectedMarker.color}08` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${selectedMarker.color}15`, border: `1px solid ${selectedMarker.color}30` }}>
                      <MarkerIcon type={selectedMarker.icon} size={18} className="" style={{ color: selectedMarker.color }} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-wide">
                        {selectedMarker.modal.title}
                      </h3>
                      <p className="text-[9px] font-mono mt-0.5" style={{ color: `${selectedMarker.color}AA` }}>
                        {selectedMarker.modal.subtitle}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMarker(null)}
                    className="w-6 h-6 rounded-lg bg-noir-border/30 flex items-center justify-center hover:bg-noir-border/50 transition-all cursor-pointer">
                    <X size={10} className="text-noir-muted" />
                  </button>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-px" style={{ backgroundColor: `${selectedMarker.color}10` }}>
                {selectedMarker.modal.stats.map((stat, i) => (
                  <div key={i} className="bg-noir-dark px-4 py-2.5">
                    <p className="text-[8px] font-mono text-noir-muted uppercase tracking-widest mb-0.5">
                      {stat.label}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="px-5 py-4">
                <p className="text-[11px] text-noir-text leading-relaxed">
                  {selectedMarker.modal.description}
                </p>
                {selectedMarker.modal.warning && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-red-950/30 border border-red-900/30 flex items-center gap-2">
                    <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                    <p className="text-[10px] font-mono text-red-400">
                      {selectedMarker.modal.warning}
                    </p>
                  </div>
                )}
              </div>

              {/* Coords footer */}
              <div className="px-5 py-3 border-t border-noir-border/30 flex items-center justify-between">
                <p className="text-[8px] font-mono text-noir-muted/50 uppercase tracking-widest">
                  Coordonate GPS
                </p>
                <p className="text-[9px] font-mono font-bold" style={{ color: selectedMarker.color }}>
                  {selectedMarker.coords}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GPS Coordinates button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleCoordsClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
              showCoords
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                : 'bg-noir-card/80 border border-noir-border hover:border-amber-500/40 text-noir-muted hover:text-amber-400'
            }`}
          >
            <Crosshair size={12} />
            VEZI COORDONATE
          </button>
        </div>

        {/* GPS Terminal Panel */}
        {showCoords && (
          <div className="absolute top-14 right-4 z-20 w-80 animate-fade-in">
            <div className="bg-noir-dark/98 backdrop-blur-md border border-amber-500/30 rounded-xl overflow-hidden" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
              {/* Terminal header */}
              <div className="px-4 py-2.5 border-b border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-amber-400/80 uppercase tracking-[0.2em]">
                    &gt; GPS_EXTRACT — NOKIA 6310i
                  </p>
                  <p className="text-[8px] text-amber-400/40 mt-0.5">
                    SRC: BACKUP_ANDREI_SERBAN.DAT
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-pulse" />
              </div>

              {/* Terminal body */}
              <div className="p-3 space-y-0.5 bg-noir-black/50">
                {!coordsRevealed ? (
                  <div className="py-6 text-center">
                    <p className="text-[10px] text-amber-400/60 animate-pulse">
                      DECRIPTARE DATE GPS...
                    </p>
                    <div className="flex justify-center gap-0.5 mt-2">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="w-1 bg-amber-400/30 rounded-sm animate-pulse"
                          style={{ height: Math.random() * 12 + 4, animationDelay: `${i * 50}ms` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[8px] text-amber-400/30 mb-2">
                      {'>'} RECORDS FOUND: {GPS_DATA.length} | FORMAT: WGS84
                    </p>
                    {GPS_DATA.map((point, i) => {
                      const isAlert = point.label.includes('⚠');
                      return (
                        <div key={i}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all ${
                            isAlert ? 'bg-red-950/40 border border-red-900/30' : 'hover:bg-amber-500/5'
                          }`}
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <span className={`text-[9px] font-bold w-11 flex-shrink-0 tabular-nums ${
                            isAlert ? 'text-red-400' : 'text-amber-400/80'
                          }`}>
                            {point.time}
                          </span>
                          <span className="text-[8px] text-amber-400/20 flex-shrink-0">│</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[9px] truncate ${
                              isAlert ? 'text-red-400 font-bold' : 'text-noir-text/80'
                            }`}>
                              {point.label}
                            </p>
                          </div>
                          <span className="text-[8px] text-amber-400/20 flex-shrink-0">│</span>
                          <p className={`text-[8px] flex-shrink-0 tabular-nums ${
                            isAlert ? 'text-red-400/70' : 'text-amber-400/40'
                          }`}>
                            {point.lat}
                          </p>
                        </div>
                      );
                    })}
                    <div className="pt-2 mt-2 border-t border-amber-500/10">
                      <p className="text-[8px] text-amber-400/30">
                        {'>'} EOF — LAST SIGNAL: 22:14:03 UTC+3
                      </p>
                      <p className="text-[8px] text-red-400/50 mt-0.5">
                        {'>'} WARNING: SIGNAL TERMINATED ABNORMALLY
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom-left: Typing coordinates */}
        {showCoords && (
          <div className="absolute bottom-4 left-4 z-20 animate-fade-in">
            <div className="bg-noir-dark/95 backdrop-blur-sm border border-amber-500/25 rounded-lg px-4 py-2.5">
              <p className="text-[8px] font-mono text-amber-400/50 uppercase tracking-widest mb-1">
                &gt; COORDONATE IDENTIFICATE
              </p>
              <p className="text-sm font-mono font-bold text-amber-400 tracking-wider tabular-nums">
                {typedCoords}<span className="animate-pulse">_</span>
              </p>
            </div>
          </div>
        )}

        {/* Bottom timestamp + clock */}
        <div className="absolute bottom-3 left-4 z-10 pointer-events-none" style={{ display: showCoords ? 'none' : 'block' }}>
          <p className="text-[8px] font-mono text-noir-muted/40 uppercase tracking-widest">
            04.05.2024 — ÎNREGISTRARE RECUPERATĂ
          </p>
        </div>
        <div className="absolute bottom-3 right-4 z-10 pointer-events-none">
          <p className="text-[8px] font-mono text-noir-red-light/30 uppercase tracking-widest tabular-nums">
            {pastClock} UTC+3
          </p>
        </div>
      </div>
    </div>
  );
}
