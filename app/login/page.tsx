"use client";
import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
        <h1 className="text-2xl font-black mb-6">Admin Access</h1>
        <div className="space-y-4">
          <input type="email" placeholder="Email" 
            className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
            value={email} onChange={e => setEmail(e.target.value)} 
          />
          <input type="password" placeholder="Password" 
            className="w-full p-4 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
            value={password} onChange={e => setPassword(e.target.value)} 
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Login</button>
        </div>
      </form>
    </div>
  );
}