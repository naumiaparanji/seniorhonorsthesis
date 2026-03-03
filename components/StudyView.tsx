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

  // 3. Fetch Topics based on Course + Lecture
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

  // 4. Fetch the actual Cards
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

  // 5. Apply Client-side Filters (Importance, Search, Category, Sub-topics)
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

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      
      {/* 1. WELCOME HERO */}
      <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50">
        <h1 className="text-3xl font-black mb-4">Welcome to Flashcards for VideoPoints</h1>
        <p className="text-indigo-100 leading-relaxed max-w-3xl opacity-90">
          Unlock knowledge from your favorite video transcripts. Currently supporting <span className="font-bold text-white underline decoration-indigo-400">COSC 1336 - Introduction to Python</span>. 
          Follow the steps below to curate your perfect study session.
        </p>
      </div>

      {/* 2. PROGRESSIVE SELECTION GRID */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[160px]">
        
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

        {/* Step 2: Lectures (Conditional) */}
        <div className={`space-y-2 border-l border-gray-100 md:pl-8 transition-all duration-500 ${selectedCourses.length > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">2. Lectures</label>
          {selectedCourses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableLectures.map(l => (
                <button key={l} onClick={() => { setSelectedLectures(selectedLectures.includes(l) ? [] : [l]); setSelectedTopics([]); }}
                  className={`px-3 py-1.5 text-xs rounded-xl border-2 font-bold transition-all ${selectedLectures.includes(l) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-50 text-gray-500 hover:border-indigo-100'}`}>
                  {l}
                </button>
              ))}
            </div>
          ) : <p className="text-[10px] text-gray-300 italic py-2">Select a course first...</p>}
        </div>

        {/* Step 3: Sub-Topics (Conditional) */}
        <div className={`space-y-2 border-l border-gray-100 md:pl-8 transition-all duration-500 ${selectedLectures.length > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Sub-Topics</label>
          {selectedLectures.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTopics.map(t => (
                <button key={t} onClick={() => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                  className={`px-3 py-1.5 text-xs rounded-xl border-2 font-bold transition-all ${selectedTopics.includes(t) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-50 text-gray-500 hover:border-indigo-100'}`}>
                  {t}
                </button>
              ))}
            </div>
          ) : <p className="text-[10px] text-gray-300 italic py-2">Select a lecture first...</p>}
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA (Locked until Lecture is selected) */}
      {selectedLectures.length > 0 ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* REFINE BAR */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <input type="text" placeholder="Search questions or topics..." className="w-full pl-10 pr-4 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <svg className="absolute left-3.5 top-4 text-gray-400" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="flex flex-wrap items-center gap-8">
              {/* Category Filters */}
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
                {['What', 'How', 'Why'].map(cat => (
                  <button key={cat} onClick={() => toggleCategory(cat)}
                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${activeCategories.includes(cat) ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Importance Slider */}
              <div className="flex items-center gap-4 bg-gray-50 px-5 py-2 rounded-2xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Imp score</span>
                <input type="range" min="1" max="5" value={minImportance} onChange={(e) => setMinImportance(parseInt(e.target.value))} className="w-20 accent-indigo-600" />
                <span className="text-xs font-black text-indigo-600">{minImportance}</span>
              </div>
            </div>
          </div>

          {/* GRID OF CARDS */}
          {loading ? (
            <div className="text-center py-20 font-bold text-gray-300">Loading cards...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayCards.map(card => (
                <FlashcardItem key={card.id} card={card} isFlipped={flippedId === card.id} onFlip={() => setFlippedId(flippedId === card.id ? null : card.id)} />
              ))}
            </div>
          )}

          {displayCards.length === 0 && !loading && (
            <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No cards match these specific filters</p>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center bg-white rounded-[3rem] border border-gray-100 shadow-inner">
          <div className="max-w-xs mx-auto space-y-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-300">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Please select a course and lecture to unlock the flashcard deck.</p>
          </div>
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
        <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center border-b-[8px] border-b-gray-200 group-hover:border-indigo-100 transition-colors">
          
          {/* TOP SECTION: Sub-Topics & Lecture */}
          <div className="absolute top-6 flex flex-col items-center gap-2 px-6">
            <span className="text-[7px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">{card.lecture}</span>
            <div className="flex flex-wrap justify-center gap-1">
              {card.topics.map(t => (
                <span key={t} className="text-[8px] bg-gray-50 text-gray-400 font-black uppercase px-2 py-0.5 rounded border border-gray-100 tracking-tight">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* MIDDLE SECTION: The Question */}
          <p className="text-xl font-bold text-gray-800 leading-snug px-2 mt-4">
            {card.question}
          </p>

          {/* BOTTOM SECTION: Category & Yield Score */}
          <div className="absolute bottom-6 flex items-center gap-1.5">
            <span className="text-[7px] bg-gray-50 text-gray-400 font-black uppercase px-2 py-0.5 rounded border border-gray-100 tracking-tight">
              {card.category}
            </span>
            
            {card.importance >= 1 && (
              <span className="text-[7px] bg-gray-50 text-gray-400 font-black uppercase px-2 py-0.5 rounded border border-gray-100 tracking-tight">
                Imp {card.importance}
              </span>
            )}
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 text-white border-2 border-indigo-700 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center border-b-[8px] border-b-indigo-800 shadow-2xl shadow-indigo-200">
          <p className="text-lg leading-relaxed font-medium">{card.answer}</p>
          <div className="absolute bottom-6 opacity-30">
          </div>
        </div>
      </div>
    </div>
  );
}