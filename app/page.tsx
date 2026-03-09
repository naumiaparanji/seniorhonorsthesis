"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import StudyView from '@/components/StudyView';
import CreatorViewAdmin from '@/components/CreatorViewAdmin';
import CreatorViewStudent from '@/components/CreatorViewStudent';
import Link from 'next/link';
import Image from 'next/image';

export default function FlashcardApp() {
  const [view, setView] = useState<'study' | 'create'>('study');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = !!session;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-8 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="ui-card flex h-10 w-10 items-center justify-center overflow-hidden">
              <Image src="/flashcardslogo.png" alt="Flashcards logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Flashcards</div>
              <div className="text-xs ui-muted">Study • Create • Review</div>
            </div>
          </div>

          {/* View toggle */}
          <div className="ui-card flex items-center gap-2 p-1">
            <button
              onClick={() => setView("study")}
              className={`ui-btn ui-ring-accent px-4 py-2 text-sm ${
                view === "study"
                  ? "bg-[#111111] text-white"
                  : "bg-transparent text-[var(--muted)] hover:opacity-80"
              }`}
            >
              Study
            </button>
            <button
              onClick={() => setView("create")}
              className={`ui-btn ui-ring-accent px-4 py-2 text-sm ${
                view === "create"
                  ? "bg-[#111111] text-white"
                  : "bg-transparent text-[var(--muted)] hover:opacity-80"
              }`}
            >
              Create
            </button>
          </div>

          {/* Auth action */}
          <div>
            {isAdmin ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className="ui-btn ui-ring-accent ui-btn-primary text-xs"
                title="Sign out admin session"
              >
                Admin Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="ui-btn ui-ring-accent ui-btn-primary text-xs inline-flex items-center"
              >
                Admin Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Page body */}
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {/* Content surface */}
        <section className="ui-card p-4 sm:p-6">
          {view === "study" ? (
            <StudyView />
          ) : isAdmin ? (
            <CreatorViewAdmin onSaveSuccess={() => setView("study")} />
          ) : (
            <CreatorViewStudent />
          )}
        </section>
      </main>
    </div>
  );
}