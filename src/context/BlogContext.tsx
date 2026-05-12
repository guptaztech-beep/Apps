import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  setDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Blog, Comment, Reactions } from '../types';
import { BLOGS } from '../constants';

interface BlogContextType {
  blogs: Blog[];
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  addBlog: (blog: Omit<Blog, 'id'>) => Promise<void>;
  updateBlog: (blog: Blog) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addComment: (blogId: string, comment: Omit<Comment, 'id' | 'date'>) => Promise<void>;
  addReaction: (blogId: string, reaction: keyof Reactions) => Promise<void>;
  subscribe: (email: string) => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

const ADMIN_EMAIL = 'guptaztech@gmail.com';

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL && user?.emailVerified;

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(collection(db, 'blogs'), orderBy('date', 'desc'));
    const unsubBlogs = onSnapshot(q, (snapshot) => {
      const blogData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Blog));

      // Initial Seed if empty
      if (blogData.length === 0) {
        // We could seed here but maybe better to do it manually or via a button
        // For now, let's keep it empty or use internal constants as fallback visual only
      }

      setBlogs(blogData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blogs');
    });

    return () => {
      unsubAuth();
      unsubBlogs();
    };
  }, []);

  const addBlog = async (blog: Omit<Blog, 'id'>) => {
    try {
      await addDoc(collection(db, 'blogs'), {
        ...blog,
        authorId: user?.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'blogs');
    }
  };

  const updateBlog = async (blog: Blog) => {
    try {
      const { id, ...data } = blog;
      await updateDoc(doc(db, 'blogs', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `blogs/${blog.id}`);
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'blogs', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `blogs/${id}`);
    }
  };

  const addComment = async (blogId: string, comment: Omit<Comment, 'id' | 'date'>) => {
    const path = `blogs/${blogId}/comments`;
    try {
      await addDoc(collection(db, path), {
        ...comment,
        blogId,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const addReaction = async (blogId: string, reaction: keyof Reactions) => {
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;
    const reactions = blog.reactions || { like: 0, informative: 0, helpful: 0 };
    try {
      await updateDoc(doc(db, 'blogs', blogId), {
        [`reactions.${reaction}`]: (reactions[reaction] || 0) + 1
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `blogs/${blogId}`);
    }
  };

  const subscribe = async (email: string) => {
    try {
      await addDoc(collection(db, 'subscribers'), {
        email,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subscribers');
    }
  };

  return (
    <BlogContext.Provider value={{ 
      blogs, 
      user, 
      isAdmin, 
      loading,
      addBlog, 
      updateBlog, 
      deleteBlog, 
      addComment, 
      addReaction,
      subscribe
    }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlogs() {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlogs must be used within a BlogProvider');
  }
  return context;
}
