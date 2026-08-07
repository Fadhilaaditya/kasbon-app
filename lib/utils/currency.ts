/**
 * Format numeric value to Indonesian Rupiah standard (e.g. Rp 1.234.000)
 */
export function formatRupiah(amount: number | bigint): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  if (isNaN(num)) return 'Rp 0';
  
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(num);

  return `Rp ${formatted}`;
}

/**
 * Clean Rupiah input string to number
 */
export function parseRupiahInput(input: string): number {
  const cleanNumber = input.replace(/[^0-9]/g, '');
  return cleanNumber ? parseInt(cleanNumber, 10) : 0;
}
