import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

export function UploadView({ onSuccess, setLoading, loading, setError }) {
  const [limitType, setLimitType] = useState('100');
  const [customLimit, setCustomLimit] = useState('100');
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setSelectedFile(acceptedFiles[0]);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError('');

    let lim = limitType === 'Custom' ? parseInt(customLimit, 10) : parseInt(limitType, 10);
    if (isNaN(lim) || lim <= 0) lim = 100;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('limit', lim.toString());

    try {
      const response = await axios.post(`${BACKEND_URL}/upload-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  return (
    <div className="glass-panel p-8 transition-all duration-300 hover:shadow-primary/20 shadow-lg">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary">Upload CSV Data</h2>
      
      {!selectedFile ? (
        <div 
          {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-12 transition-colors cursor-pointer text-center ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-gray-500 bg-surface/50'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <Upload className={`w-12 h-12 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
            <div>
              <p className="text-xl font-semibold mb-2">Drag & drop your CSV file</p>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Make sure your CSV contains a column named <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">content</span>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="p-4 bg-surface/50 border border-white/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <FileSpreadsheet className="text-primary" />
              <span className="font-medium">{selectedFile.name}</span>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-sm text-red-400 hover:text-red-300 font-medium">Remove</button>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">Review Limit (after cleaning)</label>
             <select value={limitType} onChange={(e) => setLimitType(e.target.value)} className="w-full bg-surface/80 border border-gray-600 rounded-lg px-4 py-3 text-white mb-2 focus:outline-none focus:border-primary">
               <option value="50">50</option>
               <option value="100">100</option>
               <option value="500">500</option>
               <option value="1000">1000</option>
               <option value="Custom">Custom input</option>
             </select>
             {limitType === 'Custom' && (
                <input type="number" min="1" value={customLimit} onChange={(e) => setCustomLimit(e.target.value)} placeholder="Enter custom amount" className="w-full bg-surface/80 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
             )}
          </div>

          <button onClick={handleUpload} disabled={loading} className="mt-2 w-full bg-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {loading ? 'Processing...' : 'Upload & Clean Data'}
          </button>
        </div>
      )}
    </div>
  );
}
