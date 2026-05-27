import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BlogList from './components/BlogList';
import BlogDetails from './components/BlogDetails';
import Footer from './components/Footer';

import AdminPanel from './components/AdminPanel';
import Careers from './pages/Careers';
import PrivacyPolicy from './pages/PrivacyPolicy';
import EditorialPolicy from './pages/EditorialPolicy';
import Sitemap from './pages/Sitemap';

function Home() {
  return (
    <>
      <Hero />
      <BlogList />
    </>
  );
}

function CategoryPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <BlogList />
    </div>
  );
}

import { BlogProvider } from './context/BlogContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BlogProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-editorial-bg transition-colors duration-300 w-full">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/blog/:slug" element={<BlogDetails />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/editorial-policy" element={<EditorialPolicy />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/category" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </BlogProvider>
    </ThemeProvider>
  );
}

