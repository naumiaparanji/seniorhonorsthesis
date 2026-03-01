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
  const [cards, setCards] = useState<Flashcard[]>([]);

  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [availableLectures, setAvailableLectures] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  const [selectedCourses, setSelectedCourses] = useState<string[]>(['COSC1336']); 
  const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('flashcards').select('course');
      setAvailableCourses(Array.from(new Set(data?.map(i => i.course))).filter(Boolean) as string[]);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchLectures = async () => {
      if (!selectedCourses.length) return;
      const { data } = await supabase.from('flashcards').select('lecture').in('course', selectedCourses);
      setAvailableLectures(Array.from(new Set(data?.map(i => i.lecture))).filter(Boolean) as string[]);
    };
    fetchLectures();
  }, [selectedCourses]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedCourses.length) return;
      let query = supabase.from('flashcards').select('topics').in('course', selectedCourses);
      if (selectedLectures.length) query = query.in('lecture', selectedLectures);
      const { data } = await query;
      const flattened = data?.flatMap(i => i.topics) || [];
      setAvailableTopics(Array.from(new Set(flattened)).filter(Boolean) as string[]);
    };
    fetchTopics();
  }, [selectedCourses, selectedLectures]);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      let query = supabase.from('flashcards').select('*');
      
      if (selectedCourses.length) query = query.in('course', selectedCourses);
      if (selectedLectures.length) query = query.in('lecture', selectedLectures);
      
      // We fetch all cards for the lecture, then filter/sort in JS for the "Intersection" logic
      const { data } = await query;
      
      if (data) {
        const sorted = [...data].sort((a, b) => {
          // 1. Primary Sort: Category (What -> How -> Why)
          const catOrder: Record<string, number> = { 'What': 0, 'How': 1, 'Why': 2 };
          if (catOrder[a.category] !== catOrder[b.category]) {
            return catOrder[a.category] - catOrder[b.category];
          }

          // 2. Secondary Sort: Intersection Depth (Match Count)
          // Count how many of the student's selected topics are in this card
          const aMatches = a.topics.filter((t: string) => selectedTopics.includes(t)).length;
          const bMatches = b.topics.filter((t: string) => selectedTopics.includes(t)).length;
          
          if (aMatches !== bMatches) {
            return bMatches - aMatches; // Higher matches first
          }

          // 3. Tertiary Sort: Importance (Tie-breaker)
          return (b.importance || 0) - (a.importance || 0);
        });

        // If user selected specific topics, we only show cards that have AT LEAST one match
        // OR show all if no topics are selected.
        const filtered = selectedTopics.length > 0 
          ? sorted.filter(card => card.topics.some((t: string) => selectedTopics.includes(t)))
          : sorted;

        setCards(filtered);
      }
      setLoading(false);
    };
    fetchCards();
  }, [selectedCourses, selectedLectures, selectedTopics]);

  const toggle = (item: string, current: string[], setter: Function) => {
    setter(current.includes(item) ? current.filter(i => i !== item) : [...current, item]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FilterGroup 
          label="1. Course" items={availableCourses} selected={selectedCourses} 
          onToggle={(i:any) => {
              toggle(i, selectedCourses, setSelectedCourses);
              setSelectedLectures([]); // Reset lectures when course changes
              setSelectedTopics([]);   // Reset topics when course changes
          }} 
        />
        <FilterGroup label="2. Lectures" items={availableLectures} selected={selectedLectures} 
          onToggle={(i:any) => {
              toggle(i, selectedLectures, setSelectedLectures);
              setSelectedTopics([]); // Reset topics when lecture changes
          }} 
          border 
        />
        <div className={`space-y-2 border-l md:pl-8 border-gray-100`}>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">3. Topics</label>
          <div className="flex flex-wrap gap-2">
            {selectedLectures.length === 0 ? (
              <p className="text-[11px] text-gray-300 italic py-1 leading-relaxed">
                Please select a lecture to see specific topics...
              </p>
            ) : availableTopics.length === 0 ? (
              <p className="text-[11px] text-gray-300 italic py-1">No topics found for this lecture.</p>
            ) : (
              availableTopics.map((item: string) => (
                <button 
                  key={item} 
                  onClick={() => toggle(item, selectedTopics, setSelectedTopics)} 
                  className={`px-3 py-1 text-xs rounded-lg border-2 transition-all ${selectedTopics.includes(item) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-600'}`}
                >
                  {item}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cards.map(card => (
        <div key={card.id} onClick={() => setFlippedId(flippedId === card.id ? null : card.id)} className="h-64 cursor-pointer perspective-1000">
          <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${flippedId === card.id ? 'rotate-y-180' : ''}`}>
            
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-100 rounded-[2rem] flex flex-col items-center justify-center p-10 text-center border-b-[6px] border-b-gray-200">
              
              {/* --- ADD THIS BADGE SECTION --- */}
              <div className="absolute top-6 flex flex-col items-center gap-1">
                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">{card.lecture}</span>
                <div className="flex gap-1">
                  <span className={`text-[7px] font-bold px-2 py-0.5 rounded border ${
                    card.category === 'What' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                    card.category === 'How' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                    'bg-purple-50 border-purple-200 text-purple-600'
                  }`}>
                    {card.category}
                  </span>
                  {card.importance >= 4 && (
                    <span className="text-[7px] font-bold px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 rounded">
                      High Yield
                    </span>
                  )}
                </div>
              </div>
              {/* ------------------------------ */}

              <p className="text-lg font-bold mt-6">{card.question}</p>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-blue-600 text-white border-2 border-blue-700 rounded-[2rem] flex flex-col items-center justify-center p-10 text-center border-b-[6px] border-b-blue-800">
              <p className="text-md leading-relaxed">{card.answer}</p>
              {/* Optional: Show topics on the back */}
              <div className="absolute bottom-6 flex gap-1 flex-wrap justify-center">
                {card.topics.map(t => (
                    <span key={t} className="text-[7px] bg-blue-500 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}

function FilterGroup({ label, items, selected, onToggle, border }: any) {
  return (
    <div className={`space-y-2 ${border ? 'border-l md:pl-8 border-gray-100' : ''}`}>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-2">
        {items.map((item: string) => (
          <button key={item} onClick={() => onToggle(item)} className={`px-3 py-1 text-xs rounded-lg border-2 transition-all ${selected.includes(item) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-600'}`}>{item}</button>
        ))}
      </div>
    </div>
  );
}