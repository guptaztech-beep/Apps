import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useBlogs } from '../context/BlogContext';
import { Network, FileText, ArrowRight, Layers, HelpCircle, Users } from 'lucide-react';

export default function Sitemap() {
  const { blogs } = useBlogs();

  const categories = ['All', 'CBSE', 'NEET', 'How-To', 'Exam', 'Result'];

  return (
    <div className="bg-editorial-bg min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 border-b-4 border-black pb-12"
        >
          <div className="inline-flex items-center gap-2 text-primary mb-6 text-[10px] uppercase font-black tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            <Network size={14} /> Node Directory Maps
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-black italic tracking-tighter text-editorial-text">
            Sitemap Index_
          </h1>
          <p className="mt-4 text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px]">
            Google Search Console Compliant & Automatic Document Registration
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Main Nodes */}
          <div>
            <h2 className="text-xl font-serif font-black italic mb-6 flex items-center gap-3 underline decoration-secondary decoration-4 underline-offset-4">
              <Layers size={20} className="text-primary" /> Core Pages & Categories
            </h2>
            <div className="space-y-4">
              <Link to="/" className="group flex items-center justify-between p-4 bg-white border-2 border-black/5 hover:border-black transition-all">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-editorial-text">Journal Home</h4>
                  <p className="text-[10px] opacity-60">Exams & Results Daily Dispatch</p>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-primary" />
              </Link>

              {categories.map(cat => (
                <Link key={cat} to={`/category/${cat === 'All' ? '' : cat}`} className="group flex items-center justify-between p-4 bg-white border-2 border-black/5 hover:border-black transition-all">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-editorial-text">{cat} Category</h4>
                    <p className="text-[10px] opacity-60">Filtered Academic Reports ({blogs.filter(b => cat === 'All' || b.category === cat).length})</p>
                  </div>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>

          {/* Legal and Administrative Nodes */}
          <div>
            <h2 className="text-xl font-serif font-black italic mb-6 flex items-center gap-3 underline decoration-secondary decoration-4 underline-offset-4">
              <Users size={20} className="text-primary" /> Editorial Board & Desk
            </h2>
            <div className="space-y-4">
              <Link to="/careers" className="group flex items-center justify-between p-4 bg-white border-2 border-black/5 hover:border-black transition-all">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-editorial-text">Careers Gate</h4>
                  <p className="text-[10px] opacity-60">Join the Editorial & Writing Council</p>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-primary" />
              </Link>

              <Link to="/privacy" className="group flex items-center justify-between p-4 bg-white border-2 border-black/5 hover:border-black transition-all">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-editorial-text">Privacy Policy Protocol</h4>
                  <p className="text-[10px] opacity-60">Intellectual and Digital Sovereignty</p>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-primary" />
              </Link>

              <Link to="/editorial-policy" className="group flex items-center justify-between p-4 bg-white border-2 border-black/5 hover:border-black transition-all">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-editorial-text">Editorial Ethics Code</h4>
                  <p className="text-[10px] opacity-60">Verified Dispatches Publication Standards</p>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-primary" />
              </Link>

              <Link to="/admin" className="group flex items-center justify-between p-4 bg-white border-2 border-black/5 hover:border-black transition-all">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">Editor Desk Console</h4>
                  <p className="text-[10px] opacity-60">Administrative Management Panel (Authorized Emails Only)</p>
                </div>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Blog Nodes */}
        <div className="mt-16 pt-12 border-t-2 border-black">
          <h2 className="text-xl font-serif font-black italic mb-8 flex items-center gap-3 underline decoration-secondary decoration-4 underline-offset-4">
            <FileText size={20} className="text-primary" /> Live Document Index ({blogs.length} entries)
          </h2>
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blogs.map(b => (
                <Link 
                  key={b.id} 
                  to={`/blog/${b.slug}`}
                  className="group block p-5 bg-white border-2 border-black/5 hover:border-black hover:shadow-[4px_4px_0_0_rgba(254,240,138,1)] transition-all"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="bg-primary/5 text-primary text-[8px] font-black px-2 py-0.5 uppercase tracking-wider border border-primary/10">
                      {b.category}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{b.date}</span>
                  </div>
                  <h4 className="text-xs font-bold font-serif text-editorial-text group-hover:text-primary transition-colors leading-tight line-clamp-1">
                    {b.title}
                  </h4>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-editorial-aside border border-dashed border-black/10 text-xs text-slate-400">
              Initializing document arrays. Default entries seeded automatically on demand.
            </div>
          )}
        </div>

        <footer className="mt-24 pt-8 border-t border-black/10 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          Last Crawled: Just Now // Google sitemap.xml available at /sitemap.xml
        </footer>
      </div>
    </div>
  );
}
