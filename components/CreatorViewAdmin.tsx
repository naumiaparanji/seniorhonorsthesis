"use client";
import BaseCreator from './BaseCreator';
import { supabase } from '@/utils/supabase';

export default function CreatorViewAdmin({ onSaveSuccess }: { onSaveSuccess: () => void }) {
  const saveToDB = async (cards: any[]) => {
    const formattedCards = cards.map(c => ({
      course: c.course, lecture: c.lecture, topics: c.topics,
      question: c.question, answer: c.answer, 
      category: c.category || 'What', importance: c.importance || 3
    }));

    const { error } = await supabase.from('flashcards').insert(formattedCards);
    if (!error) {
      alert("Database Updated!");
      onSaveSuccess();
      window.location.reload(); // Simple way to clear state
    } else {
      alert("Error: " + error.message);
    }
  };

  return (
    <BaseCreator 
      userRole="admin" 
      actionButton={(cards) => (
        <button onClick={() => saveToDB(cards)} className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-green-700 transition-all">
          Save {cards.length} Cards to Live Database
        </button>
      )} 
    />
  );
}