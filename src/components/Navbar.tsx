import { Search, Bell, Menu, User, LogOut, LogIn, Share2, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useBlogs } from '../context/BlogContext';
import { useTheme } from '../context/ThemeContext';
import { auth, googleProvider, signInWithPopup, signOut } from '../lib/firebase';

export default function Navbar() {
  const { user, config } = useBlogs();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.includes(path);
  };

  return (
    <header className={`bg-editorial-bg border-b border-primary sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
      <div className={`bg-primary text-editorial-bg text-[9px] sm:text-[10px] uppercase font-black px-4 sm:px-8 flex justify-between items-center tracking-widest relative z-50 transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 py-0 opacity-0' : 'h-10 py-2'}`}>
        <div className="flex items-center gap-6">
          <span className="opacity-80">The Student Journal</span>
          <span className="hidden md:inline border-l border-editorial-bg/30 pl-4 opacity-80">Verified Academic News</span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Action Buttons Group */}
          <div className="flex items-center gap-4 border-r border-editorial-bg/20 pr-4 mr-2">
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-1.5 hover:text-secondary transition-all"
              title="Toggle Appearance"
            >
              {theme === 'light' ? <Moon size={11} /> : <Sun size={11} />}
              <span className="hidden xs:inline">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
            </button>

            <button 
              onClick={() => {
                const text = "Stay updated with RollFetch - India's Student Journal: ";
                const url = window.location.origin;
                window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
              }}
              className="flex items-center gap-1.5 hover:text-secondary transition-all"
            >
              <Share2 size={11} /> Share
            </button>
          </div>

          {/* User / Journal Access */}
          <div className="flex items-center gap-4">
            {user?.email === 'guptaztech@gmail.com' && (
              <Link to="/admin" className="text-secondary hover:underline font-black">Editor Desk</Link>
            )}
            <button 
              onClick={user ? () => signOut(auth) : () => signInWithPopup(auth, googleProvider)}
              className="flex items-center gap-1.5 hover:text-secondary transition-all"
            >
              {user ? (
                <><LogOut size={11} /> {user.displayName?.split(' ')[0] || 'Logout'}</>
              ) : (
                <><LogIn size={11} /> Login</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4 sm:py-8'}`}>
        <div className="flex flex-col lg:flex-row justify-between items-center gap-2 lg:gap-6">
          <Link to="/" className={`flex flex-col lg:flex-row items-center gap-3 lg:items-start group transition-all duration-300 ${isScrolled ? 'scale-75 lg:scale-90' : 'scale-100'}`}>
            <div className={`flex items-center gap-3 ${isScrolled ? 'lg:flex-row' : 'lg:flex-row flex-col'}`}>
              {config.logoUrl && (
                <img 
                  src={config.logoUrl} 
                  alt="Logo" 
                  style={{ height: isScrolled ? `${(config.logoHeight || 40) * 0.75}px` : `${config.logoHeight || 40}px` }}
                  className="object-contain" 
                />
              )}
              <div>
                <h1 className={`${isScrolled ? 'text-3xl' : 'text-4xl sm:text-6xl'} font-serif font-black italic leading-none tracking-tighter group-hover:opacity-80 transition-all`}>
                  RollFetch
                </h1>
                {!isScrolled && (
                  <div className="flex items-center gap-2 mt-2 justify-center lg:justify-start">
                    <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] font-black italic text-primary/60">Exams & Results Daily</span>
                    <span className="bg-red-600 w-1.5 h-1.5 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </Link>

          <nav className={`flex items-center gap-4 sm:gap-10 text-[10px] sm:text-[11px] uppercase font-black tracking-widest sm:tracking-[0.3em] text-slate-500 overflow-x-auto w-full lg:w-auto justify-center sm:justify-start whitespace-nowrap scrollbar-hide transition-all ${isScrolled ? 'border-none pb-0 pt-0' : 'border-t lg:border-t-0 border-black/5 pt-4 lg:pt-0 pb-2 sm:pb-0'}`}>
            <Link 
              to="/" 
              className={`pb-1 transition-all border-b-2 ${isActive('/') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              to="/category/CBSE" 
              className={`pb-1 transition-all border-b-2 ${isActive('/category/CBSE') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'}`}
            >
              Exams
            </Link>
            <Link 
              to="/category/Result" 
              className={`pb-1 transition-all border-b-2 ${isActive('/category/Result') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'}`}
            >
              Results
            </Link>
            <Link 
              to="/category/NEET" 
              className={`pb-1 transition-all border-b-2 ${isActive('/category/NEET') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'}`}
            >
              Admissions
            </Link>
            <Link 
              to="/category/How-To" 
              className={`pb-1 transition-all border-b-2 ${isActive('/category/How-To') ? 'text-primary border-primary' : 'border-transparent hover:text-primary'}`}
            >
              How-To
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
