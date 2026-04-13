import React, { useState } from 'react';
import { UploadView } from './components/UploadView';
import { GoogleFetchView } from './components/GoogleFetchView';
import { AppleFetchView } from './components/AppleFetchView';
import { ReviewPreviewer } from './components/ReviewPreviewer';
import { ResultsDashboard } from './components/ResultsDashboard';
import { FileSpreadsheet, PlayCircle, Apple, LayoutDashboard } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('csv');
  const [fetchedData, setFetchedData] = useState(null); // { reviews, droppedCount }
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetState = () => {
    setFetchedData(null);
    setResults(null);
    setError('');
  };

  const handleFetchSuccess = (data) => {
    setFetchedData(data);
    setError('');
  };

  const handleAnalyze = async () => {
    if (fetchedData.reviews.length === 0) {
      setError("No reviews to analyze!");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${BACKEND_URL}/analyze-batch`, {
        reviews: fetchedData.reviews
      });
      setResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error running analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-success/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <header className="w-full max-w-6xl mt-12 mb-8 px-6 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Review Severity Analyzer
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Deep clean, fetch, and classify feedback via LLM seamlessly.
        </p>
      </header>

      <main className="w-full max-w-6xl px-6 flex flex-col gap-8 z-10 pb-20">
        {!fetchedData && !results && (
          <div className="glass-panel p-2 flex flex-wrap gap-2 mx-auto mb-4 bg-surface/50 justify-center">
            <button onClick={() => { setActiveTab('csv'); setError(''); }}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all font-medium ${activeTab === 'csv' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <FileSpreadsheet size={18} /> CSV Upload
            </button>
            <button onClick={() => { setActiveTab('google'); setError(''); }}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all font-medium ${activeTab === 'google' ? 'bg-[#16a34a] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <PlayCircle size={18} /> Google Play Store
            </button>
            <button onClick={() => { setActiveTab('apple'); setError(''); }}
              className={`px-6 py-2 rounded-xl flex items-center gap-2 transition-all font-medium ${activeTab === 'apple' ? 'bg-[#64748b] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Apple size={18} /> Apple App Store
            </button>
          </div>
        )}

        {error && (
          <div className="bg-critical/20 border border-critical text-red-200 px-6 py-4 rounded-xl text-center shadow-lg mx-auto max-w-2xl w-full">
            {error}
          </div>
        )}

        {!fetchedData && !results && (
          <div className="max-w-2xl mx-auto w-full">
            {activeTab === 'csv' && <UploadView onSuccess={handleFetchSuccess} setLoading={setLoading} loading={loading} setError={setError} />}
            {activeTab === 'google' && <GoogleFetchView onSuccess={handleFetchSuccess} setLoading={setLoading} loading={loading} setError={setError} />}
            {activeTab === 'apple' && <AppleFetchView onSuccess={handleFetchSuccess} setLoading={setLoading} loading={loading} setError={setError} />}
          </div>
        )}

        {fetchedData && !results && (
          <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
             <ReviewPreviewer data={fetchedData} onAnalyze={handleAnalyze} loading={loading} onCancel={resetState} />
          </div>
        )}

        {results && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <LayoutDashboard className="text-primary" /> Analysis Results
              </h2>
              <button onClick={resetState} className="px-4 py-2 bg-surface hover:bg-surface/80 border border-white/10 rounded-lg transition-colors text-sm font-medium">
                Start Over
              </button>
            </div>
            <ResultsDashboard data={{ reviews: fetchedData.reviews, droppedCount: fetchedData.droppedCount, classified: results }} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
