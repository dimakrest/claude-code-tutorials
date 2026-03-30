import { useState, useEffect } from 'react';
import { CandlestickChart } from '@/components/CandlestickChart';
import mockData from '@/data/mock-stock-data.json';

const TICKER = 'NVDA';

/**
 * Analysis page — renders the candlestick chart with real NVDA 2025 data.
 */
const AnalysisPage = () => {
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    fetch('/student.json')
      .then((r) => r.json())
      .then((s) => { if (s.name) setStudentName(s.name); })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 page-transition" data-testid="analysis-page">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          Analysis
        </h1>
        {studentName && (
          <p className="text-sm text-text-secondary mt-1" data-testid="student-greeting">
            Welcome, {studentName}
          </p>
        )}
      </div>
      <div className="rounded-lg border border-subtle bg-bg-secondary p-4 h-[600px]">
        <CandlestickChart data={mockData} ticker={TICKER} />
      </div>
    </div>
  );
};

export default AnalysisPage;
