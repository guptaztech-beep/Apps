import { Search, Bell, Menu, User, LogOut, LogIn, Share2, Sun, Moon, Sparkles, X, Check, FileText, Layout, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBlogs } from '../context/BlogContext';
import { useTheme } from '../context/ThemeContext';
import { auth, googleProvider, signInWithPopup, signOut } from '../lib/firebase';

export default function Navbar() {
  const { user, config, isApprovedWriter, isAdmin, userProfile, updateProfile } = useBlogs();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Profile local state for mobile edit tab
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  
  const logoHeight = config.logoHeight || 36;
  
  useEffect(() => {
    if (userProfile) {
      setProfileName(userProfile.displayName || '');
      setProfileBio(userProfile.bio || '');
      setProfilePhoto(userProfile.photoUrl || '');
    }
  }, [userProfile]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const updateTime = () => {
      const live = new Date().toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      setCurrentTime(live);
    };
    updateTime();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.includes(path);
  };

  const handleSearchClick = () => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('search-input');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 500);
    } else {
      const el = document.getElementById('search-input');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }
  };

  const handleTopicsClick = () => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('categories-strip');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    } else {
      const el = document.getElementById('categories-strip');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleHomeClick = () => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveProfileMobile = async () => {
    if (!profileName.trim()) {
      alert("Profile Display Name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: profileName,
        bio: profileBio,
        photoUrl: profilePhoto
      });
      alert("Biography / Journalist Credentials synchronized successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareClick = () => {
    const text = "Stay updated with RollFetch - Official Exams & Results Portal: ";
    const url = window.location.origin;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
  };

  return (
    <header className="w-full bg-editorial-bg border-b border-primary/10 relative z-[100]">
      {/* 1. TOP UTILITY ROW - Classic Newspaper Info Bar */}
      <div className="border-b border-black/[0.08] py-2 px-4 sm:px-6 lg:px-8 text-[11px] font-sans font-medium text-slate-500 bg-editorial-bg hidden md:flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-700 tracking-wider font-mono">
            {currentTime}
          </span>
          <span className="hidden md:inline border-l border-slate-300 pl-4 uppercase font-bold text-primary tracking-widest text-[10px]">
            🇮🇳 India's Academic Journal Board
          </span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-1.5 hover:text-primary transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer"
            title="Toggle Appearance"
          >
            {theme === 'light' ? <Moon size={11} className="text-primary" /> : <Sun size={11} className="text-amber-500" />}
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>

          <button 
            onClick={handleShareClick}
            className="flex items-center gap-1.5 hover:text-primary transition-all uppercase tracking-widest text-[10px] font-bold cursor-pointer"
          >
            <Share2 size={11} /> Share
          </button>

          <span className="h-3 w-px bg-slate-300 hidden sm:inline" />

          <div className="flex items-center gap-4">
            {isApprovedWriter && (
              <Link 
                to="/admin" 
                className="bg-primary text-editorial-bg hover:opacity-95 px-3 py-1 font-black uppercase text-[9px] tracking-widest border border-primary transition-all flex items-center gap-1"
              >
                <Sparkles size={8} /> Editorial Panel
              </Link>
            )}
            <button 
              onClick={user ? () => signOut(auth) : () => signInWithPopup(auth, googleProvider)}
              className="flex items-center gap-1 hover:text-primary transition-all uppercase tracking-widest text-[10px] font-black cursor-pointer"
            >
              {user ? (
                <span className="flex items-center gap-1 text-primary">
                  <LogOut size={10} /> Logout ({user.displayName?.split(' ')[0]})
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-bold hover:underline">
                  <LogIn size={10} /> Sign In
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE BRAND HEADER - Compact, perfectly proportioned like Hindustan Times */}
      <div className="py-5 sm:py-7 px-4 sm:px-6 lg:px-8 bg-editorial-bg flex flex-col items-center border-b border-black">
        <div className="w-full flex justify-between items-center max-w-7xl relative">
          
          {/* Symmetrical Left Deck */}
          <div className="hidden lg:flex flex-col items-start gap-1 w-1/4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Veritas Index</span>
            <span className="text-[9px] font-mono text-emerald-600 uppercase font-black tracking-widest border border-emerald-500/20 px-1.5 py-0.5 rounded-sm bg-emerald-500/5">
              ● Verified Portal
            </span>
          </div>

          {/* Core Brand Title and Logo (Centered) */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <Link to="/" className="flex flex-col items-center group">
              <div className="flex items-center gap-3">
                {config.logoUrl ? (
                  <img 
                    src={config.logoUrl} 
                    alt="Logo" 
                    style={{ height: `${logoHeight}px` }}
                    className="object-contain bg-transparent transition-all" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-gray-300 font-serif font-black italic tracking-tighter text-2xl lg:text-3xl block pr-2">RF</span>
                )}
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black italic leading-none tracking-tighter text-editorial-text group-hover:opacity-85 transition-opacity">
                  RollFetch
                </h1>
              </div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] font-black italic text-slate-400 mt-2 text-center">
                EXAMS, RESULTS & ADMISSIONS DISPATCHES
              </p>
            </Link>
          </div>

          {/* Symmetrical Right Deck */}
          <div className="hidden lg:flex flex-col items-end gap-1 w-1/4">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Live Tracking Active</span>
            <span className="text-[9px] font-black uppercase text-red-600 bg-red-500/5 border border-red-500/20 px-2 py-0.5 animate-pulse rounded-sm">
              Board Exams 2026
            </span>
          </div>
          
        </div>
      </div>

      {/* 3. HORIZONTAL CATEGORY STRIP - Sticky Navigation Bar */}
      <div className={`sticky top-0 z-50 w-full bg-editorial-bg border-b border-primary/25 transition-all duration-300 ${isScrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.06)] py-2' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-11">
          
          {/* Quick brand logo for sticky scroll */}
          {isScrolled && (
            <Link to="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
              <span className="text-lg font-serif font-black italic tracking-tighter text-primary">
                RollFetch_
              </span>
            </Link>
          )}

          {/* Main Category List */}
          <nav className="flex items-center gap-6 sm:gap-10 text-[11px] uppercase font-black tracking-[0.18em] text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-hide h-full flex-grow py-1">
            <Link 
              to="/" 
              className={`h-full flex items-center transition-all border-b-2 border-transparent ${isActive('/') ? 'text-primary border-primary font-black' : 'hover:text-primary hover:border-primary/20'}`}
            >
              Home
            </Link>
            <span className="text-slate-300 select-none">/</span>
            <Link 
              to="/category/CBSE" 
              className={`h-full flex items-center transition-all border-b-2 border-transparent ${isActive('/category/CBSE') ? 'text-primary border-primary font-black' : 'hover:text-primary'}`}
            >
              Exams
            </Link>
            <span className="text-slate-300 select-none">/</span>
            <Link 
              to="/category/Result" 
              className={`h-full flex items-center transition-all border-b-2 border-transparent ${isActive('/category/Result') ? 'text-primary border-primary font-black' : 'hover:text-primary'}`}
            >
              Results
            </Link>
            <span className="text-slate-300 select-none">/</span>
            <Link 
              to="/category/NEET" 
              className={`h-full flex items-center transition-all border-b-2 border-transparent ${isActive('/category/NEET') ? 'text-primary border-primary font-black' : 'hover:text-primary'}`}
            >
              Admissions
            </Link>
            <span className="text-slate-300 select-none">/</span>
            <Link 
              to="/category/How-To" 
              className={`h-full flex items-center transition-all border-b-2 border-transparent ${isActive('/category/How-To') ? 'text-primary border-primary font-black' : 'hover:text-primary'}`}
            >
              How-To
            </Link>
          </nav>

          {/* Careers writer invite link */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/careers" 
              className="hidden md:inline-block border-2 border-primary text-primary hover:bg-primary hover:text-editorial-bg px-4 py-1 text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              Apply as Writer
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          MOBILE BOTTOM NAVIGATION STRIP (Hindustan Times Style)
          ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-editorial-bg border-t-2 border-black py-2 px-4 flex justify-around items-center md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.08)] pb-safe">
        <button 
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center gap-1 p-2 min-w-[50px] transition-colors cursor-pointer ${location.pathname === '/' && !isMenuOpen ? 'text-primary' : 'text-slate-400'}`}
        >
          <Layout size={18} />
          <span className="text-[8px] font-black uppercase tracking-wider">Home</span>
        </button>

        <button 
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center gap-1 p-2 min-w-[50px] text-slate-400 hover:text-primary transition-colors cursor-pointer"
        >
          <Search size={18} />
          <span className="text-[8px] font-black uppercase tracking-wider">Search</span>
        </button>

        <button 
          onClick={handleTopicsClick}
          className="flex flex-col items-center justify-center gap-1 p-2 min-w-[50px] text-slate-400 hover:text-primary transition-colors cursor-pointer"
        >
          <Sparkles size={18} />
          <span className="text-[8px] font-black uppercase tracking-wider">Topics</span>
        </button>

        <button 
          onClick={() => setIsMenuOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center gap-1 p-2 min-w-[50px] transition-colors cursor-pointer ${isMenuOpen ? 'text-primary font-bold' : 'text-slate-400'}`}
        >
          <Menu size={18} />
          <span className="text-[8px] font-black uppercase tracking-wider">Menu Tab</span>
        </button>
      </div>

      {/* ========================================================
          MOBILE MENU OVERLAY & PROFILE MANAGEMENT TAB DRAWER
          ======================================================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm md:hidden flex flex-col justify-end"
          >
            {/* Click blank space to close */}
            <div className="flex-grow shadow-none border-none" onClick={() => setIsMenuOpen(false)} />

            {/* Sliding Bottom Drawer Sheet */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
              className="w-full max-h-[85vh] bg-editorial-bg border-t-4 border-black p-6 overflow-y-auto flex flex-col gap-6 text-editorial-text shadow-[0_-12px_30px_rgba(0,0,0,0.15)] rounded-t-2xl pb-24 border-x border-black/10"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-black pb-3.5">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">RollFetch Menu Drawer</span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-neutral-300 font-mono">
                    📅 {currentTime}
                  </span>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">
                    🇮🇳 Academic Journal Board
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">SESSION: {user ? 'Verified User' : 'Guest mode'}</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-black hover:bg-primary text-white p-2 border border-black cursor-pointer rounded-sm"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Theme, Share, Login Quick Utility Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="border-2 border-black p-4 flex flex-col items-center justify-center gap-2 bg-editorial-aside focus:outline-none focus:border-primary transition-all rounded-lg cursor-pointer"
                >
                  {theme === 'light' ? <Moon size={20} className="text-primary animate-none" /> : <Sun size={20} className="text-amber-500" />}
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#2d3748] dark:text-neutral-200">
                    Switch to {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </button>

                {/* 2. WhatsApp Portal Share */}
                <button 
                  onClick={handleShareClick}
                  className="border-2 border-black p-4 flex flex-col items-center justify-center gap-2 bg-editorial-aside focus:outline-none focus:border-primary transition-all rounded-lg cursor-pointer"
                >
                  <Share2 size={20} className="text-[#25d366]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#2d3748] dark:text-neutral-200">
                    Share RollFetch
                  </span>
                </button>

                {/* 3. Join Editorial / Panel / careers */}
                {isApprovedWriter ? (
                  <Link 
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="col-span-2 border-2 border-black p-4 flex items-center justify-center gap-3 bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-lg cursor-pointer hover:bg-black transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                  >
                    <Sparkles size={16} /> Enter Editor Desk
                  </Link>
                ) : (
                  <Link 
                    to="/careers"
                    onClick={() => setIsMenuOpen(false)}
                    className="col-span-2 border-2 border-black p-4 flex items-center justify-center gap-3 bg-editorial-aside hover:bg-primary hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] rounded-lg cursor-pointer"
                  >
                    <FileText size={16} /> Join Editorial Team
                  </Link>
                )}

                {/* 4. Login or Logout Node */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    user ? signOut(auth) : signInWithPopup(auth, googleProvider);
                  }}
                  className={`col-span-2 border-2 border-black p-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                    user ? 'bg-rose-50 text-rose-700 border-rose-300/40 hover:bg-rose-100' : 'bg-yellow-400 text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {user ? (
                    <>
                      <LogOut size={16} /> Log Out ({user.displayName || 'Authorized Account'})
                    </>
                  ) : (
                    <>
                      <LogIn size={16} /> Connect Google Account
                    </>
                  )}
                </button>
              </div>

              {/* ========================================================
                  MANDATED PROFILE MANAGEMENT TAB (Real-time Firestore)
                  ======================================================== */}
              <div className="border-2 border-black bg-editorial-aside p-5 rounded-xl space-y-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                  <User className="text-primary shrink-0" size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black">
                    Press Credentials & Biography
                  </span>
                </div>

                {user ? (
                  <div className="space-y-4">
                    {/* Journalist Name input */}
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">
                        Professional Pen Name
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Shashi Tharoor"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full bg-editorial-bg border-2 border-black/10 rounded p-3 text-xs font-bold focus:border-primary outline-none transition-all text-editorial-text"
                      />
                    </div>

                    {/* Avatar URL / Photo input */}
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">
                        Correspondent Avatar / Photo URL
                      </label>
                      <input 
                        type="text"
                        placeholder="Paste image URL (e.g. Unsplash copy)"
                        value={profilePhoto}
                        onChange={e => setProfilePhoto(e.target.value)}
                        className="w-full bg-editorial-bg border-2 border-black/10 rounded p-3 text-xs font-mono focus:border-primary outline-none transition-all text-editorial-text"
                      />
                    </div>

                    {/* Bio / Bio text area */}
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">
                        Professional Biography (About Me)
                      </label>
                      <textarea 
                        placeholder="Tell the readers about your board result tracking experience, competitive exams analysis achievements..."
                        value={profileBio}
                        onChange={e => setProfileBio(e.target.value)}
                        className="w-full bg-editorial-bg border-2 border-black/10 rounded p-3 text-xs font-medium h-24 focus:border-primary outline-none transition-all text-editorial-text resize-none leading-relaxed"
                      />
                    </div>

                    {/* Virtual Press Card Preview */}
                    <div className="border border-black/15 bg-white dark:bg-zinc-950 p-4 rounded-lg flex items-center gap-3">
                      <div className="w-12 h-12 rounded border border-black max-w-[48px] overflow-hidden shrink-0 bg-slate-200">
                        {profilePhoto ? (
                          <img referrerPolicy="no-referrer" src={profilePhoto} className="w-full h-full object-cover" alt="Author" />
                        ) : (
                          <div className="w-full h-full bg-primary text-white flex items-center justify-center font-serif font-black text-sm">
                            {(profileName || 'W').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-serif font-black text-black leading-tight truncate">
                          {profileName || 'Your Name'}
                        </h4>
                        <span className="text-[7.5px] uppercase font-black text-primary tracking-widest block mt-0.5">
                          Verified Correspondent
                        </span>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 italic font-sans leading-none truncate mt-1">
                          "{profileBio || 'No biography written yet.'}"
                        </p>
                      </div>
                    </div>

                    {/* Sync button */}
                    <button 
                      onClick={handleSaveProfileMobile}
                      disabled={isSaving}
                      className="w-full bg-black hover:bg-primary text-white py-4.5 text-[9px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 rounded transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isSaving ? 'Verifying Sync...' : 'Save Press Details'} <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-[10px] text-slate-400 font-bold leading-normal uppercase tracking-wider">
                      🔒 LOGIN REQUIRED
                    </p>
                    <p className="text-xs text-slate-500 leading-normal font-medium">
                      Please connect your Google Account using the button above to secure and customise your professional journalist press card.
                    </p>
                  </div>
                )}
              </div>

              {/* Extra legal / directory indexes */}
              <div className="flex justify-around items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400 pt-3 border-t border-black/5">
                <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="hover:text-primary">Privacy</Link>
                <span>•</span>
                <Link to="/editorial-policy" onClick={() => setIsMenuOpen(false)} className="hover:text-primary">Policy</Link>
                <span>•</span>
                <Link to="/sitemap" onClick={() => setIsMenuOpen(false)} className="hover:text-primary">Sitemap</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
