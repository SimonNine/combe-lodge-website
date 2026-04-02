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

// Constellation line connections grouped by constellation name
const CONSTELLATION_LINES: Record<string, [string, string][]> = {
  "Orion": [
    ["Betelgeuse", "Bellatrix"], ["Betelgeuse", "Alnilam"], ["Bellatrix", "Mintaka"],
    ["Alnilam", "Alnitak"], ["Alnilam", "Mintaka"], ["Alnitak", "Rigel"], ["Mintaka", "Rigel"],
  ],
  "Ursa Major": [
    ["Dubhe", "Merak"], ["Merak", "Phecda"], ["Phecda", "Megrez"],
    ["Megrez", "Alioth"], ["Alioth", "Mizar"], ["Mizar", "Alkaid"],
    ["Megrez", "Dubhe"],
  ],
  "Cassiopeia": [
    ["Schedar", "Caph"], ["Schedar", "Navi"], ["Navi", "Ruchbah"], ["Ruchbah", "Segin"],
  ],
  "Gemini": [["Castor", "Pollux"]],
  "Leo": [["Regulus", "Denebola"]],
  "Cygnus": [["Deneb", "Vega"]],
  "Andromeda": [["Alpheratz", "Mirach"], ["Mirach", "Almach"]],
  "Summer Triangle": [["Vega", "Altair"], ["Altair", "Deneb"]],
};

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
  const hoveredRef = useRef<StarPos | null>(null);

  // Keep hoveredRef in sync
  useEffect(() => { hoveredRef.current = hovered; }, [hovered]);

  const close = useCallback(() => {
    setActive(false);
    setHovered(null);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!active) {
      timerRef.current = setTimeout(() => setActive(true), 5000);
    }
  }, [active]);

  // Idle detection — only scroll/keydown/touchstart reset the timer (NOT mousemove)
  useEffect(() => {
    const events = ["keydown", "scroll", "touchstart"];
    const handler = () => {
      if (!active) resetTimer();
    };
    events.forEach((e) => window.addEventListener(e, handler));

    // Escape key closes
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active) close();
    };
    window.addEventListener("keydown", handleKey);

    if (!active) {
      timerRef.current = setTimeout(() => setActive(true), 5000);
    }

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      window.removeEventListener("keydown", handleKey);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, resetTimer, close]);

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
    let twinkleFrame = 0;

    const render = () => {
      twinkleFrame++;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      const computed = computeStars(w, h);
      starsRef.current = computed;
      setStars(computed);

      const currentHovered = hoveredRef.current;

      // Background — deeper space gradient
      const grad = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
      grad.addColorStop(0, "#080c18");
      grad.addColorStop(0.5, "#050810");
      grad.addColorStop(1, "#020306");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Faint milky way band (very subtle diagonal glow)
      const mwGrad = ctx.createLinearGradient(0, 0, w, h);
      mwGrad.addColorStop(0, "transparent");
      mwGrad.addColorStop(0.35, "rgba(180, 190, 210, 0.015)");
      mwGrad.addColorStop(0.5, "rgba(180, 190, 210, 0.025)");
      mwGrad.addColorStop(0.65, "rgba(180, 190, 210, 0.015)");
      mwGrad.addColorStop(1, "transparent");
      ctx.fillStyle = mwGrad;
      ctx.fillRect(0, 0, w, h);

      // Horizon glow
      const hGrad = ctx.createLinearGradient(0, h * 0.88, 0, h);
      hGrad.addColorStop(0, "transparent");
      hGrad.addColorStop(1, "rgba(44, 74, 53, 0.06)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, h * 0.88, w, h * 0.12);

      // Build visible star lookup for constellation lines
      const starMap = new Map(computed.map((s) => [s.name, s]));

      // Constellation lines — only draw for hovered star's constellation
      if (currentHovered) {
        const cName = currentHovered.constellation;
        // Also check "Summer Triangle" if the star is part of it
        const constellations = [cName];
        const triStars = ["Vega", "Altair", "Deneb"];
        if (triStars.includes(currentHovered.name)) constellations.push("Summer Triangle");

        for (const cn of constellations) {
          const lines = CONSTELLATION_LINES[cn];
          if (!lines) continue;

          for (const [a, b] of lines) {
            const sa = starMap.get(a);
            const sb = starMap.get(b);
            if (!sa || !sb) continue;
            ctx.beginPath();
            ctx.moveTo(sa.x, sa.y);
            ctx.lineTo(sb.x, sb.y);
            ctx.strokeStyle = "rgba(163, 184, 153, 0.35)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }

          // Constellation label — place near the midpoint of the constellation
          const cStars = computed.filter((s) => s.constellation === cn || (cn === "Summer Triangle" && triStars.includes(s.name)));
          if (cStars.length > 1) {
            const avgX = cStars.reduce((sum, s) => sum + s.x, 0) / cStars.length;
            const avgY = cStars.reduce((sum, s) => sum + s.y, 0) / cStars.length;
            ctx.fillStyle = "rgba(163, 184, 153, 0.45)";
            ctx.font = "9px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(cn.toUpperCase(), avgX, avgY - 14);
          }
        }
      }

      // Stars
      for (const star of computed) {
        const isHovered = currentHovered?.name === star.name;
        const isInConstellation = currentHovered && star.constellation === currentHovered.constellation;
        const baseMag = star.mag;
        const size = Math.max(1, 4 - baseMag * 0.7) * (isHovered ? 1.8 : isInConstellation ? 1.3 : 1);
        const alpha = Math.max(0.4, 1 - baseMag * 0.12);

        // Twinkle — subtle brightness oscillation
        const twinkle = 1 + Math.sin(twinkleFrame * 0.03 + star.x * 0.1 + star.y * 0.1) * 0.15;

        // Outer glow (large, soft)
        const outerR = size * (isHovered ? 12 : 6);
        const outer = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, outerR);
        outer.addColorStop(0, `rgba(200, 215, 240, ${alpha * 0.12 * twinkle})`);
        outer.addColorStop(0.4, `rgba(200, 215, 240, ${alpha * 0.04 * twinkle})`);
        outer.addColorStop(1, "transparent");
        ctx.fillStyle = outer;
        ctx.fillRect(star.x - outerR, star.y - outerR, outerR * 2, outerR * 2);

        // Inner glow (tighter, brighter)
        const innerR = size * 3;
        const inner = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, innerR);
        inner.addColorStop(0, `rgba(230, 240, 255, ${alpha * 0.3 * twinkle})`);
        inner.addColorStop(1, "transparent");
        ctx.fillStyle = inner;
        ctx.fillRect(star.x - innerR, star.y - innerR, innerR * 2, innerR * 2);

        // Star core — slightly blue-white tint
        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = isHovered
          ? `rgba(255, 255, 255, 1)`
          : `rgba(220, 230, 245, ${alpha * twinkle})`;
        ctx.fill();

        // Diffraction spikes on bright stars (mag < 1)
        if (baseMag < 1) {
          const spikeLen = size * (isHovered ? 8 : 4);
          const spikeAlpha = alpha * 0.12 * twinkle;
          ctx.strokeStyle = `rgba(220, 230, 245, ${spikeAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - spikeLen, star.y);
          ctx.lineTo(star.x + spikeLen, star.y);
          ctx.moveTo(star.x, star.y - spikeLen);
          ctx.lineTo(star.x, star.y + spikeLen);
          ctx.stroke();
        }

        // Star name label for hovered constellation members
        if (isInConstellation && !isHovered) {
          ctx.fillStyle = "rgba(200, 215, 235, 0.35)";
          ctx.font = "8px system-ui, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(star.name, star.x + size + 6, star.y + 3);
        }
      }

      // Cardinal directions
      ctx.fillStyle = "rgba(163, 184, 153, 0.35)";
      ctx.font = "11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("N", w / 2, 30);
      ctx.fillText("S", w / 2, h - 18);
      ctx.fillText("E", 22, h / 2 + 4);
      ctx.fillText("W", w - 22, h / 2 + 4);

      // Subtle horizon line
      ctx.beginPath();
      ctx.moveTo(0, h - 2);
      ctx.lineTo(w, h - 2);
      ctx.strokeStyle = "rgba(163, 184, 153, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      animRef.current = requestAnimationFrame(render);
    };

    setTimeout(() => {
      animRef.current = requestAnimationFrame(render);
    }, 100);

    return () => cancelAnimationFrame(animRef.current);
  }, [active, computeStars]);

  // Mouse hover detection
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    const threshold = 22;
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
        >
          <canvas ref={canvasRef} className="absolute inset-0" />

          {/* Exit button — top right */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={close}
            className="absolute top-6 right-6 z-[102] flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 bg-white/5 backdrop-blur-sm text-white/50 hover:text-white/80 hover:border-white/30 transition-all text-[10px] tracking-[0.2em] uppercase font-mono cursor-pointer"
          >
            Exit
            <span className="text-white/25 text-[9px] ml-1">ESC</span>
          </motion.button>

          {/* Header info */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute top-7 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-[11px] tracking-[0.4em] uppercase text-white/40 font-mono">
              Night sky above Combe Lodge
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-white/25 font-mono mt-1.5">
              {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} &middot; {stars.length} stars visible &middot; 51.18°N
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
                  left: mousePos.x + 20,
                  top: mousePos.y - 16,
                }}
              >
                <div className="bg-black/80 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-3 min-w-[160px] shadow-2xl shadow-black/50">
                  <p className="text-white text-sm font-sans font-medium tracking-wide">
                    {hovered.name}
                  </p>
                  <p className="text-[10px] text-white/40 font-sans mt-0.5">{hovered.constellation}</p>
                  <div className="h-px bg-white/8 my-2.5" />
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[8px] tracking-[0.15em] uppercase text-white/30 font-mono">Mag</p>
                      <p className="text-[12px] text-white/60 font-mono mt-0.5">{hovered.mag.toFixed(2)}</p>
                    </div>
                    <div className="w-px h-6 bg-white/8" />
                    <div>
                      <p className="text-[8px] tracking-[0.15em] uppercase text-white/30 font-mono">Alt</p>
                      <p className="text-[12px] text-white/60 font-mono mt-0.5">{hovered.alt.toFixed(1)}°</p>
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
                <div className="w-px h-4 bg-white/15 absolute -top-5 left-1/2 -translate-x-1/2" />
                <div className="w-px h-4 bg-white/15 absolute top-1 left-1/2 -translate-x-1/2" />
                <div className="h-px w-4 bg-white/15 absolute top-0 -left-5 translate-y-1/2" />
                <div className="h-px w-4 bg-white/15 absolute top-0 left-1 translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Bottom hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-7 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-[10px] tracking-[0.25em] uppercase text-white/25 font-mono">
              Hover stars to explore &middot; Press ESC or click Exit to return
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
