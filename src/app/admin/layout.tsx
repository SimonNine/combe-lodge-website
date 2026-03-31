"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin/pricing", label: "Pricing", icon: "£" },
  { href: "/admin/rules", label: "Booking Rules", icon: "✦" },
  { href: "/admin/bookings", label: "Bookings", icon: "▦" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-[#F5F4F1]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#0A1A12] flex flex-col">
        <div className="px-6 py-7 border-b border-white/8">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">Combe Lodge</p>
          <p className="font-serif text-lg text-white/90">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-sans ${
                  active
                    ? "bg-white/12 text-white"
                    : "text-white/45 hover:text-white/70 hover:bg-white/6"
                }`}
              >
                <span className="text-[11px] w-4 text-center opacity-60">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/8">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/35 hover:text-white/60 transition-colors text-xs font-sans"
          >
            <span className="text-[11px] w-4 text-center">↗</span>
            View site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/35 hover:text-white/60 transition-colors text-xs font-sans text-left"
          >
            <span className="text-[11px] w-4 text-center">→</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
