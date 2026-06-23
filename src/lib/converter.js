// ============================================================
// Кирилл → Төте жазу сәйкестік кестесі
// ============================================================
const cyrillicToArabic = {
  // Дауысты дыбыстар
  'а': 'ا',
  'ә': 'ءا',
  'е': 'ە',
  'и': 'ي',
  'і': 'ءى',
  'о': 'و',
  'ө': 'ءو',
  'у': 'ۋ',
  'ұ': 'ۇ',
  'ү': 'ءۇ',
  'ы': 'ى',

  // Дауыссыз дыбыстар
  'б': 'ب',
  'в': 'ۆ',
  'г': 'گ',
  'ғ': 'ع',
  'д': 'د',
  'ж': 'ج',
  'з': 'ز',
  'й': 'ي',
  'к': 'ك',
  'қ': 'ق',
  'л': 'ل',
  'м': 'م',
  'н': 'ن',
  'ң': 'ڭ',
  'п': 'پ',
  'р': 'ر',
  'с': 'س',
  'т': 'ت',
  'ф': 'ف',
  'х': 'ح',
  'һ': 'ھ',
  'ц': 'تس',
  'ч': 'چ',
  'ш': 'ش',
  'щ': 'شش',
  'ю': 'يۋ',
  'я': 'يا',

  // Орыс таңбалары
  'ё': 'يو',
  'ъ': '',
  'ь': '',
  'э': 'ە',

  // Тыныс белгілері
  '?': '؟',
  ',': '،',
  ';': '؛',
};

// ============================================================
// Дәйекше ережелері
// ============================================================
const noDaeksheTanba = new Set(['ك', 'گ', 'ە']);

function needsDaekshe(arabicWord) {
  if (!arabicWord.includes('ء')) return false;
  for (const char of arabicWord) {
    if (noDaeksheTanba.has(char)) return false;
  }
  return true;
}

function applyDaeksheRule(arabicWord) {
  if (!needsDaekshe(arabicWord)) {
    return arabicWord.replaceAll('ء', '');
  }
  const cleaned = arabicWord.replaceAll('ء', '');
  return 'ء' + cleaned;
}

// ============================================================
// Кирилл → Төте жазу
// ============================================================
// ұлы/қызы бөлу ережесі
function splitUlyQyzy(text) {
  return text
    .replace(/ұлы/g, ' ұлы')
    .replace(/қызы/g, ' қызы');
}

export function cyrillicToTote(text) {
  if (!text) return '';

  const lower = text.toLowerCase();
const prepared = splitUlyQyzy(lower);
  return prepared
    .split(/(\s+)/)
    .map(token => {
      if (/^\s+$/.test(token)) return token;

      const arabic = token
        .split('')
        .map(char => cyrillicToArabic[char] ?? char)
        .join('');

      return applyDaeksheRule(arabic);
    })
    .join('');
}

// ============================================================
// Төте жазу → Кирилл сәйкестік кестесі
// МАҢЫЗДЫ: ұзын таңбалар алдымен тұруы керек!
// ============================================================
const arabicToCyrillicMap = [

  // Дифтонгтар (алдымен!)
  ['اي', 'ай'],
  ['ەي', 'ей'],
  ['وي', 'ой'],
  ['ۇي', 'ұй'],
  ['ۋي', 'уй'],
  ['ءوي', 'өй'],
  ['ءۇي', 'үй'],

  // Екі таңбалы төте жазу таңбалары (алдымен!)
  ['ءا', 'ә'],
  ['ءى', 'і'],
  ['ءو', 'ө'],
  ['ءۇ', 'ү'],
  ['يۋ', 'ю'],
  ['يا', 'я'],
  ['يو', 'ё'],
  ['شش', 'щ'],

  // Бір таңбалы төте жазу таңбалары
  ['ا', 'а'],
  ['ە', 'е'],
  ['ي', 'и'],
  ['و', 'о'],
  ['ۋ', 'у'],
  ['ۇ', 'ұ'],
  ['ى', 'ы'],
  ['ب', 'б'],
  ['ۆ', 'в'],
  ['گ', 'г'],
  ['ع', 'ғ'],
  ['د', 'д'],
  ['ج', 'ж'],
  ['ز', 'з'],
  ['ك', 'к'],
  ['ق', 'қ'],
  ['ل', 'л'],
  ['م', 'м'],
  ['ن', 'н'],
  ['ڭ', 'ң'],
  ['پ', 'п'],
  ['ر', 'р'],
  ['س', 'с'],
  ['ت', 'т'],
  ['ف', 'ф'],
  ['ح', 'х'],
  ['ھ', 'һ'],
  ['چ', 'ч'],
  ['ش', 'ш'],

  // Тыныс белгілері
  ['؟', '?'],
  ['،', ','],
  ['؛', ';'],

  // Дәйекшені өшіру
  ['ء', ''],
];

// ============================================================
// Жуан/жіңішке үндестік ережесі (ك گ ە болса → жіңішке)
// ============================================================
const thickToThin = {
  'а': 'ә',
  'о': 'ө',
  'ұ': 'ү',
  'ы': 'і',
};

const thinIndicators = new Set(['е', 'ө', 'ү', 'ә']);

function applyVowelHarmony(word) {
  return word;
}

// ============================================================
// Төте жазу → Кирилл
// ============================================================
export function toteToCyrillic(text) {
  if (!text) return '';

 let result = text;

for (const [arabic, cyrillic] of arabicToCyrillicMap) {
  result = result.replaceAll(arabic, cyrillic);
}

  result = result
    .split(/(\s+)/)
    .map(token => {
      if (/^\s+$/.test(token)) return token;
      return applyVowelHarmony(token);
    })
    .join('');

  result = result.replace(/и$/u, 'й');
  result = result.replace(/и(\s)/gu, 'й$1');


  return result;
}

// ============================================================
// Таңба санын есептеу
// ============================================================
export function countChars(text) {
  return text.replace(/\s/g, '').length;
}


// ============================================================
// Өздігінен үйрену жүйесі — жұп сақтау
// ============================================================

/**
 * Кирилл→Төте жұптарын localStorage-ке сақтайды
 * @param {string} cyrillicWord
 * @param {string} arabicWord
 */
export function savePair(cyrillicWord, arabicWord) {
  if (typeof window === 'undefined') return;
  try {
    const pairs = JSON.parse(localStorage.getItem('kz_pairs') || '{}');
    pairs[arabicWord] = cyrillicWord;
    localStorage.setItem('kz_pairs', JSON.stringify(pairs));
  } catch (e) {
    console.error('savePair қатесі:', e);
  }
}

/**
 * Төте жазу сөзін сөздіктен іздейді
 * @param {string} arabicWord
 * @returns {string|null}
 */
export function lookupPair(arabicWord) {
  if (typeof window === 'undefined') return null;
  try {
    const pairs = JSON.parse(localStorage.getItem('kz_pairs') || '{}');
    return pairs[arabicWord] || null;
  } catch (e) {
    return null;
  }
}