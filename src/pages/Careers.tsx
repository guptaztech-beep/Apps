import { useState, useEffect } from 'react';
import { useBlogs } from '../context/BlogContext';
import { motion } from 'motion/react';
import { CheckCircle, Send, Briefcase, Lock, Clock, LogIn, Award, XCircle, FileText, ArrowRight } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { Link } from 'react-router-dom';

export default function Careers() {
  const { user, userApplication, submitApplication } = useBlogs();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comments: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isReapplying, setIsReapplying] = useState(false);

  // Initialize values when user is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.displayName || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      await submitApplication({
        name: formData.name,
        email: formData.email,
        comments: formData.comments,
        portfolio: '', // compatibility block
        bio: ''        // compatibility block
      });
      setIsReapplying(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Authentication dispatch failed:", err);
    }
  };

  // Helper inside simple state to reset status
  const handleReapply = () => {
    setIsReapplying(true);
    setFormData(prev => ({
      ...prev,
      comments: ''
    }));
  };

  return (
    <div className="bg-editorial-bg min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full mb-6 text-[10px] uppercase font-black tracking-widest border border-primary/10">
            <Briefcase size={14} /> Join the Vanguard
          </div>
          <h1 className="text-5xl sm:text-7xl font-serif font-black italic tracking-tighter text-editorial-text mb-6">
            Become a <span className="text-primary italic">Verified</span> Writer
          </h1>
          <p className="text-xl text-editorial-text/70 font-medium leading-relaxed max-w-2xl mx-auto">
            We are looking for academic minds, students, and analysts who can transform complex educational updates into compelling dispatches.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Info Side */}
          <div className="space-y-10">
            <div className="group">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-3 border-b border-primary/10 pb-2">01. Direct Attribution</h3>
              <p className="text-editorial-text/70 leading-relaxed italic font-medium text-sm sm:text-base">
                An approved application transforms your profile into a verified author index. Your name is clearly displayed alongside every dispatch you publish.
              </p>
            </div>
            <div className="group">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-3 border-b border-primary/10 pb-2">02. Modern Newsroom</h3>
              <p className="text-editorial-text/70 leading-relaxed italic font-medium text-sm sm:text-base">
                Use your personalized Writer Dashboard to post, curate, edit, and categorize educational logs reaching thousands of active university campuses daily.
              </p>
            </div>
            <div className="group">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-3 border-b border-primary/10 pb-2">03. Rapid Appraisal</h3>
              <p className="text-editorial-text/70 leading-relaxed italic font-medium text-sm sm:text-base">
                Our Editorial council evaluates open statements within hours. Track your approved status directly from this Careers page!
              </p>
            </div>
          </div>

          {/* Dynamic Component Side */}
          <div className="bg-white border-2 border-primary shadow-[8px_8px_0_0_rgba(254,240,138,1)] sm:shadow-[12px_12px_0_0_rgba(254,240,138,1)] p-8 sm:p-12 relative overflow-hidden">
            
            {/* Case 1: Not Logged In */}
            {!user && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-black/10">
                  <Lock size={28} />
                </div>
                <h3 className="text-2xl font-serif font-black mb-4">Authentication Required_</h3>
                <p className="text-editorial-text/65 text-sm font-medium leading-relaxed mb-8">
                  To securely verify your identity and authorize your personalized writer dispatch portal, please sign in with Google.
                </p>
                <button 
                  onClick={handleLogin}
                  className="w-full bg-primary text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  <LogIn size={16} /> Login to Access Application
                </button>
              </div>
            )}

            {/* Case 2: Logged In */}
            {user && (
              <>
                {/* 2A: Application Exists */}
                {userApplication && !isReapplying ? (
                  <div className="space-y-6">
                    <div className="border-b-2 border-dashed border-black/10 pb-4 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Registered Identity</span>
                      <div className="flex items-center gap-3 mt-1">
                        {user.photoURL && (
                          <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-primary/15" referrerPolicy="no-referrer" />
                        )}
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none">{userApplication.name}</p>
                          <p className="text-xs font-mono font-medium text-slate-500">{userApplication.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Display: PENDING */}
                    {userApplication.status === 'pending' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6"
                      >
                        <div className="w-20 h-20 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-500/20 animate-pulse">
                          <Clock size={36} />
                        </div>
                        <h4 className="text-xl font-serif font-black text-slate-800 mb-2">Application Pending Review_</h4>
                        <span className="inline-block bg-amber-500/10 text-amber-700 text-[10px] uppercase font-black px-3 py-1 tracking-widest border border-amber-500/20 mb-4">
                          [ Under Review ]
                        </span>
                        <p className="text-slate-650 text-xs font-medium leading-relaxed max-w-sm mx-auto mb-6">
                          Thank you for applying! Our editorial council is currently evaluating your credentials. Status updates cascade in real time.
                        </p>
                        <div className="bg-editorial-aside p-4 text-left border-l-4 border-amber-400">
                          <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Your Submission Note</p>
                          <p className="text-xs font-medium text-slate-700 italic">"{userApplication.comments}"</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Status Display: APPROVED */}
                    {userApplication.status === 'approved' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6"
                      >
                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/20">
                          <Award size={36} />
                        </div>
                        <h4 className="text-2xl font-serif font-black text-emerald-800 mb-2">Application Approved_</h4>
                        <span className="inline-block bg-emerald-500/10 text-emerald-700 text-[10px] uppercase font-black px-3 py-1 tracking-widest border border-emerald-500/20 mb-6 animate-bounce">
                          [ Verified Academic Writer ]
                        </span>
                        <p className="text-slate-650 text-sm font-medium leading-relaxed max-w-sm mx-auto mb-8">
                          Congratulations! Your credentials have been accepted. You now have complete access to the publishing council dashboard.
                        </p>
                        <Link 
                          to="/admin"
                          className="w-full bg-emerald-600 hover:bg-black text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 group"
                        >
                          Access Writer Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    )}

                    {/* Status Display: REJECTED */}
                    {userApplication.status === 'rejected' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6"
                      >
                        <div className="w-20 h-20 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-rose-500/20">
                          <XCircle size={36} />
                        </div>
                        <h4 className="text-xl font-serif font-black text-slate-800 mb-2">Application Declined_</h4>
                        <span className="inline-block bg-rose-500/10 text-rose-700 text-[10px] uppercase font-black px-3 py-1 tracking-widest border border-rose-500/20 mb-4">
                          [ Closed ]
                        </span>
                        <p className="text-slate-650 text-xs font-medium leading-relaxed max-w-sm mx-auto mb-6">
                          Unfortunately, our council couldn't approve your request at this time. We appreciate your interest in contributing.
                        </p>
                        <button 
                          onClick={handleReapply}
                          className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:tracking-[0.5em] transition-all"
                        >
                          [ Re-apply / Submit New Statement ]
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  /* 2B: Application Does NOT Exist (or isReapplying is true) */
                  <div className="block">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="border-b border-primary/10 pb-4">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#94a3b8] block mb-2">Authenticated Profile</span>
                        <div className="flex items-center gap-3">
                          {user.photoURL && (
                            <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                          )}
                          <div>
                            <p className="text-xs font-black text-slate-800 leading-none">{user.displayName}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </div>

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
                          placeholder="example@gmail.com"
                          className="w-full bg-editorial-aside border-2 border-primary/5 p-4 text-sm font-bold focus:border-primary outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Why apply? (Comments)</label>
                        <textarea 
                          required
                          value={formData.comments}
                          onChange={e => setFormData({...formData, comments: e.target.value})}
                          placeholder="Describe your writing perspective and any comments..."
                          className="w-full bg-editorial-aside border-2 border-primary/5 p-4 text-sm font-medium focus:border-primary outline-none transition-all h-36 resize-none"
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
