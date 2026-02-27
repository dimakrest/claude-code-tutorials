import { CandlestickChart } from '@/components/CandlestickChart';
import mockData from '@/data/mock-stock-data.json';

/**
 * Analysis page — renders the candlestick chart with mock stock data.
 */
const AnalysisPage = () => {
  return (
    <div className="p-6 page-transition" data-testid="analysis-page">
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-6">
        Analysis
      </h1>
      <div className="rounded-lg border border-subtle bg-bg-secondary p-4 h-[600px]">
        <CandlestickChart data={mockData} />
      </div>
    </div>
  );
};

export default AnalysisPage;
