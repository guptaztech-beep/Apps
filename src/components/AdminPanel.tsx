import { useState, useRef, useEffect } from 'react';
import { useBlogs } from '../context/BlogContext';
import { Blog, WriterApplication } from '../types';
import { 
  Plus, Trash2, Edit3, X, Save, Star, Bold, Italic, 
  List, Heading2, Link as LinkIcon, Eye, Code, 
  Settings, Users, FileText, Check, Ban, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

type AdminTab = 'dispatches' | 'applications' | 'settings';

export default function AdminPanel() {
  const { 
    blogs, addBlog, updateBlog, deleteBlog, 
    applications, updateApplication,
    config, updateConfig,
    isAdmin, loading 
  } = useBlogs();
  const [activeTab, setActiveTab] = useState<AdminTab>('dispatches');
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [logoUrl, setLogoUrl] = useState(config.logoUrl);

  useEffect(() => {
    setLogoUrl(config.logoUrl);
  }, [config.logoUrl]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-editorial-bg">
      <div className="text-xs font-black uppercase tracking-[0.5em] animate-pulse">Authenticating_Session...</div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-editorial-bg p-8">
      <div className="max-w-md w-full bg-editorial-bg border-4 border-black p-12 text-center shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-white/5">
        <h2 className="text-3xl font-serif font-black italic mb-6">Access_Denied</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 leading-relaxed mb-8">
          Unauthorized clearance detected. This node is reserved for RollFetch Editorial Council members only.
        </p>
        <Link to="/" className="inline-block bg-primary text-white px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all">
          Return to Hub
        </Link>
      </div>
    </div>
  );

  const handleUpdateLogo = async () => {
    await updateConfig({ logoUrl });
    alert("Brand logo updated successfully.");
  };
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({
    title: '',
    category: 'How-To',
    excerpt: '',
    content: '',
    author: 'Admin',
    isFeatured: false,
    galleryImages: [],
    ctaButtons: [],
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'
  });

  const handleCreate = () => {
    setIsEditing(true);
    setCurrentBlog({
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      slug: '',
      category: 'How-To',
      excerpt: '',
      content: '',
      author: 'Admin',
      isFeatured: false,
      galleryImages: [],
      ctaButtons: [],
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80'
    });
  };

  const addGalleryImage = () => {
    setCurrentBlog(prev => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), '']
    }));
  };

  const updateGalleryImage = (index: number, url: string) => {
    const newImages = [...(currentBlog.galleryImages || [])];
    newImages[index] = url;
    setCurrentBlog(prev => ({ ...prev, galleryImages: newImages }));
  };

  const removeGalleryImage = (index: number) => {
    setCurrentBlog(prev => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== index)
    }));
  };

  const addCTA = () => {
    setCurrentBlog(prev => ({
      ...prev,
      ctaButtons: [...(prev.ctaButtons || []), { label: '', url: '', variant: 'primary' }]
    }));
  };

  const updateCTA = (index: number, field: string, value: string) => {
    const newCTAs = [...(currentBlog.ctaButtons || [])];
    newCTAs[index] = { ...newCTAs[index], [field]: value };
    setCurrentBlog(prev => ({ ...prev, ctaButtons: newCTAs }));
  };

  const removeCTA = (index: number) => {
    setCurrentBlog(prev => ({
      ...prev,
      ctaButtons: prev.ctaButtons?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!currentBlog.title || !currentBlog.content) return alert("Title and Content are required");
    
    const slug = currentBlog.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const newBlog = { ...currentBlog, slug } as Blog;

    if (currentBlog.id && blogs.find(b => b.id === currentBlog.id)) {
      updateBlog(newBlog);
    } else {
      const { id, ...blogData } = newBlog;
      addBlog(blogData);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this dispatch?")) {
      deleteBlog(id);
    }
  };

  const toggleFeatured = (blog: Blog) => {
    updateBlog({ ...blog, isFeatured: !blog.isFeatured });
  };

  const insertFormat = (format: 'bold' | 'italic' | 'h2' | 'list' | 'link') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = currentBlog.content || '';
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        // Check if already bolded
        if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
          replacement = selectedText.slice(2, -2);
        } else {
          replacement = `**${selectedText || 'bold text'}**`;
        }
        break;
      case 'italic':
        // Check if already italicized
        if (selectedText.startsWith('*') && selectedText.endsWith('*')) {
          replacement = selectedText.slice(1, -1);
        } else {
          replacement = `*${selectedText || 'italic text'}*`;
        }
        break;
      case 'h2': replacement = `\n## ${selectedText || 'Heading'}\n`; break;
      case 'list': replacement = `\n- ${selectedText || 'List item'}`; break;
      case 'link': 
        replacement = `[${selectedText || 'Link text'}](https://)`; 
        cursorOffset = -1; // place cursor inside parentheses
        break;
    }
    
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setCurrentBlog({ ...currentBlog, content: newText });
    
    // Reset focus and selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = start + replacement.length + cursorOffset;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+B for Bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertFormat('bold');
    }
    // Ctrl+I for Italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertFormat('italic');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-12 border-b-4 border-black pb-8">
        <div>
          <h2 className="text-4xl sm:text-5xl font-serif font-black italic tracking-tighter text-editorial-text">Editor Desk</h2>
          <nav className="flex gap-6 mt-4">
            <button 
              onClick={() => { setActiveTab('dispatches'); setIsEditing(false); }}
              className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'dispatches' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-black'}`}
            >
              <FileText size={14} /> Dispatches
            </button>
            <button 
              onClick={() => { setActiveTab('applications'); setIsEditing(false); }}
              className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-black'}`}
            >
              <Users size={14} /> Verified Requests
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">
                  {applications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setIsEditing(false); }}
              className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-black'}`}
            >
              <Settings size={14} /> Brand Assets
            </button>
          </nav>
        </div>
        {activeTab === 'dispatches' && (
          <button 
            onClick={handleCreate}
            className="w-full sm:w-auto bg-primary text-editorial-bg px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]"
          >
            <Plus size={18} /> Compose New
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dispatches' && (
          <motion.div
            key="dispatches"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-editorial-bg border-4 border-black p-6 sm:p-12 mb-16"
              >
                <div className="flex justify-between items-center mb-10 pb-4 border-b border-black/10">
                  <h3 className="text-2xl font-serif font-black italic underline decoration-secondary decoration-4 underline-offset-4">Dispatch Editor</h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-black">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Headline</label>
                        <input 
                          type="text" 
                          value={currentBlog.title}
                          onChange={e => setCurrentBlog({...currentBlog, title: e.target.value})}
                          className="w-full bg-editorial-aside border-2 border-primary/10 p-4 text-sm font-bold focus:border-primary outline-none transition-all text-editorial-text"
                          placeholder="Enter headline..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Cover Image URL</label>
                        <input 
                          type="text" 
                          value={currentBlog.imageUrl}
                          onChange={e => setCurrentBlog({...currentBlog, imageUrl: e.target.value})}
                          className="w-full bg-editorial-aside border-2 border-primary/10 p-4 text-sm font-mono focus:border-primary outline-none transition-all text-editorial-text"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Column Category</label>
                        <input 
                          list="categories"
                          type="text"
                          value={currentBlog.category}
                          onChange={e => setCurrentBlog({...currentBlog, category: e.target.value})}
                          className="w-full bg-editorial-aside border-2 border-primary/10 p-4 text-xs font-bold focus:border-primary outline-none transition-all uppercase tracking-widest text-editorial-text"
                          placeholder="Select or Type Category..."
                        />
                        <datalist id="categories">
                          <option value="CBSE" />
                          <option value="NEET" />
                          <option value="Exam" />
                          <option value="Result" />
                          <option value="How-To" />
                          {[...new Set(blogs.map(b => b.category))].map(cat => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Featured Status</label>
                        <button 
                          onClick={() => setCurrentBlog({...currentBlog, isFeatured: !currentBlog.isFeatured})}
                          className={`w-full p-4 border-2 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest ${currentBlog.isFeatured ? 'bg-primary text-editorial-bg border-primary' : 'bg-editorial-aside border-primary/10 text-editorial-text opacity-40 hover:opacity-100'}`}
                        >
                          <Star size={16} fill={currentBlog.isFeatured ? "currentColor" : "none"} />
                          {currentBlog.isFeatured ? 'Featured On' : 'Set as Featured'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Author (Journalist Pseudo)</label>
                      <input 
                        type="text" 
                        value={currentBlog.author}
                        onChange={e => setCurrentBlog({...currentBlog, author: e.target.value})}
                        className="w-full bg-editorial-aside border-2 border-primary/10 p-4 text-xs font-bold focus:border-primary outline-none transition-all uppercase tracking-widest text-editorial-text"
                        placeholder="e.g. Editorial Board"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Teaser Text (Excerpt)</label>
                      <textarea 
                        value={currentBlog.excerpt}
                        onChange={e => setCurrentBlog({...currentBlog, excerpt: e.target.value})}
                        className="w-full bg-editorial-aside border-2 border-primary/10 p-4 text-sm font-medium focus:border-primary outline-none transition-all h-32 text-editorial-text resize-none"
                        placeholder="Short engaging summary..."
                      />
                      <div className="mt-2 text-[9px] uppercase font-bold opacity-30 text-right">
                        Characters: {currentBlog.excerpt?.length || 0}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase tracking-widest">Article Gallery (Optional)</label>
                        <button onClick={addGalleryImage} className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                          <Plus size={12} /> Add Image
                        </button>
                      </div>
                      <div className="space-y-4">
                        {currentBlog.galleryImages?.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <input 
                              type="text" 
                              value={url}
                              onChange={e => updateGalleryImage(index, e.target.value)}
                              className="flex-grow bg-editorial-aside border-2 border-primary/10 p-3 text-[10px] font-bold focus:border-primary outline-none text-editorial-text"
                              placeholder="Additional Image URL..."
                            />
                            <button onClick={() => removeGalleryImage(index)} className="p-3 text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black uppercase tracking-widest">Action Buttons (CTA)</label>
                        <button onClick={addCTA} className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                          <Plus size={12} /> Add Button
                        </button>
                      </div>
                      <div className="space-y-4">
                        {currentBlog.ctaButtons?.map((cta, index) => (
                          <div key={index} className="p-4 border-2 border-primary/10 space-y-4 bg-editorial-aside">
                            <div className="grid grid-cols-2 gap-4">
                              <input 
                                type="text" 
                                placeholder="Label (e.g. Apply Now)"
                                value={cta.label}
                                onChange={e => updateCTA(index, 'label', e.target.value)}
                                className="bg-editorial-bg border-2 border-primary/10 p-3 text-[10px] font-bold outline-none uppercase tracking-widest text-editorial-text"
                              />
                              <input 
                                type="text" 
                                placeholder="Link URL"
                                value={cta.url}
                                onChange={e => updateCTA(index, 'url', e.target.value)}
                                className="bg-editorial-bg border-2 border-primary/10 p-3 text-[10px] font-bold outline-none text-editorial-text"
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <select 
                                value={cta.variant}
                                onChange={e => updateCTA(index, 'variant', e.target.value)}
                                className="bg-editorial-bg border-2 border-primary/10 p-2 text-[9px] font-black uppercase text-editorial-text"
                              >
                                <option value="primary">Primary</option>
                                <option value="secondary">Secondary</option>
                              </select>
                              <button onClick={() => removeCTA(index)} className="text-[9px] font-black uppercase text-red-500">Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Main Body (Markdown)</label>
                        <button 
                          onClick={() => setIsPreviewMode(!isPreviewMode)}
                          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 flex items-center gap-1 transition-all ${isPreviewMode ? 'bg-primary text-editorial-bg' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {isPreviewMode ? <><Code size={12} /> Editor Mode</> : <><Eye size={12} /> Live Preview</>}
                        </button>
                      </div>
                      
                      {!isPreviewMode ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-editorial-aside border-2 border-primary/10">
                            <button onClick={() => insertFormat('bold')} className="p-2 hover:bg-primary hover:text-white transition-colors" title="Bold (Ctrl+B)">
                              <Bold size={16} />
                            </button>
                            <button onClick={() => insertFormat('italic')} className="p-2 hover:bg-primary hover:text-white transition-colors" title="Italic (Ctrl+I)">
                              <Italic size={16} />
                            </button>
                            <div className="w-px h-4 bg-primary/10 mx-1" />
                            <button onClick={() => insertFormat('h2')} className="p-2 hover:bg-primary hover:text-white transition-colors" title="Heading">
                              <Heading2 size={16} />
                            </button>
                            <button onClick={() => insertFormat('list')} className="p-2 hover:bg-primary hover:text-white transition-colors" title="List">
                              <List size={16} />
                            </button>
                            <button onClick={() => insertFormat('link')} className="p-2 hover:bg-primary hover:text-white transition-colors" title="Link">
                              <LinkIcon size={16} />
                            </button>
                          </div>

                          <textarea 
                            ref={textareaRef}
                            value={currentBlog.content}
                            onChange={e => setCurrentBlog({...currentBlog, content: e.target.value})}
                            onKeyDown={handleKeyDown}
                            onPaste={(e) => {
                              const html = e.clipboardData.getData('text/html');
                              if (html) {
                                e.preventDefault();
                                const markdown = turndownService.turndown(html);
                                const start = e.currentTarget.selectionStart;
                                const end = e.currentTarget.selectionEnd;
                                const text = currentBlog.content || '';
                                const newText = text.substring(0, start) + markdown + text.substring(end);
                                setCurrentBlog({ ...currentBlog, content: newText });
                              }
                            }}
                            className="w-full bg-editorial-aside border-2 border-primary/10 p-6 text-sm font-mono focus:border-primary outline-none transition-all h-[500px] leading-relaxed text-editorial-text"
                            placeholder="Write your official dispatch here..."
                          />
                          <div className="mt-2 text-[9px] uppercase font-black tracking-widest opacity-40">
                            Shortcuts: Ctrl+B (Bold), Ctrl+I (Italic)
                          </div>
                        </>
                      ) : (
                        <div className="w-full bg-editorial-bg border-2 border-primary/10 p-6 h-[565px] overflow-y-auto overflow-x-hidden">
                          <div className="markdown-body prose prose-sm max-w-none 
                            prose-p:leading-relaxed prose-p:text-editorial-text
                            prose-strong:text-primary prose-a:text-primary">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                              {currentBlog.content || '*No content to preview*'}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-editorial-aside p-6 border-2 border-black/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b border-black/10 pb-2">Editorial Shortcuts</h4>
                      <div className="space-y-2 text-[10px] font-bold text-slate-500">
                        <p>• <code className="bg-black/5 px-1">[Label](URL)</code> for text links</p>
                        <p>• <code className="bg-black/5 px-1"># Level 1 Heading</code></p>
                        <p>• <code className="bg-black/5 px-1">## Level 2 Heading</code></p>
                        <p>• Use Action Buttons section for verified portal links</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 border-t border-black/10 pt-8">
                  <button onClick={() => setIsEditing(false)} className="px-12 py-5 text-sm font-black uppercase tracking-[0.2em] border-2 border-black/10 hover:border-black transition-all">
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleSave}
                    className="bg-primary text-white px-12 py-5 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-primary/20"
                  >
                    <Save size={20} /> Publish Dispatch
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {blogs.map(blog => (
                  <div key={blog.id} className="bg-editorial-bg border-2 border-black/5 flex flex-col sm:flex-row items-center justify-between p-6 hover:border-black transition-all group overflow-hidden">
                    <div className="flex items-center gap-6 mb-6 sm:mb-0 w-full sm:w-auto">
                      <div className="w-16 h-16 border-2 border-black overflow-hidden flex-shrink-0 group-hover:border-primary transition-colors">
                        <img src={blog.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 group-hover:text-primary transition-colors">{blog.category} _ {blog.date}</span>
                        <h4 className="text-lg sm:text-xl font-serif font-black underline decoration-black/5 group-hover:decoration-secondary transition-all truncate">{blog.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-primary/10">
                      <button 
                        onClick={() => toggleFeatured(blog)}
                        className={`p-3 border transition-all rounded-lg ${blog.isFeatured ? 'bg-primary text-editorial-bg border-primary' : 'bg-editorial-aside border-primary/10 text-editorial-text opacity-40 hover:opacity-100 hover:border-editorial-text'}`}
                        title={blog.isFeatured ? "Remove from Featured" : "Add to Featured"}
                      >
                        <Star size={18} fill={blog.isFeatured ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => {
                          setCurrentBlog(blog);
                          setIsEditing(true);
                        }}
                        className="p-3 bg-editorial-aside border border-primary/10 hover:border-editorial-text text-editorial-text transition-all rounded-lg"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(blog.id)}
                        className="p-3 bg-red-50 text-red-600 border border-red-100 hover:border-red-600 transition-all rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'applications' && (
          <motion.div
            key="applications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {applications.length === 0 ? (
              <div className="bg-editorial-aside border-2 border-black/5 p-12 text-center">
                <p className="text-xs font-black uppercase tracking-widest opacity-40">No verified requests pending_</p>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="bg-editorial-bg border-2 border-black p-6 sm:p-8 flex flex-col md:flex-row gap-8">
                  <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {app.status}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{app.date}</span>
                    </div>
                    <h3 className="text-2xl font-serif font-black">{app.name}</h3>
                    <p className="text-xs font-bold text-primary">{app.email}</p>
                    <div className="p-4 bg-editorial-aside border-l-4 border-primary/20 italic text-sm text-editorial-text/70">
                      "{app.bio}"
                    </div>
                    <a 
                      href={app.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      View Portfolio <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="flex flex-row md:flex-col gap-3 justify-end whitespace-nowrap">
                    {app.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateApplication(app.id, 'approved')}
                          className="flex-grow md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => updateApplication(app.id, 'rejected')}
                          className="flex-grow md:flex-none flex items-center justify-center gap-2 border-2 border-red-600 text-red-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Ban size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-editorial-bg border-4 border-black p-8 sm:p-12 shadow-[12px_12px_0_0_rgba(0,0,0,0.05)]">
              <h3 className="text-2xl font-serif font-black mb-8 border-b border-black/10 pb-4 flex items-center gap-3">
                <ImageIcon className="text-primary" /> Brand Identity
              </h3>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Master Logo Configuration</label>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      placeholder="https://link-to-your-logo.png"
                      className="w-full bg-editorial-aside border-2 border-primary/10 p-4 text-sm font-mono focus:border-primary outline-none transition-all"
                    />
                    <div className="p-6 bg-black/[0.02] border-2 border-dashed border-black/10 flex items-center justify-center min-h-[120px]">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo Preview" className="max-h-20 object-contain drop-shadow-sm" />
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Preview_Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5">
                  <button 
                    onClick={handleUpdateLogo}
                    className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary transition-all flex items-center justify-center gap-2 group"
                  >
                    Sync Virtual Asset <Check size={16} />
                  </button>
                  <p className="mt-4 text-[9px] font-bold text-center opacity-30 uppercase tracking-widest">
                    This will update the header logo across all verified nodes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
