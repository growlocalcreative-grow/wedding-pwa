'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  async function checkUserAndFetch() {
    // 1. Who is logged in?
    const { data: { user } } = await supabase.auth.getUser();
    
    // 2. If nobody, send to login
    if (!user) {
      return router.push('/login');
    }

    // 3. Fetch Profile to see if they are Admin
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setUserProfile(profile);

    // 4. Fetch Wedding Data
    const { data: configData } = await supabase.from('wedding_config').select('*').single();
    const { data: phasesData } = await supabase.from('phases').select('*').order('step_number');
    const { data: tasksData } = await supabase.from('tasks').select('*');

    setConfig(configData);
    setPhases(phasesData || []);
    setTasks(tasksData || []);
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Logic Calculations
  const weddingDate = new Date(config?.wedding_date || '');
  const diffDays = Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const spentSoFar = tasks?.reduce((acc, t) => acc + (t.status === 'completed' ? (t.estimated_cost || 0) : 0), 0) || 0;
  const budgetPercent = Math.min(Math.round((spentSoFar / (config?.total_budget || 1)) * 100), 100);
  const totalSaved = tasks?.filter(t => t.is_bro_deal && t.status === 'completed').length * 50 || 0;

  if (loading) return <div className="min-h-screen bg-rose-50 flex items-center justify-center italic text-rose-300 font-serif">Checking the list...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans relative animate-in fade-in duration-700">
      
      {/* ADMIN MAGIC BUTTON - Only shows if role is 'admin' */}
      {userProfile?.role === 'admin' && (
        <Link 
          href="/admin" 
          className="absolute top-4 left-4 text-[8px] font-bold text-rose-500 uppercase tracking-widest bg-white shadow-md px-3 py-1.5 rounded-full border border-rose-100 z-50 animate-bounce"
        >
          ⚙️ Admin Desk
        </Link>
      )}

      {/* LOGOUT BUTTON */}
      <button 
        onClick={handleLogout} 
        className="absolute top-4 right-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-white/80 px-3 py-1.5 rounded-full border border-slate-100 z-50"
      >
        Logout
      </button>

      <div className="bg-rose-100/40 pt-16 pb-24 px-6 text-center border-b border-rose-200">
        <h1 className="text-4xl font-serif italic text-slate-800 mb-2">The Wedding Elephant</h1>
        <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Welcome, {userProfile?.full_name || 'Planner'}</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-16 px-4 space-y-4">
        {/* TRACKERS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-wedding flex flex-col items-center justify-center p-3 min-h-[100px] text-center bg-white shadow-sm">
            <span className="text-2xl font-bold text-rose-500 font-serif italic leading-none">{diffDays > 0 ? diffDays : 0}</span>
            <span className="text-[8px] uppercase text-slate-400 font-bold mt-2 leading-tight">Days To Go</span>
          </div>
          <div className="card-wedding flex flex-col items-center justify-center p-3 min-h-[100px] text-center bg-white shadow-sm border-rose-100">
            <span className="text-sm font-bold text-slate-700">${spentSoFar}</span>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden"><div className="bg-rose-300 h-full transition-all duration-1000" style={{ width: `${budgetPercent}%` }}></div></div>
            <span className="text-[8px] uppercase text-slate-400 font-bold mt-2 leading-tight">of ${config?.total_budget}</span>
          </div>
          <div className="card-wedding bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center p-3 min-h-[100px] text-center shadow-sm">
            <span className="text-lg font-bold text-emerald-600 leading-none">${totalSaved}</span>
            <span className="text-[8px] uppercase text-emerald-700 font-bold mt-2 leading-tight">Saved 🤝</span>
          </div>
        </div>

        {/* PHASES */}
        <div className="card-wedding bg-white shadow-sm">
          <h3 className="text-slate-700 font-bold mb-4 flex items-center text-[9px] uppercase tracking-widest"><span className="mr-2">📋</span> Planning Phases</h3>
          <div className="space-y-4">
            {phases.map((phase: any) => (
              <div key={phase.id} className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${phase.is_locked ? 'bg-slate-200' : 'bg-emerald-400 shadow-sm animate-pulse'}`}></div>
                <span className={`flex-1 text-sm ${phase.is_locked ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>{phase.name}</span>
                {phase.is_locked && <span className="text-[8px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">Locked</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-rose-500 flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-[9px] font-bold">Home</span></Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center"><span className="text-xl">✅</span><span className="text-[9px] font-bold">Tasks</span></Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🎨</span><span className="text-[9px] font-bold">DIY</span></Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🤝</span><span className="text-[9px] font-bold">Deals</span></Link>
      </nav>
    </main>
  );
}