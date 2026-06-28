'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DictionaryPage() {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetchPairs();
  }, [page, search]);

  async function fetchPairs() {
    setLoading(true);

    let query = supabase
      .from('word_pairs')
      .select('*', { count: 'exact' })
      .order('usage_count', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search) {
      query = query.or(`cyrillic.ilike.%${search}%,arabic.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (!error) {
      setPairs(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0F2347]">

      {/* Header */}
      <header className="w-full bg-[#0F2347] border-b border-[#1B3A6B] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/">
              <img src="/logo.svg" alt="KazScript" className="w-10 h-10" />
            </a>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">KazScript</h1>
              <p className="text-[#C9A84C] text-xs tracking-widest uppercase">Сөздік қоры</p>
            </div>
          </div>
          
          <a  href="/"
            className="text-xs text-[#C9A84C] border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F2347] px-4 py-1.5 rounded-full transition-colors"
          >
            ← Конвертерге
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Статистика */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">
            Сөздік қоры
            <span className="text-[#C9A84C] text-sm font-normal ml-3">
              {total.toLocaleString()} жұп
            </span>
          </h2>
        </div>

        {/* Іздеу */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Сөз іздеу..."
            className="w-full bg-[#1B3A6B] text-white placeholder-[#4a6fa5] border border-[#2a4f8a] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
        </div>

        {/* Кесте */}
        {loading ? (
          <div className="text-center text-[#4a6fa5] py-12">Жүктелуде...</div>
        ) : (
          <>
            <div className="border border-[#1B3A6B] rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 bg-[#1B3A6B] px-4 py-3">
                <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium">Кириллица</span>
                <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium text-right">Төте жазу</span>
              </div>
              {pairs.length === 0 ? (
                <div className="text-center text-[#4a6fa5] py-8">Сөз табылмады</div>
              ) : (
                pairs.map((pair, i) => (
                  <div
                    key={pair.id}
                    className={`grid grid-cols-2 px-4 py-3 border-t border-[#1B3A6B] ${i % 2 === 0 ? 'bg-[#0F2347]' : 'bg-[#1B3A6B]/30'}`}
                  >
                    <span className="text-white text-sm">{pair.cyrillic}</span>
                    <span className="text-white text-sm text-right" style={{ fontFamily: 'AlkatipBasma', fontSize: '16px' }}>
                      {pair.arabic}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Беттеу */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-xs text-[#C9A84C] border border-[#C9A84C] px-4 py-2 rounded-full disabled:opacity-30 hover:bg-[#C9A84C] hover:text-[#0F2347] transition-colors"
              >
                ← Алдыңғы
              </button>
              <span className="text-[#4a6fa5] text-xs">
                {page + 1} / {Math.ceil(total / PAGE_SIZE)} бет
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * PAGE_SIZE >= total}
                className="text-xs text-[#C9A84C] border border-[#C9A84C] px-4 py-2 rounded-full disabled:opacity-30 hover:bg-[#C9A84C] hover:text-[#0F2347] transition-colors"
              >
                Келесі →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}