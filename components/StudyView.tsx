"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

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

  // Reset function
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

  // 3. Fetch Topics based on Course + ALL Selected Lectures
  useEffect(() => {
    const fetchTopics = async () => {
      if (selectedLectures.length === 0) {
        setAvailableTopics([]);
        return;
      }
      let query = supabase.from('flashcards').select('topics').in('course', selectedCourses).in('lecture', selectedLectures);
      const { data } = await query;
      const flattened = data?.flatMap(i => i.topics) || [];
      setAvailableTopics(Array.from(new Set(flattened)).filter(Boolean) as string[]);
    };
    fetchTopics();
  }, [selectedCourses, selectedLectures]);

  // 4. Fetch the actual Cards for all selected lectures
  useEffect(() => {
    const fetchCards = async () => {
      if (selectedLectures.length === 0) {
        setAllFetchedCards([]);
        return;
      }
      setLoading(true);
      let query = supabase.from('flashcards').select('*').in('course', selectedCourses).in('lecture', selectedLectures);
      const { data } = await query;
      if (data) setAllFetchedCards(data);
      setLoading(false);
    };
    fetchCards();
  }, [selectedCourses, selectedLectures]);

  // 5. Apply Client-side Filters
  useEffect(() => {
    let results = allFetchedCards.filter(card => {
      const matchesTopic = selectedTopics.length === 0 || card.topics.some(t => selectedTopics.includes(t));
      const matchesCategory = activeCategories.includes(card.category);
      const matchesImportance = card.importance >= minImportance;
      const matchesSearch = card.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            card.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTopic && matchesCategory && matchesImportance && matchesSearch;
    });

    results.sort((a, b) => {
      const catOrder: any = { 'What': 0, 'How': 1, 'Why': 2 };
      if (catOrder[a.category] !== catOrder[b.category]) return catOrder[a.category] - catOrder[b.category];
      return b.importance - a.importance;
    });

    setDisplayCards(results);
  }, [allFetchedCards, selectedTopics, activeCategories, minImportance, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      
      {/* 1. WELCOME HERO */}
      <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50">
        <h1 className="text-3xl font-black mb-4">Welcome to Flashcards for VideoPoints</h1>
        <p className="text-indigo-100 leading-relaxed max-w-3xl opacity-90">
          Study smarter by selecting your course and specific lectures. Use the <b>Refine Bar</b> to focus on high-yield topics or specific types of questions.
        </p>
      </div>

      {/* 2. PROGRESSIVE SELECTION GRID */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Step 1: Course */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">1. Course</label>
          <div className="flex flex-wrap gap-2">
            {availableCourses.map(c => (
              <button key={c} onClick={() => { setSelectedCourses([c]); setSelectedLectures([]); setSelectedTopics([]); }}
                className={`px-3 py-1.5 text-xs rounded-xl border-2 font-bold transition-all ${selectedCourses.includes(c) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-50 text-gray-500 hover:border-indigo-100'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Multi-Lecture Selection */}
        <div className={`space-y-2 border-l border-gray-100 md:pl-8 transition-all duration-500 ${selectedCourses.length > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Lectures</label>
          <div className="flex flex-wrap gap-2">
            {availableLectures.map(l => (
              <button key={l} 
                onClick={() => {
                  const next = selectedLectures.includes(l) ? selectedLectures.filter(x => x !== l) : [...selectedLectures, l];
                  setSelectedLectures(next);
                  setSelectedTopics([]); 
                }}
                className={`px-3 py-1.5 text-xs rounded-xl border-2 font-bold transition-all ${selectedLectures.includes(l) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-50 text-gray-500 hover:border-indigo-100'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Sub-Topics */}
        <div className="space-y-2 border-l border-gray-100 md:pl-8">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            3. Sub-Topics
          </label>
          
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {selectedLectures.length > 0 ? (
              // Show topics normally when a lecture is selected
              availableTopics.length > 0 ? (
                availableTopics.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                    className={`px-3 py-1.5 text-xs rounded-xl border-2 font-bold transition-all ${
                      selectedTopics.includes(t) 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                        : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-100'
                    }`}
                  >
                    {t}
                  </button>
                ))
              ) : (
                <p className="text-[11px] text-gray-400 italic py-1 leading-relaxed">
                  No specific topics found for these lectures.
                </p>
              )
            ) : (
              // The "Locked" state prompt
              <p className="text-[11px] text-gray-400/80 font-medium italic py-1 leading-relaxed">
                Select a lecture to see specific topics...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. REFINE & CONTENT AREA */}
      {selectedLectures.length > 0 ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          <div className="flex justify-between items-end px-4">
            <div>
              <h2 className="text-xl font-black text-gray-800">Refine Results</h2>
              <p className="text-xs text-gray-400 font-medium">Viewing {displayCards.length} cards</p>
            </div>
            <button onClick={resetFilters} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Clear Filters
            </button>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <input type="text" placeholder="Search questions or topics..." className="w-full pl-10 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <svg className="absolute left-3.5 top-4 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
                {['What', 'How', 'Why'].map(cat => (
                  <button key={cat} onClick={() => setActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${activeCategories.includes(cat) ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 bg-gray-50 px-5 py-2 rounded-2xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min Imp</span>
                <input type="range" min="1" max="5" value={minImportance} onChange={(e) => setMinImportance(parseInt(e.target.value))} className="w-20 accent-indigo-600" />
                <span className="text-xs font-black text-indigo-600">{minImportance}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-gray-300 animate-pulse">Fetching Cards...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCards.map(card => (
                <FlashcardItem key={card.id} card={card} isFlipped={flippedId === card.id} onFlip={() => setFlippedId(flippedId === card.id ? null : card.id)} />
              ))}
            </div>
          )}

          {displayCards.length === 0 && !loading && (
            <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No matching cards found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-inner">
          <p className="text-gray-400 text-sm font-medium">Select one or more lectures to begin.</p>
        </div>
      )}
    </div>
  );
}

function FlashcardItem({ card, isFlipped, onFlip }: { card: Flashcard, isFlipped: boolean, onFlip: () => void }) {
  return (
    <div onClick={onFlip} className="h-72 cursor-pointer perspective-1000 group">
      <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* FRONT */}
        <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center border-b-[8px] border-b-gray-200 group-hover:border-indigo-100 transition-colors overflow-hidden">
          
          {/* TOP SECTION: Sub-Topics */}
          <div className="absolute top-6 flex flex-col items-center gap-2 px-6 w-full">
            <span className="text-[7px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">{card.lecture}</span>
            <div className="flex flex-wrap justify-center gap-1 max-h-12 overflow-y-auto no-scrollbar">
              {card.topics.map(t => (
                <span key={t} className="text-[8px] bg-gray-50 text-gray-400 font-black uppercase px-2 py-0.5 rounded border border-gray-100 tracking-tight">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* MIDDLE SECTION: The Question */}
          <p className="text-xl font-bold text-gray-800 leading-snug px-2 mt-4">
            {card.question}
          </p>

          {/* BOTTOM SECTION: Metadata Chips */}
          <div className="absolute bottom-6 flex items-center gap-1.5">
            <span className="text-[7px] bg-gray-50 text-gray-400 font-black uppercase px-2 py-0.5 rounded border border-gray-100 tracking-tight">
              {card.category}
            </span>
            <span className="text-[7px] bg-gray-50 text-gray-400 font-black uppercase px-2 py-0.5 rounded border border-gray-100 tracking-tight">
              Imp {card.importance}
            </span>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 text-white border-2 border-indigo-700 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center border-b-[8px] border-b-indigo-800 shadow-2xl shadow-indigo-200">
          <p className="text-lg leading-relaxed font-medium">{card.answer}</p>
        </div>
      </div>
    </div>
  );
}