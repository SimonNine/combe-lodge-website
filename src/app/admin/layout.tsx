"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { UnsavedChangesProvider, useUnsavedChanges } from "@/components/admin/UnsavedChangesContext";

const NAV = [
  { href: "/admin/pricing", label: "Pricing", icon: "◈" },
  { href: "/admin/rules", label: "Booking Rules", icon: "✦" },
  { href: "/admin/bookings", label: "Bookings", icon: "▦" },
  { href: "/admin/finance", label: "Finance", icon: "£" },
  { href: "/admin/trash", label: "Trash", icon: "⌫" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { confirmNavigation } = useUnsavedChanges();

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (pathname.startsWith(href)) {
      onNavigate?.();
      return;
    }
    e.preventDefault();
    confirmNavigation(() => {
      router.push(href);
      onNavigate?.();
    });
  };

  return (
    <>
      {NAV.map(({ href, label, icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleNavClick(href, e)}
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
    </>
  );
}

function AdminSidebar() {
  const router = useRouter();
  const { confirmNavigation } = useUnsavedChanges();

  const handleLogout = async () => {
    confirmNavigation(async () => {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    });
  };

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0A1A12] flex flex-col">
      <div className="px-6 py-7 border-b border-white/8">
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">Combe Lodge</p>
        <p className="font-serif text-lg text-white/90">Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <NavLinks />
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
  );
}

function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { confirmNavigation } = useUnsavedChanges();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    confirmNavigation(async () => {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    });
  };

  const currentPage = NAV.find((n) => pathname.startsWith(n.href));

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A1A12] flex items-center justify-between px-4 h-14 border-b border-white/8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 text-white/60 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="1.5" rx="0.75" />
              <rect y="9.25" width="20" height="1.5" rx="0.75" />
              <rect y="15.5" width="20" height="1.5" rx="0.75" />
            </svg>
          </button>
          <div>
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-white/30 leading-none mb-0.5">Combe Lodge</p>
            <p className="font-serif text-sm text-white/90 leading-none">
              {currentPage?.label ?? "Admin"}
            </p>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="text-white/35 hover:text-white/60 transition-colors text-xs font-sans flex items-center gap-1"
        >
          <span>View site</span>
          <span>↗</span>
        </Link>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0A1A12] flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-white/8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/30 mb-1">Combe Lodge</p>
            <p className="font-serif text-lg text-white/90">Admin</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks onNavigate={() => setOpen(false)} />
        </nav>

        <div className="px-3 py-4 border-t border-white/8">
          <Link
            href="/"
            target="_blank"
            onClick={() => setOpen(false)}
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
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <UnsavedChangesProvider>
      <div className="min-h-screen bg-[#F5F4F1]">
        {/* Desktop sidebar */}
        <div className="hidden md:flex min-h-screen">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden">
          <MobileHeader />
          <main className="pt-14">
            {children}
          </main>
        </div>
      </div>
    </UnsavedChangesProvider>
  );
}
