import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Download, Share2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function Preview() {
  const { id } = useParams();
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await axios.get(`${API_URL}/cv/${id}`);
        setCv(response.data);
      } catch (error) {
        console.error("Failed to fetch CV", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCV();
  }, [id]);

  const handleDownload = () => {
      window.open(`${API_URL}/export/pdf/${id}?template=modern`, '_blank');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading CV...</div>;
  if (!cv) return <div className="flex justify-center items-center h-screen text-warning">CV not found.</div>;

  const data = cv.cv_data;

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your CV <span className="text-sm text-muted capitalize">({cv.variant} variant)</span></h1>
        <div className="flex gap-3">
            <button onClick={handleDownload} className="bg-accent flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold hover:bg-opacity-90">
                <Download size={18} /> Download PDF
            </button>
        </div>
      </div>

      {/* HTML Preview Render */}
      <div className="bg-white text-black p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-4xl min-h-[1000px] font-sans">

        {/* Header */}
        <header className="text-center border-b-2 border-gray-300 pb-6 mb-6">
            <h1 className="text-4xl font-bold uppercase tracking-wider text-gray-800">{data.personal?.name || 'Your Name'}</h1>
            <div className="text-sm text-gray-600 mt-2 space-x-2">
                <span>{data.personal?.email}</span>
                {data.personal?.phone && <span>| {data.personal.phone}</span>}
                {data.personal?.city && <span>| {data.personal.city}</span>}
            </div>
            {(data.personal?.linkedin || data.personal?.portfolio) && (
                <div className="text-sm text-blue-600 mt-1 space-x-2">
                    {data.personal?.linkedin && <a href={data.personal.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                    {data.personal?.portfolio && <a href={data.personal.portfolio} target="_blank" rel="noreferrer">| Portfolio</a>}
                </div>
            )}
            {data.personal?.summary && (
                <p className="mt-4 text-sm text-gray-700 leading-relaxed max-w-3xl mx-auto">{data.personal.summary}</p>
            )}
        </header>

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
            <section className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-1 mb-3 uppercase tracking-wide">Experience</h2>
                <div className="space-y-4">
                    {data.experience.map((exp, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-gray-800">{exp.position}</h3>
                                <span className="text-sm text-gray-600 font-medium">{exp.start} - {exp.current ? 'Present' : exp.end}</span>
                            </div>
                            <div className="text-sm font-medium text-gray-600 mb-2">{exp.company}</div>
                            {exp.responsibilities && exp.responsibilities.length > 0 && (
                                <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1 mb-1">
                                    {exp.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            )}
                            {exp.achievements && exp.achievements.length > 0 && (
                                <ul className="list-disc list-outside ml-4 text-sm text-gray-800 font-medium space-y-1">
                                    {exp.achievements.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
            <section className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-1 mb-3 uppercase tracking-wide">Education</h2>
                <div className="space-y-3">
                    {data.education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between items-baseline">
                            <div>
                                <h3 className="font-bold text-gray-800">{edu.institution}</h3>
                                <div className="text-sm text-gray-700">{edu.degree} in {edu.field} {edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                            </div>
                            <span className="text-sm text-gray-600">{edu.year_start} - {edu.year_end}</span>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
            <section className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-1 mb-3 uppercase tracking-wide">Projects</h2>
                <div className="space-y-4">
                    {data.projects.map((proj, idx) => (
                        <div key={idx}>
                            <h3 className="font-bold text-gray-800 inline-block mr-2">{proj.name}</h3>
                            {proj.tech_stack && <span className="text-xs text-gray-500 italic">({proj.tech_stack.join(', ')})</span>}
                            <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Skills */}
        {data.skills && (
            <section className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-1 mb-3 uppercase tracking-wide">Skills</h2>
                <div className="text-sm text-gray-700 space-y-2">
                    {data.skills.technical?.length > 0 && (
                        <div><span className="font-bold text-gray-800">Technical:</span> {data.skills.technical.join(', ')}</div>
                    )}
                    {data.skills.soft?.length > 0 && (
                        <div><span className="font-bold text-gray-800">Soft Skills:</span> {data.skills.soft.join(', ')}</div>
                    )}
                    {data.skills.languages?.length > 0 && (
                        <div><span className="font-bold text-gray-800">Languages:</span> {data.skills.languages.join(', ')}</div>
                    )}
                </div>
            </section>
        )}
      </div>
    </div>
  );
}

export default Preview;
