'use client';

import { useState, useEffect } from 'react';
import { cyrillicToTote, toteToCyrillic, countChars, savePair, lookupPair } from '@/lib/converter';
import { savePairToSupabase, lookupPairFromSupabase, supabase } from '@/lib/supabase';

const MAX_CHARS = 5000;

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState('cyr2tote');
  const [charCount, setCharCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function handleInput(e) {
    const val = e.target.value;
    if (countChars(val) > MAX_CHARS) return;
    setInputText(val);
    setCharCount(countChars(val));
  }

  async function handleConvert() {
    if (!inputText.trim()) return;

    if (direction === 'cyr2tote') {
      const words = inputText.trim().split(/\s+/);
      words.forEach(word => {
        const cyrWord = word.toLowerCase().replace(/[^а-яәіңғүұқөһ]/gi, '');
        if (cyrWord.length > 1) {
          const arabicWord = cyrillicToTote(cyrWord);
          savePair(cyrWord, arabicWord);
          savePairToSupabase(cyrWord, arabicWord);
        }
      });
      setOutputText(cyrillicToTote(inputText));

    } else {
      const words = inputText.trim().split(/\s+/);
      const converted = await Promise.all(
        words.map(async word => {
          const supabaseLookup = await lookupPairFromSupabase(word);
          if (supabaseLookup) return supabaseLookup;
          const localLookup = lookupPair(word);
          return localLookup || toteToCyrillic(word);
        })
      );

      let result = converted.join(' ').trimStart();
      result = result.charAt(0).toUpperCase() + result.slice(1);
      result = result.replace(/([.!?]\s+|\n)([а-яәіңғүұқөһ])/gu,
        (match, p1, p2) => p1 + p2.toUpperCase()
      );
      setOutputText(result);
    }
  }

  function handleSwap() {
    const newDir = direction === 'cyr2tote' ? 'tote2cyr' : 'cyr2tote';
    setDirection(newDir);
    setInputText(outputText);
    setOutputText('');
    setCharCount(countChars(outputText));
  }

  const isCyr2Tote = direction === 'cyr2tote';

  return (
    <main className="min-h-screen bg-[#0F2347] flex flex-col items-center justify-center px-4 py-12">

      {/* Тақырып */}
      <div className="mb-10 text-center flex flex-col items-center">
        <img
          src="/logo.svg"
          alt="KazScript логотипі"
          className="w-20 h-20 mb-4"
        />
        <h1 className="text-4xl font-bold text-white tracking-wide">KazScript</h1>
        <p className="text-[#C9A84C] mt-2 text-sm tracking-widest uppercase">
          Қазақ жазу жүйелері түрлендіргіші
        </p>
        <div className="mt-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-[#C9A84C] text-sm">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-white border border-[#2a4f8a] hover:border-[#C9A84C] 
                           px-3 py-1.5 rounded-full transition-colors"
              >
                Шығу
              </button>
            </div>
          ) : (
            <a
              href="/auth"
              className="text-xs text-[#C9A84C] border border-[#C9A84C] hover:bg-[#C9A84C] 
                         hover:text-[#0F2347] px-4 py-1.5 rounded-full transition-colors"
            >
              Кіру / Тіркелу
            </a>
          )}
        </div>
      </div>

      {/* Бағыт таңдау */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-white font-medium text-sm">
          {isCyr2Tote ? 'Кириллица' : 'Төте жазу'}
        </span>
        <button
          onClick={handleSwap}
          className="bg-[#1B3A6B] hover:bg-[#C9A84C] text-white hover:text-[#0F2347] 
                     border border-[#C9A84C] rounded-full px-4 py-1.5 text-sm 
                     transition-all duration-200 font-medium"
        >
          ⇄ Ауыстыру
        </button>
        <span className="text-white font-medium text-sm">
          {isCyr2Tote ? 'Төте жазу' : 'Кириллица'}
        </span>
      </div>

      {/* Textarea аймағы */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Кіріс */}
        <div className="flex flex-col">
          <label className="text-[#C9A84C] text-xs uppercase tracking-widest mb-2 font-medium">
            {isCyr2Tote ? 'Кириллица' : 'Төте жазу'}
          </label>
          <textarea
            value={inputText}
            onChange={handleInput}
            placeholder={isCyr2Tote ? 'Қазақша мәтін енгізіңіз...' : 'Төте жазу мәтінін енгізіңіз...'}
            className="w-full h-56 bg-[#1B3A6B] text-white placeholder-[#4a6fa5] 
                       border border-[#2a4f8a] rounded-xl p-4 resize-none 
                       focus:outline-none focus:border-[#C9A84C] transition-colors
                       text-base leading-relaxed"
            dir={isCyr2Tote ? 'ltr' : 'rtl'}
            style={!isCyr2Tote ? { fontFamily: 'AlkatipBasma', fontSize: '20px' } : {}}
          />
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${charCount > MAX_CHARS * 0.9 ? 'text-red-400' : 'text-[#4a6fa5]'}`}>
              {charCount} / {MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Шығыс */}
        <div className="flex flex-col">
          <label className="text-[#C9A84C] text-xs uppercase tracking-widest mb-2 font-medium">
            {isCyr2Tote ? 'Төте жазу' : 'Кириллица'}
          </label>
          <textarea
            value={outputText}
            readOnly
            placeholder={isCyr2Tote ? '...нәтиже осында шығады' : 'Нәтиже осында шығады...'}
            className="w-full h-56 bg-[#1B3A6B] text-white placeholder-[#4a6fa5] 
                       border border-[#2a4f8a] rounded-xl p-4 resize-none 
                       focus:outline-none focus:border-[#C9A84C] transition-colors
                       text-base leading-relaxed"
            dir={isCyr2Tote ? 'rtl' : 'ltr'}
            style={isCyr2Tote ? { fontFamily: 'AlkatipBasma', fontSize: '20px' } : {}}
          />
          <div className="flex justify-end mt-2">
            {outputText && (
              <button
                onClick={() => navigator.clipboard.writeText(outputText)}
                className="text-xs text-[#C9A84C] hover:text-white transition-colors"
              >
                📋 Көшіру
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Түрлендіру батырмасы */}
      <button
        onClick={handleConvert}
        className="mt-6 bg-[#C9A84C] hover:bg-[#e0bc5e] text-[#0F2347] 
                   font-bold px-10 py-3 rounded-full text-base 
                   transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Түрлендіру
      </button>

    </main>
  );
}