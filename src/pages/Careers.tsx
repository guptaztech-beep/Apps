import { useState } from 'react';
import { useBlogs } from '../context/BlogContext';
import { motion } from 'motion/react';
import { CheckCircle, Send, Briefcase } from 'lucide-react';

export default function Careers() {
  const { submitApplication } = useBlogs();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    portfolio: '',
    bio: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await submitApplication(formData);
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="bg-editorial-bg min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full mb-6 text-[10px] uppercase font-black tracking-widest border border-primary/10">
            <Briefcase size={14} /> Join the Vanguard
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-black italic tracking-tighter text-editorial-text mb-6">
            Become a <span className="text-primary italic">Verified</span> Writer
          </h1>
          <p className="text-xl text-editorial-text/70 font-medium leading-relaxed max-w-2xl mx-auto">
            We are looking for analytical minds who can transform complex educational data into compelling narratives for the next generation.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-12">
            <div className="group">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4 border-b border-primary/10 pb-2">01. Intellectual Rigor</h3>
              <p className="text-editorial-text/70 leading-relaxed italic font-medium">Your work must be backed by verifiable data and academic precision. We don't just report; we analyze.</p>
            </div>
            <div className="group">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4 border-b border-primary/10 pb-2">02. Modern Aesthetic</h3>
              <p className="text-editorial-text/70 leading-relaxed italic font-medium">Understanding our "RollFetch" aesthetic is key. We bridge the gap between traditional news and modern digital culture.</p>
            </div>
            <div className="group">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-4 border-b border-primary/10 pb-2">03. Rapid Dispatch</h3>
              <p className="text-editorial-text/70 leading-relaxed italic font-medium">Results and exam updates wait for no one. Timeliness is the cornerstone of our verification process.</p>
            </div>
          </div>

          <div className="bg-white border-2 border-primary shadow-[12px_12px_0_0_rgba(37,99,235,1)] p-8 sm:p-12 relative overflow-hidden">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-serif font-black mb-4">Application Received_</h3>
                <p className="text-editorial-text/60 text-sm font-medium leading-relaxed">
                  Our editorial board will review your portfolio. You'll hear from the Dispatch Desk within 3-5 academic days.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-10 text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:tracking-[0.6em] transition-all"
                >
                  [ Send another dispatch ]
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full bg-editorial-aside border-2 border-primary/5 p-4 text-sm font-bold focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Academic Email</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="example@rollfetch.com"
                    className="w-full bg-editorial-aside border-2 border-primary/5 p-4 text-sm font-bold focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Portfolio / Link</label>
                  <input 
                    required
                    type="url" 
                    value={formData.portfolio}
                    onChange={e => setFormData({...formData, portfolio: e.target.value})}
                    placeholder="https://behance.net/you"
                    className="w-full bg-editorial-aside border-2 border-primary/5 p-4 text-sm font-bold focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Why RollFetch?</label>
                  <textarea 
                    required
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about your perspective..."
                    className="w-full bg-editorial-aside border-2 border-primary/5 p-4 text-sm font-medium focus:border-primary outline-none transition-all h-32 resize-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  {isLoading ? 'Processing...' : (
                    <>Submit Application <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
