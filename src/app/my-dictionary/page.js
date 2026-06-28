'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getPersonalDictionary, addToPersonalDictionary, deleteFromPersonalDictionary } from '@/lib/supabase';

export default function MyDictionaryPage() {
  const [user, setUser] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cyrillic, setCyrillic] = useState('');
  const [arabic, setArabic] = useState('');
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchPairs();
  }, [user]);

  async function fetchPairs() {
    setLoading(true);
    const data = await getPersonalDictionary(user.id);
    setPairs(data);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!cyrillic.trim() || !arabic.trim()) return;
    setAdding(true);
    await addToPersonalDictionary(user.id, cyrillic.trim(), arabic.trim(), note.trim());
    setCyrillic('');
    setArabic('');
    setNote('');
    await fetchPairs();
    setAdding(false);
  }

  async function handleDelete(id) {
    await deleteFromPersonalDictionary(user.id, id);
    setPairs(pairs.filter(p => p.id !== id));
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
              <p className="text-[#C9A84C] text-xs tracking-widest uppercase">Жеке сөздік</p>
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

        {!user ? (
          <div className="text-center py-16">
            <p className="text-white mb-4">Жеке сөздікті пайдалану үшін кіру керек</p>
            
            <a  href="/auth"
              className="text-[#C9A84C] border border-[#C9A84C] px-6 py-2 rounded-full hover:bg-[#C9A84C] hover:text-[#0F2347] transition-colors"
            >
              Кіру / Тіркелу
            </a>
          </div>
        ) : (
          <>
            {/* Жаңа жұп қосу */}
            <div className="bg-[#1B3A6B] rounded-xl p-6 mb-8 border border-[#2a4f8a]">
              <h2 className="text-[#C9A84C] text-xs uppercase tracking-widest mb-4 font-medium">
                Жаңа сөз қосу
              </h2>
              <form onSubmit={handleAdd}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={cyrillic}
                    onChange={e => setCyrillic(e.target.value)}
                    placeholder="Кириллица..."
                    className="bg-[#0F2347] text-white placeholder-[#4a6fa5] border border-[#2a4f8a] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                  />
                  <input
                    type="text"
                    value={arabic}
                    onChange={e => setArabic(e.target.value)}
                    placeholder="Төте жазу..."
                    className="bg-[#0F2347] text-white placeholder-[#4a6fa5] border border-[#2a4f8a] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm text-right"
                    dir="rtl"
                    style={{ fontFamily: 'AlkatipBasma', fontSize: '16px' }}
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Ескертпе (міндетті емес)..."
                    className="flex-1 bg-[#0F2347] text-white placeholder-[#4a6fa5] border border-[#2a4f8a] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C9A84C] transition-colors text-sm"
                  />
                  <button
                    type="submit"
                    disabled={adding || !cyrillic.trim() || !arabic.trim()}
                    className="bg-[#C9A84C] hover:bg-[#e0bc5e] disabled:opacity-50 text-[#0F2347] font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {adding ? '...' : '+ Қосу'}
                  </button>
                </div>
              </form>
            </div>

            {/* Жеке сөздік тізімі */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">
                Менің сөздігім
                <span className="text-[#C9A84C] text-sm font-normal ml-3">
                  {pairs.length} сөз
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="text-center text-[#4a6fa5] py-12">Жүктелуде...</div>
            ) : pairs.length === 0 ? (
              <div className="text-center text-[#4a6fa5] py-12">
                Әлі сөз қосылмаған
              </div>
            ) : (
              <div className="border border-[#1B3A6B] rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 bg-[#1B3A6B] px-4 py-3">
                  <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium col-span-2">Кириллица</span>
                  <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium col-span-2 text-right">Төте жазу</span>
                  <span></span>
                </div>
                {pairs.map((pair, i) => (
                  <div
                    key={pair.id}
                    className={`grid grid-cols-5 px-4 py-3 border-t border-[#1B3A6B] items-center ${i % 2 === 0 ? 'bg-[#0F2347]' : 'bg-[#1B3A6B]/30'}`}
                  >
                    <div className="col-span-2">
                      <span className="text-white text-sm">{pair.cyrillic}</span>
                      {pair.note && <p className="text-[#4a6fa5] text-xs mt-0.5">{pair.note}</p>}
                    </div>
                    <span className="text-white text-sm col-span-2 text-right" style={{ fontFamily: 'AlkatipBasma', fontSize: '16px' }}>
                      {pair.arabic}
                    </span>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(pair.id)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}