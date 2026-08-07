'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Direct login session created
        router.push('/dashboard');
        router.refresh();
      } else {
        setSuccess('Akun berhasil dibuat! Silakan periksa kotak masuk (inbox/spam) email Anda dan klik link konfirmasi sebelum melakukan login.');
        setIsLoading(false);
      }
    } catch {
      setError('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Buat Akun Baru</h1>
        <p className="text-slate-400 text-sm mt-1">
          Mulai catat utang & piutang pribadi Anda dengan mudah.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span>{success}</span>
            <div className="mt-2">
              <Link
                href="/login"
                className="underline font-semibold hover:text-emerald-300"
              >
                Klik di sini untuk Masuk
              </Link>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Kata Sandi
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Membuat Akun...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
              <span>Daftar Akun</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800 text-center text-sm text-slate-400">
        Sudah punya akun?{' '}
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
