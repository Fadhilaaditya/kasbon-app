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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-pulse"
          >
            <div className="h-4 w-32 bg-slate-800 rounded mb-3" />
            <div className="h-8 w-44 bg-slate-800 rounded mb-2" />
            <div className="h-3 w-24 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Total Dihutang ke Saya */}
      <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-emerald-500/30 transition-all duration-300 group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ArrowDownLeft className="w-20 h-20 text-emerald-400" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Dihutang ke Saya
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight mt-1">
          {formatRupiah(totalOwedToMe)}
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 inline" />
          Uang yang belum dibayar orang lain ke Anda
        </p>
      </div>

      {/* Card 2: Total Saya Hutang */}
      <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-lg hover:border-rose-500/30 transition-all duration-300 group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ArrowUpRight className="w-20 h-20 text-rose-400" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Saya Hutang
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight mt-1">
          {formatRupiah(totalIOwe)}
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5 text-rose-400 inline" />
          Kewajiban pembayaran yang harus Anda bayar
        </p>
      </div>

      {/* Card 3: Net (Selisih) */}
      <div
        className={`relative overflow-hidden bg-slate-900/80 backdrop-blur-md border p-5 rounded-2xl shadow-lg transition-all duration-300 ${
          isSurplus
            ? 'border-emerald-500/30 hover:border-emerald-500/50'
            : 'border-rose-500/30 hover:border-rose-500/50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isSurplus
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Balance
            </span>
          </div>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
              isSurplus
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {isSurplus ? 'Surplus' : 'Defisit'}
          </span>
        </div>

        <div
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${
            isSurplus ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isSurplus ? `+${formatRupiah(netBalance)}` : formatRupiah(netBalance)}
        </div>

        <p className="text-xs text-slate-400 mt-2">
          {isSurplus
            ? 'Posisi keuangan bersih Anda positif'
            : 'Kewajiban utang Anda lebih besar dari piutang'}
        </p>
      </div>
    </div>
  );
}
