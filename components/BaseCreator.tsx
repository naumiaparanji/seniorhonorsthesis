"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface BaseCreatorProps {
  userRole: 'admin' | 'student';
  actionButton: (cards: any[]) => React.ReactNode; 
}

export default function BaseCreator({ userRole, actionButton }: BaseCreatorProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [lectureName, setLectureName] = useState('');
  const [course, setCourse] = useState('COSC1336');
  const [cards, setCards] = useState<any[]>([]);
  const [existingTopics, setExistingTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const { data } = await supabase.from('flashcards').select('topics');
      const flattened = data?.flatMap(i => i.topics) || [];
      setExistingTopics(Array.from(new Set(flattened)).filter(Boolean) as string[]);
    };
    fetchTopics();
  }, [course]);

  const handleGenerate = async () => {
    if (!notes.trim() || !lectureName.trim()) return alert("Fill all fields");
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, course, lecture: lectureName, existingTopics }),
      });
      const aiCards = await res.json();
      if (aiCards && Array.isArray(aiCards)) {
        setCards(aiCards.map((c: any) => ({ ...c, course, lecture: lectureName })));
      }
    } catch (err) { alert("Error generating cards."); }
    setLoading(false);
  };

  const removeCard = (index: number) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Input Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input className="p-3 border rounded-xl bg-gray-50 font-bold" placeholder="Course" value={course} onChange={e => setCourse(e.target.value)} />
          <input className="p-3 border rounded-xl" placeholder="Lecture Name" value={lectureName} onChange={e => setLectureName(e.target.value)} />
        </div>
        <textarea className="w-full h-48 p-5 border-2 border-gray-50 rounded-2xl mb-4 outline-none focus:border-blue-200 transition-all" placeholder="Paste transcript..." value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50">
          {loading ? "AI is working..." : "Generate Preview"}
        </button>
      </div>

      {/* Preview Section */}
      {cards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-4">Preview ({cards.length} Cards)</h3>
          {cards.map((c, i) => (
            <div key={i} className="group relative p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-red-100 transition-all">
              <button onClick={() => removeCard(i)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <TrashIcon />
              </button>
              <div className="flex gap-2 mb-2 items-center">
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border bg-blue-50 text-blue-600">{c.category}</span>
                {c.topics.map((t: any) => <span key={t} className="text-[8px] font-black uppercase px-2 py-0.5 bg-gray-50 text-gray-400 rounded border">{t}</span>)}
              </div>
              <p className="font-bold text-gray-800 pr-8">Q: {c.question}</p>
              <p className="text-gray-500 text-sm mt-1 italic">A: {c.answer}</p>
            </div>
          ))}

          {/* This is the "Slot" where the specialized button goes */}
          <div className="pt-6">
            {actionButton(cards)}
          </div>
        </div>
      )}
    </div>
  );
}

// Small SVG Helper
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}