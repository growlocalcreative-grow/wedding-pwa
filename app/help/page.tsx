'use client';
import Link from 'next/link';

export default function HelpPage() {
  const sections = [
    {
      title: "📱 How to Install",
      content: "This isn't in the App Store! To put it on your home screen:\n\n• iPhone: Tap the 'Share' icon (square with arrow) and scroll down to 'Add to Home Screen'.\n• Android: Tap the 3 dots and select 'Install App'."
    },
    {
      title: "🐘 Eating the Elephant",
      content: "Planning a wedding is huge. We've broken it into Phases. Phase 2 stays locked until Phase 1 is 100% done. Focus only on what is 'Active'!"
    },
    {
      title: "✅ Tasks & Status",
      content: "When you finish a task, click 'DONE'. It will move to the Bride's Desk for approval. Once she approves it, the wedding budget and progress bar will update!"
    },
    {
      title: "🎨 DIY Workshop",
      content: "This is for our crafty projects. Anyone can update the progress by tapping the % button. If a project gets too hard, we can toggle it to 'Purchase It' instead."
    },
    {
      title: "🤝 Wedding Contacts",
      content: "See a cool vendor? Add them! If you are currently talking to them, mark them as 'Contacted' so others know you've got it handled."
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 pb-24 font-sans text-slate-800">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-3xl font-serif italic text-slate-800">Help & Tips</h1>
        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-1 italic text-balance">The Wedding Elephant Field Guide</p>
      </header>

      <div className="max-w-xl mx-auto space-y-4">
        {sections.map((s, i) => (
          <div key={i} className="card-wedding bg-white shadow-sm border-rose-100">
            <h3 className="font-bold text-rose-600 text-sm mb-2">{s.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{s.content}</p>
          </div>
        ))}

        <Link href="/" className="block w-full bg-rose-400 text-white font-bold py-3 rounded-xl text-center text-xs uppercase tracking-widest shadow-md mt-8">
          Got it, let's plan!
        </Link>
      </div>
    </main>
  );
}