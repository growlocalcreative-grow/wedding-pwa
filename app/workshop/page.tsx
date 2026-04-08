'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function WorkshopPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempList, setTempList] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    const { data } = await supabase.from('diy_projects').select('*').order('id');
    if (data) setProjects(data);
    setLoading(false);
  }

  async function updateProgress(id: number, current: number) {
    let next = current + 25;
    if (next > 100) next = 0;
    const status = next === 100 ? 'Completed' : 'In Progress';
    await supabase.from('diy_projects').update({ progress_percent: next, status }).eq('id', id);
    fetchProjects();
  }

  async function saveShoppingList(id: number) {
    await supabase.from('diy_projects').update({ purchase_items: tempList }).eq('id', id);
    setEditingId(null);
    fetchProjects();
  }

  if (loading) return <div className="p-10 text-center italic text-purple-300">Syncing Workshop...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans">
      <div className="bg-purple-100/40 pt-12 pb-20 px-6 text-center border-b border-purple-200 shadow-sm">
        <h1 className="text-2xl font-serif italic text-slate-800">The Workshop</h1>
        <p className="text-purple-500 uppercase tracking-widest text-[8px] font-bold italic mt-1 text-balance">Everyone can update the craft status!</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-10 px-4 space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="card-wedding border-purple-100 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 bg-purple-400 transition-all duration-700" style={{ width: `${project.progress_percent}%` }}></div>
            
            <div className="flex justify-between items-start mb-6 pt-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">{project.title}</h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter bg-purple-50 text-purple-400">Team: {project.assigned_to}</span>
              </div>
              <button onClick={() => updateProgress(project.id, project.progress_percent)} className="flex flex-col items-center bg-white border border-purple-100 p-2 rounded-2xl shadow-sm active:scale-90 transition-all">
                <span className="text-lg font-bold text-purple-600">{project.progress_percent}%</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase">Tap Status</span>
              </button>
            </div>

            <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100/50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[9px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">🛒 Shopping List</h4>
                {editingId !== project.id ? (
                   <button onClick={() => { setEditingId(project.id); setTempList(project.purchase_items || ''); }} className="text-[8px] font-bold uppercase text-rose-300">Edit</button>
                ) : (
                   <button onClick={() => saveShoppingList(project.id)} className="text-[8px] font-bold uppercase text-emerald-500 underline">Save</button>
                )}
              </div>
              
              {editingId === project.id ? (
                <textarea 
                  className="w-full bg-white border border-rose-100 rounded-lg p-2 text-xs outline-none" 
                  value={tempList} 
                  onChange={(e) => setTempList(e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-xs text-rose-800 font-medium leading-relaxed">{project.purchase_items || 'No items listed yet...'}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-[9px] font-bold mt-1">Home</span></Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center"><span className="text-xl">✅</span><span className="text-[9px] font-bold mt-1">Tasks</span></Link>
        <Link href="/workshop" className="text-purple-500 flex flex-col items-center"><span className="text-xl">🎨</span><span className="text-[9px] font-bold mt-1 underline decoration-2 underline-offset-4">DIY</span></Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🤝</span><span className="text-[9px] font-bold mt-1 text-center">Deals</span></Link>
      </nav>
    </main>
  );
}