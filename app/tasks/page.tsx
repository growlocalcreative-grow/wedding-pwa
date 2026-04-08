'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);
    }

    const { data: phasesData } = await supabase.from('phases').select('*').order('step_number');
    const { data: tasksData } = await supabase.from('tasks').select('*').order('id', { ascending: true });

    setPhases(phasesData || []);
    setTasks(tasksData || []);
    setLoading(false);
  }

  const isPhaseUnlocked = (phaseStep: number) => {
    if (phaseStep === 1) return true;
    const allPreviousTasks = tasks.filter(t => t.phase_id < phaseStep);
    return allPreviousTasks.length === 0 ? true : allPreviousTasks.every(t => t.status === 'completed');
  };

  async function completeTask(task: any) {
    const { error } = await supabase.from('tasks').update({ status: 'pending_review' }).eq('id', task.id);
    
    if (!error) {
      // LOG THE ACTIVITY
      await supabase.from('activity_log').insert([{
        message: `${userProfile?.full_name || 'Team member'} finished: ${task.title}`,
        user_id: userProfile?.id
      }]);

      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: 'pending_review' } : t));
    }
  }

  if (loading) return <div className="p-10 text-center italic text-rose-300 font-serif">Checking the list...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      <div className="bg-white border-b border-rose-100 p-6 sticky top-0 z-10 shadow-sm text-center">
        <h1 className="text-2xl font-serif italic text-slate-800 leading-none">Your Tasks</h1>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Follow the Phases</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-10">
        {phases.map((phase) => {
          const unlocked = isPhaseUnlocked(phase.step_number);
          const phaseTasks = tasks.filter(t => t.phase_id === phase.step_number && (t.assigned_user_id === userProfile?.id || t.assigned_user_id === null));

          return (
            <section key={phase.id} className={`transition-all duration-500 ${!unlocked ? 'opacity-30 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Phase {phase.step_number}: {phase.name}</h2>
                {!unlocked && <span className="text-[10px] font-bold text-rose-300 italic tracking-tight">🔒 Locked</span>}
              </div>

              {unlocked ? (
                <div className="space-y-3">
                  {phaseTasks.map((task) => (
                    <div key={task.id} className={`card-wedding relative overflow-hidden ${task.is_bro_deal ? 'bro-deal-card' : ''} border-l-4 ${task.status === 'completed' ? 'border-l-emerald-400' : 'border-l-rose-200'}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className={`font-bold text-sm ${task.status === 'completed' ? 'text-slate-300 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                          <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">"{task.directions}"</p>
                          {task.admin_comments && (
                            <div className="mt-3 p-2 bg-rose-50/50 rounded-lg border border-rose-100">
                              <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tighter">Note from Bride:</p>
                              <p className="text-[11px] text-rose-700 italic mt-0.5">{task.admin_comments}</p>
                            </div>
                          )}
                        </div>
                        {task.status === 'todo' && <button onClick={() => completeTask(task)} className="bg-rose-100 text-rose-600 font-bold py-2 px-3 rounded-xl text-[10px] shadow-sm active:scale-95 transition-all">DONE</button>}
                        {task.status === 'pending_review' && <span className="bg-sky-50 text-sky-500 text-[9px] font-bold px-3 py-2 rounded-xl italic animate-pulse">REVIEWING</span>}
                        {task.status === 'completed' && <span className="text-emerald-500 font-bold text-[10px]">✅ APPROVED</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-wedding bg-slate-100/30 border-dashed border-slate-200 py-6 text-center"><p className="text-[10px] text-slate-400 font-medium italic">Finish previous phases to unlock. 🐘</p></div>
              )}
            </section>
          );
        })}

        <section className="mt-12 mb-8 p-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4 italic">Suggest a Task</h3>
          <div className="flex gap-2">
            <input type="text" id="suggestInput" placeholder="e.g. Rent a generator" className="flex-1 p-3 rounded-xl border border-slate-200 text-sm outline-none" />
            <button 
              onClick={async () => {
                const input = document.getElementById('suggestInput') as HTMLInputElement;
                if (!input.value) return;
                await supabase.from('tasks').insert([{ title: input.value, status: 'pending_review', directions: 'User Suggestion', phase_id: 1, assigned_user_id: userProfile?.id }]);
                await supabase.from('activity_log').insert([{ message: `${userProfile?.full_name || 'Someone'} suggested a new task! 💡`, user_id: userProfile?.id }]);
                alert("Suggestion sent! 🐘");
                input.value = '';
              }}
              className="bg-rose-400 text-white font-bold px-4 rounded-xl text-[10px] uppercase shadow-sm active:scale-90"
            >Send</button>
          </div>
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-[9px] font-bold mt-1">Home</span></Link>
        <Link href="/tasks" className="text-rose-500 flex flex-col items-center"><span className="text-xl">✅</span><span className="text-[9px] font-bold mt-1 underline decoration-2 underline-offset-4 decoration-rose-200">Tasks</span></Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🎨</span><span className="text-[9px] font-bold mt-1">DIY</span></Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🤝</span><span className="text-[9px] font-bold mt-1">Deals</span></Link>
      </nav>
    </main>
  );
}