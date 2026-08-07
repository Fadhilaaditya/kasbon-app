'use client';

import React, { useState, useEffect } from 'react';
import { Debt, DebtType } from '@/lib/validations/debt';
import { formatRupiah, parseRupiahInput } from '@/lib/utils/currency';
import { X, PlusCircle, Edit3, Loader2, AlertCircle } from 'lucide-react';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  debtToEdit?: Debt | null;
}

export default function DebtModal({
  isOpen,
  onClose,
  onSuccess,
  debtToEdit = null,
}: DebtModalProps) {
  const isEditing = Boolean(debtToEdit);

  const [type, setType] = useState<DebtType>('owed_to_me');
  const [counterpartName, setCounterpartName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (debtToEdit) {
      setType(debtToEdit.type);
      setCounterpartName(debtToEdit.counterpart_name);
      setAmountInput(debtToEdit.amount.toString());
      setDueDate(
        debtToEdit.due_date || new Date().toISOString().split('T')[0]
      );
      setNote(debtToEdit.note || '');
    } else {
      // Default reset
      setType('owed_to_me');
      setCounterpartName('');
      setAmountInput('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setError(null);
  }, [debtToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = parseRupiahInput(rawVal);
    setAmountInput(num > 0 ? num.toString() : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!counterpartName.trim()) {
      setError('Nama orang wajib diisi.');
      return;
    }

    const numericAmount = parseInt(amountInput, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Jumlah uang harus lebih besar dari 0.');
      return;
    }

    if (note.length > 200) {
      setError('Catatan tidak boleh melebihi 200 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEditing
        ? `/api/debts/${debtToEdit!.id}`
        : '/api/debts';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          counterpart_name: counterpartName.trim(),
          amount: numericAmount,
          due_date: dueDate || null,
          note: note.trim() || null,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || 'Gagal menyimpan data.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  const currentNumeric = parseInt(amountInput, 10) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            {isEditing ? (
              <Edit3 className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isEditing ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEditing
                ? 'Perbarui rincian transaksi utang/piutang ini'
                : 'Isi formulir di bawah untuk menambahkan catatan baru'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipe (Radio Toggle) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all ${
                  type === 'owed_to_me'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="owed_to_me"
                  checked={type === 'owed_to_me'}
                  onChange={() => setType('owed_to_me')}
                  className="sr-only"
                />
                <span className="text-sm">Saya Dihutang</span>
                <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                  (Orang lain utang ke saya)
                </span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all ${
                  type === 'i_owe'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-400 font-bold shadow-lg shadow-rose-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="i_owe"
                  checked={type === 'i_owe'}
                  onChange={() => setType('i_owe')}
                  className="sr-only"
                />
                <span className="text-sm">Saya Hutang</span>
                <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                  (Saya utang ke orang lain)
                </span>
              </label>
            </div>
          </div>

          {/* Nama Orang */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nama Orang <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={counterpartName}
              onChange={(e) => setCounterpartName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-slate-600 transition-colors"
            />
          </div>

          {/* Jumlah (Rupiah) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Jumlah (Rupiah) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={amountInput}
              onChange={handleAmountChange}
              placeholder="Contoh: 150000"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-slate-600 transition-colors"
            />
            {currentNumeric > 0 && (
              <p className="text-xs text-emerald-400 mt-1.5 font-semibold">
                Preview: {formatRupiah(currentNumeric)}
              </p>
            )}
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-white text-sm transition-colors"
            />
          </div>

          {/* Catatan (Optional) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Catatan (Opsional)
              </label>
              <span className="text-[10px] text-slate-500">
                {note.length}/200 char
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Patungan makan siang di warung kopi"
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-slate-600 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{isEditing ? 'Simpan Perubahan' : 'Catat Transaksi'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
