"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Home, RefreshCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success("Welcome back, director!");
        router.push("/admin");
      } else {
        const data = await res.json();
        setLoginError(data.error || "Invalid username or password");
      }
    } catch (error) {
      setLoginError("Failed to connect to authentication server");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2d2a24] flex flex-col justify-center items-center p-6 text-white selection:bg-amber-300 selection:text-zinc-900">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs uppercase tracking-widest text-zinc-300 hover:text-white"
      >
        <Home className="w-3.5 h-3.5" /> Home Page
      </Link>

      <div className="w-full max-w-md bg-[#464239] rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl flex flex-col items-center">
        <div className="w-14 h-14 bg-amber-200/10 border border-amber-200/35 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-amber-200" />
        </div>

        <h1 className="font-serif-primary text-3xl font-light text-amber-100 text-center mb-2">
          Studio CMS Portal
        </h1>
        <p className="font-sans-clean text-xs text-zinc-300 text-center mb-8 tracking-wider uppercase font-light">
          Authorized Directors Access Only
        </p>

        {loginError && (
          <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2 mb-6 animate-pulse-slow">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-amber-200 font-semibold font-sans-clean">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="kopiko_wedd"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-black/25 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-sm transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-amber-200 font-semibold font-sans-clean">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-black/25 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-300 text-sm transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-4 mt-2 rounded-xl bg-amber-300 hover:bg-amber-200 disabled:bg-amber-300/40 text-zinc-950 font-semibold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Vows...</span>
              </>
            ) : (
              <span>Authenticate Session</span>
            )}
          </button>
        </form>

        <Link
          href="/"
          className="text-[11px] uppercase tracking-widest text-zinc-400 hover:text-amber-200 transition-colors mt-8 font-sans-clean"
        >
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
}
