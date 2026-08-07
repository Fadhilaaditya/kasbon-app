import React from 'react';
import Link from 'next/link';
import { Wallet } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center gap-2 text-center z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <Wallet className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Kasbon
          </span>
        </Link>
        <p className="text-slate-400 text-sm max-w-xs font-medium">
          Catat & pantau utang-piutang pribadi tanpa ribet
        </p>
      </div>

      {/* Auth Form Container */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl z-10">
        {children}
      </div>

      <footer className="mt-8 text-xs text-slate-500 z-10 text-center">
        Kasbon App &copy; {new Date().getFullYear()} &bull; Dibuat dengan Next.js 16 & Supabase
      </footer>
    </div>
  );
}
