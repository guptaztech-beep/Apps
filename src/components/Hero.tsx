import { useState, useEffect, useRef } from 'react';
import { useBlogs } from '../context/BlogContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Hero() {
  const { blogs, loading } = useBlogs();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter for featured posts only
  const featuredBlogs = blogs.filter(blog => blog.isFeatured || (blog as any).is_featured === true);

  // Fallback to latest blogs if no blogs are marked as featured
  const displayBlogs = featuredBlogs.length > 0 ? featuredBlogs : blogs.slice(0, 5);

  useEffect(() => {
    if (!autoplay || displayBlogs.length <= 1) return;
    
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayBlogs.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, displayBlogs.length, currentIndex]);

  if (loading) {
    return (
      <div className="bg-editorial-bg border-b-4 border-black h-[400px] flex items-center justify-center">
        <div className="text-[10px] uppercase font-black tracking-[0.4em] text-primary/40 animate-pulse">
          Retrieving Featured Excerpts...
        </div>
      </div>
    );
  }

  if (displayBlogs.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setAutoplay(false);
    setCurrentIndex(prev => (prev - 1 + displayBlogs.length) % displayBlogs.length);
    // Resume autoplay after action
    setTimeout(() => setAutoplay(true), 10000);
  };

  const handleNext = () => {
    setAutoplay(false);
    setCurrentIndex(prev => (prev + 1) % displayBlogs.length);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const selectSlide = (index: number) => {
    setAutoplay(false);
    setCurrentIndex(index);
    setTimeout(() => setAutoplay(true), 10000);
  };

  const current = displayBlogs[currentIndex];

  const renderDate = (d: any) => {
    if (!d) return '';
    if (typeof d === 'string') return d;
    if (d.toDate && typeof d.toDate === "function") {
      try {
        return d.toDate().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (_) {}
    }
    if (d.seconds) {
      try {
        return new Date(d.seconds * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (_) {}
    }
    return String(d);
  };

  return (
    <div className="bg-editorial-bg border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Newspaper Tagline above the Slider */}
        <div className="flex items-center justify-between border-b-2 border-black pb-2.5 mb-6 text-editorial-text">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em]">
              FEATURED BULLETINS & HOT DISPATCHES
            </span>
          </div>
          <span className="text-[9px] sm:text-[11px] font-mono font-bold opacity-50 uppercase tracking-widest hidden sm:inline">
            Verified Press Release
          </span>
        </div>

        {/* Hero Slider Stage */}
        <div 
          className="relative w-full h-[360px] sm:h-[480px] lg:h-[520px] bg-black border-4 border-black overflow-hidden group shadow-[12px_12px_0_0_rgba(0,0,0,0.1)] transition-all"
          onMouseEnter={() => setAutoplay(false)}
          onMouseLeave={() => setAutoplay(true)}
        >
          {/* Animated Background Slide (Crossfading slides) */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={current.id}
              initial={{ opacity: 0.3, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={current.imageUrl || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"} 
                alt={current.title} 
                className="w-full h-full object-cover opacity-75 sm:opacity-80 transition-transform duration-[6000ms] scale-100 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Premium cinematic vignette overlay gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/25 hidden md:block" />
            </motion.div>
          </AnimatePresence>

          {/* Left / Right Chevron Controls (Aesthetic Neobrutalist styling) */}
          {displayBlogs.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-yellow-400 hover:bg-black text-black hover:text-white p-3 border-2 border-black transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[-46%] cursor-pointer hidden sm:flex items-center justify-center"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-yellow-400 hover:bg-black text-black hover:text-white p-3 border-2 border-black transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[-46%] cursor-pointer hidden sm:flex items-center justify-center"
                aria-label="Next Slide"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Content Overlay Panel (Hindustan Times Style Overlay Card aligned cleanly on the layout) */}
          <div className="absolute inset-0 p-6 sm:p-12 lg:p-16 flex flex-col justify-end text-white z-10 pointer-events-none">
            <div className="max-w-3xl pointer-events-auto">
              
              {/* Category tag */}
              <motion.span 
                key={`cat-${current.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block bg-[#b91c1c] text-white px-3 sm:px-4 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-4 border border-white/10"
              >
                {current.category} _ FEATURED
              </motion.span>

              {/* Animated Headlines */}
              <Link to={`/blog/${current.slug}`} className="block group/link">
                <motion.h2 
                  key={`title-${current.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-tight sm:leading-none text-white hover:text-yellow-400 hover:underline transition-all mb-4"
                >
                  {current.title}
                </motion.h2>
              </Link>

              {/* Excerpt */}
              <motion.p 
                key={`excerpt-${current.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs sm:text-sm md:text-base text-slate-300 font-sans leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 font-medium max-w-2xl"
              >
                {current.excerpt}
              </motion.p>

              {/* Slide Author, date metadata & navigation button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 border-t border-white/10 pt-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5 font-bold">
                  <User size={13} className="text-yellow-400" /> By {current.author || 'Editorial Correspondent'}
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="flex items-center gap-1.5 font-bold">
                  <Clock size={13} className="text-yellow-400" /> {renderDate(current.date)}
                </span>
                
                <Link 
                  to={`/blog/${current.slug}`}
                  className="sm:ml-auto inline-flex items-center gap-2 bg-yellow-400 hover:bg-white text-black px-4 py-2 text-[9px] font-black uppercase tracking-wider border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all shrink-0"
                >
                  Read Story <ArrowRight size={11} />
                </Link>
              </div>

            </div>
          </div>

          {/* Slide Indicator Dots (Mobile-friendly pagination) */}
          {displayBlogs.length > 1 && (
            <div className="absolute bottom-4 left-6 sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-2.5 z-20">
              {displayBlogs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === idx 
                      ? 'bg-yellow-400 w-8 h-2' 
                      : 'bg-white/40 hover:bg-white/70 w-2 h-2'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
