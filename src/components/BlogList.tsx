import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useBlogs } from '../context/BlogContext';
import { Category } from '../types';
import BlogCard from './BlogCard';
import { Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function BlogList() {
  const { blogs, loading } = useBlogs();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>((categorySlug as Category) || 'All');

  const categories: Category[] = ['All', 'CBSE', 'NEET', 'How-To', 'Exam', 'Result'];

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [blogs, activeCategory, searchQuery]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
      <div className="text-[10px] uppercase font-black tracking-[0.5em] opacity-40 animate-pulse">Cataloging_Records...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b-2 border-black pb-8">
        <div>
          <h2 className="text-5xl font-serif font-black text-editorial-text mb-4 tracking-tighter">
            {activeCategory === 'All' ? 'Latest Publications' : `${activeCategory} _Report`}
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[11px]">Verified Academic Repository / Journal Index</p>
        </div>

        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search Archives..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-black/5 bg-editorial-bg focus:outline-none focus:border-black transition-all text-xs font-bold uppercase tracking-widest text-editorial-text"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-12">
        <div className="flex items-center gap-2 text-slate-400 mr-4">
          <Filter size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sort Archives:</span>
        </div>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeCategory === cat 
                ? 'bg-primary text-editorial-bg border-primary shadow-[4px_4px_0_0_rgba(254,240,138,1)]' 
                : 'bg-editorial-bg text-slate-500 border-black/10 hover:border-black'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredBlogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <BlogCard blog={blog} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-editorial-aside border-2 border-dashed border-black/10">
          <div className="max-w-xs mx-auto">
            <Search size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-editorial-text mb-2">No matching updates</h3>
            <p className="text-editorial-text opacity-60 text-sm">Try searching for something else or browse another category.</p>
          </div>
        </div>
      )}
    </div>
  );
}
