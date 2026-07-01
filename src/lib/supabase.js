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

/**
 * Конвертер тарихын сақтайды (тек тіркелген пайдаланушы)
 */
export async function saveConversionHistory(userId, inputText, outputText, direction) {
  if (!userId) return;

  const { error } = await supabase
    .from('conversion_history')
    .insert({
      user_id: userId,
      input_text: inputText,
      output_text: outputText,
      direction: direction,
    });

  if (error) console.error('saveConversionHistory қатесі:', JSON.stringify(error));
}

/**
 * Пайдаланушының конвертер тарихын алады
 */
export async function getConversionHistory(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('conversion_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('getConversionHistory қатесі:', JSON.stringify(error));
    return [];
  }
  return data || [];
}

/**
 * Жеке сөздікке жұп қосу
 */
export async function addToPersonalDictionary(userId, cyrillic, arabic, note = '') {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('personal_dictionary')
    .upsert(
      { user_id: userId, cyrillic, arabic, note },
      { onConflict: 'user_id,cyrillic' }
    );

  if (error) console.error('addToPersonalDictionary қатесі:', JSON.stringify(error));
  return data;
}

/**
 * Жеке сөздікті алу
 */
export async function getPersonalDictionary(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('personal_dictionary')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getPersonalDictionary қатесі:', JSON.stringify(error));
    return [];
  }
  return data || [];
}

/**
 * Жеке сөздіктен жұп өшіру
 */
export async function deleteFromPersonalDictionary(userId, id) {
  if (!userId) return;

  const { error } = await supabase
    .from('personal_dictionary')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) console.error('deleteFromPersonalDictionary қатесі:', JSON.stringify(error));
}

/**
 * Қате хабарлау
 */
export async function reportError(userId, inputText, outputText, wrongWord, correctWord, direction) {
  const { error } = await supabase
    .from('error_reports')
    .insert({
      user_id: userId || null,
      input_text: inputText,
      output_text: outputText,
      wrong_word: wrongWord,
      correct_word: correctWord,
      direction: direction,
    });

  if (error) console.error('reportError қатесі:', JSON.stringify(error));
}

/**
 * Жеке сөздіктен төте жазу сөзін іздейді
 */
export async function lookupPersonalDictionary(userId, arabicWord) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('personal_dictionary')
    .select('cyrillic')
    .eq('user_id', userId)
    .eq('arabic', arabicWord)
    .single();

  if (error) return null;
  return data?.cyrillic || null;
}