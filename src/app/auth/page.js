'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0F2347] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1B3A6B] rounded-2xl p-8">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="KazScript" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">KazScript</h1>
          <p className="text-[#C9A84C] text-sm mt-1 tracking-widest uppercase">Кіру / Тіркелу</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#C9A84C',
                  brandAccent: '#e0bc5e',
                  inputBackground: '#0F2347',
                  inputText: 'white',
                  inputBorder: '#2a4f8a',
                  inputBorderFocus: '#C9A84C',
                },
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Құпия сөз',
                button_label: 'Кіру',
                link_text: 'Аккаунтыңыз бар ма? Кіріңіз',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Құпия сөз',
                button_label: 'Тіркелу',
                link_text: 'Аккаунтыңыз жоқ па? Тіркеліңіз',
              },
            },
          }}
          providers={[]}
        />
      </div>
    </main>
  );
}