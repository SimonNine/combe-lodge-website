"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// WMO weather code to label + icon type
function weatherInfo(code: number, isDay: boolean): { label: string; icon: string } {
  if (code === 0) return { label: "Clear", icon: isDay ? "sun" : "moon" };
  if (code <= 3) return { label: "Cloudy", icon: isDay ? "part-cloud" : "part-cloud-night" };
  if (code <= 48) return { label: "Fog", icon: "fog" };
  if (code <= 55) return { label: "Drizzle", icon: "drizzle" };
  if (code <= 65) return { label: "Rain", icon: "rain" };
  if (code <= 67) return { label: "Freezing rain", icon: "rain" };
  if (code <= 77) return { label: "Snow", icon: "snow" };
  if (code <= 82) return { label: "Showers", icon: "rain" };
  if (code <= 86) return { label: "Snow", icon: "snow" };
  if (code <= 99) return { label: "Storm", icon: "storm" };
  return { label: "Clear", icon: "sun" };
}

function WeatherIcon({ type, size = 16 }: { type: string; size?: number }) {
  const s = size;
  const c = s / 2;

  if (type === "sun") {
    return (
      <motion.svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
        <circle cx={c} cy={c} r={s * 0.22} fill="currentColor" opacity={0.9} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line key={deg} x1={c} y1={s * 0.06} x2={c} y2={s * 0.18} stroke="currentColor" strokeWidth="1" strokeLinecap="round"
            transform={`rotate(${deg} ${c} ${c})`} opacity={0.6} />
        ))}
      </motion.svg>
    );
  }

  if (type === "moon") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" opacity={0.7} />
      </svg>
    );
  }

  if (type === "part-cloud" || type === "part-cloud-night") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        {type === "part-cloud" ? (
          <circle cx="10" cy="8" r="3.5" fill="currentColor" opacity={0.5} />
        ) : (
          <path d="M13 6.5A4 4 0 118 2a3 3 0 005 4.5z" fill="currentColor" opacity={0.4} />
        )}
        <path d="M6 20h12a4 4 0 00.5-7.97A6 6 0 006.5 14H6a3 3 0 000 6z" fill="currentColor" opacity={0.7} />
      </svg>
    );
  }

  if (type === "fog") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.6}>
        <path d="M4 12h16M6 16h12M8 8h8M5 20h14" />
      </svg>
    );
  }

  if (type === "drizzle" || type === "rain") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 16h12a4 4 0 00.5-7.97A6 6 0 006.5 10H6a3 3 0 000 6z" fill="currentColor" opacity={0.6} />
        <motion.g animate={{ y: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <line x1="10" y1="19" x2="10" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.5} />
          <line x1="14" y1="18" x2="14" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.5} />
          {type === "rain" && <line x1="8" y1="18" x2="8" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0.5} />}
        </motion.g>
      </svg>
    );
  }

  if (type === "snow") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 14h12a4 4 0 00.5-7.97A6 6 0 006.5 8H6a3 3 0 000 6z" fill="currentColor" opacity={0.6} />
        <motion.g animate={{ y: [0, 2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <circle cx="9" cy="18" r="1" fill="currentColor" opacity={0.5} />
          <circle cx="13" cy="20" r="1" fill="currentColor" opacity={0.5} />
          <circle cx="16" cy="17" r="1" fill="currentColor" opacity={0.4} />
        </motion.g>
      </svg>
    );
  }

  if (type === "storm") {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 14h12a4 4 0 00.5-7.97A6 6 0 006.5 8H6a3 3 0 000 6z" fill="currentColor" opacity={0.6} />
        <motion.path d="M13 14l-2 4h4l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      </svg>
    );
  }

  // fallback
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="currentColor" opacity={0.5} /></svg>;
}

interface Props {
  isDark: boolean;
  compact?: boolean;
}

export default function WeatherWidget({ isDark, compact = false }: Props) {
  const [weather, setWeather] = useState<{ temperature: number | null; weatherCode: number; isDay: boolean } | null>(null);

  useEffect(() => {
    const load = () => {
      fetch("/api/weather")
        .then((r) => r.json())
        .then(setWeather)
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!weather || weather.temperature === null) return null;

  const info = weatherInfo(weather.weatherCode, weather.isDay);
  const textColor = isDark ? "text-light-text/50" : "text-dark/40";

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${textColor}`}>
        <WeatherIcon type={info.icon} size={14} />
        <span className="font-mono text-[10px]">{weather.temperature}°</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${textColor}`} title={`${info.label} at the lodge`}>
      <WeatherIcon type={info.icon} size={16} />
      <span className="font-mono text-[10px] tracking-wide">{weather.temperature}°C</span>
    </div>
  );
}
