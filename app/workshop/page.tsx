'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function WorkshopPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data } = await supabase.from('diy_projects').select('*').order('id');
    if (data) setProjects(data);
    setLoading(false);
  }

  // THE MAGIC BUTTON: Increments progress by 25% on each tap
  async function handleProgressTap(id: number, currentPercent: number) {
    let nextPercent = currentPercent + 25;
    if (nextPercent > 100) nextPercent = 0; // Resets if you misclick past 100

    let newStatus = 'In Progress';
    if (nextPercent === 0) newStatus = 'Not Started';
    if (nextPercent === 100) newStatus = 'Completed';

    const { error } = await supabase
      .from('diy_projects')
      .update({ progress_percent: nextPercent, status: newStatus })
      .eq('id', id);

    if (!error) {
      // Update the local screen instantly
      setProjects(projects.map(p => p.id === id ? { ...p, progress_percent: nextPercent, status: newStatus } : p));
    }
  }

  if (loading) return <div className="p-10 text-center italic text-purple-300 font-serif">Opening the Workshop...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* Header */}
      <div className="bg-purple-100/40 pt-12 pb-20 px-6 text-center border-b border-purple-200">
        <h1 className="text-3xl font-serif italic text-slate-800 mb-1 leading-tight">The Workshop</h1>
        <p className="text-purple-500 uppercase tracking-[0.25em] text-[9px] font-bold italic">Handmade with Love • Bride & MOH</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-10 px-4 space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="card-wedding border-purple-100 shadow-md relative overflow-hidden group">
            
            {/* Visual Progress Bar (The "Fill") */}
            <div 
              className="absolute top-0 left-0 h-1.5 bg-purple-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(192,132,252,0.4)]" 
              style={{ width: `${project.progress_percent}%` }}
            ></div>
            
            <div className="flex justify-between items-start mb-6 pt-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 leading-tight">{project.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${project.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-50 text-purple-400'}`}>
                    {project.status}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Team: {project.assigned_to}</span>
                </div>
              </div>

              {/* THE BUTTON: Click this to update progress */}
              <button 
                onClick={() => handleProgressTap(project.id, project.progress_percent)}
                className="flex flex-col items-center bg-white border border-purple-100 p-2 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all active:scale-90"
              >
                <span className="text-lg font-bold text-purple-600 leading-none">{project.progress_percent}%</span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Tap to Update</span>
              </button>
            </div>

            {/* Materials Checklist Box */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Materials List</h4>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-100">Est. ${project.estimated_cost}</span>
              </div>
              <ul className="grid grid-cols-1 gap-2">
                {project.materials_list.split(',').map((item: string, i: number) => (
                  <li key={i} className="flex items-center text-xs text-slate-600 gap-2 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-200"></div>
                    {item.trim()}
                  </li>
                ))}
              </ul>
            </div>

            {/* Notes Section */}
            {project.notes && (
              <p className="mt-4 text-[11px] text-slate-400 italic leading-relaxed border-t border-slate-50 pt-3">
                “{project.notes}”
              </p>
            )}
          </div>
        ))}

        {projects.length === 0 && (
          <div className="card-wedding border-dashed border-slate-200 bg-transparent py-16 text-center">
             <p className="text-slate-400 italic text-sm">Your craft table is empty. Add a project in the Admin Desk! 🎨</p>
          </div>
        )}
      </div>

      {/* FIXED NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center">
          <span className="text-xl">🏠</span>
          <span className="text-[9px] font-bold mt-1">Home</span>
        </Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center">
          <span className="text-xl">✅</span>
          <span className="text-[9px] font-bold mt-1">Tasks</span>
        </Link>
        <Link href="/workshop" className="text-purple-500 flex flex-col items-center">
          <span className="text-xl">🎨</span>
          <span className="text-[9px] font-bold mt-1 underline decoration-2 underline-offset-4">DIY</span>
        </Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center">
          <span className="text-xl">🤝</span>
          <span className="text-[9px] font-bold mt-1">Deals</span>
        </Link>
      </nav>
    </main>
  );
}