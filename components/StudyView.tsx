"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import FlashcardMode from "@/components/FlashcardMode";
import FeedbackCard from "@/components/FeedbackCard";

type Flashcard = {
  id: string;
  course: string;
  lecture: string;
  topics: string[];
  question: string;
  answer: string;
  category: 'What' | 'How' | 'Why';
  importance: number;
};

export default function StudyView() {
  const [loading, setLoading] = useState(false);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [allFetchedCards, setAllFetchedCards] = useState<Flashcard[]>([]);
  const [displayCards, setDisplayCards] = useState<Flashcard[]>([]);

  // Selection State
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [availableLectures, setAvailableLectures] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  const [selectedCourses, setSelectedCourses] = useState<string[]>(['COSC1336']);
  const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Refinement State
  const [searchQuery, setSearchQuery] = useState('');
  const [minImportance, setMinImportance] = useState(1);
  const [activeCategories, setActiveCategories] = useState<string[]>(['What', 'How', 'Why']);

  // Flashcard Mode
  const [flashcardModeOpen, setFlashcardModeOpen] = useState(false);

  const resetFilters = () => {
    setSearchQuery('');
    setMinImportance(1);
    setActiveCategories(['What', 'How', 'Why']);
    setSelectedTopics([]);
  };

  // 1. Initial Load: Fetch Available Courses
  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('flashcards').select('course');
      setAvailableCourses(Array.from(new Set(data?.map(i => i.course))).filter(Boolean) as string[]);
    };
    fetchCourses();
  }, []);

  // 2. Fetch Lectures based on Course
  useEffect(() => {
    const fetchLectures = async () => {
      if (selectedCourses.length === 0) {
        setAvailableLectures([]);
        return;
      }
      const { data } = await supabase.from('flashcards').select('lecture').in('course', selectedCourses);
      setAvailableLectures(Array.from(new Set(data?.map(i => i.lecture))).filter(Boolean) as string[]);
    };
    fetchLectures();
  }, [selectedCourses]);

  // 3. Fetch Topics based on Course + Selected Lectures
  useEffect(() => {
    const fetchTopics = async () => {
      if (selectedLectures.length === 0) {
        setAvailableTopics([]);
        return;
      }
      const { data } = await supabase
        .from('flashcards')
        .select('topics')
        .in('course', selectedCourses)
        .in('lecture', selectedLectures);

      const flattened = data?.flatMap(i => i.topics) || [];
      setAvailableTopics(Array.from(new Set(flattened)).filter(Boolean) as string[]);
    };
    fetchTopics();
  }, [selectedCourses, selectedLectures]);

  // 4. Fetch cards
  useEffect(() => {
    const fetchCards = async () => {
      if (selectedLectures.length === 0) {
        setAllFetchedCards([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('flashcards')
        .select('*')
        .in('course', selectedCourses)
        .in('lecture', selectedLectures);

      if (data) setAllFetchedCards(data);
      setLoading(false);
    };
    fetchCards();
  }, [selectedCourses, selectedLectures]);

  // 5. Apply Client-side Filters
  useEffect(() => {
    let results = allFetchedCards.filter(card => {
      const matchesTopic =
        selectedTopics.length === 0 || card.topics.some(t => selectedTopics.includes(t));
      const matchesCategory = activeCategories.includes(card.category);
      const matchesImportance = card.importance >= minImportance;
      const matchesSearch =
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTopic && matchesCategory && matchesImportance && matchesSearch;
    });

    results.sort((a, b) => {
      const catOrder: Record<string, number> = { What: 0, How: 1, Why: 2 };
      if (catOrder[a.category] !== catOrder[b.category]) {
        return catOrder[a.category] - catOrder[b.category];
      }
      return b.importance - a.importance;
    });

    setDisplayCards(results);
  }, [allFetchedCards, selectedTopics, activeCategories, minImportance, searchQuery]);

  return (
    <div className="space-y-8">
      {/* 1) HERO / INTRO */}
      <div className="ui-card p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Flashcards for VideoPoints
            </h1>

            <p className="ui-muted text-sm leading-relaxed">
              Welcome to the Flashcards website for VideoPoints.
            </p>

            <p className="ui-muted text-sm leading-relaxed">
              Here, you can explore and study flashcards generated from lecture transcripts of your favorite courses.
              Use the filters to find cards relevant to specific courses, lectures, or topics. Click on a card to flip it
              and reveal the answer. Happy studying!
            </p>
          </div>

          <div className="flex md:flex-col items-start md:items-end">
            <a
              href="https://youtu.be/l2PbtwJFdFA"
              target="_blank"
              rel="noopener noreferrer"
              className="ui-btn ui-ring-accent border border-[var(--border)] bg-white text-sm hover:bg-[var(--accent-soft)] transition"
            >
              Watch demo video!
            </a>

            <p className="text-sm ui-muted mt-2 max-w-[280px] text-right hidden md:block">
              This is a quick video going over the features of this website.
            </p>
            <p className="text-sm ui-muted mt-2 max-w-[280px] text-right hidden md:block">
              Runtime is approximately 5 minutes. Please contact us with any questions.
            </p>
          </div>
        </div>
      </div>

      {/* 2) SELECTION GRID */}
      <div className="ui-card p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Course */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold tracking-widest uppercase ui-muted">
              1. Course
            </div>
            <div className="flex flex-wrap gap-2 max-h-50 overflow-y-auto pr-1 topic-scroll">
              {availableCourses.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCourses([c]);
                    setSelectedLectures([]);
                    setSelectedTopics([]);
                    setFlashcardModeOpen(false);
                  }}
                  className={`ui-btn ui-ring-accent px-3 py-2 text-xs border border-[var(--border)] ${
                    selectedCourses.includes(c)
                      ? "bg-[var(--accent-soft)] text-black"
                      : "bg-white text-[var(--muted)] hover:opacity-80"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Lectures */}
          <div className={`space-y-3 md:border-l md:border-[var(--border)] md:pl-8 transition-all ${selectedCourses.length > 0 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="text-[11px] font-semibold tracking-widest uppercase ui-muted">
              2. Lectures
            </div>
            <div className="flex flex-wrap gap-2 max-h-50 overflow-y-auto pr-1 topic-scroll">
              {availableLectures.map(l => (
                <button
                  key={l}
                  onClick={() => {
                    const next = selectedLectures.includes(l)
                      ? selectedLectures.filter(x => x !== l)
                      : [...selectedLectures, l];
                    setSelectedLectures(next);
                    setSelectedTopics([]);
                    setFlashcardModeOpen(false);
                  }}
                  className={`ui-btn ui-ring-accent px-3 py-2 text-xs border border-[var(--border)] ${
                    selectedLectures.includes(l)
                      ? "bg-[var(--accent-soft)] text-black"
                      : "bg-white text-[var(--muted)] hover:opacity-80"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-3 md:border-l md:border-[var(--border)] md:pl-8">
            <div className="text-[11px] font-semibold tracking-widest uppercase ui-muted">
              3. Topics
            </div>

            <div className="flex flex-wrap gap-2 max-h-50 overflow-y-auto pr-1 topic-scroll">
              {selectedLectures.length > 0 ? (
                availableTopics.length > 0 ? (
                  availableTopics.map(t => (
                    <button key={t} onClick={() => {
                        setSelectedTopics(prev =>
                          prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
                        );
                        setFlashcardModeOpen(false);
                      }}
                      className={`ui-btn ui-ring-accent px-3 py-2 text-xs border border-[var(--border)] ${
                        selectedTopics.includes(t)
                          ? "bg-[var(--accent-soft)] text-black"
                          : "bg-white text-[var(--muted)] hover:opacity-80"
                      }`}
                    >
                      {t}
                    </button>
                  ))
                ) : (
                  <p className="text-sm ui-muted italic">No specific topics found for these lectures.</p>
                )
              ) : (
                <p className="text-sm ui-muted italic">Select a lecture to see specific topics…</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3) REFINE + CARDS */}
      {selectedLectures.length > 0 ? (
        flashcardModeOpen ? (
          <FlashcardMode
            cards={displayCards}
            onExit={() => setFlashcardModeOpen(false)}
            courseId={selectedCourses[0] || "Unknown"}
            lectures={selectedLectures}
          />
        ) : (
          <div className="space-y-6">
            {/* Refine header */}
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold">Refine</h2>
                <p className="text-sm ui-muted">Viewing {displayCards.length} cards</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFlashcardModeOpen(true)}
                  disabled={displayCards.length === 0}
                  className="ui-btn ui-btn-primary ui-ring-accent text-xs disabled:opacity-50"
                >
                  Launch Flashcard mode
                </button>

                <button
                  onClick={resetFilters}
                  className="text-sm ui-muted hover:text-black transition inline-flex items-center gap-2"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-white">
                    ↻
                  </span>
                  Clear filters
                </button>
              </div>
            </div>

            {/* Refine bar */}
            <div className="ui-card p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-[420px]">
                <input
                  type="text"
                  placeholder="Search questions or topics…"
                  className="w-full rounded-xl border border-[var(--border)] bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3 top-1 text-3xl text-[var(--muted)]">⌕</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="ui-card p-1 flex items-center gap-1">
                  {['What', 'How', 'Why'].map(cat => {
                    const active = activeCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() =>
                          setActiveCategories(prev =>
                            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                          )
                        }
                        className={`ui-btn ui-ring-accent px-4 py-2 text-xs ${
                          active ? "bg-[#111111] text-white" : "bg-transparent text-[var(--muted)] hover:opacity-80"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                <div className="ui-card px-4 py-3 flex items-center gap-3">
                  <span className="text-xs ui-muted font-medium">Min importance</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={minImportance}
                    onChange={(e) => setMinImportance(parseInt(e.target.value))}
                    className="w-24 accent-[var(--accent)]"
                  />
                  <span className="text-sm font-semibold">{minImportance}</span>
                </div>
              </div>
            </div>

            {/* Cards grid */}
            {loading ? (
              <div className="ui-card p-10 text-center ui-muted animate-pulse">
                Fetching cards…
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayCards.map(card => (
                  <FlashcardItem
                    key={card.id}
                    card={card}
                    isFlipped={flippedId === card.id}
                    onFlip={() => setFlippedId(flippedId === card.id ? null : card.id)}
                  />
                ))}
              </div>
            )}

            {displayCards.length === 0 && !loading && (
              <div className="ui-card p-10 text-center">
                <p className="text-sm ui-muted">No matching cards found.</p>
              </div>
            )}

            {displayCards.length > 0 && !loading && (
              <FeedbackCard
                courseId={selectedCourses[0] || "Unknown"}
                lectures={selectedLectures}
                cardCount={displayCards.length}
              />
            )}
          </div>
        )
      ) : (
        <div className="ui-card p-10 text-center">
          <p className="text-sm ui-muted">Select one or more lectures to begin.</p>
        </div>
      )}
    </div>
  );
}

function FlashcardItem({
  card,
  isFlipped,
  onFlip,
}: {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div onClick={onFlip} className="h-72 cursor-pointer perspective-1000 group">
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* FRONT */}
        <div className="absolute inset-0 backface-hidden ui-card !bg-white p-6 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium ui-muted truncate">{card.lecture}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full border border-[var(--border)] bg-white ui-muted">
                  {card.category}
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full border border-[var(--border)] bg-white ui-muted">
                  Imp {card.importance}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-14 overflow-y-auto">
              {card.topics.map(t => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-1 rounded-full bg-[var(--accent-soft)] text-black/80"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center text-center px-2">
            <p className="text-lg font-semibold leading-snug">{card.question}</p>
          </div>

          <div className="text-center">
            <p className="text-xs ui-muted">Click to reveal answer</p>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 ui-card !bg-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium ui-muted truncate">{card.lecture}</span>
          </div>

          <div className="flex-1 flex items-center justify-center text-center px-2">
            <p className="text-base leading-relaxed">{card.answer}</p>
          </div>

          <div className="text-center">
            <p className="text-xs ui-muted">Click to see question</p>
          </div>
        </div>
      </div>
    </div>
  );
}