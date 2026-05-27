import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, FileText, CheckCircle, ArrowRight } from 'lucide-react';

function Home() {
  return (
    <div className="flex-1 overflow-y-auto bg-bg text-text">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col justify-center items-center p-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-accent text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Enterprise AI Recruitment Tech
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text">
            Elevate Your Career <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-cyan">With Intelligence.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            The next-generation AI assistant that writes, analyzes, and perfects your CV to meet enterprise hiring standards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/chat" className="w-full sm:w-auto px-8 py-3 bg-text text-white rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
              <Terminal size={18} /> Start AI Interview
            </Link>
            <Link to="/roast" className="w-full sm:w-auto px-8 py-3 bg-white text-text border border-border rounded-lg font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
              <FileText size={18} /> Analyze Existing CV
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 bg-surface border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text mb-4">Why RetroChat AI?</h2>
            <p className="text-muted max-w-2xl mx-auto">Our advanced language models evaluate and construct your professional profile just like a senior technical recruiter.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-bg border border-border rounded-2xl p-8 shadow-sm hover:shadow-saas transition-shadow">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                <Terminal className="text-accent" size={24} />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Conversational Builder</h3>
              <p className="text-muted leading-relaxed">No more struggling with blank pages. Simply chat with our AI, and it will extract your skills and experience to build a perfect ATS-friendly CV.</p>
            </div>

            <div className="bg-bg border border-border rounded-2xl p-8 shadow-sm hover:shadow-saas transition-shadow">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                <FileText className="text-warning" size={24} />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">Recruiter-Grade Analysis</h3>
              <p className="text-muted leading-relaxed">Upload your current CV and receive a brutally honest, constructive breakdown of your strengths, weaknesses, and market readiness.</p>
            </div>

            <div className="bg-bg border border-border rounded-2xl p-8 shadow-sm hover:shadow-saas transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="text-success" size={24} />
              </div>
              <h3 className="text-xl font-bold text-text mb-3">ATS Optimized</h3>
              <p className="text-muted leading-relaxed">Generate sleek, single-column PDF documents strategically formatted to pass through modern Applicant Tracking Systems without breaking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface py-8 border-t border-border text-center">
        <p className="text-muted text-sm">© {new Date().getFullYear()} RetroChat AI. Enterprise Recruitment Intelligence.</p>
      </footer>
    </div>
  );
}

export default Home;
