import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Flame } from 'lucide-react';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-bg text-text retro-crt relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-display font-bold mb-4 text-accent uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">RetroChat AI</h1>
        <p className="text-xl text-muted uppercase tracking-widest">Build it. Roast it.<span className="blink">_</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
        <Link to="/chat" className="group bg-surface p-8 border-2 border-border hover:border-accent hover:bg-[#001100] transition-colors flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <MessageSquare size={64} className="text-accent mb-6 drop-shadow-[0_0_8px_rgba(0,255,0,0.8)]" />
          <h2 className="text-3xl font-bold mb-4 uppercase">Chat-to-CV</h2>
          <p className="text-muted text-lg">Build your CV through terminal communication. No forms. Just chat.</p>
        </Link>

        <Link to="/roast" className="group bg-surface p-8 border-2 border-border hover:border-warning hover:bg-[#110500] transition-colors flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-warning opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <Flame size={64} className="text-warning mb-6 drop-shadow-[0_0_8px_rgba(255,176,0,0.8)]" />
          <h2 className="text-3xl font-bold mb-4 uppercase text-warning">Roast My CV</h2>
          <p className="text-muted text-lg">Upload your CV and get brutally honest, constructive feedback.</p>
        </Link>
      </div>

      <div className="mt-16 text-muted text-sm uppercase">
        <p>SYSTEM READY <span className="blink">█</span></p>
      </div>
    </div>
  );
}

export default Home;
