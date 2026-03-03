"use client";
import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      
      {/* THE BACK LINK */}
      <Link 
        href="/" 
        className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-all group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> 
        Back to Student View
      </Link>

      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 w-full max-w-md">
        <h1 className="text-2xl font-black mb-2 text-gray-800">Admin Access</h1>
        <p className="text-gray-400 text-sm mb-8">Secure login for card management.</p>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all mt-2"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}