import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BlogList from './components/BlogList';
import BlogDetails from './components/BlogDetails';
import Footer from './components/Footer';

import AdminPanel from './components/AdminPanel';

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
          <div className="min-h-screen flex flex-col bg-editorial-bg transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/blog/:slug" element={<BlogDetails />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </BlogProvider>
    </ThemeProvider>
  );
}

