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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return router.push('/login');
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setUserProfile(profile);

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

  // --- THE GATING LOGIC (Bug Fix 1 & 3) ---
  const isPhaseUnlocked = (phaseStep: number) => {
    if (phaseStep === 1) return true; // Phase 1 always open
    
    // Logic: Look at ALL tasks in ALL phases that come before this one
    const allPreviousTasks = tasks.filter(t => t.phase_id < phaseStep);
    
    // If no tasks exist in previous phases, it's open
    if (allPreviousTasks.length === 0) return true; 

    // Every single task before this phase MUST be 'completed'
    return allPreviousTasks.every(t => t.status === 'completed');
  };

  // Logic Calculations
  const weddingDate = new Date(config?.wedding_date || '');
  const diffDays = Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const spentSoFar = tasks?.reduce((acc, t) => acc + (t.status === 'completed' ? (t.estimated_cost || 0) : 0), 0) || 0;
  const budgetPercent = Math.min(Math.round((spentSoFar / (config?.total_budget || 1)) * 100), 100);
  const totalSaved = tasks?.filter(t => t.is_bro_deal && t.status === 'completed').length * 50 || 0;

  if (loading) return <div className="min-h-screen bg-rose-50 flex items-center justify-center italic text-rose-300 font-serif">Checking the Elephant...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans relative animate-in fade-in duration-700">
      
      {/* ADMIN MAGIC BUTTON */}
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

      <div className="bg-rose-100/40 pt-16 pb-24 px-6 text-center border-b border-rose-200 shadow-sm">
        <h1 className="text-4xl font-serif italic text-slate-800 mb-2">The Wedding Elephant</h1>
        <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold tracking-[0.2em]">Hello, {userProfile?.full_name || 'Team'}</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-16 px-4 space-y-4">
        {/* TRACKERS */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-wedding flex flex-col items-center justify-center p-3 min-h-[100px] text-center bg-white shadow-md border-rose-50">
            <span className="text-2xl font-bold text-rose-500 font-serif italic leading-none">{diffDays > 0 ? diffDays : 0}</span>
            <span className="text-[8px] uppercase text-slate-400 font-bold mt-2 leading-tight tracking-tighter">Days To Go</span>
          </div>
          <div className="card-wedding flex flex-col items-center justify-center p-3 min-h-[100px] text-center bg-white shadow-md border-rose-50">
            <span className="text-sm font-bold text-slate-700">${spentSoFar}</span>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden border border-slate-50">
                <div className="bg-rose-300 h-full transition-all duration-1000" style={{ width: `${budgetPercent}%` }}></div>
            </div>
            <span className="text-[8px] uppercase text-slate-400 font-bold mt-2 leading-tight tracking-tighter">Spent of ${config?.total_budget}</span>
          </div>
          <div className="card-wedding bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center p-3 min-h-[100px] text-center shadow-md">
            <span className="text-lg font-bold text-emerald-600 leading-none">${totalSaved}</span>
            <span className="text-[8px] uppercase text-emerald-700 font-bold mt-2 leading-tight tracking-tighter">Saved 🤝</span>
          </div>
        </div>

        {/* PHASES - Now using Live Unlocking Logic */}
        <div className="card-wedding bg-white shadow-md">
          <h3 className="text-slate-700 font-bold mb-4 flex items-center text-[9px] uppercase tracking-widest"><span className="mr-2 text-lg">📋</span> Planning Phases</h3>
          <div className="space-y-4">
            {phases.map((phase: any) => {
              const unlocked = isPhaseUnlocked(phase.step_number);
              return (
                <div key={phase.id} className="flex items-center gap-4 transition-all">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${!unlocked ? 'bg-slate-200' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse'}`}></div>
                  <span className={`flex-1 text-sm ${!unlocked ? 'text-slate-300 font-normal italic' : 'text-slate-800 font-semibold'}`}>
                    {phase.name}
                  </span>
                  {!unlocked ? (
                    <span className="text-[8px] bg-slate-50 text-slate-300 px-2 py-0.5 rounded uppercase font-bold tracking-widest">Locked</span>
                  ) : (
                    <span className="text-[8px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase font-bold tracking-widest shadow-sm">Active</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Step Box */}
        <div className="card-wedding bg-sky-50 border-sky-100 shadow-sm mb-12">
          <h3 className="text-sky-800 font-bold text-[10px] mb-2 uppercase tracking-widest flex items-center">
            <span className="mr-2">✨</span> Current Goal
          </h3>
          <p className="text-sky-900 font-serif italic text-sm leading-relaxed">
            Keep working on the active phase. The elephant gets smaller with every checkmark!
          </p>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <Link href="/" className="text-rose-500 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-xl leading-none">🏠</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">Home</span>
        </Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-xl leading-none">✅</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">Tasks</span>
        </Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-xl leading-none">🎨</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">DIY</span>
        </Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-xl leading-none">🤝</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">Deals</span>
        </Link>
      </nav>
    </main>
  );
}