import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnalysisPage from './AnalysisPage';

// Mock lightweight-charts (same stub as CandlestickChart tests)
vi.mock('lightweight-charts', () => {
  const mockSeries = {
    setData: vi.fn(),
    applyOptions: vi.fn(),
  };
  const mockPriceScale = { applyOptions: vi.fn() };
  const mockTimeScale = { fitContent: vi.fn(), applyOptions: vi.fn() };
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

describe('AnalysisPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <AnalysisPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId('analysis-page')).toBeInTheDocument();
  });

  it('displays the Analysis heading', () => {
    render(
      <MemoryRouter>
        <AnalysisPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });
});
