'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    const { data } = await supabase.from('resources').select('*').order('contact_type');
    if (data) setResources(data);
    setLoading(false);
  }

  if (loading) return <div className="p-10 text-center italic text-rose-300">Loading Directory...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-rose-100 p-6 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-serif italic text-slate-800 tracking-tight text-center">Resources & Contacts</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center italic leading-none">Who is Helping Us Eat the Elephant</p>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-8">
        
        {/* BRO DEALS SECTION (SAGE GREEN) */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em] ml-2 flex items-center">
             <span className="mr-2">🤝</span> The Bro Deals
          </h2>
          <div className="space-y-3">
            {resources.filter(r => r.contact_type === 'Bro Deal').map((res) => (
              <div key={res.id} className="bro-deal-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      {res.category}
                    </span>
                    <h3 className="text-lg font-bold mt-1 text-emerald-950">{res.name}</h3>
                    <p className="text-xs text-emerald-700 font-mono mt-1">{res.contact_info}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-600">${res.price_quoted}</span>
                    <p className="text-[10px] uppercase font-bold text-emerald-500 opacity-70">Price Agreed</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-100 italic text-xs text-emerald-800 leading-relaxed">
                  "{res.notes}"
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HIRED HELP SECTION (ROSE/LAVENDER) */}
        <section className="space-y-4 pb-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center">
            <span className="mr-2">💼</span> Professional Help
          </h2>
          <div className="space-y-3">
            {resources.filter(r => r.contact_type !== 'Bro Deal').map((res) => (
              <div key={res.id} className="card-wedding border-rose-100 hover:border-rose-200 shadow-sm transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      {res.category}
                    </span>
                    <h3 className="text-lg font-bold mt-1 text-slate-800">{res.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{res.contact_info}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-700">${res.price_quoted}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Price Quoted</p>
                  </div>
                </div>
                {res.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-500 italic">
                    Note: {res.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

       {/* FIXED NAVIGATION BAR: 4 ICONS */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-6 z-50">
        <Link href="/" className="text-slate-400 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-2xl leading-none">🏠</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">Home</span>
        </Link>
        
        <Link href="/tasks" className="text-rose-500 flex flex-col items-center hover:scale-105 active:scale-90 transition-all">
          <span className="text-2xl leading-none">✅</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight underline decoration-2 decoration-rose-200 underline-offset-4">Tasks</span>
        </Link>

        <Link href="/workshop" className="text-slate-400 flex flex-col items-center hover:scale-105 hover:text-purple-500 active:scale-90 transition-all">
          <span className="text-2xl leading-none">🎨</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">DIY</span>
        </Link>
        
        <Link href="/resources" className="text-slate-400 flex flex-col items-center hover:scale-105 hover:text-rose-400 active:scale-90 transition-all">
          <span className="text-2xl leading-none">🤝</span>
          <span className="text-[9px] font-bold mt-1 tracking-tight">Deals</span>
        </Link>
      </nav>
    </main>
  );
}