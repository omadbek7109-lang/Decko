# Arxitektura

Uch qatlam bir-biridan ajratilgan:

```
screens/ + ui/   →   state/   →   engine/        (sof TypeScript, React'siz)
                         ↓
                     services/  (interfeyslar → local/ hozir, supabase/ keyin)
```

## engine/

- `cards.ts`: mast, qiymat, `CardId` (`"Q-spades"`).
- `random.ts`: seed bilan ishlaydigan RNG (mulberry32). Dvigatel `Math.random` ishlatmaydi, har raundni seed'dan qayta tiklash mumkin. Bu keyinchalik serverda yurishlarni tekshirish uchun kerak.
- `deck.ts`: koloda yaratish, Fisher–Yates aralashtirish, tarqatish.
- `rules.ts`: `RuleSet` konfiguratsiyasi va presetlar.
- `round.ts`: bitta raundning holat mashinasi: `playCard`, `drawCard`, `passTurn`, `chooseSuit`, `legalCards`. Har bir harakat yangi holat qaytaradi (immutable), noto'g'ri harakatda `GameError` chiqaradi.
- `match.ts`: raundlar ketma-ketligi, ochkolar, chiqish, g'olib.
- `bot.ts`: oddiy, adolatli bot. Faqat o'z qo'lini va stolni ko'radi.

Testlar: `src/engine/__tests__` (Node test runner + tsx). Ular koloda, aralashtirish, tarqatish, to'g'ri yurishlar, maxsus kartalar, ochkolar va 2/3/4 o'yinchili to'liq o'yinlarni (har biri 120 ta seed) tekshiradi.

## services/

`types.ts` dagi interfeyslar: `AuthenticationService`, `PlayerService`, `MatchService`, `RoomService`, `LeaderboardService`.

Hozirgi `local/` implementatsiyalari:
- Auth: Telegram `initDataUnsafe` yoki mehmon. **Server tomonida tekshirilmaydi.**
- Player: statistika va tarix `localStorage` da saqlanadi.
- Match / Room / Leaderboard: `BackendNotConnectedError` qaytaradi. UI buni "Server ulangach ishlaydi" deb ko'rsatadi.

## state/

Kichik `useSyncExternalStore` store (`lib/store.ts`). `game.ts` mashq o'yinini boshqaradi va bot yurishlarini taymer bilan rejalashtiradi.

## UI

- Routing: hash-based (`#/lobby`). GitHub Pages va Telegram'da server sozlamasisiz ishlaydi.
- Kartalar: bitta `CardFace` SVG komponenti (200×280 koordinata), `CourtFigure` (ikki boshli V/D/K), `CardBack`.
- Tailwind v4, rang tokenlari `src/index.css` dagi `@theme` da.
- Matnlar `src/i18n/uz.ts` da.

## Supabase

Rejalashtirilgan ketma-ketlik:

1. **Auth.** Edge Function Telegram `initData` HMAC'ini bot token bilan tekshiradi va Supabase sessiyasini beradi.
2. **Jadvallar.** `profiles`, `matches`, `match_players`, `rooms`, `room_players`, `ratings`. Hammasida RLS yoqiladi.
3. **O'yin holati serverda.** Edge Function `engine/` ni ishlatib har bir yurishni tekshiradi, chunki dvigatel React'siz va deterministik. Mijoz faqat harakat yuboradi.
4. **Realtime.** Xona/match kanallari orqali yurishlar broadcast qilinadi. Bazaga faqat match boshi, natijasi va kerakli snapshot yoziladi, shunda Disk IO kam bo'ladi.
5. `src/services/supabase/` da interfeyslarni amalga oshirish va `services/index.ts` da env bo'yicha tanlash.
