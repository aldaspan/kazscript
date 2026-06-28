'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { cyrillicToTote, toteToCyrillic, countChars, savePair, lookupPair } from '@/lib/converter';
import { savePairToSupabase, savePairsBatch, lookupPairFromSupabase, saveConversionHistory, supabase } from '@/lib/supabase';

const GUEST_MAX_CHARS = 5000;
const FREE_MAX_CHARS = 10000;

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState('cyr2tote');
  const [charCount, setCharCount] = useState(0);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('free');
  const [isConverting, setIsConverting] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [charWarning, setCharWarning] = useState('');
  const [fileResult, setFileResult] = useState('');
  const [docxStatus, setDocxStatus] = useState('');
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const debounceRef = useRef(null);

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
    if (user) {
      supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setUserPlan(data.plan);
        });
    }
  }, [user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function autoResize(ref) {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }

  // Шығыс textarea биіктігін кіріс textarea-мен тізгіндеу
  useEffect(() => {
    setTimeout(() => {
      if (outputRef.current && inputRef.current) {
        outputRef.current.style.height = inputRef.current.style.height || '12rem';
      }
    }, 100);
  }, [outputText, inputText]);

  async function performConvert(text, dir) {
      console.log('performConvert басталды');

    if (!text.trim()) {
      setOutputText('');
      return;
    }

    if (dir === 'cyr2tote') {
      const words = text.trim().split(/\s+/);
      const pairs = [];
      words.forEach(word => {
        const cyrWord = word.toLowerCase().replace(/[^а-яәіңғүұқөһ]/gi, '');
        if (cyrWord.length > 1) {
          const arabicWord = cyrillicToTote(cyrWord);
          savePair(cyrWord, arabicWord);
          pairs.push({ cyrillic: cyrWord, arabic: arabicWord });
        }
      });
      savePairsBatch(pairs);
      const result = cyrillicToTote(text);
      setOutputText(result);
      saveConversionHistory(user?.id, text, result, 'cyr2tote');
    } else {
      const words = text.trim().split(/\s+/);
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
      saveConversionHistory(user?.id, text, result, 'tote2cyr');
    }

    setTimeout(() => autoResize(outputRef), 50);
  }

  const debouncedConvert = useCallback((text, dir) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performConvert(text, dir);
    }, 500);
  }, [performConvert]);

function handleInput(e) {
  const val = e.target.value;
  const maxChars = user ? FREE_MAX_CHARS : GUEST_MAX_CHARS;

  if (countChars(val) > maxChars) {
    let cut = '';
    let count = 0;
    for (const char of val) {
      if (/\S/.test(char)) count++;
      if (count > maxChars) break;
      cut += char;
    }
    setInputText(cut);
    setCharCount(maxChars);
    setCharWarning(`Мәтіндегі таңбалар саны ${maxChars.toLocaleString()}-нан асып кетті, қалған бөлігі кесілді.`);
    setTimeout(() => setCharWarning(''), 4000);
    autoResize(inputRef);
    return;
  }

  setInputText(val);
  setCharCount(countChars(val));
  setCharWarning('');
  autoResize(inputRef);
}

async function handleConvert() {
  if (!inputText.trim()) return;
  setIsConverting(true);
  await new Promise(resolve => setTimeout(resolve, 50));
  await performConvert(inputText, direction);
  setIsConverting(false);
}

  function handleSwap() {
    const newDir = direction === 'cyr2tote' ? 'tote2cyr' : 'cyr2tote';
    setDirection(newDir);
    setInputText(outputText);
    setOutputText('');
    setCharCount(countChars(outputText));
    setTimeout(() => autoResize(inputRef), 50);
    debouncedConvert(outputText, newDir);
  }

  async function handleCopy() {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopyStatus('Көшірілді!');
    setTimeout(() => setCopyStatus(''), 2000);
  }

  async function handleFileConvert(e) {
    const file = e.target.files[0];
    if (!file) return;
    const MAX_FILE_SIZE = 500 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert('Файл көлемі 500 KB-тан аспауы керек!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      let result;
      if (direction === 'cyr2tote') {
        const words = text.trim().split(/\s+/);
        const pairs = [];
        words.forEach(word => {
          const cyrWord = word.toLowerCase().replace(/[^а-яәіңғүұқөһ]/gi, '');
          if (cyrWord.length > 1) {
            const arabicWord = cyrillicToTote(cyrWord);
            pairs.push({ cyrillic: cyrWord, arabic: arabicWord });
          }
        });
        savePairsBatch(pairs);
        result = cyrillicToTote(text);
      } else {
        result = toteToCyrillic(text);
        result = result.trimStart();
        result = result.charAt(0).toUpperCase() + result.slice(1);
        result = result.replace(/([.!?]\s+|\n)([а-яәіңғүұқөһ])/gu,
          (match, p1, p2) => p1 + p2.toUpperCase()
        );
      }
      setFileResult(result);
    };
    reader.readAsText(file, 'UTF-8');
  }

  async function handleDocxConvert(e) {
    const file = e.target.files[0];
    if (!file) return;
    const MAX_DOCX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_DOCX_SIZE) {
      alert('Файл көлемі 10 MB-тан аспауы керек!');
      return;
    }
    setDocxStatus('Түрлендірілуде...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`http://localhost:8000/convert/docx?direction=${direction}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        alert(err.detail);
        setDocxStatus('');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.docx';
      a.click();
      URL.revokeObjectURL(url);
      setDocxStatus('Файл сәтті түрлендірілді!');
    } catch (error) {
      alert('Сервермен байланыс жоқ');
      setDocxStatus('');
    }
  }

  const isCyr2Tote = direction === 'cyr2tote';
  const maxChars = user ? FREE_MAX_CHARS : GUEST_MAX_CHARS;

  return (
    <div className="min-h-screen bg-[#0F2347] flex flex-col">

      {/* HEADER */}
      <header className="w-full bg-[#0F2347] border-b border-[#1B3A6B] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="KazScript" className="w-10 h-10" />
            <div>
              <h1 className="text-white font-bold text-lg leading-none">KazScript</h1>
              <p className="text-[#C9A84C] text-xs tracking-widest uppercase">Жазу мұрасы</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
            <a 
            href="/dictionary"
              className="text-xs text-white hover:text-[#C9A84C] transition-colors hidden sm:block"
            >
              Сөздік
            </a>
            {user && (
              
              <a href="/my-dictionary"
                className="text-xs text-white hover:text-[#C9A84C] transition-colors hidden sm:block"
              >
                Менің сөздігім
              </a>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[#C9A84C] text-xs hidden sm:block">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-white border border-[#2a4f8a] hover:border-[#C9A84C] px-3 py-1.5 rounded-full transition-colors"
                >
                  Шығу
                </button>
              </div>
            ) : (
              <a
                href="/auth"
                className="text-xs text-[#C9A84C] border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F2347] px-4 py-1.5 rounded-full transition-colors"
              >
                Кіру / Тіркелу
              </a>
            )}
          </div>

          
        </div>
      </header>

      {/* НЕГІЗГІ МАЗМҰН */}
      <main className="flex-1 flex flex-col items-center px-4 py-8">

      {/* Бағыт таңдау */}
      <div className="flex items-center gap-4 w-full max-w-5xl mb-4">
        <span className="text-white font-medium text-sm">
          {isCyr2Tote ? 'Кириллица' : 'Төте жазу'}
        </span>
        <button
          onClick={handleSwap}
          className="bg-[#1B3A6B] hover:bg-[#C9A84C] text-white hover:text-[#0F2347] border border-[#C9A84C] rounded-full px-4 py-1.5 text-sm transition-all duration-200 font-medium"
        >
          ⇄ Ауыстыру
        </button>
        <span className="text-white font-medium text-sm">
          {isCyr2Tote ? 'Төте жазу' : 'Кириллица'}
        </span>
      </div>

      {/* Түрлендіру батырмасы — sticky */}
      <div className="sticky top-0 z-10 w-full bg-[#0F2347] border-b border-[#1B3A6B] py-3 flex justify-center mb-4">
        <button
          onClick={handleConvert}
          disabled={isConverting || !inputText.trim()}
          className="bg-[#C9A84C] hover:bg-[#e0bc5e] disabled:opacity-50 text-[#0F2347] font-bold px-10 py-2.5 rounded-full text-sm transition-all duration-200 shadow-lg flex items-center gap-2"
        >
          {isConverting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Түрлендірілуде...
            </>
          ) : (
            'Түрлендіру'
          )}
        </button>
      </div>


        

        {/* Textarea аймағы */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Кіріс */}
          <div className="flex flex-col">
            <label className="text-[#C9A84C] text-xs uppercase tracking-widest mb-2 font-medium">
              {isCyr2Tote ? 'Кириллица' : 'Төте жазу'}
            </label>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleInput}
              placeholder={isCyr2Tote ? 'Қазақша мәтін енгізіңіз...' : 'Төте жазу мәтінін енгізіңіз...'}
              className="w-full min-h-48 max-h-96 bg-[#1B3A6B] text-white placeholder-[#4a6fa5] border border-[#2a4f8a] rounded-xl p-4 resize-none overflow-y-auto focus:outline-none focus:border-[#C9A84C] transition-colors text-base leading-relaxed"              dir={isCyr2Tote ? 'ltr' : 'rtl'}
              style={!isCyr2Tote ? { fontFamily: 'AlkatipBasma', fontSize: '20px' } : {}}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-red-400">{charWarning}</span>
              <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-red-400' : 'text-[#4a6fa5]'}`}>
                {charCount.toLocaleString()} / {maxChars.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Шығыс */}
          <div className="flex flex-col">
            <label className="text-[#C9A84C] text-xs uppercase tracking-widest mb-2 font-medium">
              {isCyr2Tote ? 'Төте жазу' : 'Кириллица'}
            </label>
          <textarea
            ref={outputRef}
            value={outputText}
            readOnly
            placeholder={isCyr2Tote ? '...ناتيجە وسىندا شىعادى' : 'Нәтиже осында шығады...'}
            className="w-full min-h-48 max-h-96 bg-[#1B3A6B] text-white placeholder-[#4a6fa5] border border-[#2a4f8a] rounded-xl p-4 resize-none overflow-y-auto focus:outline-none focus:border-[#C9A84C] transition-colors text-base leading-relaxed"            dir={isCyr2Tote ? 'rtl' : 'ltr'}
            style={isCyr2Tote ? { fontFamily: 'AlkatipBasma', fontSize: '20px' } : {}}
          />
            <div className="flex justify-end mt-2">
              {outputText && (
                <button
                  onClick={handleCopy}
                  className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${copyStatus ? 'text-green-400 border-green-400' : 'text-[#C9A84C] border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F2347]'}`}
                >
                  {copyStatus ? copyStatus : 'Көшіру'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Файл конвертер */}
        {user && (
          <div className="mt-8 w-full max-w-5xl space-y-3">

            {/* .txt */}
            <div className="border border-[#2a4f8a] rounded-xl p-4 bg-[#1B3A6B]">
              <p className="text-[#C9A84C] text-xs uppercase tracking-widest mb-3 font-medium">
                .txt файл конвертері
                <span className="text-[#4a6fa5] normal-case tracking-normal ml-2">Free · 500 KB</span>
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileConvert}
                  className="text-sm text-white file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#C9A84C] file:text-[#0F2347] hover:file:bg-[#e0bc5e] cursor-pointer"
                />
                {fileResult && (
                  <button
                    onClick={() => {
                      const blob = new Blob([fileResult], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'converted.txt';
                      a.click();
                    }}
                    className="text-xs text-[#C9A84C] border border-[#C9A84C] px-3 py-1.5 rounded-full hover:bg-[#C9A84C] hover:text-[#0F2347] transition-colors"
                  >
                    Жүктеу
                  </button>
                )}
              </div>
              {fileResult && (
                <p className="text-green-400 text-xs mt-2">Файл сәтті түрлендірілді!</p>
              )}
            </div>

            {/* .docx */}
            <div className="border border-[#2a4f8a] rounded-xl p-4 bg-[#1B3A6B] opacity-60">
              <p className="text-[#C9A84C] text-xs uppercase tracking-widest mb-1 font-medium">
                .docx файл конвертері
              </p>
              <p className="text-[#4a6fa5] text-xs">
                Жақын арада Premium жазылымшыларға қолжетімді болады
              </p>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}