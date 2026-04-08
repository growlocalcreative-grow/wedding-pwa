'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newHelp, setNewHelp] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => { fetchResources(); checkUser(); }, []);

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
      name: newName, category: newHelp, phone: newPhone, email: newEmail,
      suggested_by: userName, contact_status: 'Pending'
    }]);
    setNewName(''); setNewHelp(''); setNewPhone(''); setNewEmail('');
    fetchResources();
  }

  async function updateStatus(id: number, field: string, value: any) {
    await supabase.from('resources').update({ [field]: value }).eq('id', id);
    fetchResources();
  }

  if (loading) return <div className="p-10 text-center italic text-emerald-300">Syncing Contacts...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      <div className="bg-emerald-50 border-b border-emerald-100 p-8 text-center">
        <h1 className="text-2xl font-serif italic">Wedding Contacts</h1>
        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-1 italic">Who can help us save?</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        <section className="card-wedding bg-white border-emerald-100 shadow-md p-6">
          <h2 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4">➕ Add Potential Resource</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full Name" className="w-full p-2 text-xs rounded-lg border border-slate-100 bg-slate-50 outline-none" required />
            <input value={newHelp} onChange={(e) => setNewHelp(e.target.value)} placeholder="What can they help with?" className="w-full p-2 text-xs rounded-lg border border-slate-100 bg-slate-50 outline-none" required />
            <div className="grid grid-cols-2 gap-2">
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone #" className="p-2 text-xs rounded-lg border border-slate-100 bg-slate-50" />
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" className="p-2 text-xs rounded-lg border border-slate-100 bg-slate-50" />
            </div>
            <button type="submit" className="w-full bg-emerald-500 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest">Add to List</button>
          </form>
        </section>

        <div className="space-y-4">
          {resources.map((res) => (
            <div key={res.id} className={`card-wedding relative overflow-hidden transition-all ${res.contact_status === 'Agreed' ? 'border-emerald-300 bg-emerald-50/20' : 'bg-white shadow-sm'}`}>
              
              {/* YELLOW FLAG LOGIC (Bug Fix) */}
              <div className={`absolute top-0 right-0 px-3 py-1 text-[8px] font-bold uppercase rounded-bl-xl shadow-sm ${
                res.contact_status === 'Agreed' ? 'bg-emerald-500 text-white' : 
                res.contact_status === 'Contacted' ? 'bg-amber-400 text-amber-900' : // <-- The Yellow Flag!
                res.contact_status === 'Declined' ? 'bg-rose-400 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {res.contact_status}
              </div>

              <div className="flex justify-between items-start mb-4 pr-16">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{res.name}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">{res.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-[10px] text-slate-500">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-400 uppercase text-[8px]">Contact Info</span>
                  <span>{res.phone || 'No Phone'}</span>
                  <span className="truncate">{res.email || 'No Email'}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-bold text-slate-400 uppercase text-[8px]">Added By</span>
                  <span className="text-emerald-600 font-medium">{res.suggested_by || 'Team'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => updateStatus(res.id, 'is_potential_bro_deal', !res.is_potential_bro_deal)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase transition-all ${
                      res.is_potential_bro_deal ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    🤝 Potential Bro Deal
                  </button>

                  <select 
                    value={res.contact_status}
                    onChange={(e) => updateStatus(res.id, 'contact_status', e.target.value)}
                    className="text-[9px] font-bold uppercase bg-slate-100 p-1.5 rounded-lg outline-none"
                  >
                    <option value="Pending">Wait: Pending</option>
                    <option value="Contacted">Busy: Contacted</option>
                    <option value="Agreed">Yes: Able to Help!</option>
                    <option value="Declined">No: Not Able</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🏠</span><span className="text-[9px] font-bold mt-1">Home</span></Link>
        <Link href="/tasks" className="text-slate-400 flex flex-col items-center"><span className="text-xl">✅</span><span className="text-[9px] font-bold mt-1">Tasks</span></Link>
        <Link href="/workshop" className="text-slate-400 flex flex-col items-center"><span className="text-xl">🎨</span><span className="text-[9px] font-bold mt-1">DIY</span></Link>
        <Link href="/resources" className="text-emerald-500 flex flex-col items-center"><span className="text-xl">🤝</span><span className="text-[9px] font-bold mt-1 underline decoration-2 underline-offset-4 decoration-emerald-200">Deals</span></Link>
      </nav>
    </main>
  );
}