# DECKO qoidalari

Qoidalar kodga qattiq yozilmagan: ular `src/engine/rules.ts` dagi `RuleSet` konfiguratsiyasida turadi.

"Klassik 101" mashhur 101 (Сто одно) ilovalaridagi qoidalarga moslab olingan. Manbalar:
- 101 HD (Elvista) ilovasining qoidalar tavsifi: App Store / RuStore
- "101 (игра)" maqolasi: Rus Vikipediyasi (dic.academic.ru nusxasi)

## Asosiy qoidalar

- 36 talik koloda: 6, 7, 8, 9, 10, V, D, K, T × 4 mast. Har o'yinchiga 5 ta karta.
- Ochiq kartaga **mast** yoki **qiymat** bo'yicha mos karta tashlanadi.
- Mos karta bo'lmasa, 1 ta karta olinadi. U mos kelsa tashlash mumkin, aks holda navbat avtomatik o'tadi.
- Koloda tugasa, ustki kartadan boshqa tashlangan kartalar aralashtirilib, yangi koloda bo'ladi.
- Kartalarini birinchi tugatgan o'yinchi raund g'olibi. Qolganlarga qo'lidagi kartalar ochkosi qo'shiladi.

## Maxsus kartalar ("Klassik 101")

| Karta | Ta'siri | Kalit |
|---|---|---|
| 6 | Keyingi o'yinchi 1 ta oladi va yurmaydi. U o'z 6 i bilan jarimani keyingisiga o'tkazishi mumkin (jarima qo'shilib boradi) | `rankEffects['6']` |
| 7 | Keyingi o'yinchi 2 ta oladi va yurmaydi. 7 bilan o'tkazish mumkin | `rankEffects['7']` |
| 8 | Tashlagan o'yinchi yana yuradi. Mos karta bo'lmasa, topguncha oladi. 8 bilan raundni tugatib bo'lmaydi | `rankEffects['8']` |
| 10 | Yurish yo'nalishi o'zgaradi | `rankEffects['10']` |
| Tuz (A) | Keyingi o'yinchi yurishni o'tkazib yuboradi | `rankEffects.A` |
| Dama (Q) | Istalgan kartaga tashlanadi, mast tanlanadi | `rankEffects.Q` |
| Qarg'a qirol (K♠) | Keyingi o'yinchi 4 ta oladi va yurmaydi | `cardEffects['K-spades']` |

## Ochkolar

- 6, 7, 8, 10 o'z qiymati; 9 = 0; valet 2; dama 3; qirol 4; tuz 11.
- Dama bilan tugatsa −20, qarg'a dama bilan −40.
- Aynan **100** bo'lsa → **50**, aynan **101** bo'lsa → **0** (`scoreResets`).
- 101 dan **oshgan** o'yinchi chiqadi. Oxirgi qolgan o'yinchi g'olib.

## Hali tanlov kerak bo'lgan joylar

Ilovalar orasida farq qiladi, hozirgi qiymati qavsda:

1. Qo'lga 4 yoki 5 karta (5).
2. Dama har qanday kartaga tushadimi yoki faqat mast bo'yicha (har qanday).
3. Qarg'a qirol +4 yoki +5 (+4).
4. 8 bilan tugatish taqiqlanganmi (ha).

## "Oddiy" (Mau-Mau)

Maxsus kartalar yo'q, faqat mast/qiymat bo'yicha o'ynaladi. Ochkolar va 100/101 qoidasi yuqoridagidek.
