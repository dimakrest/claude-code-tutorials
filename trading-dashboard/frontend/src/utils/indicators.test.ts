import { describe, it, expect } from 'vitest';
import { calculateMA20 } from './indicators';
import type { OHLCVData } from '@/components/CandlestickChart';

function makeData(closes: number[]): OHLCVData[] {
  return closes.map((close, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    open: close,
    high: close,
    low: close,
    close,
    volume: 1000000,
    ma150: null,
  }));
}

describe('calculateMA20', () => {
  it('returns null for the first 19 entries', () => {
    const data = makeData(Array(25).fill(100));
    const result = calculateMA20(data);
    for (let i = 0; i < 19; i++) {
      expect(result[i]).toBeNull();
    }
  });

  it('returns a value starting at index 19', () => {
    const data = makeData(Array(25).fill(100));
    const result = calculateMA20(data);
    expect(result[19]).not.toBeNull();
  });

  it('calculates the correct average at index 19', () => {
    // First 20 values: 1, 2, 3, ..., 20 — average = 10.5
    const closes = Array.from({ length: 20 }, (_, i) => i + 1);
    const data = makeData(closes);
    const result = calculateMA20(data);
    expect(result[19]).toBeCloseTo(10.5);
  });

  it('slides the window correctly', () => {
    // 21 values: 1..20 then 21
    // MA20 at index 20 should be average of 2..21 = 11.5
    const closes = Array.from({ length: 21 }, (_, i) => i + 1);
    const data = makeData(closes);
    const result = calculateMA20(data);
    expect(result[20]).toBeCloseTo(11.5);
  });
});
