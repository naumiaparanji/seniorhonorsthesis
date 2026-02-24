"use client";

import { useState } from 'react';
import StudyView from '@/components/StudyView';
import CreatorView from '@/components/CreatorView';

export default function FlashcardApp() {
  const [view, setView] = useState<'study' | 'create'>('study');

  // Mock permission - you'll replace this with real Auth logic later
  const isAdmin = true; 

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900 font-sans">
      <nav className="flex gap-4 mb-8 justify-center">
        <button 
          onClick={() => setView('study')} 
          className={`px-6 py-2 rounded-full font-bold transition ${view === 'study' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-gray-500'}`}
        >
          Study Mode
        </button>
        
        {isAdmin && (
          <button 
            onClick={() => setView('create')} 
            className={`px-6 py-2 rounded-full font-bold transition ${view === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-gray-500'}`}
          >
            Creator Mode
          </button>
        )}
      </nav>

      <main>
        {view === 'study' ? <StudyView /> : <CreatorView onSaveSuccess={() => setView('study')} />}
      </main>
    </div>
  );
}