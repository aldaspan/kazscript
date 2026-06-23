import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Сөздік жұптарын Supabase-ке сақтайды
 */
export async function savePairToSupabase(cyrillic, arabic) {
  const { error } = await supabase
    .from('word_pairs')
    .upsert(
      { cyrillic, arabic, usage_count: 1 },
      {
        onConflict: 'cyrillic,arabic',
        ignoreDuplicates: false,
      }
    );

  if (error) console.error('savePairToSupabase қатесі:', error);
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