# Кирилл → Төте жазу сәйкестік кестесі
CYRILLIC_TO_ARABIC = {
    'а': 'ا', 'ә': 'ءا', 'е': 'ە', 'и': 'ي', 'і': 'ءى',
    'о': 'و', 'ө': 'ءو', 'у': 'ۋ', 'ұ': 'ۇ', 'ү': 'ءۇ',
    'ы': 'ى', 'б': 'ب', 'в': 'ۆ', 'г': 'گ', 'ғ': 'ع',
    'д': 'د', 'ж': 'ج', 'з': 'ز', 'й': 'ي', 'к': 'ك',
    'қ': 'ق', 'л': 'ل', 'м': 'م', 'н': 'ن', 'ң': 'ڭ',
    'п': 'پ', 'р': 'ر', 'с': 'س', 'т': 'ت', 'ф': 'ف',
    'х': 'ح', 'һ': 'ھ', 'ц': 'تس', 'ч': 'چ', 'ш': 'ش',
    'щ': 'شش', 'ю': 'يۋ', 'я': 'يا', 'ё': 'يو',
    'ъ': '', 'ь': '', 'э': 'ە',
    '?': '؟', ',': '،', ';': '؛',
}

NO_DAEKSHE = {'ك', 'گ', 'ە'}

def needs_daekshe(word: str) -> bool:
    if 'ء' not in word:
        return False
    for char in word:
        if char in NO_DAEKSHE:
            return False
    return True

def apply_daekshe(word: str) -> str:
    if not needs_daekshe(word):
        return word.replace('ء', '')
    cleaned = word.replace('ء', '')
    return 'ء' + cleaned

def split_uly_qyzy(text: str) -> str:
    return text.replace('ұлы', ' ұлы').replace('қызы', ' қызы')

def cyrillic_to_tote(text: str) -> str:
    text = text.lower()
    text = split_uly_qyzy(text)
    words = text.split(' ')
    result = []
    for word in words:
        arabic = ''
        for char in word:
            arabic += CYRILLIC_TO_ARABIC.get(char, char)
        result.append(apply_daekshe(arabic))
    return ' '.join(result)

# Төте жазу → Кирилл
ARABIC_TO_CYRILLIC = [
    ('ءا', 'ә'), ('ءى', 'і'), ('ءو', 'ө'), ('ءۇ', 'ү'),
    ('يۋ', 'ю'), ('يا', 'я'), ('يو', 'ё'), ('تس', 'ц'), ('شش', 'щ'),
    ('اي', 'ай'), ('ەي', 'ей'), ('وي', 'ой'), ('ۇي', 'ұй'),
    ('ۋي', 'уй'), ('ءوي', 'өй'), ('ءۇي', 'үй'),
    ('ا', 'а'), ('ە', 'е'), ('ي', 'и'), ('و', 'о'),
    ('ۋ', 'у'), ('ۇ', 'ұ'), ('ى', 'ы'), ('ب', 'б'),
    ('ۆ', 'в'), ('گ', 'г'), ('ع', 'ғ'), ('د', 'д'),
    ('ج', 'ж'), ('ز', 'з'), ('ك', 'к'), ('ق', 'қ'),
    ('ل', 'л'), ('م', 'м'), ('ن', 'н'), ('ڭ', 'ң'),
    ('پ', 'п'), ('ر', 'р'), ('س', 'с'), ('ت', 'т'),
    ('ف', 'ф'), ('ح', 'х'), ('ھ', 'һ'), ('چ', 'ч'), ('ش', 'ш'),
    ('؟', '?'), ('،', ','), ('؛', ';'), ('ء', ''),
]

def tote_to_cyrillic(text: str) -> str:
    result = text
    for arabic, cyrillic in ARABIC_TO_CYRILLIC:
        result = result.replace(arabic, cyrillic)
    # Жол басын бас әріппен
    if result:
        result = result[0].upper() + result[1:]
    return result