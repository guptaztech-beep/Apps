import { ArrowRight, Bell, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useBlogs } from '../context/BlogContext';
import { Link } from 'react-router-dom';

export default function Hero() {
  const { blogs, loading } = useBlogs();
  const featuredBlogs = blogs.filter(b => b.isFeatured).slice(0, 10);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredBlogs.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredBlogs.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredBlogs.length]);

  if (loading) return (
    <div className="bg-editorial-bg border-b border-black h-[600px] flex items-center justify-center">
      <div className="text-[10px] uppercase font-black tracking-[0.5em] opacity-40 animate-pulse">Syncing_Dispatches...</div>
    </div>
  );

  if (featuredBlogs.length === 0) return (
    <div className="bg-editorial-bg border-b border-black h-[400px] flex items-center justify-center p-8 text-center">
      <div>
        <h2 className="text-3xl font-serif font-black italic mb-4">No Featured Bulletins</h2>
        <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">The newsroom is preparing the next cycle of academic updates.</p>
      </div>
    </div>
  );

  const currentBlog = featuredBlogs[currentIndex];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featuredBlogs.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featuredBlogs.length) % featuredBlogs.length);

  return (
    <div className="bg-editorial-bg text-editorial-text relative overflow-hidden border-b border-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Editorial Content */}
        <div className="flex-1 p-6 sm:p-12 border-r border-black flex flex-col justify-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBlog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <span className="text-[9px] sm:text-[11px] uppercase font-black tracking-[0.1em] sm:tracking-[0.2em] bg-secondary px-2 sm:px-3 py-1 border border-black/10">
                  {currentBlog.category} Dispatch
                </span>
                <span className="text-[9px] sm:text-[11px] uppercase font-bold tracking-[0.1em] sm:tracking-[0.2em] text-emerald-700 flex items-center gap-1">
                  <ShieldCheck size={12} className="sm:w-[14px] sm:h-[14px]" /> Official Data
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-7xl font-serif font-black leading-[1] sm:leading-[0.9] tracking-tighter mb-6 sm:mb-8 border-b-2 sm:border-b-0 border-black/5 pb-4 sm:pb-0">
                {currentBlog.title.split(':').map((part, i) => (
                  <span key={i}>
                    {i === 1 ? <><br/><span className="italic text-primary/80">:{part}</span></> : part}
                  </span>
                ))}
              </h2>

              <p className="text-sm sm:text-lg leading-relaxed text-editorial-text opacity-70 max-w-xl mb-8 sm:mb-10 line-clamp-3 sm:line-clamp-none">
                {currentBlog.excerpt}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <Link to={`/blog/${currentBlog.slug}`} className="bg-primary text-editorial-bg hover:opacity-90 font-bold px-8 sm:px-10 py-4 sm:py-5 text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl">
                  Read Dispatch <ArrowRight size={18} />
                </Link>
                {featuredBlogs.length > 1 && (
                  <div className="flex justify-center gap-2 sm:ml-4">
                    <button onClick={prevSlide} className="p-3 bg-editorial-bg border border-black/10 hover:border-black transition-all">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextSlide} className="p-3 bg-editorial-bg border border-black/10 hover:border-black transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ) || (
                  <div className="p-4" />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Progress dots */}
          {featuredBlogs.length > 1 && (
            <div className="flex gap-2 mt-12">
              {featuredBlogs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 transition-all duration-500 ${currentIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-black/10 hover:bg-black/30'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Visual Accent */}
        <div className="hidden md:block w-1/3 relative bg-editorial-aside overflow-hidden border-l border-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBlog.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 mix-blend-multiply group"
            >
              <img 
                src={currentBlog.imageUrl} 
                alt={currentBlog.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-editorial-aside via-transparent to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 p-6 bg-editorial-bg border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-white/5">
            <h4 className="text-[10px] uppercase tracking-widest font-black mb-3 border-b-2 border-primary pb-2">Verified Bulletin</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] border-b border-black/5 pb-2">
                <span className="font-bold">RollFetch Index</span>
                <span className="text-primary font-black uppercase">LIVE</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold opacity-80">Source Integrity</span>
                <span className="text-emerald-500 font-black flex items-center gap-1">
                  <ShieldCheck size={12} /> 100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
