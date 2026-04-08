'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function WorkshopPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: projData } = await supabase.from('diy_projects').select('*').order('id');
    const { data: profData } = await supabase.from('profiles').select('id, full_name, email');
    
    if (projData) setProjects(projData);
    if (profData) setProfiles(profData);
    setLoading(false);
  }

  async function handleProgressTap(id: number, currentPercent: number) {
    let nextPercent = currentPercent + 25;
    if (nextPercent > 100) nextPercent = 0;
    let newStatus = nextPercent === 100 ? 'Completed' : 'In Progress';

    const { error } = await supabase.from('diy_projects').update({ progress_percent: nextPercent, status: newStatus }).eq('id', id);
    if (!error) {
      setProjects(projects.map(p => p.id === id ? { ...p, progress_percent: nextPercent, status: newStatus } : p));
    }
  }

  if (loading) return <div className="p-10 text-center italic text-purple-300 font-serif">Opening the Workshop...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans">
      <div className="bg-purple-100/40 pt-12 pb-20 px-6 text-center border-b border-purple-200 shadow-sm">
        <h1 className="text-3xl font-serif italic text-slate-800 leading-tight">The Workshop</h1>
        <p className="text-purple-500 uppercase tracking-[0.25em] text-[8px] font-bold italic">Crafting the Elephant</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-10 px-4 space-y-6">
        {projects.map((project) => {
          const teamLead = profiles.find(p => p.id === project.assigned_user_id);
          return (
            <div key={project.id} className="card-wedding border-purple-100 shadow-md relative overflow-hidden group">
              <div className="absolute top-0 left-0 h-1.5 bg-purple-400 transition-all duration-700" style={{ width: `${project.progress_percent}%` }}></div>
              
              <div className="flex justify-between items-start mb-6 pt-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{project.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter bg-purple-50 text-purple-400">
                      Team Lead: {teamLead ? (teamLead.full_name || teamLead.email) : 'TBD'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleProgressTap(project.id, project.progress_percent)}
                  className="flex flex-col items-center bg-white border border-purple-100 p-2 rounded-2xl shadow-sm hover:border-purple-300 active:scale-90 transition-all"
                >
                  <span className="text-lg font-bold text-purple-600 leading-none">{project.progress_percent}%</span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-1 leading-none">Status</span>
                </button>
              </div>

              {/* MATERIALS LIST */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-3 mb-3">
                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">🪡 Materials Needed</h4>
                <p className="text-xs text-slate-600 italic leading-relaxed">{project.materials_list || 'Check with Bride'}</p>
              </div>

              {/* NEW PURCHASE LIST (Bug Fix Round 4) */}
              <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100/50">
                <h4 className="text-[9px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                  🛒 Shopping List
                </h4>
                <p className="text-xs text-rose-800 font-medium mt-1 leading-relaxed">
                  {project.purchase_items || 'No items listed to buy yet.'}
                </p>
              </div>

              {project.notes && (
                <p className="mt-4 text-[10px] text-slate-400 italic border-t border-slate-50 pt-3 leading-relaxed">
                  &ldquo;{project.notes}&rdquo;
                </p>
              )}
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="card-wedding border-dashed border-slate-200 bg-transparent py-16 text-center italic text-slate-400 text-sm">
             Add a DIY project in the Admin Desk to see it here! 🎨
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">🏠</span><span className="text-[9px] font-bold mt-1">Home</span></Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">✅</span><span className="text-[9px] font-bold mt-1">Tasks</span></Link>
        <Link href="/workshop" className="text-purple-500 flex flex-col items-center"><span className="text-xl leading-none">🎨</span><span className="text-[9px] font-bold mt-1">DIY</span></Link>
        <Link href="/resources" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">🤝</span><span className="text-[9px] font-bold mt-1">Deals</span></Link>
      </nav>
    </main>
  );
}