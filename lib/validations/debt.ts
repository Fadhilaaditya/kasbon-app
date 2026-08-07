import { z } from 'zod';

export type DebtType = 'owed_to_me' | 'i_owe';

export interface Debt {
  id: string;
  user_id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note: string | null;
  due_date: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
}

export const debtSchema = z.object({
  type: z.enum(['owed_to_me', 'i_owe']),
  counterpart_name: z
    .string()
    .trim()
    .min(1, 'Nama orang wajib diisi')
    .max(100, 'Nama orang maksimal 100 karakter'),
  amount: z
    .number()
    .int('Jumlah harus angka utang bulat (Rupiah utuh)')
    .positive('Jumlah utang harus lebih besar dari 0'),
  due_date: z
    .string()
    .nullable()
    .optional(),
  note: z
    .string()
    .max(200, 'Catatan maksimal 200 karakter')
    .nullable()
    .optional(),
});

export type DebtInput = z.infer<typeof debtSchema>;

export const debtUpdateSchema = debtSchema.partial().extend({
  is_settled: z.boolean().optional(),
});

export type DebtUpdateInput = z.infer<typeof debtUpdateSchema>;
