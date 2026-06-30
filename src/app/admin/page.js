'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  // Статистика
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPairs: 0,
    totalConversions: 0,
    totalErrors: 0,
  });

  // Қате хабарлар
  const [errorReports, setErrorReports] = useState([]);

  // Пайдаланушылар
  const [users, setUsers] = useState([]);

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
      checkAdmin();
    } else if (user === null) {
      setLoading(false);
    }
  }, [user]);

  async function checkAdmin() {
    const { data } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (data?.plan === 'admin') {
      setIsAdmin(true);
      fetchStats();
      fetchErrorReports();
      fetchUsers();
    }
    setLoading(false);
  }

  async function fetchStats() {
    const [users, pairs, conversions, errors] = await Promise.all([
      supabase.rpc('get_total_users'),
      supabase.from('word_pairs').select('*', { count: 'exact', head: true }),
      supabase.from('conversion_history').select('*', { count: 'exact', head: true }),
      supabase.from('error_reports').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      totalUsers: users.data || 0,
      totalPairs: pairs.count || 0,
      totalConversions: conversions.count || 0,
      totalErrors: errors.count || 0,
    });
  }

  async function fetchErrorReports() {
    const { data } = await supabase
      .from('error_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setErrorReports(data || []);
  }

  async function fetchUsers() {
    const { data } = await supabase.rpc('get_all_users');
    setUsers(data || []);
  }

  async function handleDeleteError(id) {
    await supabase.from('error_reports').delete().eq('id', id);
    setErrorReports(errorReports.filter(e => e.id !== id));
  }

  async function handleChangePlan(userId, plan) {
    await supabase.from('profiles').update({ plan }).eq('id', userId);
    setUsers(users.map(u => u.id === userId ? { ...u, plan } : u));
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0F2347] flex items-center justify-center">
      <p className="text-white">Жүктелуде...</p>
    </div>
  );

  if (!user || !isAdmin) return (
    <div className="min-h-screen bg-[#0F2347] flex items-center justify-center">
      <p className="text-red-400">Рұқсат жоқ</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F2347]">

      {/* Header */}
      <header className="w-full bg-[#0F2347] border-b border-[#1B3A6B] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/"><img src="/logo.svg" alt="KazScript" className="w-10 h-10" /></a>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">KazScript</h1>
              <p className="text-[#C9A84C] text-xs tracking-widest uppercase">Админ панель</p>
            </div>
          </div>
          <a href="/" className="text-xs text-[#C9A84C] border border-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F2347] px-4 py-1.5 rounded-full transition-colors">
            ← Конвертерге
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Табтар */}
        <div className="flex gap-2 mb-8">
          {['stats', 'errors', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                ${activeTab === tab ? 'bg-[#C9A84C] text-[#0F2347] border-[#C9A84C]' : 'text-white border-[#2a4f8a] hover:border-[#C9A84C]'}`}
            >
              {tab === 'stats' ? 'Статистика' : tab === 'errors' ? 'Қателер' : 'Пайдаланушылар'}
            </button>
          ))}
        </div>

        {/* Статистика */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Пайдаланушылар', value: stats.totalUsers },
              { label: 'Сөздік жұптары', value: stats.totalPairs.toLocaleString() },
              { label: 'Түрлендірулер', value: stats.totalConversions.toLocaleString() },
              { label: 'Қате хабарлар', value: stats.totalErrors },
            ].map((item, i) => (
              <div key={i} className="bg-[#1B3A6B] border border-[#2a4f8a] rounded-xl p-5 text-center">
                <p className="text-3xl font-bold text-[#C9A84C]">{item.value}</p>
                <p className="text-[#4a6fa5] text-xs mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Қателер */}
        {activeTab === 'errors' && (
          <div className="border border-[#1B3A6B] rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 bg-[#1B3A6B] px-4 py-3">
              <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium">Қате сөз</span>
              <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium">Дұрыс нұсқа</span>
              <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium">Бағыт</span>
              <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium">Әрекет</span>
            </div>
            {errorReports.length === 0 ? (
              <div className="text-center text-[#4a6fa5] py-8">Қате хабарлар жоқ</div>
            ) : (
              errorReports.map((report, i) => (
                <div key={report.id} className={`grid grid-cols-4 px-4 py-3 border-t border-[#1B3A6B] items-center ${i % 2 === 0 ? 'bg-[#0F2347]' : 'bg-[#1B3A6B]/30'}`}>
                  <span className="text-red-400 text-sm">{report.wrong_word || '—'}</span>
                  <span className="text-green-400 text-sm">{report.correct_word || '—'}</span>
                  <span className="text-[#4a6fa5] text-xs">{report.direction}</span>
                  <button
                    onClick={() => handleDeleteError(report.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors text-left"
                  >
                    Өшіру
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Пайдаланушылар */}
        {activeTab === 'users' && (
          <div className="border border-[#1B3A6B] rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-[#1B3A6B] px-4 py-3">
              <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium">Email</span>
              <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium">Жоспар</span>
              <span className="text-[#C9A84C] text-xs uppercase tracking-widest font-medium">Өзгерту</span>
            </div>
            {users.map((u, i) => (
              <div key={u.id} className={`grid grid-cols-3 px-4 py-3 border-t border-[#1B3A6B] items-center ${i % 2 === 0 ? 'bg-[#0F2347]' : 'bg-[#1B3A6B]/30'}`}>
                <span className="text-white text-sm truncate">{u.email}</span>
                <span className={`text-xs font-medium ${u.plan === 'admin' ? 'text-red-400' : u.plan === 'premium' ? 'text-[#C9A84C]' : 'text-[#4a6fa5]'}`}>
                  {u.plan}
                </span>
                <select
                  value={u.plan}
                  onChange={e => handleChangePlan(u.id, e.target.value)}
                  className="bg-[#0F2347] text-white border border-[#2a4f8a] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#C9A84C] w-32"
                >
                  <option value="free">free</option>
                  <option value="premium">premium</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}