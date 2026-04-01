"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HotTubGauge() {
  const [temp, setTemp] = useState(38.0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fluctuate temperature by small amounts every 3-6 seconds
    const tick = () => {
      setTemp((t) => {
        const drift = (Math.random() - 0.5) * 0.4; // ±0.2
        const next = t + drift;
        // Keep between 37.0 and 39.2
        return Math.min(39.2, Math.max(37.0, Math.round(next * 10) / 10));
      });
    };

    const schedule = () => {
      const delay = 3000 + Math.random() * 3000;
      return setTimeout(() => {
        tick();
        timerId = schedule();
      }, delay);
    };

    let timerId = schedule();
    return () => clearTimeout(timerId);
  }, []);

  // Fill percentage: 37°C = 0%, 39.2°C = 100%
  const fill = ((temp - 37) / 2.2) * 100;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.4, delay: 2 }}
          className="fixed bottom-6 left-6 z-30 group"
        >
          <div className="relative flex items-end gap-3 bg-dark-overlay/80 backdrop-blur-xl rounded-2xl pl-4 pr-5 py-3.5 border border-light-text/10 shadow-xl shadow-dark-overlay/30 cursor-default">
            {/* Dismiss */}
            <button
              onClick={() => setVisible(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-dark-overlay border border-light-text/10 flex items-center justify-center text-light-text/30 hover:text-light-text/70 transition-colors opacity-0 group-hover:opacity-100 text-[10px]"
              aria-label="Dismiss"
            >
              &times;
            </button>

            {/* Thermometer */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative w-3.5 h-16 rounded-full bg-light-text/10 overflow-hidden">
                {/* Fill */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 rounded-full"
                  style={{
                    background: "linear-gradient(to top, #E85D3A, #F4A261, #FFD166)",
                  }}
                  animate={{ height: `${fill}%` }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                {/* Tick marks */}
                {[25, 50, 75].map((p) => (
                  <div
                    key={p}
                    className="absolute left-0 right-0 h-px bg-light-text/10"
                    style={{ bottom: `${p}%` }}
                  />
                ))}
              </div>
              {/* Bulb at bottom */}
              <div
                className="w-5 h-5 rounded-full border-2 border-light-text/10 -mt-2"
                style={{
                  background: `radial-gradient(circle, #F4A261, #E85D3A)`,
                }}
              />
            </div>

            {/* Text */}
            <div>
              <motion.div
                key={temp}
                initial={{ opacity: 0.6, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="font-mono text-lg text-light-text tracking-tight leading-none"
              >
                {temp.toFixed(1)}
                <span className="text-light-text/40 text-xs ml-0.5">°C</span>
              </motion.div>
              <p className="font-sans text-[10px] text-light-text/35 mt-1 leading-tight">
                Hot tub is ready
              </p>
              {/* Animated steam wisps */}
              <div className="flex gap-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-px bg-light-text/20 rounded-full"
                    animate={{
                      height: [4, 8, 4],
                      opacity: [0.15, 0.35, 0.15],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
