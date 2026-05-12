import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-editorial-bg min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 border-b-4 border-black pb-12"
        >
          <div className="inline-flex items-center gap-2 text-primary mb-6 text-[10px] uppercase font-black tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            <Shield size={14} /> Data Protection Protocol
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-black italic tracking-tighter text-editorial-text">
            Privacy Policy_
          </h1>
        </motion.header>

        <div className="prose prose-slate max-w-none prose-p:text-editorial-text/80 prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-black prose-strong:text-primary">
          <section className="mb-12">
            <h2 className="text-3xl italic mb-6">01. Collective Intelligence</h2>
            <p>
              At <strong>RollFetch Media Solutions</strong>, we value the integrity of our readers. This Privacy Policy describes how we collect, use, and process your personal data when you interact with our educational dispatch nodes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl italic mb-6">02. Information Acquisition</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="p-6 bg-editorial-aside border-2 border-black/5">
                <Lock className="text-primary mb-4" size={24} />
                <h4 className="text-xs font-black uppercase tracking-widest mb-2">Authenticated Data</h4>
                <p className="text-xs font-medium opacity-60">When you sign in via Google, we verify your identity to enable commenting and reaction protocols. We do not store your passwords.</p>
              </div>
              <div className="p-6 bg-editorial-aside border-2 border-black/5">
                <Eye className="text-primary mb-4" size={24} />
                <h4 className="text-xs font-black uppercase tracking-widest mb-2">Behavioral Metrics</h4>
                <p className="text-xs font-medium opacity-60">We analyze reading patterns to optimize our news distribution, ensuring the most relevant exam results reach your terminal first.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl italic mb-6">03. Verification Applications</h2>
            <p>
              Candidates applying via our <strong>Careers</strong> portal provide professional history, portfolios, and contact information. This data is strictly restricted to our Editorial Board and is never shared with third-party advertising nodes.
            </p>
          </section>

          <section className="mb-12 p-8 bg-black not-prose">
            <div className="flex items-start gap-4">
              <FileText className="text-primary shrink-0" size={32} />
              <div>
                <h3 className="text-xl font-serif font-black italic mb-2 text-white">Reader Autonomy</h3>
                <p className="text-sm text-white leading-relaxed italic">
                  You retain complete sovereignty over your data. You may request data extraction or account neutralization at any time by contacting the Dispatch Desk.
                </p>
              </div>
            </div>
          </section>

          <footer className="mt-20 pt-8 border-t border-black/10 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            Last Adjusted: May 2026 // RollFetch Ethics Committee
          </footer>
        </div>
      </div>
    </div>
  );
}
