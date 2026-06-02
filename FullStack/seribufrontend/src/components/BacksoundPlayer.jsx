import { useState, useEffect, useRef } from "react";

const SOUNDS = [
  {
    id: "whitley",
    name: "Whitley Nova",
    emoji: "🌙",
    color: "#a78bfa",
    desc: "Lo-fi melankolis dreamy",
    generate: (ctx) => {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.5);
      master.connect(ctx.destination);

      // Chord pads — dreamy layered oscillators (Em-like atmosphere)
      const chordFreqs = [
        [164.81, 196.00, 246.94, 329.63], // E minor chord
        [130.81, 155.56, 196.00, 261.63], // C major
        [146.83, 174.61, 220.00, 293.66], // D major
      ];
      const chordGain = ctx.createGain();
      chordGain.gain.setValueAtTime(0.06, ctx.currentTime);
      const chordFilter = ctx.createBiquadFilter();
      chordFilter.type = "lowpass";
      chordFilter.frequency.setValueAtTime(900, ctx.currentTime);
      chordFilter.Q.setValueAtTime(0.8, ctx.currentTime);
      chordGain.connect(chordFilter);
      chordFilter.connect(master);

      const oscs = [];
      chordFreqs[0].forEach((freq) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        // Slow LFO vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.3 + Math.random() * 0.2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        g.gain.setValueAtTime(0.22, ctx.currentTime);
        osc.connect(g);
        g.connect(chordGain);
        osc.start();
        oscs.push(osc, lfo);
      });

      // Warm bass note
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();
      bass.type = "triangle";
      bass.frequency.setValueAtTime(82.41, ctx.currentTime); // E2
      bassFilter.type = "lowpass";
      bassFilter.frequency.setValueAtTime(200, ctx.currentTime);
      bassGain.gain.setValueAtTime(0.18, ctx.currentTime);
      bass.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(master);
      bass.start();
      oscs.push(bass);

      // Soft vinyl crackle (pink noise bursts)
      const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const data = crackleBuffer.getChannelData(0);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        b0=0.99886*b0+w*0.0555; b1=0.99332*b1+w*0.0751;
        b2=0.96900*b2+w*0.1539; b3=0.86650*b3+w*0.3105;
        b4=0.55000*b4+w*0.5330; b5=-0.7616*b5-w*0.0169;
        data[i] = (b0+b1+b2+b3+b4+b5+w*0.5362)*0.11;
      }
      const crackleSource = ctx.createBufferSource();
      crackleSource.buffer = crackleBuffer;
      crackleSource.loop = true;
      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0.018, ctx.currentTime);
      const crackleFilter = ctx.createBiquadFilter();
      crackleFilter.type = "highpass";
      crackleFilter.frequency.setValueAtTime(3000, ctx.currentTime);
      crackleSource.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(master);
      crackleSource.start();

      // Slow melodic notes (simple pentatonic: E-G-A-B-D)
      const melodyFreqs = [329.63, 392.00, 440.00, 493.88, 587.33];
      let melodyStep = 0;
      function playMelodyNote() {
        const freq = melodyFreqs[melodyStep % melodyFreqs.length];
        melodyStep = Math.floor(Math.random() * melodyFreqs.length);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = "lowpass";
        filt.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
        osc.connect(filt);
        filt.connect(g);
        g.connect(master);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
      }
      const melodyInterval = setInterval(playMelodyNote, 2800 + Math.random() * 1400);

      // Subtle shimmer (high glassy overtone)
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = "sine";
      shimmer.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
      shimmerGain.gain.setValueAtTime(0.008, ctx.currentTime);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(master);
      shimmer.start();
      oscs.push(shimmer);

      master._oscillators = oscs;
      master._intervals = [melodyInterval];
      master._extra = [crackleSource];
      master._isCompound = true;
      return master;
    },
  },
  {
    id: "senja",
    name: "Senja Lofi",
    emoji: "🌅",
    color: "#fb923c",
    desc: "Hangat & melankolis",
    generate: (ctx) => {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2);
      master.connect(ctx.destination);

      // Warm guitar-like plucks (Cmaj7 vibe)
      const pluckFreqs = [261.63, 329.63, 392.00, 493.88, 523.25];
      const oscs = [];
      let pluckStep = 0;
      function playPluck() {
        const freq = pluckFreqs[pluckStep % pluckFreqs.length];
        pluckStep = (pluckStep + 1) % pluckFreqs.length;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = "bandpass";
        filt.frequency.setValueAtTime(freq * 2, ctx.currentTime);
        filt.Q.setValueAtTime(5, ctx.currentTime);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(filt);
        filt.connect(g);
        g.connect(master);
        osc.start();
        osc.stop(ctx.currentTime + 2.2);
      }
      const pluckInterval = setInterval(playPluck, 700);

      // Warm pad underneath
      [130.81, 196.00, 261.63].forEach(freq => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = "lowpass";
        filt.frequency.setValueAtTime(600, ctx.currentTime);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.045, ctx.currentTime);
        osc.connect(filt);
        filt.connect(g);
        g.connect(master);
        osc.start();
        oscs.push(osc);
      });

      // Soft kick (thump) pattern
      function playKick() {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
        g.gain.setValueAtTime(0.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(g);
        g.connect(master);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
      const kickInterval = setInterval(playKick, 800);

      // Hi-hat (soft noise burst)
      function playHat() {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1 - i/d.length);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = "highpass";
        filt.frequency.setValueAtTime(8000, ctx.currentTime);
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        src.connect(filt);
        filt.connect(g);
        g.connect(master);
        src.start();
      }
      const hatInterval = setInterval(playHat, 400);

      // Vinyl crackle warm
      const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const cdata = crackleBuffer.getChannelData(0);
      for (let i = 0; i < cdata.length; i++) cdata[i] = (Math.random()*2-1) * 0.015;
      const crackle = ctx.createBufferSource();
      crackle.buffer = crackleBuffer;
      crackle.loop = true;
      const crackleG = ctx.createGain();
      crackleG.gain.setValueAtTime(0.03, ctx.currentTime);
      crackle.connect(crackleG);
      crackleG.connect(master);
      crackle.start();

      master._oscillators = oscs;
      master._intervals = [pluckInterval, kickInterval, hatInterval];
      master._extra = [crackle];
      master._isCompound = true;
      return master;
    },
  },
  {
    id: "hujan_kopi",
    name: "Hujan & Kopi",
    emoji: "☕",
    color: "#92400e",
    desc: "Cozy lo-fi indoor",
    generate: (ctx) => {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1.5);
      master.connect(ctx.destination);

      // Rain ambience (pink noise, layered)
      const rainBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const rainData = rainBuffer.getChannelData(0);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < rainData.length; i++) {
        const w = Math.random()*2-1;
        b0=0.99886*b0+w*0.0555; b1=0.99332*b1+w*0.0751;
        b2=0.96900*b2+w*0.1539; b3=0.86650*b3+w*0.3105;
        b4=0.55000*b4+w*0.5330; b5=-0.7616*b5-w*0.0169;
        rainData[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.1159;
      }
      const rain = ctx.createBufferSource();
      rain.buffer = rainBuffer;
      rain.loop = true;
      const rainG = ctx.createGain();
      rainG.gain.setValueAtTime(0.35, ctx.currentTime);
      const rainFilt = ctx.createBiquadFilter();
      rainFilt.type = "bandpass";
      rainFilt.frequency.setValueAtTime(1200, ctx.currentTime);
      rainFilt.Q.setValueAtTime(0.4, ctx.currentTime);
      rain.connect(rainFilt);
      rainFilt.connect(rainG);
      rainG.connect(master);
      rain.start();

      // Warm low chord hum (Am vibe)
      const oscs = [];
      [110, 130.81, 164.81, 220].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        filt.type = "lowpass";
        filt.frequency.setValueAtTime(500, ctx.currentTime);
        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.04 - i*0.007, ctx.currentTime);
        osc.connect(filt);
        filt.connect(g);
        g.connect(master);
        osc.start();
        oscs.push(osc);
      });

      // Slow gentle pluck (like guitar picking near window)
      const pluckNotes = [220, 246.94, 261.63, 293.66];
      let pStep = 0;
      function playPlink() {
        const freq = pluckNotes[pStep % pluckNotes.length];
        pStep = Math.floor(Math.random() * pluckNotes.length);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        g.gain.setValueAtTime(0.0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
        osc.connect(g);
        g.connect(master);
        osc.start();
        osc.stop(ctx.currentTime + 3);
      }
      const plinkInterval = setInterval(playPlink, 2200 + Math.random() * 1000);

      master._oscillators = oscs;
      master._intervals = [plinkInterval];
      master._extra = [rain];
      master._isCompound = true;
      return master;
    },
  },
  {
    id: "malam",
    name: "Malam Sunyi",
    emoji: "🌌",
    color: "#6366f1",
    desc: "Ambient piano malam",
    generate: (ctx) => {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
      master.connect(ctx.destination);

      // Deep reverb-like pad
      const oscs = [];
      [65.41, 98.00, 130.81, 164.81].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoG = ctx.createGain();
        osc.type = i < 2 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        lfo.frequency.setValueAtTime(0.15 + i * 0.05, ctx.currentTime);
        lfoG.gain.setValueAtTime(0.5, ctx.currentTime);
        lfo.connect(lfoG);
        lfoG.connect(osc.frequency);
        g.gain.setValueAtTime(0.035 - i*0.005, ctx.currentTime);
        osc.connect(g);
        g.connect(master);
        osc.start();
        lfo.start();
        oscs.push(osc, lfo);
      });

      // Piano-like bell tones (simple ADSR sine)
      const pianoScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
      let pianoStep = 0;
      function playPiano() {
        const idx = Math.floor(Math.random() * pianoScale.length);
        const freq = pianoScale[idx];
        // Fundamental
        const playTone = (f, vol, dur) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          g.gain.setValueAtTime(0.0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
          osc.connect(g);
          g.connect(master);
          osc.start();
          osc.stop(ctx.currentTime + dur + 0.05);
        };
        playTone(freq, 0.07, 3.5);
        playTone(freq * 2, 0.025, 1.8);  // octave harmonic
        playTone(freq * 3, 0.01, 1.0);   // 3rd harmonic
        pianoStep++;
      }
      const pianoInterval = setInterval(playPiano, 3500 + Math.random() * 2000);

      // Soft wind texture
      const windBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const wdata = windBuffer.getChannelData(0);
      for (let i = 0; i < wdata.length; i++) {
        wdata[i] = (Math.random()*2-1) * Math.sin(i/wdata.length * Math.PI) * 0.1;
      }
      const wind = ctx.createBufferSource();
      wind.buffer = windBuffer;
      wind.loop = true;
      const windG = ctx.createGain();
      windG.gain.setValueAtTime(0.04, ctx.currentTime);
      const windFilt = ctx.createBiquadFilter();
      windFilt.type = "bandpass";
      windFilt.frequency.setValueAtTime(400, ctx.currentTime);
      windFilt.Q.setValueAtTime(0.5, ctx.currentTime);
      wind.connect(windFilt);
      windFilt.connect(windG);
      windG.connect(master);
      wind.start();

      master._oscillators = oscs;
      master._intervals = [pianoInterval];
      master._extra = [wind];
      master._isCompound = true;
      return master;
    },
  },
];

export default function BacksoundPlayer() {
  const [isOpen,  setIsOpen]  = useState(false);
  const [playing, setPlaying] = useState(null);
  const [volume,  setVolume]  = useState(0.4);
  const audioCtxRef = useRef(null);
  const nodesRef    = useRef({});
  const masterGainRef = useRef(null);

  function getCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
      // Note: individual sound generators connect directly to ctx.destination
      // masterGainRef is used only for volume control reference
    }
    return audioCtxRef.current;
  }

  function stopCurrent() {
    Object.values(nodesRef.current).forEach(node => {
      try {
        if (node._intervals) node._intervals.forEach(id => clearInterval(id));
        if (node._oscillators) node._oscillators.forEach(o => { try { o.stop(); } catch {} });
        if (node._extra) node._extra.forEach(s => { try { s.stop(); } catch {} });
        node.disconnect();
      } catch {}
    });
    nodesRef.current = {};
    setPlaying(null);
  }

  function applyVolume(vol) {
    Object.values(nodesRef.current).forEach(node => {
      try {
        if (audioCtxRef.current) {
          node.gain.setTargetAtTime(vol, audioCtxRef.current.currentTime, 0.05);
        }
      } catch {}
    });
  }

  function toggle(sound) {
    if (playing === sound.id) { stopCurrent(); return; }
    stopCurrent();
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    const node = sound.generate(ctx);
    // Apply current volume to master gain of the sound
    try { node.gain.setValueAtTime(volume, ctx.currentTime); } catch {}
    nodesRef.current[sound.id] = node;
    setPlaying(sound.id);
  }

  useEffect(() => {
    if (playing) applyVolume(volume);
  }, [volume]);

  useEffect(() => () => stopCurrent(), []);

  const current = SOUNDS.find(s => s.id === playing);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 50,
          width: 56, height: 56, borderRadius: "50%",
          background: playing
            ? `linear-gradient(135deg, ${current?.color}, ${current?.color}88)`
            : "linear-gradient(135deg, #5b98b4, #557cc5)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: playing
            ? `0 8px 28px ${current?.color}60`
            : "0 8px 28px rgba(92, 136, 177, 0.3)",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          transform: isOpen ? "scale(1.1) rotate(10deg)" : "scale(1)",
        }}
        title="Backsound Lo-fi"
      >
        {playing ? (
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
          </svg>
        )}
        {playing && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: 14, height: 14, borderRadius: "50%",
            background: "#6BCB77", border: "2.5px solid white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", animation: "pop 1s infinite" }} />
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 92, right: 24, zIndex: 50,
          width: 296, background: "white", borderRadius: 28,
          boxShadow: "0 24px 72px rgba(43, 97, 133, 0.2)",
          border: "2px solid rgba(115,156,175,0.10)",
          overflow: "hidden", animation: "fadeUp 0.2s ease both",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px 14px", borderBottom: "2px solid rgba(26,26,46,0.06)",
            background: playing
              ? `linear-gradient(135deg, ${current?.color}CC, ${current?.color}55)`
              : "linear-gradient(135deg,#1A1A2E,#2D1B4E)",
            transition: "background 0.6s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:15, fontWeight:700, color:"white", marginBottom:2 }}>
                  🎵 Lo-fi Backsound
                </h3>
                <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"rgba(255,255,255,0.60)", fontWeight:500, margin:0 }}>
                  {playing ? `▶ ${current?.name} · ${current?.desc}` : "Pilih suara buat menemanimu"}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)}
                style={{ color:"rgba(255,255,255,0.60)", background:"none", border:"none", cursor:"pointer", padding:4 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Sound list */}
          <div style={{ padding: "12px 12px 0" }}>
            {SOUNDS.map(sound => (
              <button key={sound.id} onClick={() => toggle(sound)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 16, marginBottom: 6, cursor: "pointer",
                  background: playing===sound.id ? `${sound.color}14` : "rgba(26,26,46,0.04)",
                  border: `2px solid ${playing===sound.id ? sound.color+"35" : "transparent"}`,
                  transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: playing===sound.id ? "scale(1.02)" : "scale(1)",
                  textAlign: "left",
                }}
                onMouseEnter={e => { if (playing!==sound.id) e.currentTarget.style.background="rgba(26,26,46,0.07)"; }}
                onMouseLeave={e => { if (playing!==sound.id) e.currentTarget.style.background="rgba(26,26,46,0.04)"; }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 14, fontSize: 21, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: playing===sound.id ? `${sound.color}20` : "white",
                  boxShadow: playing===sound.id
                    ? `0 4px 16px ${sound.color}40`
                    : "0 2px 8px rgba(26,26,46,0.07)",
                  transition: "all 0.25s",
                }}>
                  {sound.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800,
                    color: playing===sound.id ? sound.color : "#1A1A2E", margin:0,
                    transition: "color 0.2s",
                  }}>{sound.name}</p>
                  <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:"#7B7B9A", margin:0, fontWeight:500 }}>
                    {sound.desc}
                  </p>
                </div>
                {playing===sound.id ? (
                  <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:18, flexShrink:0 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        width: 3, borderRadius: 4, background: sound.color,
                        height: `${8 + i*3}px`,
                        animation: "typingBounce 0.8s ease infinite",
                        animationDelay: `${i*0.12}s`,
                      }} />
                    ))}
                  </div>
                ) : (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#b8c0cc" strokeWidth={2} style={{ flexShrink:0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Volume */}
          <div style={{ padding: "10px 20px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#b8c0cc" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" fillRule="evenodd"/>
              </svg>
              <input type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: playing ? current?.color : "#739caf",
                  cursor: "pointer",
                  transition: "accent-color 0.3s",
                }}
              />
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#b8c0cc" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              </svg>
            </div>
            <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, color:"#b8c0cc", textAlign:"center", marginTop:4, fontWeight:600 }}>
              Volume: {Math.round(volume*100)}%
            </p>
          </div>

          {playing && (
            <div style={{ padding:"0 12px 14px" }}>
              <button onClick={stopCurrent}
                style={{
                  width:"100%", padding:"10px", borderRadius:16, fontSize:13,
                  fontFamily:"'Nunito',sans-serif", fontWeight:700,
                  background:`${current?.color}12`, color: current?.color,
                  border:`2px solid ${current?.color}25`, cursor:"pointer", transition:"all 0.2s",
                }}>
                ⏹ Hentikan
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
