import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Сөздік жұптарын Supabase-ке сақтайды
 */
export async function savePairToSupabase(cyrillic, arabic) {
  // Тым қысқа сөздерді өткізіп жібер
  if (cyrillic.length < 2) return;
  
  const { error } = await supabase
    .from('word_pairs')
    .upsert(
      { cyrillic, arabic },
      { onConflict: 'cyrillic,arabic', ignoreDuplicates: true }
    );

  if (error && error.code !== '23505') {
    console.error('savePairToSupabase қатесі:', JSON.stringify(error));
  }
}

// Жұптарды топтап сақтайды (batch)
export async function savePairsBatch(pairs) {
  if (!pairs.length) return;
  
  const { error } = await supabase
    .from('word_pairs')
    .upsert(pairs, { onConflict: 'cyrillic,arabic', ignoreDuplicates: true });

  if (error) console.error('savePairsBatch қатесі:', JSON.stringify(error));
}

/**
 * Supabase сөздігінен төте жазу сөзін іздейді
 */
export async function lookupPairFromSupabase(arabic) {
  const { data, error } = await supabase
    .from('word_pairs')
    .select('cyrillic')
    .eq('arabic', arabic)
    .single();

  if (error) return null;
  return data?.cyrillic || null;
}