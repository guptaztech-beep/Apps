import { motion } from 'motion/react';
import { PenTool, CheckCircle, Scale, Quote } from 'lucide-react';

export default function EditorialPolicy() {
  return (
    <div className="bg-editorial-bg min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <motion.header 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 border-b-4 border-primary pb-12"
        >
          <div className="inline-flex items-center gap-2 text-primary mb-6 text-[10px] uppercase font-black tracking-widest">
            <PenTool size={14} /> The Journalist Code
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-black italic tracking-tighter text-editorial-text">
            Editorial Integrity_
          </h1>
        </motion.header>

        <div className="prose prose-slate max-w-none prose-p:text-editorial-text/80 prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-black prose-strong:text-primary">
          <div className="mb-16 p-10 bg-editorial-aside border-l-8 border-primary relative">
            <Quote className="absolute top-4 right-4 opacity-5 text-primary" size={60} />
            <p className="text-2xl font-serif italic text-editorial-text font-black leading-tight">
              "We don't just report exam results. We map the trajectory of educational evolution through a lens of absolute transparency and modern aesthetics."
            </p>
            <cite className="block mt-6 text-[10px] font-black uppercase tracking-widest opacity-40">— RollFetch Editorial Board</cite>
          </div>

          <section className="mb-16">
            <h2 className="text-4xl italic mb-8 border-b border-black/5 pb-2">I. Truth & Verification</h2>
            <p className="text-lg">
              Every dispatch published under the <strong>RollFetch</strong> node undergoes a rigorous verification cycle. We prioritize accuracy over speed. 
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 list-none pl-0">
              <li className="flex items-center gap-3 p-4 bg-white border border-black/5">
                <CheckCircle className="text-green-500" size={18} /> <span className="text-xs font-black uppercase">Primary Source Reliance</span>
              </li>
              <li className="flex items-center gap-3 p-4 bg-white border border-black/5">
                <CheckCircle className="text-green-500" size={18} /> <span className="text-xs font-black uppercase">Multi-Tier Fact Checking</span>
              </li>
              <li className="flex items-center gap-3 p-4 bg-white border border-black/5">
                <CheckCircle className="text-green-500" size={18} /> <span className="text-xs font-black uppercase">Official Board Validation</span>
              </li>
              <li className="flex items-center gap-3 p-4 bg-white border border-black/5">
                <CheckCircle className="text-green-500" size={18} /> <span className="text-xs font-black uppercase">Correction Transparency</span>
              </li>
            </ul>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl italic mb-8 border-b border-black/5 pb-2">II. Impartial Analysis</h2>
            <p>
              While we maintain a bold and modern aesthetic, our reporting remains neutral. We distinguish clearly between <strong>Dispatches (News)</strong> and <strong>Editorials (Opinion)</strong>. 
            </p>
            <div className="mt-8 flex items-center gap-6 p-6 bg-primary !text-white italic">
              <Scale size={40} className="shrink-0 opacity-50" />
              <p className="text-sm font-medium leading-relaxed !text-white">
                RollFetch Media Solutions does not accept corporate influence or "sponsored results". Our loyalty remains to the student and the truth of the academic record.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-4xl italic mb-8 border-b border-black/5 pb-2">III. Verified Writers</h2>
            <p>
              Only individuals who have passed the <strong>RollFetch Verification Protocol</strong> are granted writer status. Each writer is accountable for their dispatches, ensuring that our readers receive only the highest grade of educational intelligence.
            </p>
          </section>

          <footer className="mt-20 pt-8 border-t border-black/10 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
            Internal Document: RF-EP-2026-V1
          </footer>
        </div>
      </div>
    </div>
  );
}
