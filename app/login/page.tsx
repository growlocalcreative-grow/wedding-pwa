'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: email.split('@')[0], // Temporary name until they update it
            }
          }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else router.push('/'); 
  };

  return (
    <main className="min-h-screen bg-rose-50 flex items-center justify-center p-6 font-sans text-slate-800">
      <div className="card-wedding w-full max-w-sm shadow-xl bg-white border-2 border-rose-100 p-8 animate-in fade-in zoom-in duration-500">
        
        {/* HEADER WITH ICON */}
        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-3xl font-serif italic text-slate-800 leading-none">The Wedding Elephant</h1>
          
          {/* THE NEW PINK ELEPHANT ICON */}
          <div className="my-4 p-3 bg-rose-50 rounded-full border border-rose-100 shadow-inner">
            <img 
              src="/icon.png" 
              alt="The Wedding Elephant" 
              className="w-16 h-16 object-contain"
              /* Fallback if icon.png isn't found */
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            />
          </div>

          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em] leading-none">Wedding Planner Login</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="team@wedding.com" 
              className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-rose-200 transition-all" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-rose-200 transition-all" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="w-full bg-rose-400 text-white font-bold py-4 rounded-2xl shadow-md uppercase text-[11px] tracking-widest hover:bg-rose-500 active:scale-95 transition-all mt-2">
            {isSignUp ? 'Create My Account' : 'Sign In'}
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-6 text-[10px] text-slate-400 uppercase font-bold tracking-tight hover:text-rose-400 transition-colors">
          {isSignUp ? 'Already have an account? Sign In' : 'New to the team? Sign Up'}
        </button>

        {/* HELP LINK */}
        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <Link href="/help" className="text-[10px] font-bold text-sky-300 uppercase tracking-widest hover:text-sky-500 transition-colors">
            ❓ Installation Instructions
          </Link>
        </div>
      </div>
    </main>
  );
}