import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EnvironmentProvider } from './contexts/EnvironmentContext';
import { PageBackground } from './components/layouts/PageBackground';
import AnalysisPage from './pages/AnalysisPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <EnvironmentProvider>
          <div className="dark overflow-x-hidden">
            <PageBackground />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<AnalysisPage />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </EnvironmentProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
