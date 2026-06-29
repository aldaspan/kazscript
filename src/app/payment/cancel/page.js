'use client';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-[#0F2347] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-6">😔</div>
        <h1 className="text-2xl font-bold text-white mb-3">Төлем тоқтатылды</h1>
        <p className="text-[#4a6fa5] mb-6">Төлем жасалмады. Кез келген уақытта қайта көріңіз.</p>
        
        <a  href="/"
          className="inline-block text-xs text-[#C9A84C] border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F2347] px-6 py-2 rounded-full transition-colors"
        >
          Басты бетке өту
        </a>
      </div>
    </div>
  );
}