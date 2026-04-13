import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export function GoogleFetchView({ onSuccess, setLoading, loading, setError }) {
  const [appId, setAppId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [limitType, setLimitType] = useState('100');
  const [customLimit, setCustomLimit] = useState('100');

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!appId.trim()) return;

    setLoading(true);
    setError('');
    
    let lim = limitType === 'Custom' ? parseInt(customLimit, 10) : parseInt(limitType, 10);
    if (isNaN(lim) || lim <= 0) lim = 100;

    try {
      const response = await axios.post(`${BACKEND_URL}/fetch-app`, {
        app_id: appId,
        from_date: fromDate || null,
        to_date: toDate || null,
        limit: lim,
        source: 'google'
      });
      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while fetching app reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 transition-all duration-300 border-[#16a34a]/30 hover:border-[#16a34a] shadow-lg">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#16a34a]">Google Play Store Fetcher</h2>
      <form onSubmit={handleFetch} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">App Package Name / ID</label>
          <input type="text" value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="e.g. com.rovio.baba" className="w-full bg-surface/80 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#16a34a]" required />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-surface/80 border border-gray-600 rounded-lg px-4 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-surface/80 border border-gray-600 rounded-lg px-4 py-2 text-white" />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-300 mb-1">Review Limit</label>
           <select value={limitType} onChange={(e) => setLimitType(e.target.value)} className="w-full bg-surface/80 border border-gray-600 rounded-lg px-4 py-2 text-white mb-2">
             <option value="50">50</option>
             <option value="100">100</option>
             <option value="500">500</option>
             <option value="1000">1000</option>
             <option value="Custom">Custom input</option>
           </select>
           {limitType === 'Custom' && (
              <input type="number" min="1" value={customLimit} onChange={(e) => setCustomLimit(e.target.value)} placeholder="Enter custom amount" className="w-full bg-surface/80 border border-gray-600 rounded-lg px-4 py-2 text-white" />
           )}
        </div>

        <button type="submit" disabled={loading} className="mt-4 w-full bg-[#16a34a] hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          {loading ? 'Fetching...' : 'Fetch Reviews'}
        </button>
      </form>
    </div>
  );
}
