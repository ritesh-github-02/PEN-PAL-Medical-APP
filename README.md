# PEN-PAL Platform

PEN-PAL is a federally funded healthcare research study platform built to evaluate penicillin allergy education and evaluation workflows. The platform is designed to maintain distinct separation between an interactive Intervention app and a static Control site, offering strict tracking, secure compliance, bilingual support, and configurable questionnaires.

## 🏗️ Architecture

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database ORM**: Prisma
- **Database Engine**: PostgreSQL
- **Internationalization (i18n)**: next-intl
- **Form Handling**: React Hook Form + Zod

### Core Characteristics
1. **Modular Segregation**: Clean separation between Intervention (`/app/[locale]/intervention`) and Control (`/app/[locale]/control`).
2. **Server-side Security**: Business logic, token generation, and tracking run securely via Server Actions (`actions.ts`). 
3. **Stateless Scale**: Configured for stateless scaling (`output: 'standalone'`).
4. **Research Exporting**: Custom `Papaparse` exports for dynamic event streaming directly into the CSV response.
5. **Questionnaire Engine**: JSON-driven configuration allows changing study questions without heavily refactoring the UI (`/config/questionnaire.ts`).

## 🔐 Security & Compliance Notes

This application handles sensitive medical research data. When deploying, note the following:
- **HIPAA Compliance**: While this repository offers rigid access controls (token-based study tracking instead of unencrypted PII), AWS/GCP deployments require dedicated BAAs (Business Associate Agreements) and hardened configurations (e.g., encryption at rest).
- **Token Invalidation**: Participant access URLs must expire post-evaluation.
- **Data Protection**: Store minimal PII. Do not attach names or phone numbers directly to `Participant` unless securely encrypted. Limit access to the `/admin` portal using rigid SSO mapping or Zero Trust Proxies (Cloudflare Access).

## 🚀 Development Setup

1. **Environment Variables**:
   Copy the example environment into `.env.local` or `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure you provide a valid `DATABASE_URL`. For local development, this could be a Postgres Docker container.

2. **Database Migration**:
   Before running the app, provision your database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   # Alternatively: npx prisma migrate dev
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🌐 Bilingual Strategy / Localization

The application utilizes `next-intl` to map routing seamlessly:
- `/en/intervention` -> Loads `messages/en.json`
- `/es/intervention` -> Loads `messages/es.json`

Translation bundles reside in `/messages`. Update text dictionaries there.

## 🌱 Sample Seed Data

To test the Intervention entry form without real data, use the Prisma CLI to seed a test token or manually create records in PostgreSQL:
```sql
INSERT INTO "Participant" (id, "groupId", "status", "createdAt", "updatedAt") 
VALUES ('demo-part-1', 'INTERVENTION', 'ACTIVE', NOW(), NOW());

INSERT INTO "ParticipantToken" (id, token, "participantId", "status", "createdAt", "updatedAt") 
VALUES ('token-1', 'TEST-TOKEN-123', 'demo-part-1', 'VALID', NOW(), NOW());
```

## 📦 Deployment (AWS / Vercel / GCP)

This codebase builds cleanly for modern serverless (Vercel) or containerized (Cloud Run / AWS Fargate) environments.
- During build, Next.js requires the `DATABASE_URL` for typing and pre-rendering if layout routes rely explicitly on Prisma (all sensitive calls are deferred to actions so standard standalone deployments do not suffer static build halts).
- Ensure that instances have the Prisma binary cached. 
