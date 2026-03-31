"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Hero from "./Hero";
import TheSetting from "./TheSetting";
import TheLodge from "./TheLodge";
import TheRooms from "./TheRooms";
import TheExperience from "./TheExperience";
import BookingCTA from "./BookingCTA";
import Footer from "./Footer";

const sections = [
  { id: "hero", Component: Hero },
  { id: "setting", Component: TheSetting },
  { id: "lodge", Component: TheLodge },
  { id: "rooms", Component: TheRooms },
  { id: "experience", Component: TheExperience },
  { id: "booking", Component: BookingCTA },
  { id: "footer", Component: Footer },
];

export default function HorizontalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [totalWidth, setTotalWidth] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      const w = scrollRef.current.scrollWidth - window.innerWidth;
      setTotalWidth(w);
    }

    const handleResize = () => {
      if (scrollRef.current) {
        const w = scrollRef.current.scrollWidth - window.innerWidth;
        setTotalWidth(w);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const xRaw = useTransform(scrollYProgress, [0, 1], [0, -totalWidth]);
  const x = useSpring(xRaw, { stiffness: 300, damping: 40, mass: 0.5 });

  // Progress dots
  const progress = useTransform(scrollYProgress, [0, 1], [0, sections.length - 1]);

  return (
    <>
      {/* This tall container creates the scroll distance */}
      <div
        ref={containerRef}
        style={{ height: `${sections.length * 100}vh` }}
        className="relative"
      >
        {/* Sticky horizontal track */}
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            ref={scrollRef}
            style={{ x }}
            className="flex h-screen"
          >
            {sections.map(({ id, Component }) => (
              <div
                key={id}
                id={id}
                className="flex-shrink-0 w-screen h-screen relative overflow-hidden"
              >
                <Component />
              </div>
            ))}
          </motion.div>

          {/* Progress indicator */}
          <ProgressDots count={sections.length} progress={progress} />
        </div>
      </div>
    </>
  );
}

function ProgressDots({
  count,
  progress,
}: {
  count: number;
  progress: ReturnType<typeof useTransform>;
}) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <ProgressDot key={i} index={i} progress={progress} />
      ))}
    </div>
  );
}

function ProgressDot({
  index,
  progress,
}: {
  index: number;
  progress: ReturnType<typeof useTransform>;
}) {
  const opacity = useTransform(
    progress,
    [index - 0.5, index, index + 0.5],
    [0.3, 1, 0.3]
  );
  const scale = useTransform(
    progress,
    [index - 0.5, index, index + 0.5],
    [1, 1.5, 1]
  );

  return (
    <motion.div
      style={{ opacity, scale }}
      className="w-2 h-2 rounded-full bg-light-text/80"
    />
  );
}
