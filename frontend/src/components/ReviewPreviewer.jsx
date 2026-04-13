import React from 'react';
import { Loader2, ArrowRight, X } from 'lucide-react';

export function ReviewPreviewer({ data, onAnalyze, loading, onCancel }) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex justify-between items-center bg-surface/70 p-5 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white">Data Fetched Successfully</h2>
          <p className="text-gray-400 text-sm mt-1">
             Ready for analysis. Filtered out <span className="font-bold text-red-400">{data.droppedCount}</span> irrelevant/generic reviews.
          </p>
        </div>
        <div className="flex gap-3 items-center text-center">
             <div className="bg-primary/20 text-primary px-5 py-3 rounded-xl border border-primary/20">
                <span className="block text-2xl font-bold">{data.reviews.length}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">to analyze</span>
             </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto border border-white/10 rounded-xl relative bg-surface/30">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#151e30] border-b border-white/10 uppercase text-xs text-gray-400 sticky top-0 backdrop-blur-md">
             <tr>
               <th className="px-4 py-4 font-semibold w-16">#</th>
               <th className="px-4 py-4 font-semibold w-32">Date</th>
               <th className="px-4 py-4 font-semibold">Content Preview</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.reviews.map((r, i) => (
               <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{r.date || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-300 line-clamp-2 mt-1">{r.content}</td>
               </tr>
            ))}
          </tbody>
        </table>
        {data.reviews.length === 0 && (
          <div className="p-12 text-center text-gray-500 font-medium">No valid meaningful data acquired to preview.</div>
        )}
      </div>

      <div className="flex gap-4 justify-end">
        <button onClick={onCancel} disabled={loading} className="px-6 py-3 rounded-xl font-semibold border border-white/10 text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2">
           <X size={18} /> Cancel
        </button>
        <button onClick={onAnalyze} disabled={loading || data.reviews.length === 0} className="px-6 py-3 rounded-xl font-semibold bg-primary hover:bg-blue-600 text-white transition-all shadow-lg hover:shadow-primary/30 flex justify-center items-center gap-2 disabled:opacity-50 min-w-[200px]">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Start AI Analysis</span>}
          {!loading && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
}
