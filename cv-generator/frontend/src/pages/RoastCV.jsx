import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function RoastCV() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/roast`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data.roast_result);
    } catch (err) {
      console.error(err);
      setError('Failed to roast CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg text-text p-4 md:p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-warning mb-2 uppercase border-b-2 border-warning pb-2">ROAST_SYSTEM_V1.0</h1>
        <p className="text-muted mb-8 uppercase text-sm">Upload your CV to initiate brutal honesty mode.</p>

        {!result && (
          <form onSubmit={handleUpload} className="bg-surface border-2 border-border p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-border opacity-5"></div>
            <div className="relative z-10 flex flex-col items-center justify-center">
               <Upload size={64} className="text-warning mb-6" />
               <h3 className="text-2xl font-bold text-text mb-4 uppercase">Select File</h3>
               <p className="text-muted mb-6">PDF Only (Max 5MB)</p>

               <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="mb-6 block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-warning file:text-bg hover:file:bg-opacity-80"
               />

               <button
                  type="submit"
                  disabled={loading || !file}
                  className="bg-warning text-bg px-8 py-3 font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-white hover:text-black transition-colors border-2 border-warning"
               >
                  {loading ? 'PROCESSING...' : 'INITIATE ROAST'}
               </button>

               {error && <p className="text-accent-2 mt-4 blink">ERROR: {error}</p>}
            </div>
          </form>
        )}

        {loading && (
           <div className="mt-8 text-center border-2 border-warning p-8 bg-surface">
              <h2 className="text-2xl text-warning font-bold uppercase blink mb-4">ANALYZING FLAWS...</h2>
              <div className="w-full bg-bg border border-warning h-4">
                 <div className="bg-warning h-full w-1/2 animate-pulse"></div>
              </div>
           </div>
        )}

        {result && (
          <div className="space-y-8 mt-8 fade-in">
            <div className="border-2 border-warning bg-surface p-6">
              <div className="flex justify-between items-center border-b border-warning pb-4 mb-4">
                <h2 className="text-3xl font-bold uppercase text-warning">Diagnostic Report</h2>
                <div className="text-center">
                  <span className="text-xs uppercase text-muted block">Score</span>
                  <span className="text-4xl font-bold text-warning">{result.overall_score}</span>
                </div>
              </div>
              <p className="text-xl italic text-muted">"{result.verdict}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="border border-border p-6 bg-surface">
                  <h3 className="text-xl font-bold text-accent mb-4 uppercase flex items-center gap-2"><CheckCircle size={20}/> Strengths</h3>
                  <ul className="space-y-2">
                     {result.strengths.map((s, i) => (
                        <li key={i} className="text-muted before:content-['>'] before:mr-2 before:text-accent">{s}</li>
                     ))}
                  </ul>
               </div>

               <div className="border border-accent-2 p-6 bg-surface">
                  <h3 className="text-xl font-bold text-accent-2 mb-4 uppercase flex items-center gap-2"><AlertTriangle size={20}/> Priority Fixes</h3>
                  <ul className="space-y-2">
                     {result.priority_fixes.map((f, i) => (
                        <li key={i} className="text-muted before:content-['>'] before:mr-2 before:text-accent-2">{f}</li>
                     ))}
                  </ul>
               </div>
            </div>

            <div className="border-2 border-warning p-6 bg-surface">
              <h3 className="text-2xl font-bold text-warning mb-6 uppercase border-b border-warning pb-2">Roast Points</h3>
              <div className="space-y-6">
                {result.roast_points.map((point, idx) => (
                  <div key={idx} className="border-l-4 border-warning pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg uppercase text-text">{point.section}</span>
                      <span className={`text-xs uppercase px-2 py-1 ${point.severity === 'critical' ? 'bg-accent-2 text-white' : 'bg-warning text-black'}`}>
                        {point.severity}
                      </span>
                    </div>
                    <p className="text-muted mb-2">Issue: {point.issue}</p>
                    <p className="text-text font-bold">Fix: {point.fix}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setResult(null)} className="text-muted uppercase hover:text-text border-b border-muted hover:border-text">New Scan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoastCV;
