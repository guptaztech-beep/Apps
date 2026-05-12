import { Calendar, User, ArrowRight, Share2, MessageSquare, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Blog } from '../types';

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const text = `Check this out: ${blog.title}\n\nRead more at: `;
    const url = window.location.origin + `/blog/${blog.slug}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
  };

  const likeCount = blog.reactions?.like || 0;
  const commentCount = blog.comments?.length || 0;

  return (
    <article className="bg-editorial-bg border border-black overflow-hidden group flex flex-col hover:bg-editorial-aside transition-colors h-full shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
      <Link to={`/blog/${blog.slug}`} className="relative h-48 sm:h-64 overflow-hidden border-b border-black">
        <img 
          src={blog.imageUrl} 
          alt={blog.title} 
          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-black text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 uppercase tracking-[0.2em]">
            {blog.category}
          </span>
        </div>
      </Link>
      
      <div className="p-6 sm:p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-[9px] text-editorial-text opacity-50 font-black uppercase tracking-[0.3em] mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-secondary" />
            {blog.date}
          </div>
          <div className="flex items-center gap-1 border-l border-primary/20 pl-4">
            <User size={12} className="text-secondary" />
            {blog.author}
          </div>
        </div>

        <Link to={`/blog/${blog.slug}`}>
          <h3 className="text-2xl font-serif font-black text-editorial-text group-hover:italic transition-all leading-[1.1] mb-4">
            {blog.title}
          </h3>
        </Link>
        
        <p className="text-editorial-text opacity-70 text-sm mb-8 line-clamp-2 leading-relaxed">
          {blog.excerpt}
        </p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
            <ThumbsUp size={12} className="text-primary" />
            {likeCount}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
            <MessageSquare size={12} className="text-secondary" />
            {commentCount}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-primary/10">
          <Link 
            to={`/blog/${blog.slug}`}
            className="text-primary font-black text-[11px] uppercase tracking-widest flex items-center gap-2 group/link"
          >
            Read Article <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
          </Link>
          
          <button 
            onClick={handleShare}
            className="text-editorial-text opacity-40 hover:opacity-100 transition-opacity"
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
