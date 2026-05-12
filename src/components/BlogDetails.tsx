import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, ExternalLink, ChevronRight, ArrowRight, MessageSquare, ThumbsUp, Lightbulb, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useBlogs } from '../context/BlogContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Comment } from '../types';

import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default function BlogDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { blogs, addComment, addReaction, loading } = useBlogs();
  const blog = blogs.find(b => b.slug === slug);
  
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!blog) return;
    
    const q = query(collection(db, `blogs/${blog.id}/comments`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `blogs/${blog.id}/comments`);
    });
    
    return () => unsub();
  }, [blog?.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-editorial-bg">
      <div className="text-[10px] uppercase font-black tracking-[0.5em] animate-pulse">Archiving_Dispatch...</div>
    </div>
  );

  if (!blog) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Post Not Found</h2>
        <Link to="/" className="text-primary font-bold flex items-center justify-center gap-2">
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    const text = `Check this official update: ${blog.title}\n\n`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentText) return;
    addComment(blog.id, { author: commentName, text: commentText });
    setCommentName('');
    setCommentText('');
  };

  const relatedBlogs = blogs.filter(b => b.category === blog.category && b.id !== blog.id).slice(0, 3);

  const reactions = blog.reactions || { like: 0, informative: 0, helpful: 0 };

  return (
    <div className="bg-editorial-bg min-h-screen">
      <div className="bg-primary text-white pt-12 pb-48">
        <div className="max-w-[95%] sm:max-w-7xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-10 text-[10px] uppercase font-bold tracking-[0.3em] transition-colors">
            <ArrowLeft size={16} /> [ Back to Archives ]
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-secondary text-primary font-black text-[10px] px-3 py-1 uppercase tracking-widest border border-black/10">
                {blog.category}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Verified Dispatch</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-serif font-black mb-10 leading-[0.95] tracking-tighter italic">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-secondary" />
                {blog.date}
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-secondary" />
                {blog.author}
              </div>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-white hover:italic transition-all"
              >
                <Share2 size={16} />
                Share Dispatch
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[95%] sm:max-w-7xl mx-auto px-4 -mt-32 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-editorial-bg border-2 border-black overflow-hidden mb-16 shadow-[16px_16px_0_0_rgba(0,0,0,0.05)]"
        >
          <div className="h-[300px] sm:h-[500px] border-b border-black group overflow-hidden">
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-full object-cover transition-all duration-1000 hover:scale-110"
            />
          </div>
          <div className="p-8 sm:p-16">
            <div className="markdown-body prose prose-slate dark:prose-invert max-w-none 
              prose-p:text-base sm:prose-p:text-lg prose-p:leading-[1.8] prose-p:text-editorial-text
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-editorial-aside prose-blockquote:p-6
              prose-ul:list-disc prose-ol:list-decimal prose-li:text-editorial-text/80
              prose-a:text-primary prose-a:underline hover:prose-a:italic">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{blog.content}</ReactMarkdown>
            </div>

            {blog.galleryImages && blog.galleryImages.length > 0 && (
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {blog.galleryImages.map((img, idx) => (
                  <div key={idx} className={`border-2 border-black overflow-hidden group/gal ${idx === 0 && blog.galleryImages!.length % 2 !== 0 ? 'sm:col-span-2 aspect-video' : 'aspect-square'}`}>
                    <img src={img} className="w-full h-full object-cover transition-all duration-1000 hover:scale-110" alt="Gallery detail" />
                  </div>
                ))}
              </div>
            )}

            {blog.ctaButtons && blog.ctaButtons.length > 0 && (
              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                {blog.ctaButtons.map((cta, idx) => (
                  <a 
                    key={idx}
                    href={cta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 text-center py-5 text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${cta.variant === 'secondary' ? 'bg-secondary text-primary border-2 border-black/10' : 'bg-primary text-white hover:bg-black shadow-lg shadow-black/10'}`}
                  >
                    {cta.label} <ArrowRight size={18} />
                  </a>
                ))}
              </div>
            )}

            {blog.officialLinks && (
              <div className="mt-16 p-8 bg-editorial-aside border-l-8 border-black">
                <h3 className="text-xs font-black text-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <ExternalLink size={18} /> Official Source Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {blog.officialLinks.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border-2 border-black/10 hover:border-black px-6 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group"
                    >
                      {link.label} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reactions */}
            <div className="mt-16 border-t-2 border-dashed border-black/10 pt-10">
              <h4 className="text-[10px] uppercase font-black tracking-widest mb-6">Reader Feedback</h4>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => addReaction(blog.id, 'like')}
                  className="px-6 py-3 border-2 border-black/5 hover:border-black transition-all flex items-center gap-3 bg-slate-50"
                >
                  <ThumbsUp size={16} className="text-primary" />
                  <span className="text-xs font-black">{reactions.like}</span>
                </button>
                <button 
                  onClick={() => addReaction(blog.id, 'informative')}
                  className="px-6 py-3 border-2 border-black/5 hover:border-black transition-all flex items-center gap-3 bg-slate-50"
                >
                  <Lightbulb size={16} className="text-amber-500" />
                  <span className="text-xs font-black">{reactions.informative}</span>
                </button>
                <button 
                  onClick={() => addReaction(blog.id, 'helpful')}
                  className="px-6 py-3 border-2 border-black/5 hover:border-black transition-all flex items-center gap-3 bg-slate-50"
                >
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-xs font-black">{reactions.helpful}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {relatedBlogs.length > 0 && (
          <div className="mt-24 border-t-4 border-black pt-16 mb-24">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-2xl font-serif font-black italic tracking-tighter text-editorial-text underline decoration-secondary decoration-4 underline-offset-8">
                The Continuity_Archives
              </h3>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Section C: Related Dispatches</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {relatedBlogs.map((rb, idx) => (
                <Link key={rb.id} to={`/blog/${rb.slug}`} className="group block">
                  <div className="relative aspect-[4/3] border-2 border-black overflow-hidden mb-6 group-hover:shadow-[8px_8px_0_0_rgba(254,240,138,1)] transition-all">
                    <img 
                      src={rb.imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" 
                      alt={rb.title} 
                    />
                    <div className="absolute top-4 left-4 bg-primary text-editorial-bg px-2 py-1 text-[8px] font-black uppercase tracking-widest">
                      Related_0{idx + 1}
                    </div>
                  </div>
                  <h4 className="font-serif font-black text-xl text-editorial-text group-hover:italic group-hover:text-primary transition-all line-clamp-2 leading-tight mb-3">
                    {rb.title}
                  </h4>
                  <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity border-t border-black/5 pt-4">
                    <span className="text-[9px] font-black uppercase tracking-widest">{rb.date}</span>
                    <div className="flex items-center gap-1 text-primary font-black text-[9px] uppercase tracking-widest">
                      Read <ArrowRight size={10} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mb-24">
          <h3 className="text-xs font-black text-black uppercase tracking-[0.4em] mb-10 border-b-2 border-black pb-4 flex items-center gap-2">
            <MessageSquare size={16} /> Community Discussions
          </h3>
          
          <div className="space-y-6 mb-12">
            {comments.length ? comments.map(comment => (
              <div key={comment.id} className="bg-editorial-bg border-2 border-primary/20 p-6 relative shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">{comment.author}</span>
                  <span className="text-[9px] font-bold text-slate-400">{comment.date}</span>
                </div>
                <p className="text-sm font-medium text-editorial-text opacity-80 leading-relaxed italic">"{comment.text}"</p>
              </div>
            )) : (
              <p className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-primary/10">No entries in discussion yet.</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="bg-editorial-aside p-8 border-2 border-primary shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 border-b border-primary/10 pb-2">Post an Entry</h4>
            <div className="grid grid-cols-1 gap-6">
              <input 
                type="text" 
                placeholder="Full Name"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                className="w-full bg-editorial-bg border-2 border-primary/10 p-4 text-xs font-bold outline-none focus:border-primary transition-all uppercase tracking-widest text-editorial-text"
              />
              <textarea 
                placeholder="Write your academic perspective..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="w-full bg-editorial-bg border-2 border-primary/10 p-4 text-sm font-medium outline-none focus:border-primary transition-all h-32 leading-relaxed text-editorial-text"
              />
              <button type="submit" className="bg-primary text-editorial-bg px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all self-start">
                Publish Comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
