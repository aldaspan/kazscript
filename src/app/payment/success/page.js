'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.push('/'), 5000);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F2347] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-3">Төлем сәтті өтті!</h1>
        <p className="text-[#C9A84C] mb-2">KazScript Premium аккаунтыңыз белсендірілді.</p>
        <p className="text-[#4a6fa5] text-sm">5 секундтан кейін басты бетке өтесіз...</p>
        
        <a  href="/"
          className="inline-block mt-6 text-xs text-[#C9A84C] border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F2347] px-6 py-2 rounded-full transition-colors"
        >
          Басты бетке өту
        </a>
      </div>
    </div>
  );
}