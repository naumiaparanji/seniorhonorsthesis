"use client";
import { useEffect, useMemo, useState } from "react";
import FeedbackCard from "@/components/FeedbackCard";

type Flashcard = {
  id: string;
  lecture: string;
  topics: string[];
  question: string;
  answer: string;
  category: "What" | "How" | "Why";
  importance: number;
};

export default function FlashcardMode({
  cards,
  onExit,
  courseId,
  lectures,
}: {
  cards: Flashcard[];
  onExit: () => void;
  courseId: string;
  lectures: string[];
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const total = cards.length;
  const card = useMemo(() => cards[idx], [cards, idx]);

  useEffect(() => {
    if (idx > total - 1) setIdx(0);
  }, [total, idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " " || e.key === "Enter") setFlipped((f) => !f);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, total]);

  const prev = () => {
    setFlipped(false);
    setIdx((i) => (i - 1 + total) % total);
  };

  const next = () => {
    setFlipped(false);
    setIdx((i) => (i + 1) % total);
  };

  if (!card) {
    return (
      <div className="ui-card p-10 text-center">
        <p className="text-sm ui-muted">No cards to show.</p>
        <button onClick={onExit} className="ui-btn ui-btn-primary mt-4">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="ui-card p-6 sm:p-8">
        {/* Top controls */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Flashcard mode</div>
            <div className="text-xs ui-muted">
              {idx + 1} / {total} • {card.lecture}
            </div>
          </div>

          <button
            onClick={onExit}
            className="ui-btn ui-ring-accent border border-[var(--border)] bg-white text-sm hover:opacity-80"
          >
            Exit
          </button>
        </div>

        {/* Single card */}
        <div className="mt-6 flex items-center justify-center">
          <div
            onClick={() => setFlipped((f) => !f)}
            className="w-full max-w-2xl h-[420px] perspective-1000"
          >
            <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flipped ? "rotate-y-180" : ""}`}>
              {/* FRONT */}
              <div className="absolute inset-0 backface-hidden ui-card p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs ui-muted">
                    {card.category} • Imp {card.importance}
                  </span>
                  <span className="text-xs ui-muted">Click to flip</span>
                </div>

                <div className="flex-1 flex items-center justify-center text-center px-4">
                  <p className="text-2xl font-semibold leading-snug">
                    {card.question}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {card.topics?.map((t) => (
                    <span key={t} className="text-xs px-3 py-1 rounded-full bg-[var(--accent-soft)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* BACK */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 ui-card !bg-gray-200 p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs ui-muted">Answer</span>
                  <span className="text-xs ui-muted">Click to flip back</span>
                </div>

                <div className="flex-1 flex items-center justify-center text-center px-4">
                  <p className="text-lg leading-relaxed font-medium">{card.answer}</p>
                </div>

                <div className="text-center text-xs ui-muted">
                  Tip: ← / → to navigate, Space to flip, Esc to exit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={prev}
            className="ui-btn ui-ring-accent border border-[var(--border)] bg-white text-sm hover:opacity-80"
          >
            ← Prev
          </button>

          <button
            onClick={() => setFlipped((f) => !f)}
            className="ui-btn ui-btn-primary ui-ring-accent text-sm"
          >
            Flip
          </button>

          <button
            onClick={next}
            className="ui-btn ui-ring-accent border border-[var(--border)] bg-white text-sm hover:opacity-80"
          >
            Next →
          </button>
        </div>
      </div>

      {cards.length > 0 && (
        <FeedbackCard
          courseId={courseId}
          lectures={lectures}
          cardCount={cards.length}
        />
      )}
    </div>
  );
}