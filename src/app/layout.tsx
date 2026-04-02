import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import FloatingBookButton from "@/components/ui/FloatingBookButton";
import HotTubGauge from "@/components/ui/HotTubGauge";
import StarMap from "@/components/ui/StarMap";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Combe Lodge | A Shelter in the Valley",
  description:
    "A luxury lodge retreat nestled in the North Devon countryside at Kentisbury Grange. Private hot tub, contemporary interiors, and Exmoor on your doorstep.",
  keywords: [
    "luxury lodge",
    "North Devon",
    "Kentisbury Grange",
    "Exmoor",
    "holiday let",
    "hot tub lodge",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} ${spaceGrotesk.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className="min-h-screen bg-warm-white text-dark font-sans font-light transition-colors duration-300">
        <ThemeProvider>
          {children}
          <FloatingBookButton />
          <HotTubGauge />
          <StarMap />
        </ThemeProvider>
      </body>
    </html>
  );
}
