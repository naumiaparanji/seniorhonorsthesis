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
        <button
          onClick={() => saveToDB(cards)}
          className="ui-btn ui-ring-accent w-full py-4 text-sm bg-[var(--accent)] text-black font-semibold rounded-full transition active:translate-y-[1px]"
        >
          Save {cards.length} Cards to Live Database
        </button>
      )}
    />
  );
}