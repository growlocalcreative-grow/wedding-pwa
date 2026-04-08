'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function WorkshopPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const { data: projData } = await supabase.from('diy_projects').select('*').order('id');
    const { data: profData } = await supabase.from('profiles').select('id, full_name, email');
    if (projData) setProjects(projData);
    if (profData) setProfiles(profData);
    setLoading(false);
  }

  async function updateProgress(id: number, current: number) {
    let next = current + 25;
    if (next > 100) next = 0;
    const status = next === 100 ? 'Completed' : 'In Progress';
    await supabase.from('diy_projects').update({ progress_percent: next, status }).eq('id', id);
    fetchData();
  }

  async function toggleStrategy(id: number, current: string) {
    const next = current === 'DIY' ? 'Purchase' : 'DIY';
    await supabase.from('diy_projects').update({ strategy: next }).eq('id', id);
    fetchData();
  }

  if (loading) return <div className="p-10 text-center italic text-purple-300 font-serif">Opening the Workshop...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans">
      <div className="bg-purple-100/40 pt-12 pb-20 px-6 text-center border-b border-purple-200">
        <h1 className="text-3xl font-serif italic text-slate-800">The Workshop</h1>
        <p className="text-purple-500 uppercase tracking-widest text-[8px] font-bold italic mt-1">DIY or Buy: You Decide</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-10 px-4 space-y-6">
        {projects.map((project) => {
          const lead = profiles.find(p => p.id === project.assigned_user_id);
          const isPurchase = project.strategy === 'Purchase';

          return (
            <div key={project.id} className="card-wedding border-purple-100 shadow-md relative overflow-hidden group">
              {/* Progress Bar Top */}
              <div className={`absolute top-0 left-0 h-1.5 transition-all duration-700 ${isPurchase ? 'bg-amber-400' : 'bg-purple-400'}`} style={{ width: `${project.progress_percent}%` }}></div>
              
              <div className="flex justify-between items-start mb-4 pt-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{project.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Lead: {lead?.full_name || lead?.email || 'The Team'}</p>
                </div>

                {/* Progress Button */}
                <button onClick={() => updateProgress(project.id, project.progress_percent)} className="bg-white border border-purple-100 p-2 rounded-2xl shadow-sm active:scale-90 transition-all text-center min-w-[60px]">
                  <span className={`text-lg font-bold leading-none ${isPurchase ? 'text-amber-500' : 'text-purple-600'}`}>{project.progress_percent}%</span>
                  <span className="block text-[7px] font-bold text-slate-400 uppercase mt-1">Status</span>
                </button>
              </div>

              {/* STRATEGY TOGGLE */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                <button 
                  onClick={() => toggleStrategy(project.id, project.strategy)}
                  className={`flex-1 py-2 text-[9px] font-bold uppercase rounded-lg transition-all ${!isPurchase ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400'}`}
                >🔨 DIY IT</button>
                <button 
                  onClick={() => toggleStrategy(project.id, project.strategy)}
                  className={`flex-1 py-2 text-[9px] font-bold uppercase rounded-lg transition-all ${isPurchase ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400'}`}
                >🛒 PURCHASE IT</button>
              </div>

              {/* BULLETED NEEDS LIST */}
              <div className={`rounded-2xl p-4 border transition-colors ${isPurchase ? 'bg-amber-50/30 border-amber-100' : 'bg-purple-50/30 border-purple-100'}`}>
                <h4 className={`text-[9px] font-bold uppercase tracking-widest mb-3 ${isPurchase ? 'text-amber-600' : 'text-purple-600'}`}>
                   {isPurchase ? '🔍 To Find / Buy' : '🪡 Materials Needed'}
                </h4>
                <ul className="space-y-2">
                  {(project.materials_list || '').split(',').map((item: string, i: number) => (
                    <li key={i} className="flex items-center text-xs text-slate-700 gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPurchase ? 'bg-amber-300' : 'bg-purple-300'}`}></div>
                      {item.trim()}
                    </li>
                  ))}
                </ul>
              </div>

              {project.notes && <p className="mt-4 text-[10px] text-slate-400 italic border-t border-slate-50 pt-3 italic leading-relaxed text-center">"{project.notes}"</p>}
            </div>
          );
        })}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-[9px] font-bold mt-1">Home</span></Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center"><span className="text-xl">✅</span><span className="text-[9px] font-bold mt-1">Tasks</span></Link>
        <Link href="/workshop" className="text-purple-500 flex flex-col items-center"><span className="text-xl">🎨</span><span className="text-[9px] font-bold mt-1 underline decoration-2 underline-offset-4">DIY</span></Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🤝</span><span className="text-[9px] font-bold mt-1">Deals</span></Link>
      </nav>
    </main>
  );
}