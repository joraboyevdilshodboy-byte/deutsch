# Deutsch.gg

Nemis tili tayyorgarlik platformasi — Next.js App Router, TypeScript, Tailwind CSS, NextAuth, Prisma va Google Gemini yordamida ishlaydi.

## Xususiyatlar

- Email/parol va Google OAuth bilan autentifikatsiya
- Parolni unutdim va tiklash havolasi
- Grammatika mavzulari va interaktiv testlar
- AI bilan nemischa ovozli suhbat
- Tinglab tushunish va o‘qish mashqlari
- Yozish mashqlari + AI baholash
- Lug‘at kartochkalari (spaced repetition uslubida)
- Progress statistikasi va haftalik grafika

## O‘rnatish

1. Loyihani yuklab oling:

```bash
npm install
```

2. `.env.local` faylini `.env.local.example` dan nusxa ko‘chiring va qiymatlarni to‘ldiring:

```bash
copy .env.local.example .env.local
```

3. `.env.local` faylini quyidagi o‘zgaruvchilar bilan to‘ldiring:

- `DATABASE_URL=file:./dev.db`
- `NEXTAUTH_SECRET` — uzun va tasodifiy bo‘lgan kalit
- `NEXTAUTH_URL=http://localhost:3000`
- `GEMINI_API_KEY` — Google Gemini API kaliti
- `GOOGLE_CLIENT_ID` va `GOOGLE_CLIENT_SECRET` — agar Google kirishi kerak bo‘lsa
- `SMTP_*` — agar parolni tiklash email yuborish xizmati kerak bo‘lsa

4. Prisma migratsiyasini ishga tushiring:

```bash
npm run prisma:migrate
```

5. Loyihani ishga tushiring:

```bash
npm run dev
```

6. Brauzeringizdagi `http://localhost:3000` manzilini oching.

## Gemini API kalitini qanday olish

1. `https://aistudio.google.com` saytiga kiring.
2. Hisob oching yoki Google hisobingiz bilan kiring.
3. `API kalitlarini` bo‘limiga o‘ting va yangi `Gemini` API kalitini yarating.
4. `GEMINI_API_KEY` ni `.env.local` faylida joylashtiring.

## Ishlatish

- `npm run dev` — lokal serverni ishga tushiradi
- `npm run build` — ishlab chiqarish uchun yaratadi
- `npm run start` — `build` qilingan versiyani ishga tushiradi
- `npm run prisma:studio` — SQLite ma’lumotlar bazasini ko‘rish uchun Prisma Studio

## Eslatma

`SMTP` sozlamalari ixtiyoriy. Agar ular o‘rnatilmagan bo‘lsa, parol tiklash havolasi faqat rivojlanish muhiti uchun ekranda ko‘rsatiladi.
# deutsch
