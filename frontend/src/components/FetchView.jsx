import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

export function FetchView({ onSuccess, setLoading, loading, setError }) {
  const [appId, setAppId] = useState('');
  const [timeRange, setTimeRange] = useState('month');

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!appId.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BACKEND_URL}/analyze-app`, {
        app_id: appId,
        time_range: timeRange
      });
      onSuccess(response.data.results);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while fetching app reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 transition-all duration-300 hover:shadow-success/20">
      <form onSubmit={handleFetch} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">App Package Name / ID</label>
          <input 
            type="text" 
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="e.g. com.whatsapp"
            className="w-full bg-surface border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            required
          />
          <p className="text-xs text-gray-400 mt-2">Find the ID in the Google Play Store URL parameter (id=...)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full bg-surface border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-2 w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:bg-primary/50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          {loading ? 'Fetching & Analyzing...' : 'Analyze App'}
        </button>
      </form>
    </div>
  );
}
