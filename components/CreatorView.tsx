"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function CreatorView({ onSaveSuccess }: { onSaveSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [lectureName, setLectureName] = useState('');
  const [course, setCourse] = useState('COSC1336');
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

  const saveToDB = async () => {
    setLoading(true);
    const { error } = await supabase.from('flashcards').insert(cards);
    if (!error) {
      alert("Success!");
      onSaveSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input className="p-2 border rounded-xl bg-gray-50 text-sm" placeholder="Course" value={course} onChange={e => setCourse(e.target.value)} />
          <input className="p-2 border rounded-xl text-sm" placeholder="Lecture Name" value={lectureName} onChange={e => setLectureName(e.target.value)} />
        </div>
        <textarea className="w-full h-48 p-5 border-2 border-gray-50 rounded-2xl mb-4 text-sm" placeholder="Paste transcript..." value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50">
          {loading ? "AI Generating..." : "Generate Flashcards"}
        </button>
      </div>

      {cards.length > 0 && (
        <div className="space-y-4">
          {cards.map((c, i) => (
            <div key={i} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex gap-2 mb-2">
                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-green-50 text-green-600 rounded">{c.lecture}</span>
                {c.topics.map((t: string) => <span key={t} className="text-[8px] font-black uppercase px-2 py-0.5 bg-gray-50 text-gray-500 rounded">{t}</span>)}
              </div>
              <p className="font-bold text-sm">Q: {c.question}</p>
              <p className="text-gray-600 text-xs italic mt-1">A: {c.answer}</p>
            </div>
          ))}
          <button onClick={saveToDB} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black">Save to Database</button>
        </div>
      )}
    </div>
  );
}