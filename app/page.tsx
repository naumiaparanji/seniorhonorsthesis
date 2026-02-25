"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import StudyView from '@/components/StudyView';
import CreatorView from '@/components/CreatorView';
import Link from 'next/link';

export default function FlashcardApp() {
  const [view, setView] = useState<'study' | 'create'>('study');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = !!session;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900 font-sans">
      <nav className="flex items-center justify-between max-w-6xl mx-auto mb-8">
        <div className="flex gap-4">
          <button onClick={() => setView('study')} className={`px-6 py-2 rounded-full font-bold transition ${view === 'study' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-gray-500'}`}>Study</button>
          <button onClick={() => setView('create')} className={`px-6 py-2 rounded-full font-bold transition ${view === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-gray-500'}`}>Creator</button>
        </div>

        {isAdmin ? (
          <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold text-red-400 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-50">Admin Logout</button>
        ) : (
          <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-blue-600">Admin Login</Link>
        )}
      </nav>

      <main>
        {view === 'study' ? <StudyView /> : <CreatorView isAdmin={isAdmin} onSaveSuccess={() => setView('study')} />}
      </main>
    </div>
  );
}