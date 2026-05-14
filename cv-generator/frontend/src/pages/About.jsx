import React from 'react';
import { Terminal, Cpu, Shield, Zap } from 'lucide-react';

function About() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 font-mono bg-bg text-text relative z-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-accent uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">SYSTEM_INFO</h1>
          <p className="text-xl text-muted uppercase tracking-widest">v1.0.0 // RETROCHAT AI<span className="blink">_</span></p>
        </div>

        <div className="border-2 border-border bg-surface p-6 md:p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-5 transition-opacity"></div>
          <h2 className="text-2xl font-bold mb-4 uppercase text-accent flex items-center gap-2">
            <Terminal size={24} />
            ABOUT THE SYSTEM
          </h2>
          <div className="space-y-4 text-lg text-muted">
            <p>
              RetroChat AI adalah asisten virtual rekrutmen masa depan dengan gaya retro terminal. Sistem ini dirancang untuk mengotomatiskan pembuatan dan analisis Curriculum Vitae (CV) dengan interaksi yang mulus layaknya sedang berbincang dengan AI dari tahun 80-an yang super canggih.
            </p>
            <p>
              Cukup berbincang dengan AI kami, dan biarkan sistem mengekstrak data Anda untuk menyusun CV profesional yang siap diunduh dalam format PDF.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border p-6 bg-surface hover:bg-[#001100] transition-colors">
            <Cpu className="text-accent mb-4" size={40} />
            <h3 className="text-xl font-bold text-accent mb-2 uppercase">AI Powered</h3>
            <p className="text-muted">Menggunakan kecerdasan buatan generasi terbaru untuk menyaring dan menyusun data pengalaman dan keterampilan Anda secara presisi.</p>
          </div>

          <div className="border border-warning p-6 bg-surface hover:bg-[#110500] transition-colors">
            <Zap className="text-warning mb-4" size={40} />
            <h3 className="text-xl font-bold text-warning mb-2 uppercase">Lightning Fast</h3>
            <p className="text-muted">Pembuatan CV tanpa form yang panjang. Hanya dengan chat ringan, CV langsung tergenerasi dalam hitungan detik.</p>
          </div>

          <div className="border border-accent-2 p-6 bg-surface hover:bg-[#110011] transition-colors">
            <Shield className="text-accent-2 mb-4" size={40} />
            <h3 className="text-xl font-bold text-accent-2 mb-2 uppercase">ATS Friendly</h3>
            <p className="text-muted">Struktur CV yang dihasilkan dijamin ramah terhadap Applicant Tracking Systems, memperbesar peluang lolos seleksi.</p>
          </div>
        </div>

        <div className="mt-12 text-center text-muted text-sm uppercase border-t border-border pt-6">
          <p>End of file. System ready <span className="blink">█</span></p>
        </div>
      </div>
    </div>
  );
}

export default About;
