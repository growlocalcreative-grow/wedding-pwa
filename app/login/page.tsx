'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else router.push('/'); // Send to dashboard after login
  };

  return (
    <main className="min-h-screen bg-rose-50 flex items-center justify-center p-6 font-sans text-slate-800">
      <div className="card-wedding w-full max-w-sm shadow-xl bg-white border-2 border-rose-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif italic text-slate-800 leading-tight">The Elephant</h1>
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-1">Wedding Planner Login</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-rose-300" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-rose-300" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-rose-400 text-white font-bold py-3 rounded-xl shadow-md uppercase text-[10px] tracking-widest hover:bg-rose-500 transition-all">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-6 text-[10px] text-slate-400 uppercase font-bold tracking-tight hover:text-rose-400 transition-colors">
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </main>
  );
}