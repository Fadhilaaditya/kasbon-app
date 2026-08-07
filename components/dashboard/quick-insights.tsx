'use client';

import React from 'react';
import { Debt } from '@/lib/validations/debt';
import { formatRupiah } from '@/lib/utils/currency';
import { CheckCircle2, AlertCircle, Award, ShieldCheck } from 'lucide-react';

interface QuickInsightsProps {
  debts: Debt[];
}

export default function QuickInsights({ debts }: QuickInsightsProps) {
  const totalCount = debts.length;
  const settledCount = debts.filter((d) => d.settled_at !== null).length;
  const unsettledCount = totalCount - settledCount;
  const completionPercentage =
    totalCount > 0 ? Math.round((settledCount / totalCount) * 100) : 0;

  // Calculate Top Counterparts by volume
  const topCounterparts = React.useMemo(() => {
    const map = new Map<string, number>();
    debts.forEach((d) => {
      const name = d.counterpart_name.trim();
      map.set(name, (map.get(name) || 0) + d.amount);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [debts]);

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl mb-6 shadow-2xl flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Ringkasan & Aktivitas
              </h3>
              <p className="text-[11px] text-slate-400">
                Statistik tingkat pelunasan & kolega utama
              </p>
            </div>
          </div>
        </div>

        {/* Completion Rate Progress */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tingkat Pelunasan
            </span>
            <span className="font-extrabold text-emerald-400">
              {completionPercentage}% ({settledCount}/{totalCount})
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-md shadow-emerald-500/20"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {settledCount} Lunas
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <AlertCircle className="w-3 h-3" /> {unsettledCount} Belum Lunas
            </span>
          </div>
        </div>

        {/* Top Counterparts */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            Kolega Terbesar (Top Volume)
          </h4>

          {topCounterparts.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">Belum ada data transaksi.</p>
          ) : (
            <div className="space-y-2">
              {topCounterparts.map(([name, amount], idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{name}</span>
                  </div>
                  <span className="font-bold text-emerald-400">
                    {formatRupiah(amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helpful Hint Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span>Tips: Tandai &quot;Lunas&quot; untuk memperbarui rasio ini secara otomatis.</span>
      </div>
    </div>
  );
}
