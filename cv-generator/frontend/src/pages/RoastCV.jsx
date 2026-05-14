import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Flame, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function RoastCV() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRoast = async () => {
    if (!file && !text.trim()) {
        setError("Please upload a PDF or paste your CV text.");
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    } else {
        formData.append('cv_text', text);
    }

    try {
        const response = await axios.post(`${API_URL}/roast`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setResult(response.data.roast_result);
    } catch (err) {
        console.error(err);
        setError("Failed to roast CV. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
      switch(severity) {
          case 'critical': return <AlertTriangle className="text-warning" size={20} />;
          case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
          case 'suggestion': return <Info className="text-blue-500" size={20} />;
          default: return null;
      }
  };

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-4xl font-display font-bold text-warning mb-2 flex items-center gap-3">
            <Flame size={40} /> Roast My CV
        </h1>
        <p className="text-muted mb-8 text-center max-w-2xl">
            Our AI Career Coach will brutally but constructively review your CV. Don't take it personally, we just want you to get hired.
        </p>

        {!result && !loading && (
            <div className="w-full max-w-2xl bg-surface border border-border p-8 rounded-xl">
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">Upload PDF</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-warning transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="mx-auto text-muted mb-2" size={32} />
                        <p className="text-muted">{file ? file.name : 'Drag & drop or click to upload PDF'}</p>
                    </div>
                </div>

                <div className="text-center text-muted my-4">OR</div>

                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">Paste CV Text</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-40 bg-bg border border-border rounded-lg p-4 text-text focus:border-warning outline-none resize-none"
                        placeholder="Paste your CV content here..."
                        disabled={!!file}
                    />
                </div>

                {error && <p className="text-warning mb-4 text-sm">{error}</p>}

                <button
                    onClick={handleRoast}
                    className="w-full bg-warning text-white py-3 rounded-lg font-bold text-lg hover:bg-opacity-90 flex justify-center items-center gap-2"
                >
                    <Flame size={20} /> Roast It!
                </button>
            </div>
        )}

        {loading && (
            <div className="flex flex-col items-center mt-20">
                <Flame size={64} className="text-warning animate-pulse mb-4" />
                <h2 className="text-xl font-bold">Heating up the oven...</h2>
                <p className="text-muted">Analyzing every flaw in your CV.</p>
            </div>
        )}

        {result && (
            <div className="w-full max-w-4xl space-y-6">
                {/* Score Card */}
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-warning">
                        <span className="text-4xl font-bold">{result.overall_score}</span>
                        <span className="text-sm text-muted">/100</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold mb-2">Grade: <span className="text-warning">{result.grade}</span></h2>
                        <p className="text-lg italic text-muted">"{result.verdict}"</p>
                    </div>
                    <button onClick={() => setResult(null)} className="text-sm underline text-muted hover:text-text">Roast Another</button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Roast Points */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border pb-2">
                            <Flame className="text-warning" /> The Roast
                        </h3>
                        <div className="space-y-4">
                            {result.roast_points.map((pt, idx) => (
                                <div key={idx} className="bg-bg p-4 rounded-lg border border-border">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">{getSeverityIcon(pt.severity)}</div>
                                        <div>
                                            <span className="text-xs font-bold uppercase text-muted tracking-wider">{pt.section}</span>
                                            <p className="font-bold mt-1 text-red-400">{pt.issue}</p>
                                            <p className="text-sm mt-2 text-accent-2"><span className="font-bold">Fix:</span> {pt.fix}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                         {/* Priority Fixes */}
                         <div className="bg-surface border border-border rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">Priority Fixes</h3>
                            <ul className="space-y-2">
                                {result.priority_fixes.map((fix, i) => (
                                    <li key={i} className="flex gap-2 text-sm"><AlertTriangle className="text-warning shrink-0" size={16}/> {fix}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Strengths */}
                        <div className="bg-surface border border-border rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">Strengths (Not terrible)</h3>
                            <ul className="space-y-2">
                                {result.strengths.map((str, i) => (
                                    <li key={i} className="flex gap-2 text-sm"><CheckCircle className="text-accent-2 shrink-0" size={16}/> {str}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Improved Summary */}
                        {result.improved_summary && (
                            <div className="bg-surface border border-accent rounded-xl p-6">
                                <h3 className="text-xl font-bold mb-4 text-accent border-b border-border pb-2">Suggested Summary</h3>
                                <p className="text-sm italic">{result.improved_summary}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default RoastCV;
