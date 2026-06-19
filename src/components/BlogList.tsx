import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogs } from '../context/BlogContext';
import { Category } from '../types';
import BlogCard from './BlogCard';
import { Search as SearchIcon, Filter, Home, SlidersHorizontal, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

// HT Style Trending News Feed Sidebar
function TrendingSidebar({ blogs }: { blogs: any[] }) {
  const sortedByTrending = useMemo(() => {
    return [...blogs].sort((a, b) => {
      const reactionsA = (a.reactions?.like || 0) + (a.reactions?.informative || 0) + (a.reactions?.helpful || 0);
      const reactionsB = (b.reactions?.like || 0) + (b.reactions?.informative || 0) + (b.reactions?.helpful || 0);
      return reactionsB - reactionsA;
    }).slice(0, 5);
  }, [blogs]);

  return (
    <div className="bg-editorial-bg border-4 border-black p-6 space-y-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.05)]">
      <h3 className="text-xs font-black uppercase tracking-[0.25em] border-b-4 border-black pb-3 text-editorial-text">
        HT Trending Highlights
      </h3>
      <div className="divide-y-2 divide-black/5">
        {sortedByTrending.map((blog, idx) => (
          <div key={blog.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 text-editorial-text">
            <span className="font-serif font-black italic text-2xl text-primary/30 w-8">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                {blog.category}
              </span>
              <Link to={`/blog/${blog.slug}`} className="block hover:text-primary transition-colors">
                <h4 className="text-sm font-serif font-bold text-editorial-text leading-snug line-clamp-2 hover:underline">
                  {blog.title}
                </h4>
              </Link>
              <div className="text-[9px] font-mono text-slate-400">
                {blog.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogList() {
  const { blogs, loading } = useBlogs();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>((categorySlug as Category) || 'All');
  const [displayCount, setDisplayCount] = useState(6);

  // Multi-route state synchronization to solve frozen category links
  useEffect(() => {
    const value = (categorySlug as Category) || 'All';
    setActiveCategory(value);
  }, [categorySlug]);

  useEffect(() => {
    setDisplayCount(6);
  }, [activeCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = ['All', 'CBSE', 'NEET', 'How-To', 'Exam', 'Result'];
    blogs.forEach(blog => {
      if (!cats.includes(blog.category)) {
        cats.push(blog.category);
      }
    });
    return cats;
  }, [blogs]);

  const featuredBlogs = useMemo(() => {
    return blogs.filter(blog => blog.isFeatured || (blog as any).is_featured === true);
  }, [blogs]);

  const filteredBlogsSorted = useMemo(() => {
    const unsorted = blogs.filter(blog => {
      const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Default sorting: latest posts at top (by serverTimestamp / creation / date)
    return unsorted.sort((a, b) => {
      const timeA = (a as any).createdAt?.seconds ? (a as any).createdAt.seconds * 1000 : (a as any).createdAt ? new Date((a as any).createdAt).getTime() : new Date(a.date).getTime();
      const timeB = (b as any).createdAt?.seconds ? (b as any).createdAt.seconds * 1000 : (b as any).createdAt ? new Date((b as any).createdAt).getTime() : new Date(b.date).getTime();
      return timeB - timeA;
    });
  }, [blogs, activeCategory, searchQuery]);

  if (loading) return (
    <div className="max-w-[1200px] mx-auto px-4 py-32 text-center">
      <div className="text-[10px] uppercase font-black tracking-[0.5em] opacity-40 animate-pulse">Cataloging_Records...</div>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-16 pb-24 md:pb-16 font-sans">
      
      {/* Publications Control Panel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b-2 border-black pb-8">
        <div>
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-editorial-text mb-4 tracking-tighter">
            {activeCategory === 'All' ? 'Latest Publications' : `${activeCategory} _Report`}
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px]">HT Newsroom / National Publications Index</p>
        </div>

        <div className="relative group max-w-sm w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            id="search-input"
            type="text" 
            placeholder="Search Archives..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-black/5 bg-editorial-bg focus:outline-none focus:border-black transition-all text-xs font-bold uppercase tracking-widest text-editorial-text"
          />
        </div>
      </div>

      {/* Categories Bar */}
      <div id="categories-strip" className="flex flex-wrap items-center gap-4 mb-12 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
        <div className="flex items-center gap-2 text-slate-400 mr-2 flex-shrink-0">
          <Filter size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sort Archives:</span>
        </div>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${
              activeCategory === cat 
                ? 'bg-primary text-editorial-bg border-primary shadow-[2px_2px_0_0_rgba(0,0,0,0.15)]' 
                : 'bg-editorial-bg text-slate-500 border-black/10 hover:border-black'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main news feed: 8 Columns Left */}
        <div className="lg:col-span-8 space-y-10">
          {filteredBlogsSorted.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {filteredBlogsSorted.slice(0, displayCount).map((blog, idx) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <BlogCard blog={blog} />
                  </motion.div>
                ))}
              </div>

              {/* Touch Friendly Load More Pagination Button */}
              {filteredBlogsSorted.length > displayCount && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 6)}
                    className="w-full sm:w-auto bg-black text-white hover:bg-primary hover:text-black border-2 border-black px-12 py-5 text-xs font-black uppercase tracking-widest transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] cursor-pointer"
                  >
                    Load More Stories
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-editorial-aside border-2 border-dashed border-black/10">
              <div className="max-w-xs mx-auto">
                <SearchIcon size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-editorial-text mb-2">No matching updates</h3>
                <p className="text-editorial-text opacity-60 text-sm">Try searching for something else or browse another category.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar: 4 Columns Right */}
        <div className="lg:col-span-4 lg:sticky lg:top-[80px] h-fit space-y-10">
          <TrendingSidebar blogs={blogs} />
        </div>

      </div>

    </div>
  );
}
