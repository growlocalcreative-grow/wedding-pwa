'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  async function fetchMyTasks() {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase.from('tasks').select('*').order('phase_id', { ascending: true });

    // IF logged in, only show tasks assigned to ME or to EVERYONE (NULL)
    if (user) {
      query = query.or(`assigned_user_id.eq.${user.id},assigned_user_id.is.null`);
    }

    const { data } = await query;
    if (data) setTasks(data);
    setLoading(false);
  }

  async function completeTask(taskId: number) {
    const { error } = await supabase.from('tasks').update({ status: 'pending_review' }).eq('id', taskId);
    if (!error) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'pending_review' } : t));
    }
  }

  if (loading) return <div className="p-10 text-center italic text-rose-300 font-serif">Finding your tasks...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      <div className="bg-white border-b border-rose-100 p-6 sticky top-0 z-10 shadow-sm text-center">
        <h1 className="text-2xl font-serif italic text-slate-800">Your Tasks</h1>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center italic leading-none">Bite-Sized Planning</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        {[1, 2, 3, 4].map((phaseNum) => (
          <section key={phaseNum} className="space-y-4">
            <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] ml-2">Phase {phaseNum}</h2>
            <div className="space-y-3">
              {tasks.filter(t => t.phase_id === phaseNum).map((task) => (
                <div key={task.id} className={`card-wedding transition-all border-l-4 ${task.status === 'completed' ? 'border-l-emerald-400' : 'border-l-rose-200'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className={`font-bold text-sm ${task.status === 'completed' ? 'text-slate-300 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 italic leading-relaxed">"{task.directions}"</p>
                    </div>
                    {task.status === 'todo' && <button onClick={() => completeTask(task.id)} className="bg-rose-100 text-rose-600 font-bold py-2 px-3 rounded-xl text-[10px]">DONE</button>}
                    {task.status === 'pending_review' && <span className="bg-sky-100 text-sky-600 text-[9px] font-bold px-3 py-2 rounded-xl italic animate-pulse">UNDER REVIEW</span>}
                    {task.status === 'completed' && <span className="text-emerald-500 font-bold text-[10px]">✅ APPROVED</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {/* Suggest a Task Section */}
        <section className="mt-12 mb-8 p-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-4 italic">Suggest a Task for the Bride</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              id="suggestInput"
              placeholder="e.g. Rent a generator" 
              className="flex-1 p-3 rounded-xl border border-slate-200 text-sm outline-none" 
            />
            <button 
              onClick={async () => {
                const input = document.getElementById('suggestInput') as HTMLInputElement;
                if (!input.value) return;
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from('tasks').insert([{
                  title: input.value,
                  status: 'pending_review', // It goes straight to the Bride's desk!
                  directions: 'Suggested by ' + (user?.email || 'Team Member'),
                  phase_id: 1,
                  assigned_user_id: user?.id
                }]);
                alert("Suggestion sent to the Bride's Desk! 🐘");
                input.value = '';
              }}
              className="bg-rose-400 text-white font-bold px-4 rounded-xl text-[10px] uppercase shadow-sm"
            >
              Send
            </button>
          </div>
        </section>
      </div>

      {/* FIXED NAVIGATION BAR: 4 ICONS */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-[9px] font-bold mt-1">Home</span></Link>
        <Link href="/tasks" className="text-rose-500 flex flex-col items-center"><span className="text-xl">✅</span><span className="text-[9px] font-bold mt-1">Tasks</span></Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🎨</span><span className="text-[9px] font-bold mt-1">DIY</span></Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🤝</span><span className="text-[9px] font-bold mt-1">Deals</span></Link>
      </nav>
    </main>
  );
}