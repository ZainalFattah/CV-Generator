import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Target, Shield, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ScoreCard = ({ title, score, subtitle }) => {
  let color = 'text-success';
  if (score < 50) color = 'text-danger';
  else if (score < 75) color = 'text-warning';

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-saas flex flex-col justify-between">
      <h4 className="text-sm font-semibold text-muted mb-2">{title}</h4>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${color}`}>{score}</span>
        <span className="text-sm text-muted">/100</span>
      </div>
      {subtitle && <p className="text-xs text-muted mt-2">{subtitle}</p>}
    </div>
  );
};

const RoastPointCard = ({ point }) => {
  const [isOpen, setIsOpen] = useState(false);

  const severityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  };

  const badgeColor = severityColors[point.severity?.toLowerCase()] || severityColors.low;

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-saas transition-shadow duration-200">
      <div
        className="px-5 py-4 cursor-pointer flex justify-between items-center bg-surface hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${badgeColor}`}>
            {point.severity || 'Unknown'}
          </span>
          <h4 className="font-semibold text-text">{point.section || 'General'}</h4>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
      </div>

      {isOpen && (
        <div className="px-5 py-4 border-t border-border bg-slate-50">
          <div className="mb-3">
            <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Issue</h5>
            <p className="text-sm text-text">{point.issue}</p>
          </div>
          {point.impact && (
            <div className="mb-3">
              <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Impact</h5>
              <p className="text-sm text-text">{point.impact}</p>
            </div>
          )}
          <div>
            <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Recommended Fix</h5>
            <p className="text-sm font-medium text-accent">{point.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
};

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
      setError('Failed to process CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg text-text p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-3">CV Analysis Engine</h1>
          <p className="text-muted">Upload your CV for an enterprise-grade recruiter evaluation.</p>
        </div>

        {!result && (
          <form onSubmit={handleUpload} className="bg-surface border border-border rounded-2xl p-10 text-center shadow-saas max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                 <Upload size={32} className="text-accent" />
               </div>
               <h3 className="text-xl font-bold text-text mb-2">Upload Document</h3>
               <p className="text-muted text-sm mb-8">Supported format: PDF (Max 5MB)</p>

               <label className="w-full mb-6 cursor-pointer border-2 border-dashed border-border rounded-xl p-8 hover:bg-slate-50 hover:border-accent transition-colors">
                 <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                 />
                 <span className="text-sm font-medium text-text">
                   {file ? file.name : "Click to browse or drag and drop"}
                 </span>
               </label>

               <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full bg-accent text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                  {loading ? 'Analyzing...' : 'Analyze CV'}
               </button>

               {error && <p className="text-danger mt-4 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
            </div>
          </form>
        )}

        {loading && (
           <div className="mt-8 max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-10 text-center shadow-saas">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-accent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold text-text mb-2">Processing Document</h2>
              <p className="text-muted text-sm">Evaluating structure, content, and ATS compatibility...</p>
           </div>
        )}

        {result && (
          <div className="space-y-8 mt-8 fade-in">
            {/* Executive Summary & Grade */}
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-saas">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 pb-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold text-text mb-2">Executive Summary</h2>
                  <p className="text-text leading-relaxed">{result.executive_summary || result.verdict || "Analysis complete."}</p>
                </div>
                <div className="flex-shrink-0 bg-slate-50 rounded-xl p-4 border border-border text-center min-w-[120px]">
                  <span className="text-xs uppercase text-muted font-bold tracking-wider block mb-1">Grade</span>
                  <span className="text-4xl font-bold text-accent">{result.grade || 'N/A'}</span>
                </div>
              </div>

              {result.recruiter_impression && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Target size={16} /> Recruiter Impression
                  </h4>
                  <p className="text-sm text-indigo-800">{result.recruiter_impression}</p>
                </div>
              )}
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard title="Overall Score" score={result.overall_score || 0} subtitle="Holistic evaluation" />
              <ScoreCard title="ATS Compatibility" score={result.ats_score || 0} subtitle="System readability" />
              <ScoreCard title="Technical Depth" score={result.technical_depth_score || 0} subtitle="Skill demonstration" />
              <ScoreCard title="Credibility" score={result.credibility_score || 0} subtitle="Experience validity" />
            </div>

            {/* SWOT Analysis */}
            {result.swot_analysis && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-text">SWOT Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-success uppercase tracking-wider mb-4 flex items-center gap-2">
                      <TrendingUp size={18} /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {(result.swot_analysis.strengths || result.strengths || []).map((s, i) => (
                        <li key={i} className="text-sm text-text flex items-start gap-2">
                          <span className="text-success mt-0.5">•</span> <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-danger uppercase tracking-wider mb-4 flex items-center gap-2">
                      <TrendingDown size={18} /> Weaknesses
                    </h4>
                    <ul className="space-y-2">
                      {(result.swot_analysis.weaknesses || []).map((w, i) => (
                        <li key={i} className="text-sm text-text flex items-start gap-2">
                          <span className="text-danger mt-0.5">•</span> <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-accent-2 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Target size={18} /> Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {(result.swot_analysis.opportunities || []).map((o, i) => (
                        <li key={i} className="text-sm text-text flex items-start gap-2">
                          <span className="text-accent-2 mt-0.5">•</span> <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-warning uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield size={18} /> Threats
                    </h4>
                    <ul className="space-y-2">
                      {(result.swot_analysis.threats || []).map((t, i) => (
                        <li key={i} className="text-sm text-text flex items-start gap-2">
                          <span className="text-warning mt-0.5">•</span> <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Priority Fixes */}
            {result.priority_fixes && result.priority_fixes.length > 0 && (
               <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} /> High Priority Action Items
                  </h3>
                  <ul className="space-y-2">
                     {result.priority_fixes.map((f, i) => (
                        <li key={i} className="text-sm text-orange-900 flex items-start gap-2">
                          <span className="font-bold">•</span> <span>{f}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {/* Roast Points / Detailed Analysis */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text border-b border-border pb-2">Detailed Analysis</h3>
              <div className="flex flex-col gap-3">
                {result.roast_points && result.roast_points.map((point, idx) => (
                  <RoastPointCard key={idx} point={point} />
                ))}
              </div>
            </div>

            {/* Career Fit */}
            {result.career_fit && (
              <div className="bg-surface border border-border rounded-xl p-6 shadow-saas">
                <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-accent" /> Career Positioning
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Best Roles</h5>
                    <div className="flex flex-wrap gap-2">
                      {(result.career_fit.best_roles || []).map((role, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-800 text-xs px-3 py-1 rounded-full font-medium">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Market Readiness</h5>
                    <p className="text-sm text-text font-medium">{result.career_fit.market_readiness}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h5 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Recommended Focus</h5>
                    <p className="text-sm text-text">{result.career_fit.recommended_focus}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center pt-8 pb-12">
              <button
                onClick={() => setResult(null)}
                className="text-sm font-medium text-accent hover:text-indigo-700 transition-colors"
              >
                ← Analyze Another CV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoastCV;
