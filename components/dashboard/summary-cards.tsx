'use client';

import React from 'react';
import { formatRupiah } from '@/lib/utils/currency';
import { ArrowDownLeft, ArrowUpRight, Scale, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardsProps {
  totalOwedToMe: number;
  totalIOwe: number;
  isLoading?: boolean;
}

export default function SummaryCards({
  totalOwedToMe,
  totalIOwe,
  isLoading = false,
}: SummaryCardsProps) {
  const netBalance = totalOwedToMe - totalIOwe;
  const isSurplus = netBalance >= 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 animate-pulse"
          >
            <div className="h-4 w-32 bg-slate-800 rounded-lg mb-4" />
            <div className="h-9 w-44 bg-slate-800 rounded-xl mb-3" />
            <div className="h-3 w-28 bg-slate-800/60 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6">
      {/* Card 1: Total Dihutang ke Saya */}
      <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-[0.99] transition-all duration-300 group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-300 pointer-events-none">
          <ArrowDownLeft className="w-24 h-24 text-emerald-400" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Total Dihutang ke Saya
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-1">
          {formatRupiah(totalOwedToMe)}
        </div>
        <p className="text-xs text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          Uang yang belum dibayar orang lain ke Anda
        </p>
      </div>

      {/* Card 2: Total Saya Hutang */}
      <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/10 active:scale-[0.99] transition-all duration-300 group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 group-hover:scale-110 transition-all duration-300 pointer-events-none">
          <ArrowUpRight className="w-24 h-24 text-rose-400" />
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 group-hover:bg-rose-500/20 transition-colors">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Total Saya Hutang
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight mt-1">
          {formatRupiah(totalIOwe)}
        </div>
        <p className="text-xs text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium">
          <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          Kewajiban pembayaran yang harus Anda bayar
        </p>
      </div>

      {/* Card 3: Net (Selisih) */}
      <div
        className={`relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border p-5 sm:p-6 rounded-3xl shadow-xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 group sm:col-span-2 md:col-span-1 ${
          isSurplus
            ? 'border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10'
            : 'border-rose-500/30 hover:border-rose-500/50 hover:shadow-2xl hover:shadow-rose-500/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border transition-colors ${
                isSurplus
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20'
              }`}
            >
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Net Balance
            </span>
          </div>

          <span
            className={`text-[11px] px-3 py-1 rounded-full font-bold border ${
              isSurplus
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {isSurplus ? 'Surplus' : 'Defisit'}
          </span>
        </div>

        <div
          className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${
            isSurplus ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isSurplus ? `+${formatRupiah(netBalance)}` : formatRupiah(netBalance)}
        </div>

        <p className="text-xs text-slate-400 mt-2.5 font-medium">
          {isSurplus
            ? 'Posisi keuangan bersih Anda positif'
            : 'Kewajiban utang Anda lebih besar dari piutang'}
        </p>
      </div>
    </div>
  );
}
