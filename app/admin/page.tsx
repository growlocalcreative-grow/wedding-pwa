'use client';
export const dynamic = 'force-dynamic';
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

  // Unified Form States
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [val1, setVal1] = useState('1'); 
  const [val2, setVal2] = useState(''); 
  const [cost, setCost] = useState('0');
  
  // New Contact Specific States
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const theme = {
    tasks: { bg: 'bg-rose-50/50', border: 'border-rose-200', text: 'text-rose-600', btn: 'bg-rose-400' },
    resources: { bg: 'bg-emerald-50/50', border: 'border-emerald-200', text: 'text-emerald-600', btn: 'bg-emerald-500' },
    diy: { bg: 'bg-purple-50/50', border: 'border-purple-200', text: 'text-purple-600', btn: 'bg-purple-500' }
  }[activeTab];

  useEffect(() => { checkAdminAndFetch(); }, [activeTab]);

  async function checkAdminAndFetch() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return router.push('/');
    const { data: userList } = await supabase.from('profiles').select('id, full_name, email');
    if (userList) setProfiles(userList);
    fetchData();
  }

  async function fetchData() {
    let table = activeTab === 'tasks' ? 'tasks' : activeTab === 'resources' ? 'resources' : 'diy_projects';
    const { data } = await supabase.from(table).select('*').order('id', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let table = activeTab === 'tasks' ? 'tasks' : activeTab === 'resources' ? 'resources' : 'diy_projects';
    
    const payload: any = activeTab === 'tasks' ? { 
        title, directions: desc, phase_id: parseInt(val1), assigned_user_id: val2 || null, estimated_cost: parseFloat(cost) 
      } : activeTab === 'resources' ? { 
        name: title, notes: desc, category: val1, phone, email, price_quoted: parseFloat(cost) 
      } : { 
        title, materials_list: desc, estimated_cost: parseFloat(cost), assigned_user_id: val2 || null 
      };

    const { error } = editingId ? await supabase.from(table).update(payload).eq('id', editingId) : await supabase.from(table).insert([payload]);
    if (!error) { setEditingId(null); setTitle(''); setDesc(''); setCost('0'); setPhone(''); setEmail(''); fetchData(); }
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setTitle(item.title || item.name);
    setDesc(item.directions || item.notes || item.materials_list || '');
    setCost((item.estimated_cost || item.price_quoted || 0).toString());
    setVal1(item.phase_id?.toString() || item.category || '1');
    setVal2(item.assigned_user_id || '');
    setPhone(item.phone || '');
    setEmail(item.email || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function approveTask(id: number) {
    await supabase.from('tasks').update({ status: 'completed' }).eq('id', id);
    fetchData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure? This is permanent!")) return;
    let table = activeTab === 'tasks' ? 'tasks' : activeTab === 'resources' ? 'resources' : 'diy_projects';
    await supabase.from(table).delete().eq('id', id);
    fetchData();
  }

  if (loading) return <div className="p-10 text-center italic text-rose-300">Loading Desk...</div>;

  return (
    <main className={`min-h-screen pb-32 font-sans text-slate-800 transition-colors duration-500 ${theme.bg}`}>
      <header className={`bg-white border-b sticky top-0 z-20 shadow-sm flex flex-col items-center p-6 transition-all duration-500 ${theme.border}`}>
        <h1 className="text-xl font-serif italic">Bride&apos;s Desk</h1>
        <div className="flex bg-slate-100 rounded-xl p-1 mt-4 w-full max-w-xs">
          <button onClick={() => {setActiveTab('tasks'); setEditingId(null);}} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${activeTab === 'tasks' ? 'bg-white shadow-sm text-rose-500' : 'text-slate-400'}`}>Tasks</button>
          <button onClick={() => {setActiveTab('resources'); setEditingId(null);}} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${activeTab === 'resources' ? 'bg-white shadow-sm text-emerald-500' : 'text-slate-400'}`}>People</button>
          <button onClick={() => {setActiveTab('diy'); setEditingId(null);}} className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all ${activeTab === 'diy' ? 'bg-white shadow-sm text-purple-500' : 'text-slate-400'}`}>Crafts</button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <section className={`card-wedding border-2 bg-white p-6 shadow-md transition-all duration-500 ${theme.border}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className={`text-[10px] font-bold uppercase tracking-widest ${theme.text}`}>{editingId ? '✏️ Edit' : '➕ Add'} Item</h2>
            <input type="text" placeholder="Name/Title" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none" value={title} onChange={(e) => setTitle(e.target.value)} required />
            
            {/* NEW: Contact Fields show only on People tab */}
            {activeTab === 'resources' && (
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Phone" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input type="text" placeholder="Email" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}

            <textarea placeholder="Details/Notes..." className="w-full p-3 rounded-xl border border-slate-200 text-sm h-20 outline-none" value={desc} onChange={(e) => setDesc(e.target.value)} />
            
            <div className="grid grid-cols-2 gap-3">
              {activeTab === 'tasks' && (
                <select className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white" value={val1} onChange={(e) => setVal1(e.target.value)}>
                  {[1,2,3,4].map(n => <option key={n} value={n}>Phase {n}</option>)}
                </select>
              )}
              {activeTab === 'resources' && (
                 <input type="text" placeholder="Category" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none" value={val1} onChange={(e) => setVal1(e.target.value)} />
              )}
              {(activeTab === 'tasks' || activeTab === 'diy') && (
                <select className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white" value={val2} onChange={(e) => setVal2(e.target.value)}>
                  <option value="">Team: Everyone</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                </select>
              )}
              <input type="number" placeholder="Cost $" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>

            <button type="submit" className={`w-full text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-md ${theme.btn}`}>
              {editingId ? 'Save Changes' : `Add to Elephant`}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 italic">Existing Items</h2>
          {items.map((item) => (
            <div key={item.id} className="card-wedding py-4 px-5 flex justify-between items-center shadow-sm bg-white/80 border-l-4 border-l-slate-200">
              <div className="flex-1 pr-4">
                <h3 className="text-sm font-bold text-slate-700 leading-tight">{item.title || item.name}</h3>
                <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                  {item.contact_status ? `Status: ${item.contact_status}` : `Cost: $${item.estimated_cost || 0}`}
                </p>
              </div>
              <div className="flex gap-2">
                {item.status === 'pending_review' && <button onClick={() => approveTask(item.id)} className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase shadow-sm">Approve</button>}
                <button onClick={() => startEdit(item)} className="p-2 bg-slate-50 rounded-lg text-sm border active:scale-90 transition-all">✏️</button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 rounded-lg text-sm border border-rose-100 active:scale-90 transition-all text-rose-400">🗑️</button>
              </div>
            </div>
          ))}
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-[9px] font-bold mt-1">Exit</span></Link>
      </nav>
    </main>
  );
}