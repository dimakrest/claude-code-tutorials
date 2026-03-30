import type { OHLCVData } from '@/components/CandlestickChart';

/**
 * Calculates the 20-day simple moving average of closing prices.
 * Returns null for the first 19 entries (insufficient history).
 */
export function calculateMA20(data: OHLCVData[]): (number | null)[] {
  return data.map((_, i) => {
    if (i < 19) return null;
    const slice = data.slice(i - 19, i + 1);
    const sum = slice.reduce((acc, d) => acc + d.close, 0);
    return sum / 20;
  });
}
