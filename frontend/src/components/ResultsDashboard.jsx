import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import { FileDown, Lightbulb, TrendingUp } from 'lucide-react';

const SEVERITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#eab308',
  Low: '#84cc16'
};

export function ResultsDashboard({ data }) {
  const stats = useMemo(() => {
    if (!data.classified) return [];
    
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    data.classified.forEach(r => {
       const sev = r.classification?.severity;
       if (counts[sev] !== undefined) counts[sev]++;
    });

    return Object.keys(SEVERITY_COLORS).map(key => ({
      name: key,
      value: counts[key]
    })).filter(item => item.value > 0);
  }, [data.classified]);

  const insights = useMemo(() => {
     if (!data.classified) return null;
     
     const appleCount = data.classified.filter(r => r.source === 'apple').length;
     const googleCount = data.classified.filter(r => r.source === 'google').length;
     
     const words = {};
     data.classified.filter(r => r.classification?.severity === 'Critical' || r.classification?.severity === 'High').forEach(r => {
       const reasonWords = r.classification?.reason.toLowerCase().split(' ') || [];
       reasonWords.forEach(w => {
         const cleanWord = w.replace(/[^a-z]/g, '');
         if (cleanWord.length > 4 && !['mentions', 'issue', 'complaint', 'feature'].includes(cleanWord)) {
           words[cleanWord] = (words[cleanWord] || 0) + 1;
         }
       });
     });
     
     const topWords = Object.entries(words).sort((a,b) => b[1] - a[1]).slice(0,3).map(e => e[0]);

     return {
        appleCount,
        googleCount,
        topIssues: topWords.length > 0 ? topWords.join(", ") : "No major recurring issues reliably identified."
     }
  }, [data.classified]);

  const exportCSV = () => {
    if (!data.classified) return;
    const header = "id,date,source,content,severity,reason\n";
    const rows = data.classified.map(r => {
      const content = r.content.replace(/"/g, '""');
      const reason = (r.classification?.reason || '').replace(/"/g, '""');
      return `"${r.id}","${r.date||''}","${r.source||''}","${content}","${r.classification?.severity}","${reason}"`;
    }).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'analysis_results.csv';
    a.href = url;
    a.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="glass-panel p-4 text-center border border-[#3b82f6]/30">
            <p className="text-gray-400 text-sm font-medium">Total Negative Reviews</p>
            <p className="text-3xl font-bold text-white">{data.classified.length}</p>
         </div>
         <div className="glass-panel p-4 text-center border border-red-500/30">
            <p className="text-gray-400 text-sm font-medium">Filtered Out</p>
            <p className="text-3xl font-bold text-red-400">{data.droppedCount}</p>
         </div>
         <div className="glass-panel p-4 text-center border border-[#dc2626]/30">
            <p className="text-gray-400 text-sm font-medium">Critical Issues</p>
            <p className="text-3xl font-bold text-[#dc2626]">{stats.find(s=>s.name === 'Critical')?.value || 0}</p>
         </div>
         <div className="glass-panel p-4 text-center border border-[#ea580c]/30">
            <p className="text-gray-400 text-sm font-medium">High Issues</p>
            <p className="text-3xl font-bold text-[#ea580c]">{stats.find(s=>s.name === 'High')?.value || 0}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="font-semibold text-lg mb-4 text-center w-full">Severity Distribution</h3>
          {stats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name]} />
                  ))}
                  <LabelList dataKey="name" position="outside" offset={10} fill="#fff" fontSize={12} formatter={(val) => val} />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400">No data available</div>
          )}
        </div>

        <div className="glass-panel p-6 md:col-span-2 flex flex-col justify-between">
          <div>
             <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-white">
                  <Lightbulb className="text-yellow-400" size={20} /> Analysis Insights
                </h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-xs font-bold tracking-wider text-gray-500 mb-2 truncate uppercase">Top Recurring Issues</h4>
                   <p className="text-white text-lg capitalize font-medium">{insights?.topIssues}</p>
                </div>
                <div>
                   <h4 className="text-xs font-bold tracking-wider text-gray-500 mb-2 truncate uppercase">Platform Comparison</h4>
                   {insights?.appleCount > 0 && insights?.googleCount > 0 ? (
                      <div className="flex gap-6 mt-1">
                         <div className="bg-[#64748b]/20 px-4 py-2 rounded-lg border border-[#64748b]/30">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Apple</span> 
                            <p className="font-bold text-xl">{insights.appleCount}</p>
                         </div>
                         <div className="bg-[#16a34a]/20 px-4 py-2 rounded-lg border border-[#16a34a]/30">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Google</span> 
                            <p className="font-bold text-xl">{insights.googleCount}</p>
                         </div>
                      </div>
                   ) : (
                      <p className="text-gray-400 text-sm mt-1">Data originates entirely from <span className="text-white">{insights?.appleCount > 0 ? 'Apple App Store' : insights?.googleCount > 0 ? 'Google Play Store' : 'CSV Upload'}</span>.</p>
                   )}
                </div>
             </div>
          </div>

          <div className="mt-8 flex justify-end">
             <button onClick={exportCSV} className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg hover:shadow-primary/30">
                <FileDown size={18} /> Export Full Results
             </button>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden mt-2">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#151e30] border-b border-white/10 uppercase text-xs text-gray-400 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium min-w-[300px]">Review Content</th>
                <th className="px-6 py-4 font-medium w-24">Source</th>
                <th className="px-6 py-4 font-medium w-24">Date</th>
                <th className="px-6 py-4 font-medium w-32">Severity</th>
                <th className="px-6 py-4 font-medium">LLM Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.classified?.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-gray-300 text-xs">
                    {item.content}
                  </td>
                  <td className="px-6 py-4 text-gray-400 capitalize text-xs font-semibold">
                     {item.source || 'CSV'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-[11px] font-mono whitespace-nowrap">
                     {item.date || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                      style={{
                        backgroundColor: `${SEVERITY_COLORS[item.classification?.severity] || '#000'}30`,
                        color: SEVERITY_COLORS[item.classification?.severity] || '#fff',
                        border: `1px solid ${SEVERITY_COLORS[item.classification?.severity] || '#fff'}50`
                      }}
                    >
                      {item.classification?.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs leading-relaxed max-w-sm">
                    {item.classification?.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
