# DECKO qoidalari

Mau-Mau / 101 ning mintaqaviy variantlari ko'p. Shuning uchun DECKO'da qoidalar kodga qattiq yozilmagan: ular `src/engine/rules.ts` dagi `RuleSet` konfiguratsiyasida turadi.

## Aniq qoidalar (barcha variantlarda bir xil)

- 36 talik koloda: 6, 7, 8, 9, 10, V, D, K, T × 4 mast.
- Har o'yinchiga 5 ta karta tarqatiladi (`handSize`), bitta karta ochib qo'yiladi.
- Ochiq kartaga **mast** yoki **qiymat** bo'yicha mos karta tashlanadi.
- Mos karta bo'lmasa, 1 ta karta olinadi (`drawPerTurn`). Olingan karta mos kelsa, tashlash mumkin (`mayPlayAfterDraw`), aks holda yurish o'tkaziladi.
- Koloda tugasa, tashlangan kartalar (eng ustidagisidan tashqari) aralashtirilib, yangi koloda qilinadi.
- Kartalarini birinchi tugatgan o'yinchi raundda g'olib. Qolganlarga qo'lidagi kartalar ochkosi qo'shiladi.
- Ochkosi 101 dan **oshgan** o'yinchi chiqadi (`eliminationScore`). Aynan 101 bo'lsa, o'yinda qoladi. Oxirgi qolgan o'yinchi g'olib.

## "Klassik 101" — tasdiqlanishi kerak

Quyidagilar sozlanadi va hozircha **taxminiy**. Har birini tasdiqlang yoki to'g'rilang:

| Karta | Hozirgi sozlama | Kalit |
|---|---|---|
| 6 | Tashlagan o'yinchi uni yana bir karta bilan yopishi kerak, yopolmasa karta oladi | `rankEffects['6'].mustCover` |
| 7 | Keyingi o'yinchi 2 ta oladi va yurishni o'tkazib yuboradi | `rankEffects['7']` |
| 8 | Yurish yo'nalishi o'zgaradi | `rankEffects['8'].reverse` |
| Tuz (A) | Keyingi o'yinchi yurishni o'tkazib yuboradi | `rankEffects.A.skipNext` |
| Dama (Q) | Istalgan kartaga tashlanadi, mast tanlanadi | `rankEffects.Q` |
| Qirol qarg'a (K♠) | Keyingi o'yinchi 4 ta oladi va o'tkazib yuboradi | `cardEffects['K-spades']` |

**Ochkolar:** 6–10 o'z qiymati, 9 = 0, V = 2, D = 3, K = 4, T = 11 (`cardPoints`).

**Dama bilan tugatish:** −20, qarg'a dama bilan −40 (`finishBonusByRank`, `finishBonusByCard`).

**Ochiq savollar:**

1. Aynan 100 ga tushsa, ochko nolga qaytadimi? Hozir yo'q (`resetScoreAt: null`).
2. 7 ni 7 ga "o'tkazish" (jarimani yig'ish) bormi? Hozir yo'q.
3. Oxirgi karta 7 yoki K♠ bo'lsa, keyingi o'yinchi baribir karta oladimi? Hozir oladi (`applyEffectsOnFinishingCard`).
4. Boshlang'ich ochiq karta maxsus bo'lsa, ta'siri ishlaydimi? Hozir ishlamaydi (`applyEffectsOnStartCard`).
5. 2 kishilik o'yinda 8 (yo'nalish) qanday ishlaydi? Hozir oddiy karta kabi: navbat raqibga o'tadi.
6. Mos kartasi bo'lsa ham ixtiyoriy karta olish mumkinmi? Hozir mumkin.

## "Oddiy" (Mau-Mau)

Maxsus kartalar yo'q, faqat mast/qiymat bo'yicha o'ynaladi. Ochkolar yuqoridagidek.

## Yangi variant qo'shish

`rules.ts` da yangi `RuleSet` yarating va `RULE_SETS` ga qo'shing. U o'yin, sozlamalar va qoidalar ekranida avtomatik paydo bo'ladi.
