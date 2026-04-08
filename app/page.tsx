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
  const [activities, setActivities] = useState<any[]>([]); // New State for Feed
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUserAndFetch();

    // --- REAL-TIME SUBSCRIPTION ---
    // This listens for any change in the database and refreshes the feed instantly!
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function checkUserAndFetch() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setUserProfile(profile);

      const { data: configData } = await supabase.from('wedding_config').select('*').single();
      const { data: phasesData } = await supabase.from('phases').select('*').order('step_number');
      const { data: tasksData } = await supabase.from('tasks').select('*');

      setConfig(configData || {});
      setPhases(phasesData || []);
      setTasks(tasksData || []);
      fetchActivities();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function fetchActivities() {
    const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(3);
    if (data) setActivities(data);
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const isPhaseUnlocked = (phaseStep: number) => {
    if (phaseStep === 1) return true;
    const prev = tasks.filter(t => t.phase_id < phaseStep);
    return prev.length === 0 ? true : prev.every(t => t.status === 'completed');
  };

  const weddingDate = config?.wedding_date ? new Date(config.wedding_date) : null;
  const diffDays = weddingDate ? Math.ceil((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const spentSoFar = tasks?.reduce((acc, t) => acc + (t.status === 'completed' ? (Number(t.estimated_cost) || 0) : 0), 0) || 0;
  const budgetPercent = Math.min(Math.round((spentSoFar / (config?.total_budget || 1)) * 100), 100);

  if (loading) return <div className="min-h-screen bg-rose-50 flex items-center justify-center italic text-rose-300">Syncing...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans relative">
      
      {userProfile?.role === 'admin' && (
        <Link href="/admin" className="absolute top-4 left-4 text-[8px] font-bold text-rose-500 uppercase tracking-widest bg-white shadow-md px-3 py-1.5 rounded-full border border-rose-100 z-50">⚙️ Admin Desk</Link>
      )}

      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <Link href="/help" className="text-[10px] font-bold text-slate-300 bg-white/50 w-7 h-7 flex items-center justify-center rounded-full border border-slate-100 shadow-sm">?</Link>
        <button onClick={handleLogout} className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-white/80 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">Logout</button>
      </div>

      <div className="bg-rose-100/40 pt-16 pb-24 px-6 text-center border-b border-rose-200">
        <h1 className="text-4xl font-serif italic text-slate-800 mb-2">The Wedding Elephant</h1>
        <p className="text-slate-400 uppercase tracking-widest text-[9px] font-bold tracking-[0.2em]">Hello, {userProfile?.full_name || 'Team'}</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-16 px-4 space-y-4">
        
        {/* LIVE ACTIVITY FEED */}
        <div className="card-wedding bg-white/80 backdrop-blur-sm border-dashed border-rose-200 p-3 shadow-sm">
          <h3 className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center">
            <span className="mr-1">⚡</span> Recent Bites
          </h3>
          <div className="space-y-2">
            {activities.length > 0 ? activities.map((act) => (
              <p key={act.id} className="text-[10px] text-slate-600 animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="text-rose-300 mr-1">•</span> {act.message}
              </p>
            )) : <p className="text-[10px] text-slate-300 italic">No recent activity. Time to start planning!</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card-wedding flex flex-col items-center justify-center p-3 min-h-[100px] text-center bg-white shadow-md">
            <span className="text-2xl font-bold text-rose-500 font-serif italic">{diffDays > 0 ? diffDays : 0}</span>
            <span className="text-[8px] uppercase text-slate-400 font-bold mt-2 leading-tight tracking-tighter">Days To Go</span>
          </div>
          <div className="card-wedding flex flex-col items-center justify-center p-3 min-h-[100px] text-center bg-white shadow-md">
            <span className="text-sm font-bold text-slate-700">${spentSoFar}</span>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden"><div className="bg-rose-300 h-full transition-all duration-1000" style={{ width: `${budgetPercent}%` }}></div></div>
            <span className="text-[8px] uppercase text-slate-400 font-bold mt-2 leading-tight tracking-tighter">of ${config?.total_budget}</span>
          </div>
          <div className="card-wedding bg-emerald-50 border-emerald-100 flex flex-col items-center justify-center p-3 min-h-[100px] text-center shadow-md">
            <span className="text-lg font-bold text-emerald-600 tracking-tighter leading-none">${tasks.filter(t => t.is_bro_deal && t.status === 'completed').length * 50}</span>
            <span className="text-[8px] uppercase text-emerald-700 font-bold mt-2 leading-tight tracking-tighter text-center">Bro Deal Savings 🤝</span>
          </div>
        </div>

        {/* PHASES */}
        <div className="card-wedding bg-white shadow-md">
          <h3 className="text-slate-700 font-bold mb-4 flex items-center text-[9px] uppercase tracking-widest"><span className="mr-2 text-lg">📋</span> Planning Phases</h3>
          <div className="space-y-4">
            {phases.map((phase: any) => {
              const unlocked = isPhaseUnlocked(phase.step_number);
              return (
                <div key={phase.id} className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${!unlocked ? 'bg-slate-200' : 'bg-emerald-400 shadow-sm animate-pulse'}`}></div>
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <Link href="/" className="text-rose-500 flex flex-col items-center hover:scale-105 transition-all"><span className="text-xl leading-none">🏠</span><span className="text-[9px] font-bold mt-1 tracking-tight underline decoration-2 decoration-rose-200">Home</span></Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center hover:scale-105 transition-all"><span className="text-xl leading-none">✅</span><span className="text-[9px] font-bold mt-1 tracking-tight">Tasks</span></Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center hover:scale-105 transition-all"><span className="text-xl leading-none">🎨</span><span className="text-[9px] font-bold mt-1 tracking-tight">DIY</span></Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center hover:scale-105 transition-all"><span className="text-xl leading-none">🤝</span><span className="text-[9px] font-bold mt-1 tracking-tight">Deals</span></Link>
      </nav>
    </main>
  );
}