# DECKO

An'anaviy 36 talik kartalarda o'ynaladigan Mau-Mau / 101 o'yini. Telegram Mini App uchun, mobil ekranga moslab qurilgan.

> Bosqich 1: frontend, o'yin dvigateli va servis interfeyslari tayyor. Onlayn o'yin (Supabase) keyingi bosqichda ulanadi.

## Hozir nima ishlaydi

- **Kirish.** Telegram ichida foydalanuvchi avtomatik olinadi, tashqarida "mehmon" sifatida kiriladi.
- **Lobbi.** Profil, tez o'yin, do'stlar bilan o'yin, xona yaratish/kirish, reyting, tarix, qoidalar, sozlamalar.
- **O'yin stoli.** Kompyuterga qarshi mashq o'yini, 2–4 o'yinchi, to'liq ishlaydi: raundlar, ochkolar, 101 dan oshganda chiqish, g'olib.
- **Kartalar.** 36 talik koloda (6–A), SVG'da chizilgan an'anaviy yuzlar: qirol, dama, valet. Uchta karta orqa tomoni bor.
- **Qoidalar.** Sozlanadigan konfiguratsiya ("Klassik 101" va "Oddiy"). Tasdiqlanmagan qoidalar ro'yxati: [docs/RULES.md](docs/RULES.md).
- **Mahalliy saqlash.** Profil statistikasi va o'yinlar tarixi qurilmada saqlanadi.

## Hali ishlamaydi (server kerak)

Onlayn tez o'yin, xonalar, umumiy reyting va tangalar hisobi. Bu tugmalar ekranda bor, lekin "Server ulangach ishlaydi" deb ko'rsatiladi. Soxta onlayn rejim yo'q.

## Ishga tushirish

Node.js 20+ kerak.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # o'yin dvigateli testlari
npm run typecheck  # TypeScript (strict)
npm run build      # dist/ ga production build
```

Taklif havolalari uchun `.env.example` faylini `.env` ga ko'chiring va bot nomini yozing:

```
VITE_TELEGRAM_BOT_USERNAME=sizning_botingiz
```

## Telegram'ga ulash

1. `npm run build`, keyin `dist/` papkani istalgan static hostingga joylang. `.github/workflows/ci.yml` main branch'dan GitHub Pages'ga avtomatik joylaydi (Settings → Pages → Source: GitHub Actions).
2. @BotFather → Bot Settings → Menu Button yoki `/newapp` orqali Mini App URL'ini kiriting.

## Tuzilma

```
src/
  engine/      UI'dan mustaqil o'yin dvigateli (koloda, qoidalar, raund, match, bot) + testlar
  services/    Auth/Player/Match/Room/Leaderboard interfeyslari va mahalliy implementatsiyalar
  state/       Sessiya va o'yin holati (kichik store)
  ui/          Kartalar (SVG), umumiy komponentlar, ikonlar
  screens/     Ekranlar: splash, lobbi, o'yin stoli, profil, reyting, xonalar, sozlamalar
  i18n/uz.ts   Barcha matnlar (o'zbekcha)
docs/          Qoidalar va arxitektura
```

Batafsil: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Keyingi bosqich: Supabase

`src/services/types.ts` dagi interfeyslar uchun Supabase implementatsiyasi yoziladi va `src/services/index.ts` da ulanadi. Ekranlar va dvigatel o'zgarmaydi. Rejasi: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#supabase).
