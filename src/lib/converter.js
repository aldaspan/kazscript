// Кирилл → Төте жазу сәйкестік кестесі
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
  'ё': 'ۇ',
  'ъ': '',
  'ь': '',
  'э': 'ە',
};

// Дәйекшесіз таңбалар (ك گ ە болса дәйекше қойылмайды)
const noDaeksheTanba = new Set(['ك', 'گ', 'ە']);

/**
 * Сөзде дәйекше қажет пе?
 * - ء бар таңба болса, бірақ ك گ ە болмаса — қажет
 */
function needsDaekshe(arabicWord) {
  const hasDaeksheChar = arabicWord.includes('ء');
  if (!hasDaeksheChar) return false;

  // ك گ ە болса — дәйекше қойылмайды
  for (const char of arabicWord) {
    if (noDaeksheTanba.has(char)) return false;
  }
  return true;
}

/**
 * Сөздің басына бір дәйекше қойып, ішіндегілерін өшіреді
 */
function applyDaeksheRule(arabicWord) {
  if (!needsDaekshe(arabicWord)) {
    // Дәйекше қажет емес — барлық ء өшіру
    return arabicWord.replaceAll('ء', '');
  }
  // Барлық ء өшіріп, сөз басына бір ء қою
  const cleaned = arabicWord.replaceAll('ء', '');
  return 'ء' + cleaned;
}

/**
 * Кирилл мәтінін Төте жазуға түрлендіреді
 * @param {string} text - Кирилл мәтіні
 * @returns {string} - Төте жазу мәтіні
 */
export function cyrillicToTote(text) {
  if (!text) return '';

  // Бас әріпті кіші әріпке айналдыру
  const lower = text.toLowerCase();

  // Сөздерге бөліп өңдейміз
  return lower
    .split(/(\s+)/)
    .map(token => {
      // Бос орын болса — өзгертпей қайтар
      if (/^\s+$/.test(token)) return token;

      // Әр таңбаны түрлендір
      const arabic = token
        .split('')
        .map(char => cyrillicToArabic[char] ?? char)
        .join('');

      // Дәйекше ережесін қолдан
      return applyDaeksheRule(arabic);
    })
    .join('');
}

/**
 * Таңба санын есептейді (бос орынсыз)
 * @param {string} text
 * @returns {number}
 */
export function countChars(text) {
  return text.replace(/\s/g, '').length;
}