import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries, type IChartApi, type ISeriesApi, ColorType } from 'lightweight-charts';
import { calculateMA20 } from '@/utils/indicators';

/** Shape of each data point from mock-stock-data.json */
export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma150: number | null;
}

interface CandlestickChartProps {
  data: OHLCVData[];
  ticker?: string;
}

/**
 * Two-pane financial chart:
 *   Top pane  — candlesticks + MA150 + MA20 line overlays
 *   Bottom pane — volume histogram
 *
 * Uses CSS variables from index.css for all colors (no hardcoded hex).
 */
export const CandlestickChart = ({ data, ticker }: CandlestickChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [ma20Visible, setMa20Visible] = useState(true);
  const [volumeVisible, setVolumeVisible] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Read CSS variables from the document
    const styles = getComputedStyle(document.documentElement);
    const bgPrimary = styles.getPropertyValue('--bg-primary').trim();
    const bgSecondary = styles.getPropertyValue('--bg-secondary').trim();
    const textSecondary = styles.getPropertyValue('--text-secondary').trim();
    const textMuted = styles.getPropertyValue('--text-muted').trim();
    const borderSubtle = styles.getPropertyValue('--border-subtle').trim();
    const candleBullish = styles.getPropertyValue('--candle-bullish').trim();
    const candleBearish = styles.getPropertyValue('--candle-bearish').trim();
    const accentPrimary = styles.getPropertyValue('--accent-primary').trim();
    const accentSecondary = styles.getPropertyValue('--accent-secondary').trim();

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: bgPrimary || '#0a0b0f' },
        textColor: textSecondary || '#94a3b8',
        fontFamily: "'Inter', sans-serif",
      },
      grid: {
        vertLines: { color: borderSubtle || 'rgba(255,255,255,0.06)' },
        horzLines: { color: borderSubtle || 'rgba(255,255,255,0.06)' },
      },
      crosshair: {
        mode: 0, // Normal crosshair
        vertLine: {
          color: textMuted || '#64748b',
          width: 1,
          style: 2, // Dashed
          labelBackgroundColor: bgSecondary || '#12141a',
        },
        horzLine: {
          color: textMuted || '#64748b',
          width: 1,
          style: 2,
          labelBackgroundColor: bgSecondary || '#12141a',
        },
      },
      timeScale: {
        borderColor: borderSubtle || 'rgba(255,255,255,0.06)',
        timeVisible: false,
      },
      rightPriceScale: {
        borderColor: borderSubtle || 'rgba(255,255,255,0.06)',
      },
    });

    chartRef.current = chart;

    // Main pane gets 70% of height
    chart.panes()[0].setStretchFactor(0.7);

    // -- Candlestick series (main pane) --
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: candleBullish || '#10b981',
      downColor: candleBearish || '#ef4444',
      borderUpColor: candleBullish || '#10b981',
      borderDownColor: candleBearish || '#ef4444',
      wickUpColor: candleBullish || '#10b981',
      wickDownColor: candleBearish || '#ef4444',
    });

    const candleData = data.map((d) => ({
      time: d.date as string,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    candleSeries.setData(candleData);
    candleSeriesRef.current = candleSeries;

    // -- MA150 line overlay (main pane) --
    const maSeries = chart.addSeries(LineSeries, {
      color: accentPrimary || '#6366f1',
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const maData = data
      .filter((d) => d.ma150 != null)
      .map((d) => ({
        time: d.date as string,
        value: d.ma150,
      }));
    maSeries.setData(maData);
    maSeriesRef.current = maSeries;

    // -- MA20 line overlay (main pane) --
    const ma20Values = calculateMA20(data);
    const ma20Series = chart.addSeries(LineSeries, {
      color: accentSecondary || '#f59e0b',
      lineWidth: 2,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    });

    const ma20Data = data
      .map((d, i) => ({ time: d.date as string, value: ma20Values[i] }))
      .filter((d): d is { time: string; value: number } => d.value != null);
    ma20Series.setData(ma20Data);
    ma20SeriesRef.current = ma20Series;

    // -- Volume histogram (separate pane, 30% height) --
    const volumePane = chart.addPane();
    volumePane.setStretchFactor(0.3);

    const volumeSeries = volumePane.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
    });

    const volumeData = data.map((d) => ({
      time: d.date as string,
      value: d.volume,
      color:
        d.close >= d.open
          ? (candleBullish || '#10b981') + '80' // 50% opacity
          : (candleBearish || '#ef4444') + '80',
    }));
    volumeSeries.setData(volumeData);
    volumeSeriesRef.current = volumeSeries;

    // Fit content initially
    chart.timeScale().fitContent();

    // -- Resize handling --
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      ma20SeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [data]);

  const handleToggleMa20 = () => {
    const next = !ma20Visible;
    setMa20Visible(next);
    ma20SeriesRef.current?.applyOptions({ visible: next });
  };

  const handleToggleVolume = () => {
    const next = !volumeVisible;
    setVolumeVisible(next);
    volumeSeriesRef.current?.applyOptions({ visible: next });
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Legend + toggle controls */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-4">
        {ticker && (
          <span className="font-mono font-bold text-sm text-text-primary pointer-events-none">
            {ticker}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-text-secondary pointer-events-none">
          <span className="inline-block w-4 h-0.5 bg-[var(--accent-primary)]" />
          MA 150
        </span>
        <button
          onClick={handleToggleMa20}
          aria-pressed={ma20Visible}
          data-testid="toggle-ma20"
          className={`flex items-center gap-1.5 text-xs transition-opacity ${ma20Visible ? 'opacity-100' : 'opacity-40'}`}
        >
          <span className="inline-block w-4 h-0.5 bg-[var(--accent-secondary)]" />
          <span className="text-text-secondary">MA 20</span>
        </button>
        <button
          onClick={handleToggleVolume}
          aria-pressed={volumeVisible}
          data-testid="toggle-volume"
          className={`text-xs text-text-secondary transition-opacity ${volumeVisible ? 'opacity-100' : 'opacity-40'}`}
        >
          Volume
        </button>
      </div>
      <div
        ref={containerRef}
        data-testid="candlestick-chart"
        className="w-full h-full"
      />
    </div>
  );
};
