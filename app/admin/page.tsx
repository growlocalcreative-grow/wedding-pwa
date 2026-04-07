'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'resources' | 'diy'>('tasks');
  const [items, setItems] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [val1, setVal1] = useState('1'); 
  const [val2, setVal2] = useState(''); 
  const [cost, setCost] = useState('0');

  useEffect(() => {
    checkAdminAndFetch();
  }, [activeTab]);

  async function checkAdminAndFetch() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      alert("Admins only!");
      return router.push('/');
    }

    const { data: userList } = await supabase.from('profiles').select('id, full_name');
    if (userList) setProfiles(userList);

    fetchData();
  }

  async function fetchData() {
    let table = activeTab === 'tasks' ? 'tasks' : activeTab === 'resources' ? 'resources' : 'diy_projects';
    const { data } = await supabase.from(table).select('*').order('id', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  // --- MISSING FUNCTIONS START HERE ---
  
  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this?")) return;
    let table = activeTab === 'tasks' ? 'tasks' : activeTab === 'resources' ? 'resources' : 'diy_projects';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchData();
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    if (activeTab === 'tasks') {
      setTitle(item.title); setDesc(item.directions); setVal1(item.phase_id.toString()); setVal2(item.assigned_user_id || ''); setCost(item.estimated_cost.toString());
    } else if (activeTab === 'resources') {
      setTitle(item.name); setDesc(item.notes); setVal1(item.category); setVal2(item.contact_type); setCost(item.price_quoted.toString());
    } else {
      setTitle(item.title); setDesc(item.materials_list); setCost(item.estimated_cost.toString()); setVal2(item.assigned_to);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- MISSING FUNCTIONS END HERE ---

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let table = activeTab === 'tasks' ? 'tasks' : activeTab === 'resources' ? 'resources' : 'diy_projects';
    
    const payload: any = activeTab === 'tasks' ? { title, directions: desc, phase_id: parseInt(val1), assigned_user_id: val2 || null, estimated_cost: parseFloat(cost) }
                     : activeTab === 'resources' ? { name: title, notes: desc, category: val1, contact_type: val2, price_quoted: parseFloat(cost) }
                     : { title, materials_list: desc, estimated_cost: parseFloat(cost), assigned_to: val2 };

    const { error } = editingId 
      ? await supabase.from(table).update(payload).eq('id', editingId)
      : await supabase.from(table).insert([payload]);

    if (!error) {
      alert(editingId ? "Updated!" : "Added!");
      setEditingId(null); setTitle(''); setDesc(''); setCost('0');
      fetchData();
    }
  }

  async function approveTask(id: number) {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
    fetchData();
  }

  if (loading) return <div className="p-10 text-center italic text-rose-300">Syncing Desk...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-800">
      <header className="bg-white border-b border-rose-100 p-6 sticky top-0 z-20 shadow-sm flex flex-col items-center">
        <h1 className="text-xl font-serif italic text-slate-800">Bride's Desk</h1>
        <div className="flex bg-slate-100 rounded-xl p-1 mt-4 w-full max-w-xs">
          {(['tasks', 'resources', 'diy'] as const).map((tab) => (
            <button key={tab} onClick={() => {setActiveTab(tab); setEditingId(null);}} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-rose-500' : 'text-slate-400'}`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <section className="card-wedding border-2 border-rose-100 bg-white shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingId ? '✏️ Edit' : '➕ Add'} {activeTab}</h2>
            <input type="text" placeholder="Title/Name" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-1 focus:ring-rose-200" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Description/Directions/Materials" className="w-full p-3 rounded-xl border border-slate-200 text-sm h-20 outline-none focus:ring-1 focus:ring-rose-200" value={desc} onChange={(e) => setDesc(e.target.value)} />
            
            <div className="grid grid-cols-2 gap-3">
              {activeTab === 'tasks' ? (
                <select className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white" value={val2} onChange={(e) => setVal2(e.target.value)}>
                  <option value="">Assign to Everyone</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                </select>
              ) : (
                <input type="text" placeholder="Category/Type" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none" value={val1} onChange={(e) => setVal1(e.target.value)} />
              )}
              <input type="number" placeholder="Cost $" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>

            <button type="submit" className="w-full bg-rose-400 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-sm hover:bg-rose-500">
              {editingId ? 'Save Changes' : `Assign ${activeTab}`}
            </button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setTitle(''); setDesc('');}} className="w-full text-[9px] text-slate-400 font-bold uppercase text-center">Cancel Edit</button>}
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 italic">Manage {activeTab}</h2>
          {items.map((item) => (
            <div key={item.id} className="card-wedding py-4 px-5 flex justify-between items-center shadow-sm border-l-4 border-l-slate-100">
              <div className="flex-1 pr-4">
                <h3 className="text-sm font-bold text-slate-700 leading-tight">{item.title || item.name}</h3>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter italic">
                  {item.status === 'pending_review' ? '⚠️ REVIEW NEEDED' : `$${item.estimated_cost || item.price_quoted || 0}`}
                </p>
              </div>
              <div className="flex gap-2">
                {item.status === 'pending_review' && (
                   <button onClick={() => approveTask(item.id)} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase shadow-sm">Approve</button>
                )}
                <button onClick={() => startEdit(item)} className="p-2 bg-slate-50 rounded-lg text-sm border border-slate-100 shadow-sm active:scale-90 transition-all">✏️</button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 rounded-lg text-sm border border-rose-100 shadow-sm active:scale-90 transition-all">🗑️</button>
              </div>
            </div>
          ))}
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center hover:scale-105 transition-all"><span className="text-xl leading-none">🏠</span><span className="text-[9px] font-bold mt-1 tracking-tight">Exit</span></Link>
      </nav>
    </main>
  );
}