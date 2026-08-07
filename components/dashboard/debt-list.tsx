'use client';

import React, { useState, useOptimistic, useTransition } from 'react';
import { Debt, DebtType } from '@/lib/validations/debt';
import { formatRupiah } from '@/lib/utils/currency';
import { formatRelativeTime } from '@/lib/utils/date';
import {
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Users,
  Calendar,
  FileText,
  Loader2,
  ArrowUpDown,
  Filter,
  AlertTriangle,
} from 'lucide-react';

import { useToast } from '@/components/ui/toast';

interface DebtListProps {
  debts: Debt[];
  isLoading: boolean;
  onRefresh: (silent?: boolean) => void;
  onEdit: (debt: Debt) => void;
}

export default function DebtList({
  debts,
  isLoading,
  onRefresh,
  onEdit,
}: DebtListProps) {
  const { showToast } = useToast();

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsettled' | 'settled'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DebtType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [groupByPerson, setGroupByPerson] = useState(false);

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Optimistic UI state for instant zero-latency UI feedback
  const [optimisticDebts, setOptimisticDebts] = useOptimistic(
    debts,
    (state, updateAction: { type: 'toggle' | 'delete'; id: string }) => {
      if (updateAction.type === 'toggle') {
        return state.map((item) =>
          item.id === updateAction.id
            ? {
                ...item,
                settled_at: item.settled_at ? null : new Date().toISOString(),
              }
            : item
        );
      }
      if (updateAction.type === 'delete') {
        return state.filter((item) => item.id !== updateAction.id);
      }
      return state;
    }
  );

  // Toggle status (Lunas / Belum Lunas) with Optimistic UI & Toast
  const handleToggleStatus = async (debt: Debt) => {
    const isCurrentlySettled = Boolean(debt.settled_at);

    // Instant optimistic update
    startTransition(() => {
      setOptimisticDebts({ type: 'toggle', id: debt.id });
    });

    const newStatusText = !isCurrentlySettled ? 'Lunas' : 'Belum Lunas';
    showToast(`Status pelunasan ${debt.counterpart_name} diubah ke ${newStatusText}`, 'success');

    try {
      const res = await fetch(`/api/debts/${debt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_settled: !isCurrentlySettled }),
      });

      if (res.ok) {
        onRefresh(true);
      } else {
        const data = await res.json();
        showToast(data.error || 'Gagal mengubah status pelunasan.', 'error');
        onRefresh(false); // Rollback
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      onRefresh(false); // Rollback
    }
  };

  // Delete transaction with Optimistic UI & Toast
  const handleDelete = async (id: string) => {
    setActionLoadingId(id);

    // Instant optimistic delete
    startTransition(() => {
      setOptimisticDebts({ type: 'delete', id });
    });

    showToast('Catatan transaksi berhasil dihapus', 'info');

    try {
      const res = await fetch(`/api/debts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onRefresh(true);
      } else {
        const data = await res.json();
        showToast(data.error || 'Gagal menghapus transaksi.', 'error');
        onRefresh(false);
      }
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      onRefresh(false);
    } finally {
      setActionLoadingId(null);
      setDeletingId(null);
    }
  };

  // Filter & Sort Logic using optimisticDebts
  const filteredDebts = optimisticDebts
    .filter((d) => {
      if (statusFilter === 'unsettled' && d.settled_at !== null) return false;
      if (statusFilter === 'settled' && d.settled_at === null) return false;
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (
        searchQuery.trim() !== '' &&
        !d.counterpart_name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'amount_high') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_low') {
        return a.amount - b.amount;
      }
      // Newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Grouping Logic by Person
  const groupedPersons = React.useMemo(() => {
    if (!groupByPerson) return [];

    const map = new Map<
      string,
      { counterpart_name: string; count: number; totalOwedToMe: number; totalIOwe: number; items: Debt[] }
    >();

    filteredDebts.forEach((debt) => {
      const key = debt.counterpart_name.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          counterpart_name: debt.counterpart_name,
          count: 0,
          totalOwedToMe: 0,
          totalIOwe: 0,
          items: [],
        });
      }
      const group = map.get(key)!;
      group.count += 1;
      group.items.push(debt);
      if (debt.type === 'owed_to_me') {
        group.totalOwedToMe += debt.amount;
      } else {
        group.totalIOwe += debt.amount;
      }
    });

    return Array.from(map.values());
  }, [filteredDebts, groupByPerson]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Filters & Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama orang..."
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'unsettled' | 'settled')}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900">Semua Status</option>
              <option value="unsettled" className="bg-slate-900">Belum Lunas</option>
              <option value="settled" className="bg-slate-900">Lunas</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | DebtType)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900">Semua Tipe</option>
              <option value="owed_to_me" className="bg-slate-900">Saya Dihutang</option>
              <option value="i_owe" className="bg-slate-900">Saya Hutang</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'amount_high' | 'amount_low')}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest" className="bg-slate-900">Terbaru</option>
              <option value="oldest" className="bg-slate-900">Terlama</option>
              <option value="amount_high" className="bg-slate-900">Jumlah Terbesar</option>
              <option value="amount_low" className="bg-slate-900">Jumlah Terkecil</option>
            </select>
          </div>

          {/* Grouping Toggle Button */}
          <button
            onClick={() => setGroupByPerson(!groupByPerson)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              groupByPerson
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
            title="Kelompokkan berdasarkan nama orang"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Grup Orang</span>
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-4 w-36 bg-slate-800 rounded" />
                <div className="h-3 w-24 bg-slate-800/60 rounded" />
              </div>
              <div className="h-6 w-28 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredDebts.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
          <div className="p-4 bg-slate-800/40 rounded-full border border-slate-800 mb-3">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>
          <h4 className="text-base font-semibold text-slate-300">Belum Ada Catatan Transaksi</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Tidak ada transaksi yang cocok dengan filter pencarian Anda.'
              : 'Mulai dengan menekan tombol "+ Catat Baru" untuk menambahkan utang atau piutang.'}
          </p>
        </div>
      ) : groupByPerson ? (
        /* Grouped View */
        <div className="space-y-4">
          {groupedPersons.map((group, idx) => {
            const netGroup = group.totalOwedToMe - group.totalIOwe;
            return (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{group.counterpart_name}</h4>
                      <span className="text-[11px] text-slate-400">
                        {group.count} transaksi dicatat
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Total Net</span>
                    <span
                      className={`text-sm font-extrabold ${
                        netGroup >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {netGroup >= 0 ? `+${formatRupiah(netGroup)}` : formatRupiah(netGroup)}
                    </span>
                  </div>
                </div>

                {/* Sub items inside group */}
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <DebtItemRow
                      key={item.id}
                      debt={item}
                      actionLoadingId={actionLoadingId}
                      onToggleStatus={handleToggleStatus}
                      onEdit={onEdit}
                      onDeleteClick={(id) => setDeletingId(id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat List View */
        <div className="space-y-3">
          {filteredDebts.map((debt) => (
            <DebtItemRow
              key={debt.id}
              debt={debt}
              actionLoadingId={actionLoadingId}
              onToggleStatus={handleToggleStatus}
              onEdit={onEdit}
              onDeleteClick={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Hapus Catatan Ini?</h3>
            <p className="text-xs text-slate-400 mb-5">
              Tindakan ini tidak dapat dibatalkan. Data transaksi akan dihapus secara permanen dari database.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={actionLoadingId === deletingId}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-rose-600/25 flex items-center justify-center gap-1.5"
              >
                {actionLoadingId === deletingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Individual Debt Item Component */
function DebtItemRow({
  debt,
  actionLoadingId,
  onToggleStatus,
  onEdit,
  onDeleteClick,
}: {
  debt: Debt;
  actionLoadingId: string | null;
  onToggleStatus: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDeleteClick: (id: string) => void;
}) {
  const isSettled = Boolean(debt.settled_at);
  const isOwedToMe = debt.type === 'owed_to_me';
  const isLoading = actionLoadingId === debt.id;

  return (
    <div className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 group">
      {/* Left Info */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
            isOwedToMe
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {isOwedToMe ? '+' : '-'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm sm:text-base truncate">
              {debt.counterpart_name}
            </span>

            {/* Type Badge */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                isOwedToMe
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {isOwedToMe ? 'Saya Dihutang' : 'Saya Hutang'}
            </span>

            {/* Status Badge */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                isSettled
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isSettled ? 'Lunas' : 'Belum Lunas'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-500" />
              {formatRelativeTime(debt.due_date || debt.created_at)}
            </span>

            {debt.note && (
              <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={debt.note}>
                &bull; {debt.note}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions & Amount */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 shrink-0">
        <div className="text-left sm:text-right shrink-0">
          <div
            className={`text-sm sm:text-lg font-extrabold tracking-tight whitespace-nowrap ${
              isOwedToMe ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatRupiah(debt.amount)}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle Lunas Button */}
          <button
            onClick={() => onToggleStatus(debt)}
            disabled={isLoading}
            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              isSettled
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
            title={isSettled ? 'Tandai sebagai belum lunas' : 'Tandai sebagai lunas'}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : isSettled ? (
              <>
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Batal Lunas</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Tandai Lunas</span>
              </>
            )}
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(debt)}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Edit transaksi"
          >
            <Edit2 className="w-4 h-4 shrink-0" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDeleteClick(debt.id)}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Hapus transaksi"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
