'use client'; // This allows the logout button to work!

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [config, setConfig] = useState<any>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    // Fetch data from Supabase
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
    window.location.href = '/login';
  };

  // Logic for Countdown
  const weddingDate = new Date(config?.wedding_date || '');
  const today = new Date();
  const diffTime = weddingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Logic for Budget
  const totalBudget = config?.total_budget || 0;
  const spentSoFar = tasks?.reduce((acc, task) => 
    acc + (task.status === 'completed' ? (task.estimated_cost || 0) : 0), 0) || 0;
  const budgetPercent = Math.min(Math.round((spentSoFar / totalBudget) * 100), 100);

  // Logic for Savings
  const broDealsDone = tasks?.filter(t => t.is_bro_deal && t.status === 'completed').length || 0;
  const totalSaved = broDealsDone * 50;

  if (loading) return <div className="p-10 text-center italic text-rose-300 font-serif">Opening your dashboard...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans relative">
      
      {/* LOGOUT BUTTON - Top Right */}
      <button 
        onClick={handleLogout} 
        className="absolute top-4 right-4 text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-100 shadow-sm z-50 hover:text-rose-500 transition-colors"
      >
        Logout
      </button>

      {/* Header Area */}
      <div className="bg-rose-100/50 pt-16 pb-24 px-6 text-center border-b border-rose-200">
        <h1 className="text-4xl font-serif italic text-slate-800 mb-2 leading-tight">The Wedding Elephant</h1>
        <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold italic">Bite-Sized Planning • Small Budget</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-16 px-4 space-y-4">
        
        {/* TRACKER ROW: 3 Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-wedding flex flex-col items-center justify-center p-4 min-h-[110px] text-center">
            <span className="text-2xl font-bold text-rose-500 font-serif italic tracking-tighter leading-none">
              {diffDays > 0 ? diffDays : 0}
            </span>
            <span className="text-[9px] uppercase text-slate-400 font-bold mt-2 leading-tight">Days<br/>ToGo</span>
          </div>

          <div className="card-wedding flex flex-col items-center justify-center p-4 min-h-[110px] text-center border-rose-200">
            <span className="text-sm font-bold text-slate-700">${spentSoFar}</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-200/30">
              <div className="bg-rose-300 h-full transition-all duration-1000" style={{ width: `${budgetPercent}%` }}></div>
            </div>
            <span className="text-[9px] uppercase text-slate-400 font-bold mt-2 leading-tight">Spent of<br/>${totalBudget}</span>
          </div>

          <div className="card-wedding bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center p-4 min-h-[110px] text-center shadow-sm">
            <span className="text-lg font-bold text-emerald-600 tracking-tighter leading-none">
              ${totalSaved}
            </span>
            <span className="text-[9px] uppercase text-emerald-700 font-bold mt-2 leading-tight text-balance tracking-tight">Bro Deal<br/>Savings 🤝</span>
          </div>
        </div>

        {/* Planning Phases */}
        <div className="card-wedding">
          <h3 className="text-slate-700 font-bold mb-4 flex items-center text-[10px] uppercase tracking-[0.2em]">
            <span className="mr-2 opacity-40 text-lg">📋</span> Planning Phases
          </h3>
          <div className="space-y-4">
            {phases.map((phase: any) => (
              <div key={phase.id} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full shrink-0 ${phase.is_locked ? 'bg-slate-200' : 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse'}`}></div>
                <span className={`flex-1 text-sm ${phase.is_locked ? 'text-slate-400 font-normal' : 'text-slate-800 font-semibold'}`}>
                  {phase.name}
                </span>
                {phase.is_locked ? (
                  <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Locked</span>
                ) : (
                  <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase font-bold tracking-tighter">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed Placeholder */}
        <div className="card-wedding bg-sky-50 border-sky-100 shadow-sm mb-10">
          <h3 className="text-sky-800 font-bold text-[10px] mb-2 uppercase tracking-widest flex items-center">
            <span className="mr-2">✨</span> Next Step
          </h3>
          <p className="text-sky-900 font-serif italic text-sm leading-relaxed">
            Welcome to the Elephant! Start with Phase 1 tasks to get the foundation ready.
          </p>
        </div>
      </div>

      {/* FIXED NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-rose-500 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-2xl leading-none">🏠</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight underline decoration-2 underline-offset-4">Home</span>
        </Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-2xl leading-none">✅</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">Tasks</span>
        </Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-2xl leading-none">🎨</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">DIY</span>
        </Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-2xl leading-none">🤝</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight text-center leading-none">Deals</span>
        </Link>
      </nav>
    </main>
  );
}