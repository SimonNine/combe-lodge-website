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

    // Layout constants
    const photoW = W * 0.5;           // Photo takes left half
    const rightW = W - photoW;        // Right side
    const pad = 40;                   // Inner padding on right side
    const rightCenter = photoW + rightW / 2; // Vertical divider position
    const msgColW = rightCenter - photoW - pad * 2; // Message column width
    const addrColX = rightCenter + pad / 2;         // Address column x
    const addrColW = W - addrColX - pad;            // Address column width

    // --- Photo side (left half) ---
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

    // Photo label — simple, bottom-left
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(ctx, 16, H - 48, 250, 32, 6);
    ctx.fill();
    ctx.fillStyle = "#F5F2ED";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Combe Lodge at Kentisbury Grange", 28, H - 27);

    // --- Right side — postcard message area ---
    ctx.fillStyle = "#FAF8F5";
    ctx.fillRect(photoW, 0, rightW, H);

    // Outer border
    ctx.strokeStyle = "#D4CFC7";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // Photo/message divider
    ctx.beginPath();
    ctx.moveTo(photoW, 0);
    ctx.lineTo(photoW, H);
    ctx.strokeStyle = "#D4CFC7";
    ctx.lineWidth = 1;
    ctx.stroke();

    // "POST CARD" header — centred on right side
    ctx.fillStyle = "#1A1A18";
    ctx.font = "600 10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("P O S T C A R D", rightCenter, 35);

    // Thin rule under header
    ctx.beginPath();
    ctx.moveTo(photoW + pad, 48);
    ctx.lineTo(W - pad, 48);
    ctx.strokeStyle = "#E8E4DE";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Vertical divider (message | address)
    ctx.beginPath();
    ctx.moveTo(rightCenter, 55);
    ctx.lineTo(rightCenter, H - 30);
    ctx.strokeStyle = "#E0DCD6";
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- Stamp (top-right of right side) ---
    const stampSize = 65;
    const stampX = W - pad - stampSize;
    const stampY = 58;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "#D4CFC7";
    ctx.lineWidth = 1;
    ctx.strokeRect(stampX, stampY, stampSize, stampSize + 10);
    ctx.setLineDash([]);
    ctx.fillStyle = "#A3B899";
    ctx.font = "bold 9px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("COMBE", stampX + stampSize / 2, stampY + 28);
    ctx.fillText("LODGE", stampX + stampSize / 2, stampY + 40);
    ctx.fillStyle = "#C9A87C";
    ctx.font = "8px system-ui, sans-serif";
    ctx.fillText("EST. 2024", stampX + stampSize / 2, stampY + 56);

    // Postmark circle — overlapping stamp
    const pmX = stampX - 10;
    const pmY = stampY + stampSize / 2 + 5;
    ctx.beginPath();
    ctx.arc(pmX, pmY, 25, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(163, 184, 153, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(163, 184, 153, 0.45)";
    ctx.font = "7px system-ui, sans-serif";
    ctx.fillText("NORTH DEVON", pmX, pmY - 4);
    ctx.fillText("EXMOOR", pmX, pmY + 8);

    // --- Message column (left of divider) ---
    const msgX = photoW + pad;
    const msgY = 80;
    ctx.fillStyle = "#1A1A18";
    ctx.font = "italic 15px Georgia, serif";
    ctx.textAlign = "left";
    const msgEndY = wrapText(ctx, `\u201C${message}\u201D`, msgX, msgY, msgColW, 22);

    // From name — sits right below message
    if (fromName) {
      ctx.font = "14px Georgia, serif";
      ctx.fillStyle = "#1A1A18";
      ctx.fillText(`\u2014 ${fromName}`, msgX, msgEndY + 30);
    }

    // --- Address column (right of divider) ---
    // "To" name
    if (toName) {
      ctx.fillStyle = "#1A1A18";
      ctx.font = "italic 15px Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(toName, addrColX, stampY + stampSize + 45);
    }

    // Address lines
    ctx.strokeStyle = "#E8E4DE";
    ctx.lineWidth = 1;
    const lineStartY = stampY + stampSize + 55;
    for (let i = 0; i < 4; i++) {
      const ly = lineStartY + i * 35;
      ctx.beginPath();
      ctx.moveTo(addrColX, ly);
      ctx.lineTo(addrColX + addrColW, ly);
      ctx.stroke();
    }

    // Address text on bottom lines
    ctx.fillStyle = "#C8C3BC";
    ctx.font = "9px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Kentisbury Grange", addrColX, lineStartY + 68);
    ctx.fillText("North Devon, EX31 4NL", addrColX, lineStartY + 103);

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
                    <div className="absolute bottom-3 left-3 bg-dark-overlay/55 backdrop-blur-sm text-light-text/90 text-[11px] font-sans px-3 py-1.5 rounded-lg">
                      Combe Lodge at Kentisbury Grange
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
                    <div className="h-full p-5 md:p-7 flex flex-col">
                      {/* Header */}
                      <p className="font-mono text-[8px] tracking-[0.4em] uppercase text-dark/25 text-center mb-1">
                        POST CARD
                      </p>
                      <div className="h-px bg-dark/8 mb-3" />

                      <div className="flex-1 grid grid-cols-2 gap-0">
                        {/* Left — message */}
                        <div className="flex flex-col border-r border-dark/8 pr-4">
                          <p className="font-serif italic text-sm text-dark/75 leading-relaxed">
                            &ldquo;{message || "Wish you were here!"}&rdquo;
                          </p>
                          {fromName && (
                            <p className="font-serif text-sm text-dark mt-3">&mdash; {fromName}</p>
                          )}
                        </div>

                        {/* Right — address */}
                        <div className="flex flex-col justify-between pl-4">
                          {/* Stamp */}
                          <div className="self-end border border-dashed border-dark/12 rounded-sm px-2.5 py-1.5 text-center">
                            <p className="font-mono text-[7px] text-sage font-bold tracking-wider leading-tight">COMBE</p>
                            <p className="font-mono text-[7px] text-sage font-bold tracking-wider leading-tight">LODGE</p>
                            <p className="font-mono text-[6px] text-wheat mt-0.5">EST. 2024</p>
                          </div>

                          {/* Address lines */}
                          <div className="space-y-2.5 mt-3">
                            {toName ? (
                              <p className="font-serif italic text-sm text-dark border-b border-dark/10 pb-1">{toName}</p>
                            ) : (
                              <div className="border-b border-dark/10 pb-1 h-5" />
                            )}
                            <div className="border-b border-dark/10 pb-1 h-5" />
                            <div className="border-b border-dark/10 pb-1 h-5" />
                          </div>

                          <p className="font-mono text-[7px] text-dark/18 mt-2">
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
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
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
  return cy; // return final Y so caller knows where text ended
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
