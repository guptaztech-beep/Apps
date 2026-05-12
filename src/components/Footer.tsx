import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBlogs } from '../context/BlogContext';

export default function Footer() {
  const { subscribe } = useBlogs();
  return (
    <footer className="bg-primary dark:bg-zinc-950 text-slate-400 mt-auto border-t-2 border-black dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8 mb-16">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-serif font-black italic text-white mb-6">RollFetch</h3>
            <p className="text-[11px] uppercase tracking-widest font-bold leading-relaxed text-slate-300">
              India's leading student-first newspaper. Information verified by the Editorial Board and Academic Council.
            </p>
          </div>

          <div>
            <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-black underline decoration-secondary decoration-2 underline-offset-8 mb-8">
              Archives
            </h4>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest font-bold">
              <li><Link to="/category/CBSE" className="hover:text-white transition-colors">CBSE Records</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Board Bulletins</a></li>
              <li><a href="#" className="hover:text-white transition-colors">University Index</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Research Papers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-black underline decoration-secondary decoration-2 underline-offset-8 mb-8">
              Protocol
            </h4>
            <ul className="space-y-4 text-[11px] uppercase tracking-widest font-bold">
              <li><Link to="/category/How-To" className="hover:text-white transition-colors">Verification Guide</Link></li>
              <li><Link to="/category/NEET" className="hover:text-white transition-colors">NTA Guidelines</Link></li>
              <li><Link to="/category/Exam" className="hover:text-white transition-colors">Registration Norms</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Scrutiny Policy</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1">
            <h4 className="text-white text-[10px] uppercase tracking-[0.3em] font-black underline decoration-secondary decoration-2 underline-offset-8 mb-8">
              Dispatch
            </h4>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-4">Subscribe for Live Alerts</p>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                if (email) {
                  await subscribe(email);
                  alert("Subscription successful. Check nodes for updates.");
                  (e.target as HTMLFormElement).reset();
                }
              }}
              className="flex flex-col gap-2"
            >
              <input 
                name="email"
                type="email" 
                placeholder="REGISTRATION_EMAIL" 
                className="bg-white/5 border border-white/10 p-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-secondary transition-all"
                required
              />
              <button 
                type="submit"
                className="bg-secondary text-primary p-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all"
              >
                JOIN_DISPATCH
              </button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
          <p>© 2026 RollFetch Media Solutions. Rights Reserved.</p>
          <div className="flex gap-10">
            <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
            <Link to="/admin" className="hover:text-white transition-colors">Admin Desk</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/editorial-policy" className="hover:text-white transition-colors">Editorial Policy</Link>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
