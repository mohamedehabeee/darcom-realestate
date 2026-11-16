import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const SCENES = [
  {
    id: 1,
    tag: '01 • Exterior Facade',
    title: 'Cantilevered Architecture & Entryway',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    motion: 'scale-110 translate-x-2',
  },
  {
    id: 2,
    tag: '02 • Pool & Terrace',
    title: 'Private Courtyard & Sunset Deck',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
    motion: 'scale-110 -translate-x-2',
  },
  {
    id: 3,
    tag: '03 • Main Living',
    title: 'Double-Height Reception & Daylight Glass',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    motion: 'scale-110 -translate-y-2',
  },
  {
    id: 4,
    tag: '04 • Master Suite',
    title: 'Panoramic Terrace Overlooking Greens',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=80',
    motion: 'scale-110 translate-y-2',
  },
];

const TOTAL_SECONDS = 30;
const SCENE_DURATION = TOTAL_SECONDS / SCENES.length;

export default function VideoShowcaseSection() {
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setElapsed((prev) => (prev + 0.1 >= TOTAL_SECONDS ? 0 : +(prev + 0.1).toFixed(1)));
    }, 100);
    return () => clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleSound = () => {
    try {
      if (!soundOn) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioCtx();
          const master = ctx.createGain();
          master.gain.value = 0.04;
          master.connect(ctx.destination);

          [220, 277.18, 329.63].forEach((freq) => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(master);
            osc.start();
          });

          audioCtxRef.current = ctx;
          gainRef.current = master;
        } else if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        if (gainRef.current) gainRef.current.gain.value = 0.04;
        setSoundOn(true);
      } else {
        if (gainRef.current) gainRef.current.gain.value = 0;
        setSoundOn(false);
      }
    } catch {
      setSoundOn(false);
    }
  };

  const activeIndex = Math.min(
    SCENES.length - 1,
    Math.floor(elapsed / SCENE_DURATION)
  );
  const progressPercent = (elapsed / TOTAL_SECONDS) * 100;

  const formatTime = (sec) => {
    const s = Math.floor(sec);
    return `00:${s < 10 ? `0${s}` : s}`;
  };

  return (
    <section className="border-b border-black/10 dark:border-white/10 bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              Architectural Film
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mt-1">
              30-Second Residence Tour
            </h2>
          </div>
          <span className="text-xs text-white/60 border border-white/15 px-3 py-1">
            4 Angles • {formatTime(elapsed)} / 00:30
          </span>
        </div>

        <div className="relative border border-white/15 bg-black overflow-hidden h-[280px] sm:h-[420px] lg:h-[500px]">
          {SCENES.map((scene, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={scene.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={scene.image}
                  alt={scene.title}
                  className={`w-full h-full object-cover transition-transform duration-[7500ms] ease-out ${
                    isActive && playing ? scene.motion : 'scale-100 translate-x-0 translate-y-0'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            );
          })}

          {/* Scene Caption */}
          <div className="absolute bottom-14 sm:bottom-6 left-4 sm:left-6 z-20 max-w-md">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              {SCENES[activeIndex].tag}
            </p>
            <h3 className="text-lg sm:text-2xl font-semibold text-white mt-1">
              {SCENES[activeIndex].title}
            </h3>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setPlaying((p) => !p)}
              title={playing ? 'Pause Tour' : 'Play Tour'}
              className="p-2.5 bg-[#111111]/90 border border-white/20 text-white hover:border-[#C59B27] transition-colors cursor-pointer"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleSound}
              title={soundOn ? 'Mute Ambient' : 'Ambient Sound'}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-[#111111]/90 border border-white/20 text-[#C59B27] text-xs font-semibold hover:border-[#C59B27] transition-colors cursor-pointer"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundOn ? 'Sound On' : 'Sound'}</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-20">
            <div
              className="h-full bg-[#C59B27] transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Angle Quick Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => setElapsed(idx * SCENE_DURATION)}
              className={`text-left px-3 py-2 border text-xs transition-colors cursor-pointer ${
                idx === activeIndex
                  ? 'border-[#C59B27] bg-[#C59B27]/15 text-[#C59B27] font-semibold'
                  : 'border-white/10 bg-white/5 text-white/65 hover:border-white/30'
              }`}
            >
              {scene.tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}