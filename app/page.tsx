import { supabase } from '@/lib/supabase';

export default async function Home() {
  // This fetches your Phases from the database we set up earlier!
  const { data: phases } = await supabase.from('phases').select('*').order('step_number');

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6 border-t-4 border-rose-200">
        <h1 className="text-3xl font-serif text-slate-800 mb-4 text-center italic">The Wedding Elephant</h1>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-700 border-b pb-2">Current Planning Phases:</h2>
          {phases?.map((phase) => (
            <div key={phase.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
              <span className="text-slate-700 font-medium">{phase.name}</span>
              <span className={phase.is_locked ? "text-xs bg-slate-200 px-2 py-1 rounded" : "text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded"}>
                {phase.is_locked ? "Locked" : "Unlocked"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}