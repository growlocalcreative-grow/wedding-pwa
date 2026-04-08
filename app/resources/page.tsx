'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('Venue');
  const [userName, setUserName] = useState('');

  useEffect(() => { 
    fetchResources(); 
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      setUserName(prof?.full_name || 'Team Member');
    }
  }

  async function fetchResources() {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    if (data) setResources(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from('resources').insert([{
      name: newName, category: newCat, contact_type: 'Scouting', suggested_by: userName
    }]);
    setNewName('');
    fetchResources();
  }

  if (loading) return <div className="p-10 text-center italic text-emerald-300">Syncing Contacts...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-emerald-50 border-b border-emerald-100 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-serif italic text-slate-800">Wedding Contacts</h1>
        <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Don&apos;t Call the Same Place Twice!</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* ADD FORM FOR EVERYONE */}
        <form onSubmit={handleAdd} className="card-wedding border-dashed border-emerald-200 bg-emerald-50/20 p-4 flex gap-2 items-center">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Scouting a new place?" className="flex-1 p-2 text-xs rounded-lg border border-emerald-100" required />
          <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="p-2 text-[10px] rounded-lg bg-white border border-emerald-100">
            <option>Venue</option><option>Food</option><option>Music</option><option>Photo</option>
          </select>
          <button type="submit" className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-[10px] font-bold">ADD</button>
        </form>

        <div className="grid grid-cols-1 gap-3">
          {resources.map((res) => (
            <div key={res.id} className="card-wedding bg-white shadow-sm border-l-4 border-l-emerald-300 flex justify-between items-center">
              <div>
                <span className="text-[8px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase">{res.category}</span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">{res.name}</h3>
                <p className="text-[9px] text-slate-400 mt-0.5">Suggested by: <span className="text-emerald-500 font-bold">{res.suggested_by || 'Original List'}</span></p>
              </div>
              <span className="text-[10px] text-slate-400 italic">{res.contact_type}</span>
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <Link href="/" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">🏠</span><span className="text-[9px] font-bold mt-1">Home</span></Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">✅</span><span className="text-[9px] font-bold mt-1">Tasks</span></Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center"><span className="text-xl leading-none">🎨</span><span className="text-[9px] font-bold mt-1">DIY</span></Link>
        <Link href="/resources" className="text-emerald-500 flex flex-col items-center"><span className="text-xl leading-none">🤝</span><span className="text-[9px] font-bold mt-1 underline decoration-2 underline-offset-4">Deals</span></Link>
      </nav>
    </main>
  );
}