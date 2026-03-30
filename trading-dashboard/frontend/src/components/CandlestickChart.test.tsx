import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandlestickChart, type OHLCVData } from './CandlestickChart';

// Mock lightweight-charts v5 — requires real canvas that JSDOM doesn't provide.
vi.mock('lightweight-charts', () => {
  const mockSeries = {
    setData: vi.fn(),
    applyOptions: vi.fn(),
  };
  const mockPane = {
    setStretchFactor: vi.fn(),
    addSeries: vi.fn(() => mockSeries),
  };
  const mockTimeScale = {
    fitContent: vi.fn(),
    applyOptions: vi.fn(),
  };
  const mockChart = {
    addSeries: vi.fn(() => mockSeries),
    addPane: vi.fn(() => mockPane),
    panes: vi.fn(() => [mockPane]),
    timeScale: vi.fn(() => mockTimeScale),
    applyOptions: vi.fn(),
    remove: vi.fn(),
  };

  return {
    createChart: vi.fn(() => mockChart),
    CandlestickSeries: {},
    LineSeries: {},
    HistogramSeries: {},
    ColorType: { Solid: 'solid' },
  };
});

beforeAll(() => {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '',
  } as unknown as CSSStyleDeclaration);
});

const SAMPLE_DATA: OHLCVData[] = Array.from({ length: 25 }, (_, i) => ({
  date: `2025-01-${String(i + 1).padStart(2, '0')}`,
  open: 100 + i,
  high: 105 + i,
  low: 95 + i,
  close: 102 + i,
  volume: 1000000,
  ma150: i >= 149 ? 100 + i : null,
}));

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

  it('renders MA20 toggle button with aria-pressed true by default', () => {
    render(<CandlestickChart data={SAMPLE_DATA} />);
    const btn = screen.getByTestId('toggle-ma20');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders Volume toggle button with aria-pressed true by default', () => {
    render(<CandlestickChart data={SAMPLE_DATA} />);
    const btn = screen.getByTestId('toggle-volume');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles MA20 aria-pressed when clicked', () => {
    render(<CandlestickChart data={SAMPLE_DATA} />);
    const btn = screen.getByTestId('toggle-ma20');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles Volume aria-pressed when clicked', () => {
    render(<CandlestickChart data={SAMPLE_DATA} />);
    const btn = screen.getByTestId('toggle-volume');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});
