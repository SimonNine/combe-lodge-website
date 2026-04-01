"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/ui/Navigation";
import Link from "next/link";

const PHOTOS = [
  { src: "/images/hero-exterior.jpg", label: "The Lodge" },
  { src: "/images/deck-view.jpg", label: "The Deck" },
  { src: "/images/hot-tub.jpg", label: "Hot Tub" },
  { src: "/images/landscape.jpg", label: "The Valley" },
  { src: "/images/living-room.jpg", label: "Living Space" },
  { src: "/images/master-bedroom.jpg", label: "Master Suite" },
];

export default function PostcardPage() {
  const [photo, setPhoto] = useState(0);
  const [message, setMessage] = useState("Wish you were here!");
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generatePostcard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setGenerating(true);
    const ctx = canvas.getContext("2d")!;
    const W = 1200;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // Load photo
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = PHOTOS[photo].src;

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });

    // --- FRONT: Photo side ---
    // Draw photo covering left 55%
    const photoW = W * 0.55;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const drawH = H;
    const drawW = drawH * imgAspect;
    const offsetX = (photoW - drawW) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, photoW, H);
    ctx.clip();
    ctx.drawImage(img, offsetX, 0, drawW, drawH);
    ctx.restore();

    // Right side — postcard message area
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(photoW, 0, W - photoW, H);

    // Border
    ctx.strokeStyle = "#D4CFC7";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // Divider line
    ctx.beginPath();
    ctx.moveTo(photoW, 0);
    ctx.lineTo(photoW, H);
    ctx.strokeStyle = "#D4CFC7";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Vertical divider on right side
    const rightCenter = photoW + (W - photoW) / 2;
    ctx.beginPath();
    ctx.moveTo(rightCenter, 40);
    ctx.lineTo(rightCenter, H - 40);
    ctx.strokeStyle = "#E8E4DE";
    ctx.lineWidth = 1;
    ctx.stroke();

    // "POST CARD" header
    ctx.fillStyle = "#1A1A18";
    ctx.font = "600 11px 'DM Sans', system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.textAlign = "center";
    ctx.fillText("P O S T C A R D", photoW + (W - photoW) / 2, 45);

    // Stamp area (top right)
    const stampX = W - 100;
    const stampY = 55;
    const stampW = 70;
    const stampH = 85;
    ctx.strokeStyle = "#D4CFC7";
    ctx.lineWidth = 1;
    // Perforated stamp border
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(stampX, stampY, stampW, stampH);
    ctx.setLineDash([]);

    // Mini lodge icon in stamp
    ctx.fillStyle = "#A3B899";
    ctx.font = "10px 'DM Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("COMBE", stampX + stampW / 2, stampY + 35);
    ctx.fillText("LODGE", stampX + stampW / 2, stampY + 48);
    ctx.fillStyle = "#C9A87C";
    ctx.font = "bold 14px 'DM Sans', system-ui, sans-serif";
    ctx.fillText("🏡", stampX + stampW / 2, stampY + 70);

    // Postmark circle
    ctx.beginPath();
    ctx.arc(stampX - 15, stampY + stampH / 2, 30, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(163, 184, 153, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(163, 184, 153, 0.5)";
    ctx.font = "8px 'DM Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NORTH DEVON", stampX - 15, stampY + stampH / 2 - 5);
    ctx.fillText("EXMOOR", stampX - 15, stampY + stampH / 2 + 7);

    // Message (left column of right side)
    const msgX = photoW + 30;
    const msgMaxW = rightCenter - photoW - 50;
    ctx.fillStyle = "#1A1A18";
    ctx.font = "italic 16px 'DM Serif Display', Georgia, serif";
    ctx.textAlign = "left";
    wrapText(ctx, `"${message}"`, msgX, 100, msgMaxW, 24);

    // From name
    if (fromName) {
      ctx.font = "15px 'DM Serif Display', Georgia, serif";
      ctx.fillStyle = "#1A1A18";
      ctx.fillText(`— ${fromName}`, msgX, H - 60);
    }

    // Address lines (right column) — decorative
    const addrX = rightCenter + 20;
    const addrMaxW = W - rightCenter - 50;
    ctx.strokeStyle = "#E8E4DE";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ly = 200 + i * 40;
      ctx.beginPath();
      ctx.moveTo(addrX, ly);
      ctx.lineTo(addrX + addrMaxW, ly);
      ctx.stroke();
    }

    // "To" name on first line
    if (toName) {
      ctx.fillStyle = "#1A1A18";
      ctx.font = "italic 16px 'DM Serif Display', Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(toName, addrX + 5, 197);
    }

    // Address hint
    ctx.fillStyle = "#D4CFC7";
    ctx.font = "10px 'DM Sans', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Kentisbury Grange, North Devon", addrX + 5, 277);
    ctx.fillText("EX31 4NL, England", addrX + 5, 317);

    // Bottom branding
    ctx.fillStyle = "#A3B899";
    ctx.font = "9px 'DM Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("combelodge.co.uk", photoW + (W - photoW) / 2, H - 25);

    // Photo overlay — location label
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    const labelW = 180;
    const labelH = 32;
    roundRect(ctx, 20, H - 52, labelW, labelH, 6);
    ctx.fill();
    ctx.fillStyle = "#F5F2ED";
    ctx.font = "11px 'DM Sans', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`📍 Combe Lodge — ${PHOTOS[photo].label}`, 34, H - 31);

    setGenerating(false);
  }, [photo, message, fromName, toName]);

  const download = async () => {
    await generatePostcard();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "combe-lodge-postcard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const share = async () => {
    await generatePostcard();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      if (navigator.share) {
        const file = new File([blob], "combe-lodge-postcard.png", { type: "image/png" });
        try {
          await navigator.share({ files: [file], title: "Postcard from Combe Lodge" });
        } catch {
          // User cancelled or share failed — fall back to download
          download();
        }
      } else {
        download();
      }
    }, "image/png");
  };

  return (
    <main className="grain min-h-screen bg-warm-white">
      <Navigation light />

      <div className="pt-28 md:pt-36 pb-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase text-dark/40 hover:text-dark/60 transition-colors mb-6">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl text-dark leading-[1.05]">
              Send a Postcard
            </h1>
            <p className="font-sans font-light text-dark/45 text-base mt-3 max-w-md">
              Create a vintage postcard from Combe Lodge. Pick your photo, write your message, and share it with someone who deserves a holiday.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-[1fr,320px] gap-10 mt-12">
            {/* Postcard preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {/* Interactive preview card */}
              <div
                className="relative cursor-pointer"
                style={{ perspective: "1200px" }}
                onClick={() => setFlipped(!flipped)}
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative"
                >
                  {/* Front — photo */}
                  <div
                    className="aspect-[3/2] rounded-xl overflow-hidden shadow-2xl shadow-dark/15 border-2 border-white"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${PHOTOS[photo].src}')` }}
                    />
                    {/* Location badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-dark-overlay/60 backdrop-blur-sm text-light-text/90 text-xs font-sans px-3 py-1.5 rounded-lg">
                      <span>📍</span> Combe Lodge — {PHOTOS[photo].label}
                    </div>
                    {/* Flip hint */}
                    <div className="absolute top-3 right-3 bg-dark-overlay/40 backdrop-blur-sm text-light-text/60 text-[10px] font-mono px-2 py-1 rounded-md">
                      Click to flip →
                    </div>
                  </div>

                  {/* Back — message side */}
                  <div
                    className="absolute inset-0 aspect-[3/2] rounded-xl overflow-hidden shadow-2xl shadow-dark/15 border-2 border-white bg-[#FAF8F5]"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <div className="h-full p-6 md:p-8 flex flex-col">
                      {/* Header */}
                      <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-dark/30 text-center mb-4">
                        POST CARD
                      </p>

                      <div className="flex-1 grid grid-cols-2 gap-4">
                        {/* Left — message */}
                        <div className="flex flex-col justify-between border-r border-dark/8 pr-4">
                          <p className="font-serif italic text-sm md:text-base text-dark/80 leading-relaxed">
                            &ldquo;{message || "Wish you were here!"}&rdquo;
                          </p>
                          {fromName && (
                            <p className="font-serif text-sm text-dark mt-4">— {fromName}</p>
                          )}
                        </div>

                        {/* Right — address */}
                        <div className="flex flex-col justify-between pl-2">
                          {/* Stamp */}
                          <div className="self-end border border-dashed border-dark/15 rounded-sm px-3 py-2 text-center">
                            <p className="font-mono text-[8px] text-sage tracking-wider">COMBE</p>
                            <p className="font-mono text-[8px] text-sage tracking-wider">LODGE</p>
                            <p className="text-sm mt-0.5">🏡</p>
                          </div>

                          {/* Address lines */}
                          <div className="space-y-3 mt-4">
                            {toName ? (
                              <p className="font-serif italic text-sm text-dark border-b border-dark/10 pb-1">{toName}</p>
                            ) : (
                              <div className="border-b border-dark/10 pb-1 h-5" />
                            )}
                            <div className="border-b border-dark/10 pb-1 h-5" />
                            <div className="border-b border-dark/10 pb-1 h-5" />
                          </div>

                          <p className="font-mono text-[8px] text-dark/20 mt-3">
                            Kentisbury Grange, North Devon
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <p className="font-sans font-light text-[11px] text-dark/30 text-center mt-3">
                Click the postcard to flip it
              </p>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Photo picker */}
              <div>
                <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35 block mb-3">
                  Choose your photo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PHOTOS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPhoto(i)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        i === photo ? "border-moss shadow-md scale-[1.02]" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${p.src}')` }}
                      />
                      {i === photo && (
                        <div className="absolute inset-0 bg-moss/10 flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8L6.5 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35 block mb-2">
                  Your message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 120))}
                  rows={3}
                  maxLength={120}
                  className="w-full p-3 rounded-lg border border-dark/10 font-serif italic text-sm text-dark placeholder:text-dark/20 bg-transparent focus:outline-none focus:border-sage transition-colors resize-none"
                  placeholder="Wish you were here!"
                />
                <p className="font-mono text-[9px] text-dark/20 mt-1">{message.length}/120</p>
              </div>

              {/* From / To */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35 block mb-2">From</label>
                  <input
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-dark/10 font-sans text-sm text-dark placeholder:text-dark/20 bg-transparent focus:outline-none focus:border-sage transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-dark/35 block mb-2">To</label>
                  <input
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-dark/10 font-sans text-sm text-dark placeholder:text-dark/20 bg-transparent focus:outline-none focus:border-sage transition-colors"
                    placeholder="Their name"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={download}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-all duration-300 disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M8 2v9M4.5 7.5L8 11l3.5-3.5M3 13h10" />
                  </svg>
                  Download Postcard
                </button>
                <button
                  onClick={share}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[10px] border border-dark/12 text-dark/60 font-sans font-medium text-sm tracking-wide hover:border-dark/25 hover:text-dark transition-all duration-300 disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="3.5" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="12" cy="12.5" r="2" />
                    <path d="M5.8 9.1l4.4 2.4M5.8 6.9l4.4-2.4" />
                  </svg>
                  Share
                </button>
              </div>

              <p className="font-sans font-light text-[11px] text-dark/25 text-center leading-relaxed">
                Send this to someone who deserves a holiday.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}

// Canvas helpers
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let cy = y;

  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, cy);
      line = word + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, cy);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
