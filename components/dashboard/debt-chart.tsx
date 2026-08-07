'use client';

import React from 'react';
import { formatRupiah } from '@/lib/utils/currency';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface DebtChartProps {
  totalOwedToMe: number;
  totalIOwe: number;
}

export default function DebtChart({ totalOwedToMe, totalIOwe }: DebtChartProps) {
  const maxVal = Math.max(totalOwedToMe, totalIOwe, 1);
  
  // Calculate vertical height percentages (min 15% for visual visibility if 0)
  const heightOwed = totalOwedToMe > 0 ? Math.round((totalOwedToMe / maxVal) * 100) : 10;
  const heightOwe = totalIOwe > 0 ? Math.round((totalIOwe / maxVal) * 100) : 10;

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Grafik Batang Perbandingan
            </h3>
            <p className="text-[11px] text-slate-400">
              Perbandingan nominal total dihutang ke saya vs saya hutang
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3 h-3 rounded-md bg-gradient-to-t from-emerald-500 to-teal-400 inline-block shadow-sm shadow-emerald-500/50" />
            <span>Dihutang ke Saya</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-3 h-3 rounded-md bg-gradient-to-t from-rose-500 to-pink-400 inline-block shadow-sm shadow-rose-500/50" />
            <span>Saya Hutang</span>
          </div>
        </div>
      </div>

      {/* Vertical Column Bar Chart Area */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="h-56 sm:h-64 flex items-end justify-center gap-12 sm:gap-24 relative pt-8 border-b border-slate-800">
          
          {/* Grid Background Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-dashed border-slate-700 w-full" />
            <div className="border-b border-dashed border-slate-700 w-full" />
            <div className="border-b border-dashed border-slate-700 w-full" />
            <div className="border-b border-dashed border-slate-700 w-full" />
          </div>

          {/* Bar 1: Dihutang ke Saya (Vertical Column) */}
          <div className="flex flex-col items-center h-full justify-end group z-10 w-24 sm:w-32">
            {/* Value Label on Top */}
            <div className="mb-2 text-center animate-in fade-in duration-300">
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl shadow-md block">
                {formatRupiah(totalOwedToMe)}
              </span>
            </div>

            {/* Vertical Bar Column */}
            <div className="w-full bg-slate-900/80 rounded-t-2xl overflow-hidden p-1 flex items-end border-t border-x border-slate-800 h-full">
              <div
                className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-t-xl transition-all duration-700 shadow-lg shadow-emerald-500/20 group-hover:brightness-110"
                style={{ height: `${heightOwed}%` }}
              />
            </div>
          </div>

          {/* Bar 2: Saya Hutang (Vertical Column) */}
          <div className="flex flex-col items-center h-full justify-end group z-10 w-24 sm:w-32">
            {/* Value Label on Top */}
            <div className="mb-2 text-center animate-in fade-in duration-300">
              <span className="text-xs font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl shadow-md block">
                {formatRupiah(totalIOwe)}
              </span>
            </div>

            {/* Vertical Bar Column */}
            <div className="w-full bg-slate-900/80 rounded-t-2xl overflow-hidden p-1 flex items-end border-t border-x border-slate-800 h-full">
              <div
                className="w-full bg-gradient-to-t from-rose-600 via-rose-500 to-pink-400 rounded-t-xl transition-all duration-700 shadow-lg shadow-rose-500/20 group-hover:brightness-110"
                style={{ height: `${heightOwe}%` }}
              />
            </div>
          </div>

        </div>

        {/* X-Axis Category Labels */}
        <div className="flex justify-center gap-12 sm:gap-24 pt-3 text-center">
          <div className="w-24 sm:w-32">
            <span className="text-xs font-bold text-slate-300 block">Dihutang ke Saya</span>
            <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-0.5 mt-0.5 font-medium">
              <TrendingUp className="w-3 h-3" /> Piutang
            </span>
          </div>

          <div className="w-24 sm:w-32">
            <span className="text-xs font-bold text-slate-300 block">Saya Hutang</span>
            <span className="text-[10px] text-rose-400 flex items-center justify-center gap-0.5 mt-0.5 font-medium">
              <TrendingDown className="w-3 h-3" /> Kewajiban
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
