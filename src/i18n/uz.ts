import type { Card, GameEvent, Rank, Suit } from '../engine';

/** All UI copy lives here (Uzbek, Latin script) so a second language can be added later. */

export const SUIT_NAME: Record<Suit, string> = {
  spades: 'Qarg‘a',
  hearts: 'Yurak',
  diamonds: 'G‘isht',
  clubs: 'Chillak',
};

export const SUIT_SYMBOL: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const RANK_NAME: Record<Rank, string> = {
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  J: 'Valet',
  Q: 'Dama',
  K: 'Qirol',
  A: 'Tuz',
};

export function cardName(card: Card): string {
  return `${RANK_NAME[card.rank]} ${SUIT_NAME[card.suit].toLowerCase()}`;
}

export const t = {
  appName: 'DECKO',
  tagline: 'An’anaviy kartalarda Mau-Mau va 101',
  back: 'Orqaga',
  close: 'Yopish',
  cancel: 'Bekor qilish',
  coming: 'Server ulangach ishlaydi',
  offlineNotice: 'Onlayn server hali ulanmagan. Hozircha kompyuterga qarshi mashq qilish mumkin.',

  splash: {
    telegram: 'Telegram orqali kirish',
    guest: 'Mehmon sifatida kirish',
    guestName: 'Ismingiz',
    guestPlaceholder: 'Masalan, Omadbek',
    guestHint: 'Telegram’dan tashqarida ochilgan. Natijalar faqat shu qurilmada saqlanadi.',
    features: ['36 talik an’anaviy koloda', '2–4 o‘yinchi', 'Do‘stlar bilan xonalar'],
  },

  lobby: {
    hello: 'Salom',
    balance: 'Tangalar',
    balanceHint: 'Hisob server ulangach yuritiladi',
    quickPlay: 'Tez o‘yin',
    quickPlaySub: 'Kompyuterga qarshi yoki onlayn',
    friends: 'Do‘stlar bilan',
    friendsSub: 'Xona orqali o‘ynash',
    createRoom: 'Xona yaratish',
    joinRoom: 'Xonaga kirish',
    rankings: 'Reyting',
    history: 'O‘yinlar tarixi',
    settings: 'Sozlamalar',
    rules: 'Qoidalar',
    profile: 'Profil',
  },

  play: {
    title: 'Tez o‘yin',
    online: 'Onlayn raqib',
    onlineSub: 'Tasodifiy o‘yinchilar bilan reytingli o‘yin',
    practice: 'Kompyuterga qarshi',
    practiceSub: 'Mashq o‘yini, reytingga ta’sir qilmaydi',
    players: 'O‘yinchilar soni',
    rules: 'Qoidalar',
    start: 'Boshlash',
  },

  game: {
    practice: 'Mashq',
    round: (n: number) => `${n}-raund`,
    deck: 'Koloda',
    yourTurn: 'Navbat sizda',
    waiting: (name: string) => `${name} yurmoqda…`,
    draw: 'Karta olish',
    pass: 'O‘tkazish',
    coverAgain: 'Yana yuring yoki karta oling',
    penalty: (n: number) => `Sizga +${n} karta`,
    takePenalty: (n: number) => `${n} ta olish`,
    chooseSuit: 'Mastni tanlang',
    cards: (n: number) => `${n} karta`,
    leaveTitle: 'O‘yindan chiqasizmi?',
    leaveText: 'Mashq o‘yini yakunlanmaydi va natija saqlanmaydi.',
    leave: 'Chiqish',
    stay: 'Davom etish',
    roundOver: 'Raund tugadi',
    roundWinner: (name: string) => `${name} kartalarini tugatdi`,
    nextRound: 'Keyingi raund',
    matchWon: 'G‘alaba!',
    matchLost: 'Mag‘lubiyat',
    matchWinner: (name: string) => `${name} o‘yinda g‘olib`,
    playAgain: 'Yana o‘ynash',
    toLobby: 'Lobbiga',
    points: 'Ochko',
    out: 'Chiqdi',
    reset: 'Nolga qaytdi',
    direction: (d: 1 | -1) => (d === 1 ? 'Yurish soat yo‘nalishida' : 'Yurish teskari yo‘nalishda'),
    chat: 'Tezkor xabarlar',
    phrases: ['Salom!', 'Omad!', 'Zo‘r yurish', 'O‘ylab ko‘ryapman…', 'Rahmat, yaxshi o‘yin'],
    you: 'Siz',
  },

  friends: {
    title: 'Do‘stlar bilan',
    intro: 'Xona yarating va kodni do‘stlaringizga yuboring yoki do‘stingiz bergan kod bilan kiring.',
    createTitle: 'Xona yaratish',
    joinTitle: 'Xonaga kirish',
    maxPlayers: 'O‘yinchilar soni',
    create: 'Xona yaratish',
    code: 'Xona kodi',
    codeHint: '6 ta belgi: harf va raqamlar',
    codeInvalid: 'Kod 6 ta harf yoki raqamdan iborat bo‘lishi kerak',
    join: 'Kirish',
    invite: 'Taklif havolasi',
    invitePreview: 'Havola shu ko‘rinishda bo‘ladi:',
    noBot: 'Bot nomi sozlanmagan (VITE_TELEGRAM_BOT_USERNAME).',
  },

  profile: {
    title: 'Profil',
    rating: 'Reyting',
    ratingNone: 'Onlayn o‘yinda paydo bo‘ladi',
    wins: 'G‘alaba',
    losses: 'Mag‘lubiyat',
    played: 'O‘yinlar',
    winRate: 'G‘alaba ulushi',
    recent: 'So‘nggi o‘yinlar',
    allHistory: 'Barcha tarix',
    localNote: 'Hozircha natijalar faqat shu qurilmada saqlanadi.',
    signOut: 'Hisobdan chiqish',
    source: { telegram: 'Telegram', guest: 'Mehmon' },
  },

  history: {
    title: 'O‘yinlar tarixi',
    empty: 'Hali o‘yinlar yo‘q. Birinchi o‘yiningizni boshlang!',
    vs: 'Raqiblar',
    win: 'G‘alaba',
    loss: 'Mag‘lubiyat',
    rounds: (n: number) => `${n} raund`,
    practice: 'Mashq',
  },

  rankings: {
    title: 'Reyting',
    global: 'Umumiy reyting',
    emptyTitle: 'Reyting jadvali hali yo‘q',
    emptyText: 'Umumiy reyting onlayn o‘yinlar va server ulangach shakllanadi. Quyida — sizning mahalliy natijalaringiz.',
    yourStats: 'Sizning natijangiz',
  },

  settings: {
    title: 'Sozlamalar',
    cardBack: 'Karta orqa tomoni',
    defaultRules: 'Standart qoidalar',
    botSpeed: 'Kompyuter tezligi',
    speeds: { slow: 'Sekin', normal: 'O‘rtacha', fast: 'Tez' },
    haptics: 'Tebranish (Telegram)',
    clearData: 'Mahalliy tarixni tozalash',
    clearConfirm: 'Tarix o‘chirildi',
    version: 'Versiya',
  },

  rulesScreen: {
    title: 'Qoidalar',
    basics: 'Asosiy qoidalar',
    basicsText: [
      'Har bir o‘yinchiga 5 ta karta tarqatiladi, bitta karta ochib qo‘yiladi.',
      'Navbatingizda ochiq kartaga mast yoki qiymat bo‘yicha mos karta tashlaysiz.',
      'Mos karta bo‘lmasa, kolodadan 1 ta karta olasiz. Olingan karta mos kelsa, tashlash mumkin, aks holda navbat o‘tadi.',
      'Kartalarini birinchi tugatgan o‘yinchi raundda g‘olib bo‘ladi. Qolganlarning qo‘lidagi kartalar ochkosi qo‘shiladi.',
      'Ochko aynan 100 bo‘lsa 50 ga, aynan 101 bo‘lsa 0 ga tushadi. 101 dan oshgan o‘yinchi chiqadi, oxirgi qolgan o‘yinchi g‘olib.',
    ],
    effects: 'Maxsus kartalar',
    points: 'Karta ochkolari',
    unconfirmed: 'Tasdiqlanishi kerak',
    unconfirmedText: 'Bu qoidalar sozlanadi va hali yakuniy tasdiqlanmagan:',
  },
} as const;

export function effectText(effect: {
  nextDraws?: number;
  skipNext?: boolean;
  reverse?: boolean;
  wild?: boolean;
  chooseSuit?: boolean;
  mustCover?: boolean;
  stackable?: boolean;
}): string {
  const parts: string[] = [];
  if (effect.wild) parts.push('istalgan kartaga tashlanadi');
  if (effect.chooseSuit) parts.push('mast tanlanadi');
  if (effect.nextDraws) parts.push(`keyingi o‘yinchi ${effect.nextDraws} ta oladi`);
  if (effect.skipNext) parts.push('keyingi o‘yinchi yurishni o‘tkazib yuboradi');
  if (effect.reverse) parts.push('yo‘nalish o‘zgaradi');
  if (effect.stackable) parts.push('xuddi shu qiymatdagi karta bilan keyingisiga o‘tkazish mumkin');
  if (effect.mustCover) parts.push('tashlagan o‘yinchi yana yuradi, yopolmasa karta oladi');
  return parts.join(', ');
}

export function eventText(event: GameEvent, nameOf: (id: string) => string): string | null {
  switch (event.type) {
    case 'play':
      return `${nameOf(event.playerId)}: ${cardName(event.card)}`;
    case 'draw':
      return event.forced
        ? `${nameOf(event.playerId)} ${event.count} ta karta oldi`
        : `${nameOf(event.playerId)} karta oldi`;
    case 'skip':
      return `${nameOf(event.playerId)} yurishni o‘tkazib yubordi`;
    case 'reverse':
      return 'Yo‘nalish o‘zgardi';
    case 'suitChosen':
      return `Mast: ${SUIT_NAME[event.suit]} ${SUIT_SYMBOL[event.suit]}`;
    case 'mustCover':
      return `${nameOf(event.playerId)} yana yuradi`;
    case 'passOn':
      return `${nameOf(event.playerId)}ga +${event.draws}`;
    case 'pass':
      return `${nameOf(event.playerId)} yurishni o‘tkazdi`;
    case 'reshuffle':
      return 'Koloda qayta aralashtirildi';
    case 'roundOver':
      return null;
  }
}
