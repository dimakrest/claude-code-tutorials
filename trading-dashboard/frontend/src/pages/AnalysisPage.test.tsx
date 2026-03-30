import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnalysisPage from './AnalysisPage';

// Mock lightweight-charts v5 (same stub as CandlestickChart tests)
vi.mock('lightweight-charts', () => {
  const mockSeries = {
    setData: vi.fn(),
    applyOptions: vi.fn(),
  };
  const mockPane = {
    setStretchFactor: vi.fn(),
    addSeries: vi.fn(() => mockSeries),
  };
  const mockTimeScale = { fitContent: vi.fn(), applyOptions: vi.fn() };
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
