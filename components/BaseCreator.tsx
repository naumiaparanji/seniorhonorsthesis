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
  const [course, setCourse] = useState('');
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
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-semibold tracking-tight">Flashcard Creator</h2>
        <p className="text-sm ui-muted mt-1">
          Paste a transcript, generate a preview, then {userRole === 'admin' ? 'save to the database.' : 'request cards.'}
        </p>
      </div>

      {/* Input Section */}
      <div className="ui-card p-6 sm:p-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs ui-muted font-medium">Course</label>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Course Name"
              value={course}
              onChange={e => setCourse(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs ui-muted font-medium">Lecture name</label>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Lecture Name"
              value={lectureName}
              onChange={e => setLectureName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs ui-muted font-medium">Transcript</label>
          <textarea
            className="w-full h-48 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="Paste transcript..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <p className="text-xs ui-muted">
            Tip: Longer transcripts work best when they’re clean (no timestamps, minimal speaker tags).
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="ui-btn ui-btn-primary ui-ring-accent w-full disabled:opacity-50"
        >
          {loading ? "AI is working..." : "Generate Preview"}
        </button>
      </div>

      {/* Preview Section */}
      {cards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <h3 className="text-lg font-semibold">Preview</h3>
              <p className="text-sm ui-muted">{cards.length} cards generated</p>
            </div>
            <p className="text-xs ui-muted">Remove any cards you don’t want.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {cards.map((c, i) => (
              <div
                key={i}
                className="ui-card relative p-5 sm:p-6 transition hover:shadow-sm"
              >
                <button
                  onClick={() => removeCard(i)}
                  className="ui-ring-accent absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] hover:text-black hover:bg-[var(--accent-soft)] transition"
                  title="Remove card"
                >
                  <TrashIcon />
                </button>

                <div className="flex flex-wrap gap-2 pr-10 mb-3">
                  <span className="text-[11px] px-2 py-1 rounded-full border border-[var(--border)] bg-white ui-muted">
                    {c.category}
                  </span>

                  {Array.isArray(c.topics) && c.topics.map((t: any) => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-1 rounded-full bg-[var(--accent-soft)] text-black/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <p className="font-semibold leading-snug">
                  <span className="ui-muted font-medium">Q:</span> {c.question}
                </p>
                <p className="text-sm ui-muted mt-2 leading-relaxed">
                  <span className="font-medium">A:</span> {c.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Slot for admin/student action button */}
          <div className="pt-2">
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