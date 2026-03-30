import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandlestickChart, type OHLCVData } from './CandlestickChart';

// Mock lightweight-charts — it requires a real DOM with canvas support
// that JSDOM doesn't provide, so we stub the entire module.
vi.mock('lightweight-charts', () => {
  const mockSeries = {
    setData: vi.fn(),
    applyOptions: vi.fn(),
  };
  const mockPriceScale = {
    applyOptions: vi.fn(),
  };
  const mockTimeScale = {
    fitContent: vi.fn(),
    applyOptions: vi.fn(),
  };
  const mockChart = {
    addCandlestickSeries: vi.fn(() => mockSeries),
    addLineSeries: vi.fn(() => mockSeries),
    addHistogramSeries: vi.fn(() => mockSeries),
    priceScale: vi.fn(() => mockPriceScale),
    timeScale: vi.fn(() => mockTimeScale),
    applyOptions: vi.fn(),
    remove: vi.fn(),
  };

  return {
    createChart: vi.fn(() => mockChart),
    ColorType: { Solid: 'solid' },
  };
});

// Stub getComputedStyle to return CSS variable values
beforeAll(() => {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '',
  } as unknown as CSSStyleDeclaration);
});

const SAMPLE_DATA: OHLCVData[] = [
  {
    date: '2025-06-02',
    open: 195.54,
    high: 195.79,
    low: 195.29,
    close: 195.5,
    volume: 45305275,
    ma150: 194.83,
  },
  {
    date: '2025-06-03',
    open: 195.26,
    high: 195.47,
    low: 194.07,
    close: 194.47,
    volume: 43644226,
    ma150: 194.94,
  },
];

describe('CandlestickChart', () => {
  it('renders the chart container', () => {
    render(<CandlestickChart data={SAMPLE_DATA} />);
    expect(screen.getByTestId('candlestick-chart')).toBeInTheDocument();
  });

  it('accepts data prop without errors', () => {
    expect(() => render(<CandlestickChart data={SAMPLE_DATA} />)).not.toThrow();
  });

  it('renders with empty data without crashing', () => {
    expect(() => render(<CandlestickChart data={[]} />)).not.toThrow();
  });
});
