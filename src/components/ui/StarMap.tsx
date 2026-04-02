"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Lodge coordinates
const LAT = 51.1842 * (Math.PI / 180);
const LON = -3.8531;

// Bright star catalog: [name, RA (hours), Dec (degrees), magnitude, constellation]
const STARS: [string, number, number, number, string][] = [
  ["Sirius", 6.752, -16.72, -1.46, "Canis Major"],
  ["Canopus", 6.399, -52.70, -0.74, "Carina"],
  ["Arcturus", 14.261, 19.18, -0.05, "Boötes"],
  ["Vega", 18.616, 38.78, 0.03, "Lyra"],
  ["Capella", 5.278, 46.00, 0.08, "Auriga"],
  ["Rigel", 5.242, -8.20, 0.13, "Orion"],
  ["Procyon", 7.655, 5.22, 0.34, "Canis Minor"],
  ["Betelgeuse", 5.919, 7.41, 0.42, "Orion"],
  ["Altair", 19.846, 8.87, 0.76, "Aquila"],
  ["Aldebaran", 4.599, 16.51, 0.86, "Taurus"],
  ["Spica", 13.420, -11.16, 0.97, "Virgo"],
  ["Antares", 16.490, -26.43, 1.04, "Scorpius"],
  ["Pollux", 7.755, 28.03, 1.14, "Gemini"],
  ["Fomalhaut", 22.961, -29.62, 1.16, "Piscis Austrinus"],
  ["Deneb", 20.690, 45.28, 1.25, "Cygnus"],
  ["Regulus", 10.140, 11.97, 1.40, "Leo"],
  ["Castor", 7.577, 31.89, 1.58, "Gemini"],
  ["Bellatrix", 5.419, 6.35, 1.64, "Orion"],
  ["Elnath", 5.438, 28.61, 1.65, "Taurus"],
  ["Alnilam", 5.604, -1.20, 1.69, "Orion"],
  ["Alnitak", 5.679, -1.94, 1.77, "Orion"],
  ["Dubhe", 11.062, 61.75, 1.79, "Ursa Major"],
  ["Mirfak", 3.405, 49.86, 1.80, "Perseus"],
  ["Alioth", 12.900, 55.96, 1.77, "Ursa Major"],
  ["Mintaka", 5.533, -0.30, 2.23, "Orion"],
  ["Polaris", 2.530, 89.26, 1.98, "Ursa Minor"],
  ["Alkaid", 13.792, 49.31, 1.86, "Ursa Major"],
  ["Mizar", 13.399, 54.93, 2.04, "Ursa Major"],
  ["Merak", 11.031, 56.38, 2.37, "Ursa Major"],
  ["Phecda", 11.897, 53.69, 2.44, "Ursa Major"],
  ["Megrez", 12.257, 57.03, 3.31, "Ursa Major"],
  ["Schedar", 0.675, 56.54, 2.24, "Cassiopeia"],
  ["Caph", 0.153, 59.15, 2.28, "Cassiopeia"],
  ["Navi", 0.945, 60.72, 2.47, "Cassiopeia"],
  ["Ruchbah", 1.430, 60.24, 2.68, "Cassiopeia"],
  ["Segin", 1.907, 63.67, 3.37, "Cassiopeia"],
  ["Denebola", 11.818, 14.57, 2.13, "Leo"],
  ["Alphard", 9.460, -8.66, 1.98, "Hydra"],
  ["Algol", 3.136, 40.96, 2.12, "Perseus"],
  ["Alderamin", 21.310, 62.59, 2.51, "Cepheus"],
  ["Cor Caroli", 12.934, 38.32, 2.90, "Canes Venatici"],
  ["Rasalhague", 17.582, 12.56, 2.07, "Ophiuchus"],
  ["Alphecca", 15.578, 26.71, 2.23, "Corona Borealis"],
  ["Etamin", 17.944, 51.49, 2.23, "Draco"],
  ["Kochab", 14.845, 74.16, 2.08, "Ursa Minor"],
  ["Menkent", 14.111, -36.37, 2.06, "Centaurus"],
  ["Hamal", 2.120, 23.46, 2.00, "Aries"],
  ["Diphda", 0.727, -17.99, 2.04, "Cetus"],
  ["Nunki", 18.921, -26.30, 2.05, "Sagittarius"],
  ["Kaus Australis", 18.403, -34.38, 1.85, "Sagittarius"],
  ["Mirach", 1.163, 35.62, 2.05, "Andromeda"],
  ["Almach", 2.065, 42.33, 2.17, "Andromeda"],
  ["Alpheratz", 0.140, 29.09, 2.07, "Andromeda"],
];

// Constellation line connections (by star name pairs)
const CONSTELLATION_LINES: [string, string][] = [
  // Orion
  ["Betelgeuse", "Bellatrix"], ["Betelgeuse", "Alnilam"], ["Bellatrix", "Mintaka"],
  ["Alnilam", "Alnitak"], ["Alnilam", "Mintaka"], ["Alnitak", "Rigel"], ["Mintaka", "Rigel"],
  // Ursa Major (Big Dipper)
  ["Dubhe", "Merak"], ["Merak", "Phecda"], ["Phecda", "Megrez"],
  ["Megrez", "Alioth"], ["Alioth", "Mizar"], ["Mizar", "Alkaid"],
  ["Megrez", "Dubhe"],
  // Cassiopeia
  ["Schedar", "Caph"], ["Schedar", "Navi"], ["Navi", "Ruchbah"], ["Ruchbah", "Segin"],
  // Gemini
  ["Castor", "Pollux"],
  // Leo
  ["Regulus", "Denebola"],
  // Cygnus
  ["Deneb", "Vega"],
  // Andromeda
  ["Alpheratz", "Mirach"], ["Mirach", "Almach"],
  // Summer Triangle
  ["Vega", "Altair"], ["Altair", "Deneb"],
];

interface StarPos {
  name: string;
  x: number;
  y: number;
  mag: number;
  constellation: string;
  alt: number;
}

function julianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

function localSiderealTime(date: Date): number {
  const jd = julianDate(date);
  const t = (jd - 2451545.0) / 36525.0;
  let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t;
  gst = ((gst % 360) + 360) % 360;
  return ((gst + LON) % 360 + 360) % 360;
}

function raDecToAltAz(raHours: number, decDeg: number, lstDeg: number): { alt: number; az: number } {
  const dec = decDeg * (Math.PI / 180);
  const ha = ((lstDeg - raHours * 15) * Math.PI) / 180;
  const sinAlt = Math.sin(dec) * Math.sin(LAT) + Math.cos(dec) * Math.cos(LAT) * Math.cos(ha);
  const alt = Math.asin(sinAlt);
  const cosA = (Math.sin(dec) - Math.sin(alt) * Math.sin(LAT)) / (Math.cos(alt) * Math.cos(LAT));
  let az = Math.acos(Math.max(-1, Math.min(1, cosA)));
  if (Math.sin(ha) > 0) az = 2 * Math.PI - az;
  return { alt: alt * (180 / Math.PI), az: az * (180 / Math.PI) };
}

function projectStar(alt: number, az: number, w: number, h: number): { x: number; y: number } {
  const r = ((90 - alt) / 90) * Math.min(w, h) * 0.46;
  const azRad = (az - 180) * (Math.PI / 180);
  return {
    x: w / 2 + r * Math.sin(azRad),
    y: h / 2 - r * Math.cos(azRad),
  };
}

export default function StarMap() {
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState<StarPos | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<StarPos[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const starsRef = useRef<StarPos[]>([]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (active) {
      setActive(false);
      return;
    }
    timerRef.current = setTimeout(() => setActive(true), 5000);
  }, [active]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    timerRef.current = setTimeout(() => setActive(true), 5000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  const computeStars = useCallback((w: number, h: number) => {
    const lst = localSiderealTime(new Date());
    const result: StarPos[] = [];
    for (const [name, ra, dec, mag, constellation] of STARS) {
      const { alt, az } = raDecToAltAz(ra, dec, lst);
      if (alt < 2) continue;
      const { x, y } = projectStar(alt, az, w, h);
      result.push({ name, x, y, mag, constellation, alt });
    }
    return result;
  }, []);

  // Canvas rendering loop
  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const render = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      const computed = computeStars(w, h);
      starsRef.current = computed;
      setStars(computed);

      // Background
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, "#0a0e1a");
      grad.addColorStop(1, "#020408");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle horizon glow
      const hGrad = ctx.createLinearGradient(0, h * 0.85, 0, h);
      hGrad.addColorStop(0, "transparent");
      hGrad.addColorStop(1, "rgba(44, 74, 53, 0.08)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, h * 0.85, w, h * 0.15);

      // Constellation lines
      const starMap = new Map(computed.map((s) => [s.name, s]));
      ctx.lineWidth = 0.5;
      for (const [a, b] of CONSTELLATION_LINES) {
        const sa = starMap.get(a);
        const sb = starMap.get(b);
        if (!sa || !sb) continue;
        ctx.beginPath();
        ctx.moveTo(sa.x, sa.y);
        ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = "rgba(163, 184, 153, 0.12)";
        ctx.stroke();
      }

      // Stars
      for (const star of computed) {
        const size = Math.max(0.8, 3.5 - star.mag * 0.6);
        const alpha = Math.max(0.3, 1 - star.mag * 0.15);

        // Glow
        const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 4);
        glow.addColorStop(0, `rgba(220, 230, 240, ${alpha * 0.15})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(star.x - size * 4, star.y - size * 4, size * 8, size * 8);

        // Star dot
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 240, ${alpha})`;
        ctx.fill();
      }

      // Cardinal directions
      ctx.fillStyle = "rgba(163, 184, 153, 0.25)";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", w / 2, 28);
      ctx.fillText("S", w / 2, h - 16);
      ctx.fillText("E", 20, h / 2 + 4);
      ctx.fillText("W", w - 20, h / 2 + 4);

      animRef.current = requestAnimationFrame(render);
    };

    // Small delay so the fade-in starts on black
    setTimeout(() => {
      animRef.current = requestAnimationFrame(render);
    }, 100);

    return () => cancelAnimationFrame(animRef.current);
  }, [active, computeStars]);

  // Mouse hover detection
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    const threshold = 18;
    let closest: StarPos | null = null;
    let closestDist = Infinity;
    for (const star of starsRef.current) {
      const dx = e.clientX - star.x;
      const dy = e.clientY - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold && dist < closestDist) {
        closest = star;
        closestDist = dist;
      }
    }
    setHovered(closest);
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 z-[100] cursor-crosshair"
          onMouseMove={handleMouseMove}
          onClick={() => setActive(false)}
        >
          <canvas ref={canvasRef} className="absolute inset-0" />

          {/* Header info */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/20 font-mono">
              Night sky above Combe Lodge
            </p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/12 font-mono mt-1">
              {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · {stars.length} stars visible
            </p>
          </motion.div>

          {/* Star tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="fixed pointer-events-none z-[101]"
                style={{
                  left: mousePos.x + 16,
                  top: mousePos.y - 10,
                }}
              >
                {/* Connecting line from star to tooltip */}
                <div className="relative">
                  <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-3.5 py-2.5 min-w-[140px]">
                    <p className="text-white/90 text-xs font-sans font-medium tracking-wide">
                      {hovered.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div>
                        <p className="text-[8px] tracking-[0.15em] uppercase text-white/25 font-mono">Constellation</p>
                        <p className="text-[11px] text-white/50 font-sans">{hovered.constellation}</p>
                      </div>
                      <div className="w-px h-5 bg-white/10" />
                      <div>
                        <p className="text-[8px] tracking-[0.15em] uppercase text-white/25 font-mono">Magnitude</p>
                        <p className="text-[11px] text-white/50 font-mono">{hovered.mag.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-1.5">
                      <p className="text-[8px] tracking-[0.15em] uppercase text-white/25 font-mono">Altitude</p>
                      <p className="text-[11px] text-white/50 font-mono">{hovered.alt.toFixed(1)}°</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Crosshair at cursor */}
          {!hovered && (
            <div
              className="fixed pointer-events-none z-[101]"
              style={{ left: mousePos.x, top: mousePos.y }}
            >
              <div className="absolute -translate-x-1/2 -translate-y-1/2">
                <div className="w-px h-3 bg-white/10 absolute -top-4 left-1/2 -translate-x-1/2" />
                <div className="w-px h-3 bg-white/10 absolute top-1 left-1/2 -translate-x-1/2" />
                <div className="h-px w-3 bg-white/10 absolute top-0 -left-4 translate-y-1/2" />
                <div className="h-px w-3 bg-white/10 absolute top-0 left-1 translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Exit hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.3em] uppercase text-white/12 font-mono"
          >
            Click or move to return
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
