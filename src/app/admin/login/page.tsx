"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/pricing");
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-dark/30 mb-2">Combe Lodge</p>
          <h1 className="font-serif text-3xl text-dark">Admin</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-sm border border-dark/5"
        >
          <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-dark/40 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-dark/10 font-sans text-sm text-dark focus:outline-none focus:border-sage transition-colors"
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <p className="font-sans text-xs text-red-500 mt-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-4 py-3 rounded-lg bg-moss text-light-text font-sans font-medium text-sm tracking-wide hover:bg-moss-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center font-sans text-xs text-dark/25 mt-6">
          Set your password via <span className="font-mono">ADMIN_PASSWORD</span> in .env.local
        </p>
      </div>
    </div>
  );
}
