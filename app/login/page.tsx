"use client";
import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] p-6">

      {/* Back Link */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-black transition group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        Back to Student View
      </Link>

      <form
        onSubmit={handleLogin}
        className="ui-card w-full max-w-md p-10 space-y-6"
      >
        <div>
          <h1 className="text-2xl font-semibold">Admin Access</h1>
          <p className="ui-muted text-sm mt-1">
            Secure login for flashcard management
          </p>
        </div>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="ui-btn ui-btn-primary w-full py-3 text-sm"
          >
            Login
          </button>

        </div>
      </form>
    </div>
  );
}