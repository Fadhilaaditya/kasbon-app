'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/ui/navbar';
import SummaryCards from '@/components/dashboard/summary-cards';
import DebtChart from '@/components/dashboard/debt-chart';
import QuickInsights from '@/components/dashboard/quick-insights';
import DebtList from '@/components/dashboard/debt-list';
import DebtModal from '@/components/dashboard/debt-modal';
import { Debt } from '@/lib/validations/debt';
import { createClient } from '@/lib/supabase/client';
import { PlusCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);

  // Fetch debts from API
  const fetchDebts = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch('/api/debts');
      const json = await res.json();
      if (res.ok && json.data) {
        setDebts(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch debts:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Fetch user info
  useEffect(() => {
    const getAuthUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };
    getAuthUser();
    fetchDebts();
  }, [fetchDebts]);

  // Aggregate totals for unsettled debts
  const totalOwedToMe = debts
    .filter((d) => d.type === 'owed_to_me' && d.settled_at === null)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIOwe = debts
    .filter((d) => d.type === 'i_owe' && d.settled_at === null)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAddModal = () => {
    setDebtToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (debt: Debt) => {
    setDebtToEdit(debt);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 relative">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <Navbar userEmail={userEmail} />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 relative z-10">
        {/* Header Action Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Dashboard Catatan Kasbon
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kelola utang-piutang pribadi Anda dengan rapi dan terorganisir.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDebts(false)}
              disabled={isLoading}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-400 hover:text-slate-200 transition-colors shadow-md"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 text-sm transition-all duration-200"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              <span>+ Catat Baru</span>
            </button>
          </div>
        </div>

        {/* 3 Summary Cards */}
        <SummaryCards
          totalOwedToMe={totalOwedToMe}
          totalIOwe={totalIOwe}
          isLoading={isLoading}
        />

        {/* Middle Section: 2-Column Grid (Chart + Quick Insights) */}
        {debts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <DebtChart totalOwedToMe={totalOwedToMe} totalIOwe={totalIOwe} />
            </div>
            <div className="lg:col-span-1">
              <QuickInsights debts={debts} />
            </div>
          </div>
        )}

        {/* Interactive Debt List */}
        <DebtList
          debts={debts}
          isLoading={isLoading}
          onRefresh={fetchDebts}
          onEdit={handleOpenEditModal}
        />

        {/* Create / Edit Form Modal */}
        <DebtModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchDebts}
          debtToEdit={debtToEdit}
        />
      </main>
    </div>
  );
}
