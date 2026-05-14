import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Flame, Briefcase, FileText } from 'lucide-react';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-display font-bold mb-4 text-accent">AI CV Generator</h1>
        <p className="text-xl text-muted">Build, Roast, and Match your CV with the power of AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Link to="/chat" className="bg-surface p-6 rounded-xl border border-border hover:border-accent transition-colors flex flex-col items-center text-center">
          <MessageSquare size={48} className="text-accent mb-4" />
          <h2 className="text-2xl font-bold mb-2">Chat-to-CV</h2>
          <p className="text-muted">Chat with our AI recruiter to effortlessly build your professional CV.</p>
        </Link>

        <Link to="/roast" className="bg-surface p-6 rounded-xl border border-border hover:border-warning transition-colors flex flex-col items-center text-center">
          <Flame size={48} className="text-warning mb-4" />
          <h2 className="text-2xl font-bold mb-2">Roast My CV</h2>
          <p className="text-muted">Get brutal, constructive feedback on your existing CV.</p>
        </Link>

        <Link to="/jobmatch" className="bg-surface p-6 rounded-xl border border-border hover:border-accent-2 transition-colors flex flex-col items-center text-center">
          <Briefcase size={48} className="text-accent-2 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Job Match</h2>
          <p className="text-muted">Analyze how well your CV matches a specific Job Description.</p>
        </Link>

        <div className="bg-surface p-6 rounded-xl border border-border flex flex-col items-center text-center opacity-75 cursor-not-allowed">
           <FileText size={48} className="text-muted mb-4" />
           <h2 className="text-2xl font-bold mb-2">CV Variants</h2>
           <p className="text-muted">Generate variants for different roles. Available after creating a CV.</p>
        </div>
      </div>

      <Link to="/chat" className="mt-12 bg-accent text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-opacity">
        Mulai Gratis
      </Link>
    </div>
  );
}

export default Home;
