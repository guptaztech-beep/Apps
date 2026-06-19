import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Share2, ExternalLink, ArrowRight, 
  MessageSquare, ThumbsUp, Lightbulb, CheckCircle2, Copy, Check, Sparkles, MapPin, Clock, Newspaper
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { useBlogs } from '../context/BlogContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { Comment } from '../types';
import { toPng } from 'html-to-image';

import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const renderDate = (d: any) => {
  if (!d) return '';
  if (typeof d === 'string') return d;
  if (d.toDate && typeof d.toDate === 'function') {
    try {
      return d.toDate().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (_) {}
  }
  if (d.seconds) {
    try {
      return new Date(d.seconds * 1000).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch (_) {}
  }
  return String(d);
};

// Dynamic Journalist Spot card that displays updated bio & image dynamically
function AuthorSpot({ authorId, defaultAuthorName }: { authorId?: string; defaultAuthorName: string }) {
  const [profile, setProfile] = useState<{ displayName: string; bio: string; photoUrl?: string } | null>(null);

  useEffect(() => {
    if (!authorId) return;
    const docRef = doc(db, 'users', authorId);
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as any);
      }
    }, (error) => {
      console.warn("Author profile load failed:", error);
    });
    return () => unsub();
  }, [authorId]);

  const displayName = profile?.displayName || defaultAuthorName;
  const bio = profile?.bio || 'Verified correspondent covering education board structures and competitive updates.';
  const photoUrl = profile?.photoUrl;

  return (
    <div className="mt-12 bg-editorial-aside border-2 border-black p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-editorial-text">
      <div className="w-20 h-20 border-2 border-black overflow-hidden flex-shrink-0 bg-slate-200 rounded-full shadow-md">
        {photoUrl ? (
          <img referrerPolicy="no-referrer" src={photoUrl} className="w-full h-full object-cover" alt={displayName} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl font-serif font-black bg-primary text-white">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="text-center sm:text-left space-y-2 flex-grow">
        <div className="flex items-center justify-center sm:justify-start gap-1 pb-1">
          <Newspaper size={11} className="text-[#dc2626]" />
          <span className="text-[9px] font-black uppercase text-primary tracking-widest block">HT-Style Verified Correspondent</span>
        </div>
        <h4 className="text-lg sm:text-xl font-serif font-black text-black leading-tight flex items-center justify-center sm:justify-start gap-1.5">
          {displayName}
          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-sans font-black uppercase tracking-widest px-2 py-0.5 rounded-sm">Verified Badge</span>
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 font-sans font-medium leading-relaxed">
          {bio}
        </p>
      </div>
    </div>
  );
}

export default function BlogDetails() {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = rawSlug?.replace(/\/$/, '')?.trim() || "";
  const navigate = useNavigate();
  const { blogs, addComment, addReaction, loading, config, userProfiles } = useBlogs();
  const blog = blogs.find(b => b.slug?.toLowerCase()?.trim() === slug.toLowerCase());
  
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [safePlugins, setSafePlugins] = useState<any[]>([]);

  useEffect(() => {
    const plugins = [];
    if (remarkGfm) {
      if (typeof remarkGfm === 'function') {
        plugins.push(remarkGfm);
      } else if ((remarkGfm as any).default && typeof (remarkGfm as any).default === 'function') {
        plugins.push((remarkGfm as any).default);
      }
    }
    if (remarkBreaks) {
      if (typeof remarkBreaks === 'function') {
        plugins.push(remarkBreaks);
      } else if ((remarkBreaks as any).default && typeof (remarkBreaks as any).default === 'function') {
        plugins.push((remarkBreaks as any).default);
      }
    }
    setSafePlugins(plugins);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-editorial-bg">
        <div className="text-[10px] uppercase font-black tracking-[0.5em] animate-pulse">Archiving Hindustan Dispatch...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-editorial-text">
        <span className="text-3xl font-serif font-black block mb-4">Post Not Found</span>
        <Link to="/" className="text-primary font-bold flex items-center justify-center gap-2">
          <ArrowLeft size={16} /> Back to Newsroom
        </Link>
      </div>
    );
  }

  const getShareUrl = () => {
    if (config?.productionDomain) {
      let base = config.productionDomain.trim();
      if (!/^https?:\/\//i.test(base)) {
        base = `https://${base}`;
      }
      return `${base.replace(/\/$/, '')}/blog/${blog.slug}`;
    }
    return `${window.location.origin}/blog/${blog.slug}`;
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert(`URL: ${url}`);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Read on RollFetch (Hindustan Times style update): ${blog.title}\n\n`;
    const url = getShareUrl();
    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    addComment(blog.id, { author: commentName, text: commentText });
    setCommentName('');
    setCommentText('');
  };

  // HT-Style: Filter trending side lists of same category or generic featured
  const recommendedBlogs = blogs.filter(b => b.id !== blog.id).slice(0, 5);
  const relativeCategories = blogs.filter(b => b.category === blog.category && b.id !== blog.id).slice(0, 3);
  const reactions = blog.reactions || { like: 0, informative: 0, helpful: 0 };

  const MarkdownRenderer = ({ content }: { content: string }) => {
    const RawMarkdown: any = ReactMarkdown;
    const Component = RawMarkdown?.default || RawMarkdown;
    if (!Component) return <pre className="whitespace-pre-wrap">{content}</pre>;
    return (
      <Component 
        remarkPlugins={safePlugins}
        components={{
          h1: ({ children, ...props }: any) => <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 mt-10 mb-6 tracking-tight leading-snug" {...props}>{children}</h1>,
          h2: ({ children, ...props }: any) => <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800 mt-10 mb-4 tracking-tight leading-snug pb-1 border-b-2 border-black/5" {...props}>{children}</h2>,
          h3: ({ children, ...props }: any) => <h3 className="text-xl sm:text-2xl font-serif font-semibold text-slate-800 mt-8 mb-3 tracking-tight" {...props}>{children}</h3>,
          p: ({ children, ...props }: any) => <p className="text-[17px] sm:text-[18px] text-editorial-text font-serif font-normal antialiased tracking-wide leading-relaxed sm:leading-[1.9] mb-8 last:mb-0" {...props}>{children}</p>,
          blockquote: ({ children, ...props }: any) => (
            <blockquote className="border-l-4 border-[#b91c1c] bg-[#b91c1c]/5 px-6 py-4 my-8 font-serif italic text-slate-800 rounded-r shadow-sm" {...props}>
              {children}
            </blockquote>
          ),
          ul: ({ children, ...props }: any) => <ul className="list-disc pl-6 space-y-2 mb-6 font-serif text-slate-700/85 text-[17px] leading-relaxed" {...props}>{children}</ul>,
          ol: ({ children, ...props }: any) => <ol className="list-decimal pl-6 space-y-2 mb-6 font-serif text-slate-700/85 text-[17px] leading-relaxed" {...props}>{children}</ol>,
          li: ({ children, ...props }: any) => <li className="my-1.5 pl-1" {...props}>{children}</li>,
          a: ({ children, href, ...props }: any) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#dc2626] font-bold underline underline-offset-4 decoration-2 hover:text-black transition-all rounded px-0.5" 
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }: any) => (
            <span className="block my-8 max-w-full">
              <span className="block overflow-hidden rounded border border-slate-200">
                <img src={src} alt={alt} className="w-full h-auto object-cover max-h-[500px]" referrerPolicy="no-referrer" {...props} />
              </span>
              {alt && (
                <span className="block text-center text-xs font-bold uppercase tracking-widest text-slate-500 mt-3 italic">
                  {alt}
                </span>
              )}
            </span>
          ),
          hr: ({ ...props }: any) => <hr className="my-10 border-t border-slate-200" {...props} />,
          pre: ({ children, ...props }: any) => (
            <pre className="bg-slate-900 text-slate-100 p-5 rounded overflow-x-auto font-mono text-sm leading-relaxed my-6 shadow-md border border-slate-800" {...props}>
              {children}
            </pre>
          ),
          code: ({ children, className, ...props }: any) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 text-[#b91c1c] font-mono text-sm px-1.5 py-0.5 rounded border border-slate-200 font-semibold" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono text-sm leading-relaxed block" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </Component>
    );
  };

  return (
    <div className="bg-editorial-bg text-editorial-text min-h-screen">
      
      {/* 1. TOP NEWS HEADER BLOCK */}
      <div className="border-b border-black/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb row like HT */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-500 mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to={`/category/${blog.category}`} className="text-[#dc2626] hover:underline uppercase">{blog.category}</Link>
            <span>/</span>
            <span className="text-slate-400 font-bold max-w-[200px] truncate">{blog.title}</span>
          </div>

          {/* Primary News Category Accent */}
          <div className="inline-block bg-[#b91c1c] text-white px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-4">
            {blog.category} dispatch
          </div>

          {/* Huge Editorial Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif font-black tracking-tighter leading-[1.1] mb-5 text-slate-900">
            {blog.title}
          </h1>

          {/* Subtitle / Excerpt summary node */}
          {blog.excerpt && (
            <p className="text-lg md:text-xl font-normal font-serif text-slate-600 dark:text-neutral-300 leading-relaxed max-w-5xl mb-6 pb-2 italic select-none">
              {blog.excerpt}
            </p>
          )}

          {/* HT Style Metadata: Journalist Byline, Location Stamps, Timestamps */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-y border-black py-4 select-none">
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-neutral-200">
                By <span className="font-black text-[#dc2626] font-serif hover:underline cursor-pointer">
                  {blog.authorId && userProfiles[blog.authorId]?.displayName 
                    ? userProfiles[blog.authorId].displayName 
                    : (blog.author || 'RollFetch Editorial Correspondent')}
                </span>
              </span>
              
              <span className="h-3 w-px bg-slate-300 hidden md:inline" />
              
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" /> Chandigarh / New Delhi, India
              </span>

              <span className="h-3 w-px bg-slate-300 hidden md:inline" />

              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Clock size={13} className="text-slate-400" /> Published: {renderDate(blog.date)} 04:30 PM IST
              </span>
            </div>

            {/* Quick Sharing cluster */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 bg-[#25d366] hover:opacity-90 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                <Share2 size={12} /> Share WA
              </button>
              
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-black hover:text-white text-black px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 2. TWO-COLUMN HIGH DENSITY EDITORIAL STAGE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ================ LEFT CORE CONTENT (8 COLUMNS) ================ */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Massive Lead Photo Banner */}
            <div className="border-4 border-black group overflow-hidden bg-black shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
              <img 
                src={blog.imageUrl || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"} 
                alt={blog.title} 
                className="w-full h-auto object-cover max-h-[480px] opacity-95 transition-all duration-1000 group-hover:scale-[1.02] block"
              />
              <div className="bg-black text-[9px] text-white font-mono uppercase tracking-widest px-4 py-2.5 flex items-center justify-between border-t border-black/10">
                <span>REPRESENTATIVE PORTAL INDEX PHOTO</span>
                <span className="text-yellow-400 font-bold">PRESS BULLETIN</span>
              </div>
            </div>

            {/* Core Markdown Body */}
            <article className="markdown-body font-serif prose prose-lg dark:prose-invert max-w-none leading-[1.8] sm:leading-[1.95] text-slate-800 dark:text-neutral-100 text-lg sm:text-[19px]">
              <MarkdownRenderer content={blog.content || ''} />
            </article>

            {/* Custom Interactive Press Identity Section */}
            <AuthorSpot authorId={blog.authorId} defaultAuthorName={blog.author} />

            {/* Interactive CTAs Links and Resource buttons if available */}
            {blog.ctaButtons && blog.ctaButtons.length > 0 && (
              <div className="pt-8 border-t-2 border-black">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#dc2626] block mb-3">ACTIONABLE OFFICIAL RESOURECE PORTALS</span>
                <div className="flex flex-col sm:flex-row gap-4">
                  {blog.ctaButtons.map((cta, idx) => (
                    <a 
                      key={idx}
                      href={cta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 text-center py-5 text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-2 border-black ${cta.variant === 'secondary' ? 'bg-secondary text-primary' : 'bg-primary text-white hover:bg-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}
                    >
                      {cta.label} <ArrowRight size={18} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary/Supplementary content images if available */}
            {blog.contentImages && blog.contentImages.length > 0 && (
              <div className="space-y-8 pt-6">
                {blog.contentImages.map((img, idx) => (
                  <figure key={idx} className="flex flex-col gap-2 w-full">
                    <div className="border-2 border-black overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      <img src={img.url} alt={img.caption || 'Detail'} className="w-full object-cover" />
                    </div>
                    {img.caption && (
                      <figcaption className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center italic mt-1">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {/* Gallery Cluster */}
            {blog.galleryImages && blog.galleryImages.length > 0 && (
              <div className="pt-8 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">IMAGE GALLERY DISPATCHES</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {blog.galleryImages.map((img, idx) => (
                    <div key={idx} className={`border-2 border-black overflow-hidden group/gal aspect-video`}>
                      <img src={img} className="w-full h-full object-cover transition-all duration-1000 hover:scale-105" alt="Gallery dispatch" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Link Verifiers */}
            {blog.officialLinks && blog.officialLinks.length > 0 && (
              <div className="bg-editorial-aside border-l-8 border-[#b91c1c] p-6 sm:p-8 space-y-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.05)] text-editorial-text mt-8">
                <h3 className="text-xs font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                  <ExternalLink size={18} className="text-[#b91c1c]" /> Official Source Verifiers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {blog.officialLinks.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border-2 border-black hover:bg-yellow-100 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group"
                    >
                      {link.label} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform animate-none" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Social Reader Reactions widget */}
            <div className="border-t-2 border-dashed border-black/10 pt-8 mt-12">
              <span className="text-[10px] uppercase font-black tracking-widest mb-4 block text-slate-500">Academic Reader Reactions Feed</span>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => addReaction(blog.id, 'like')}
                  className="px-6 py-3 border border-black hover:bg-yellow-100 transition-all flex items-center gap-3 bg-white text-black font-bold cursor-pointer rounded"
                >
                  <ThumbsUp size={16} className="text-[#dc2626]" />
                  <span className="text-xs font-black">{reactions.like} Likes</span>
                </button>
                <button 
                  onClick={() => addReaction(blog.id, 'informative')}
                  className="px-6 py-3 border border-black hover:bg-yellow-100 transition-all flex items-center gap-3 bg-white text-black font-bold cursor-pointer rounded"
                >
                  <Lightbulb size={16} className="text-[#d97706]" />
                  <span className="text-xs font-black">{reactions.informative} Informative</span>
                </button>
                <button 
                  onClick={() => addReaction(blog.id, 'helpful')}
                  className="px-6 py-3 border border-black hover:bg-yellow-100 transition-all flex items-center gap-3 bg-white text-black font-bold cursor-pointer rounded"
                >
                  <CheckCircle2 size={16} className="text-[#059669]" />
                  <span className="text-xs font-black">{reactions.helpful} Helpful</span>
                </button>
              </div>
            </div>

            {/* ========================================================
                VERIFIED COMMENTS BOARD
                ======================================================== */}
            <div className="pt-12 mt-12 border-t-2 border-black space-y-8 select-none">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-800">
                  Discussion Forum ({comments.length} verified responses)
                </h3>
                <span className="text-[10px] font-mono text-emerald-600 block">PUBLIC FEED</span>
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleCommentSubmit} className="space-y-4 bg-slate-50/50 p-6 border-2 border-dashed border-black/15 rounded-lg">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#dc2626]">Post Editorial Response</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <input 
                      type="text"
                      placeholder="My Display Name / Initials"
                      value={commentName}
                      onChange={e => setCommentName(e.target.value)}
                      className="w-full bg-white border border-black p-3.5 text-xs font-bold outline-none rounded"
                      required
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Write your brief enquiry, query, or CBSET/NEET results query feedback..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="w-full bg-white border border-black p-3.5 text-xs font-medium h-24 outline-none rounded resize-none"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-black hover:bg-primary text-white py-3.5 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-sm"
                  >
                    Submit Editorial response
                  </button>
                </div>
              </form>

              {/* Rendered comments */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="border border-black/10 p-5 bg-white dark:bg-zinc-900 rounded space-y-2">
                      <div className="flex justify-between items-center text-[10px] uppercase font-black text-[#dc2626] tracking-wider">
                        <span>{comment.author}</span>
                        <span className="font-mono text-slate-400 font-bold">{renderDate(comment.date)}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 font-medium leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-slate-200 bg-slate-50 text-xs font-medium text-slate-400 tracking-wide rounded">
                    Speak on this bulletin. No responses registered yet.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ================ RIGHT WIDGET STAGE (4 COLUMNS) ================ */}
          <div className="lg:col-span-4 lg:sticky lg:top-[74px] h-fit space-y-10 select-none">
            
            {/* 1. Verified Live Ticker Box */}
            <div className="border border-black p-5 space-y-4 bg-editorial-aside rounded shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#dc2626] flex items-center gap-1.5">
                  <span className="bg-[#b91c1c] w-2.5 h-2.5 rounded-full animate-pulse" />
                  BOARD BULLETIN DESK
                </span>
                <span className="text-[9px] font-bold bg-yellow-100 text-yellow-800 px-1.5 py-0.5 uppercase tracking-wider font-mono">
                  LIVE
                </span>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="border-b border-black/5 pb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">CBSE UPDATE</span>
                  <p className="font-extrabold leading-tight hover:text-[#dc2626] cursor-pointer">Secondary Board Re-evaluation fee process released details.</p>
                </div>
                <div className="border-b border-black/5 pb-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">NEET STATUS</span>
                  <p className="font-extrabold leading-tight hover:text-[#dc2626] cursor-pointer">State counseling cutoff lists announced online live tracker.</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">CUET ANNOUNCEMENT</span>
                  <p className="font-extrabold leading-tight hover:text-[#dc2626] cursor-pointer">Expected normalisation percentile mapping keys declared.</p>
                </div>
              </div>
            </div>

            {/* 2. Hot Categories Bulletins (HT Style list) */}
            <div className="border-2 border-black p-5 space-y-5 bg-white dark:bg-zinc-950 rounded">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] pb-2 border-b-2 border-black text-slate-800 dark:text-slate-200">
                Trending Exam Dispatches
              </h3>

              <div className="divide-y divide-slate-100 space-y-4">
                {recommendedBlogs.length > 0 ? (
                  recommendedBlogs.map((b, idx) => (
                    <div key={b.id} className="pt-4 first:pt-0 group text-slate-800">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl font-serif font-black italic text-slate-200 group-hover:text-yellow-405 transition-colors leading-[1] select-none shrink-0 text-amber-500">
                          {`0${idx + 1}`}
                        </span>
                        <div className="space-y-1 min-w-0">
                          <Link to={`/category/${b.category}`} className="text-[9px] text-[#2563eb] font-bold uppercase tracking-widest hover:underline">
                            {b.category}
                          </Link>
                          <Link to={`/blog/${b.slug}`}>
                            <h4 className="text-xs font-serif font-black leading-snug group-hover:text-primary/75 group-hover:underline decoration-yellow-400 decoration-2 transition-all text-slate-800 dark:text-slate-100 line-clamp-2">
                              {b.title}
                            </h4>
                          </Link>
                          <p className="text-[9px] text-slate-400 font-bold font-mono">
                            {renderDate(b.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 block py-2">No other active news guides available.</span>
                )}
              </div>
            </div>

            {/* 3. Consistency category archives links */}
            {relativeCategories.length > 0 && (
              <div className="border-2 border-black p-5 space-y-4 bg-white dark:bg-zinc-950 rounded">
                <h3 className="text-xs font-black uppercase tracking-[0.18em] pb-2 border-b-2 border-black text-slate-800 dark:text-neutral-100">
                  More on {blog.category}
                </h3>
                <div className="space-y-3">
                  {relativeCategories.map(b => (
                    <Link key={b.id} to={`/blog/${b.slug}`} className="block hover:underline truncate text-xs font-bold text-slate-600 dark:text-neutral-300">
                      ● {b.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick redirect home arrow */}
            <Link 
              to="/" 
              className="inline-flex w-full items-center justify-between border-2 border-black bg-black text-white hover:bg-yellow-400 hover:text-black py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-sm"
            >
              Return To Newsroom <ArrowRight size={14} />
            </Link>

          </div>

        </div>
      </div>

    </div>
  );
}
