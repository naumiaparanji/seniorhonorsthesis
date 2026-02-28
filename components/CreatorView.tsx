"use client";
import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function CreatorView({ isAdmin, onSaveSuccess }: { isAdmin: boolean, onSaveSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [lectureName, setLectureName] = useState('');
  const [course, setCourse] = useState('');
  const [cards, setCards] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!notes.trim() || !lectureName.trim()) return alert("Fill all fields");
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ notes, course, lecture: lectureName }),
      });
      const aiCards = await res.json();
      setCards(aiCards.map((c: any) => ({ ...c, course, lecture: lectureName })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const downloadCSV = () => {
    // Format: Question, Answer, Tags
    const header = "Question,Answer,Topics\n";
    const rows = cards.map(c => `"${c.question}","${c.answer}","${c.topics.join(';')}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lectureName}_flashcards.csv`;
    a.click();
  };

  const saveToDB = async () => {
    if (!isAdmin) return;
    setLoading(true);
    const { error } = await supabase.from('flashcards').insert(cards);
    if (!error) {
      alert("Database Updated!");
      onSaveSuccess();
    } else {
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input className="p-3 border rounded-xl bg-gray-50" placeholder="Course" value={course} onChange={e => setCourse(e.target.value)} />
          <input className="p-3 border rounded-xl" placeholder="Lecture Name" value={lectureName} onChange={e => setLectureName(e.target.value)} />
        </div>
        <textarea className="w-full h-48 p-5 border-2 border-gray-50 rounded-2xl mb-4" placeholder="Paste transcript here..." value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 disabled:opacity-50">
          {loading ? "AI is working..." : "Generate Preview"}
        </button>
      </div>

      {cards.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2 px-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Preview ({cards.length} Cards)</h3>
            <button onClick={downloadCSV} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">Download for Anki (.csv)</button>
          </div>
          
          {cards.map((c, i) => (
            <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex gap-2 mb-2">
                {c.topics.map((t: string) => <span key={t} className="text-[8px] font-black uppercase px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-200">{t}</span>)}
              </div>
              <p className="font-bold text-gray-800">Q: {c.question}</p>
              <p className="text-gray-500 text-sm mt-1 italic">A: {c.answer}</p>
            </div>
          ))}

          {isAdmin && (
            <button onClick={saveToDB} className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-green-700 transition-all">
              Save to Database
            </button>
          )}
        </div>
      )}
    </div>
  );
}