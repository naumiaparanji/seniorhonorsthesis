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
      if (selectedTopics.length) query = query.overlaps('topics', selectedTopics);
      const { data } = await query;
      setCards(data || []);
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
              <div className="absolute inset-0 backface-hidden bg-white border-2 border-gray-100 rounded-[2rem] flex flex-col items-center justify-center p-10 text-center border-b-[6px] border-b-gray-200">
                <span className="absolute top-6 text-[8px] font-black text-green-500 uppercase">{card.lecture}</span>
                <p className="text-lg font-bold">{card.question}</p>
              </div>
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-blue-600 text-white border-2 border-blue-700 rounded-[2rem] flex flex-col items-center justify-center p-10 text-center border-b-[6px] border-b-blue-800">
                <p className="text-md leading-relaxed">{card.answer}</p>
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