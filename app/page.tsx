'use client';

export const dynamic = 'force-dynamic';

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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const user = session.user;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);

      const { data: configData } = await supabase.from('wedding_config').select('*').single();
      const { data: phasesData } = await supabase.from('phases').select('*').order('step_number');
      const { data: tasksData } = await supabase.from('tasks').select('*');

      setConfig(configData || {});
      setPhases(phasesData || []);
      setTasks(tasksData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // --- SAFE LOGIC CALCULATIONS ---
  const isPhaseUnlocked = (phaseStep: number) => {
    if (phaseStep === 1) return true;
    if (!tasks || tasks.length === 0) return true;
    const allPreviousTasks = tasks.filter(t => t.phase_id < phaseStep);
    if (allPreviousTasks.length === 0) return true; 
    return allPreviousTasks.every(t => t.status === 'completed');
  };

  const weddingDateStr = config?.wedding_date;
  const weddingDate = weddingDateStr ? new Date(weddingDateStr) : null;
  const today = new Date();
  const diffDays = weddingDate ? Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  const totalBudget = config?.total_budget || 1; // Avoid divide by zero
  const spentSoFar = tasks?.reduce((acc, t) => acc + (t.status === 'completed' ? (Number(t.estimated_cost) || 0) : 0), 0) || 0;
  const budgetPercent = Math.min(Math.round((spentSoFar / totalBudget) * 100), 100);
  const totalSaved = tasks?.filter(t => t.is_bro_deal && t.status === 'completed').length * 50 || 0;

  if (loading) return <div className="min-h-screen bg-rose-50 flex items-center justify-center italic text-rose-300 font-serif">Syncing the Elephant...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans relative">
      {userProfile?.role === 'admin' && (
        <Link href="/admin" className="absolute top-4 left-4 text-[8px] font-bold text-rose-500 uppercase tracking-widest bg-white shadow-md px-3 py-1.5 rounded-full border border-rose-100 z-50">
          ⚙️ Admin Desk
        </Link>
      )}

      <button onClick={handleLogout} className="absolute top-4 right-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-white/80 px-3 py-1.5 rounded-full border border-slate-100 z-50">
        Logout
      </button>

      <div className="bg-rose-100/40 pt-16 pb-24 px-6 text-center border-b border-rose-200">
        <h1 className="text-4xl font-serif italic text-slate-800 mb-2">The Wedding Elephant</h1>
        <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold tracking-[0.2em]">Hello, {userProfile?.full_name || 'Team'}</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-16 px-4 space-y-4">
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
            <span className="text-[8px] uppercase text-slate-400 font-bold mt-2 leading-tight tracking-tighter">of ${totalBudget}</span>
          </div>
          <div className="card-wedding bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center p-3 min-h-[100px] text-center shadow-md">
            <span className="text-lg font-bold text-emerald-600 leading-none">${totalSaved}</span>
            <span className="text-[8px] uppercase text-emerald-700 font-bold mt-2 leading-tight tracking-tighter">Saved 🤝</span>
          </div>
        </div>

        <div className="card-wedding bg-white shadow-md">
          <h3 className="text-slate-700 font-bold mb-4 flex items-center text-[9px] uppercase tracking-widest"><span className="mr-2 text-lg">📋</span> Planning Phases</h3>
          <div className="space-y-4">
            {phases.map((phase: any) => {
              const unlocked = isPhaseUnlocked(phase.step_number);
              return (
                <div key={phase.id} className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${!unlocked ? 'bg-slate-200' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse'}`}></div>
                  <span className={`flex-1 text-sm ${!unlocked ? 'text-slate-300 font-normal italic' : 'text-slate-800 font-semibold'}`}>{phase.name}</span>
                  {!unlocked ? (
                    <span className="text-[8px] bg-slate-50 text-slate-300 px-2 py-0.5 rounded uppercase font-bold">Locked</span>
                  ) : (
                    <span className="text-[8px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase font-bold shadow-sm">Active</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-rose-500 flex flex-col items-center"><span className="text-xl leading-none">🏠</span><span className="text-[9px] font-bold mt-1">Home</span></Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">✅</span><span className="text-[9px] font-bold mt-1">Tasks</span></Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">🎨</span><span className="text-[9px] font-bold mt-1">DIY</span></Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">🤝</span><span className="text-[9px] font-bold mt-1">Deals</span></Link>
      </nav>
    </main>
  );
}