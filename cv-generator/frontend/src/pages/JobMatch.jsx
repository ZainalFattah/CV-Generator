import React, { useState } from 'react';
import axios from 'axios';
import { Briefcase, FileSearch, Target, AlertCircle } from 'lucide-react';
import { useCVStore } from '../store/cvStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function JobMatch() {
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Use current session CV if available as a quick option
  const { cvData } = useCVStore();

  const handleMatch = async () => {
    if (!cvText.trim() && !cvData) {
        setError("Please provide your CV text or generate one first.");
        return;
    }
    if (!jdText.trim()) {
        setError("Please provide the Job Description.");
        return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
        const payload = {
            jd_text: jdText,
            cv_text: cvText.trim() ? cvText : JSON.stringify(cvData)
        };

        const response = await axios.post(`${API_URL}/jobmatch`, payload);
        setResult(response.data.match_result);
    } catch (err) {
        console.error(err);
        setError("Failed to analyze job match.");
    } finally {
        setLoading(false);
    }
  };

  const useCurrentCV = () => {
      setCvText(JSON.stringify(cvData, null, 2));
  };

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-4xl font-display font-bold text-accent-2 mb-2 flex items-center gap-3">
            <Briefcase size={40} /> Job Match
        </h1>
        <p className="text-muted mb-8 text-center max-w-2xl">
            See how well your CV aligns with a specific Job Description to beat the ATS.
        </p>

        {!result && !loading && (
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CV Input */}
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold">Your CV Content</label>
                        {cvData && (
                            <button onClick={useCurrentCV} className="text-xs bg-accent text-white px-3 py-1 rounded">
                                Load Current Session CV
                            </button>
                        )}
                    </div>
                    <textarea
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                        className="flex-1 min-h-[300px] bg-bg border border-border rounded-lg p-4 text-sm font-mono text-text focus:border-accent-2 outline-none resize-none"
                        placeholder="Paste your CV text or JSON here..."
                    />
                </div>

                {/* JD Input */}
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
                    <label className="text-sm font-bold mb-4">Job Description</label>
                    <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        className="flex-1 min-h-[300px] bg-bg border border-border rounded-lg p-4 text-sm text-text focus:border-accent-2 outline-none resize-none"
                        placeholder="Paste the target Job Description here..."
                    />
                </div>

                {error && <div className="col-span-full text-center text-warning">{error}</div>}

                <div className="col-span-full flex justify-center mt-4">
                    <button
                        onClick={handleMatch}
                        className="bg-accent-2 text-bg px-8 py-3 rounded-full font-bold text-lg hover:bg-opacity-90 flex items-center gap-2"
                    >
                        <FileSearch size={20} /> Analyze Match
                    </button>
                </div>
            </div>
        )}

        {loading && (
            <div className="flex flex-col items-center mt-20">
                <Target size={64} className="text-accent-2 animate-spin-slow mb-4" />
                <h2 className="text-xl font-bold">Analyzing Keywords...</h2>
                <p className="text-muted">Comparing your experience with employer requirements.</p>
            </div>
        )}

        {result && (
            <div className="w-full max-w-5xl space-y-6">
                 {/* Top Level Score */}
                 <div className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-border"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="text-accent-2"
                                strokeDasharray={`${result.match_score}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-4xl font-bold">{result.match_score}%</span>
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2">Match Verdict</h2>
                        <p className="text-lg text-muted">"{result.verdict}"</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="text-center">
                                <div className="text-sm text-muted">Technical</div>
                                <div className="font-bold text-accent-2">{result.keyword_analysis.technical_skills_match}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted">Soft Skills</div>
                                <div className="font-bold text-accent-2">{result.keyword_analysis.soft_skills_match}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted">Experience</div>
                                <div className="font-bold text-accent-2">{result.keyword_analysis.experience_match}%</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-muted">Education</div>
                                <div className="font-bold text-accent-2">{result.keyword_analysis.education_match}%</div>
                            </div>
                        </div>
                    </div>
                     <button onClick={() => setResult(null)} className="text-sm underline text-muted hover:text-text">New Match</button>
                 </div>

                 {/* Keyword Columns */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-surface border border-border rounded-xl p-6">
                         <h3 className="text-lg font-bold mb-4 text-accent-2">Matched Keywords</h3>
                         <div className="flex flex-wrap gap-2">
                             {result.matched_keywords.map((kw, i) => (
                                 <span key={i} className="bg-accent-2 bg-opacity-20 text-accent-2 px-3 py-1 rounded-full text-sm">{kw}</span>
                             ))}
                         </div>
                     </div>
                     <div className="bg-surface border border-border rounded-xl p-6">
                         <h3 className="text-lg font-bold mb-4 text-warning">Missing Keywords</h3>
                         <div className="flex flex-wrap gap-2">
                             {result.missing_keywords.map((kw, i) => (
                                 <span key={i} className="bg-warning bg-opacity-20 text-warning px-3 py-1 rounded-full text-sm">{kw}</span>
                             ))}
                         </div>
                     </div>
                 </div>

                 {/* Gap Analysis & Improvements */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-surface border border-border rounded-xl p-6">
                         <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Gap Analysis</h3>
                         <div className="space-y-4">
                             {result.gap_analysis.map((gap, i) => (
                                 <div key={i} className="bg-bg p-3 rounded-lg border border-border">
                                     <div className="flex items-center gap-2 mb-1">
                                         <AlertCircle size={16} className={gap.importance === 'high' ? 'text-warning' : 'text-yellow-500'} />
                                         <span className="font-bold text-sm">{gap.gap}</span>
                                     </div>
                                     <p className="text-xs text-muted">Suggestion: {gap.suggestion}</p>
                                 </div>
                             ))}
                         </div>
                     </div>

                     <div className="space-y-6">
                         <div className="bg-surface border border-border rounded-xl p-6">
                             <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">CV Improvements</h3>
                             <ul className="list-disc list-outside ml-4 text-sm space-y-2 text-text">
                                 {result.cv_improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                             </ul>
                         </div>
                         {result.cover_letter_tips && result.cover_letter_tips.length > 0 && (
                             <div className="bg-surface border border-accent rounded-xl p-6">
                                 <h3 className="text-lg font-bold mb-4 text-accent border-b border-border pb-2">Cover Letter Tips</h3>
                                 <ul className="list-disc list-outside ml-4 text-sm space-y-2 text-text">
                                     {result.cover_letter_tips.map((tip, i) => <li key={i}>{tip}</li>)}
                                 </ul>
                             </div>
                         )}
                     </div>
                 </div>
            </div>
        )}
    </div>
  );
}

export default JobMatch;
