# PEN-PAL Project Flow & Architecture Document

Welcome to the **PEN-PAL** (Parents Engaged in Penicillin Allergies) project documentation. This document details the application's overall structure, system-wide interaction flows, and the cryptographic **Token Security & Session Lifecycle System** (which manages participant authentication).

---

## 1. Directory Structure

Below is an overview of the key directories and files in the Next.js 15 (App Router) codebase:

```text
pen-pal/
├── app/                        # Next.js App Router Root
│   ├── [locale]/               # Routing wrapper for next-intl (bilingual ES/EN support)
│   │   ├── admin/              # Admin Telemetry & Cohort Portal
│   │   │   ├── page.tsx        # Dashboard (cohort metrics, audit logs, CSV exporting)
│   │   │   └── actions.ts      # Server Actions for metrics and revoking tokens
│   │   ├── intervention/       # Parent/Participant Portal
│   │   │   ├── page.tsx        # Token Verification / Generation entry page
│   │   │   ├── actions.ts      # Server Actions for token generation, validation, and sessions
│   │   │   ├── flow/           # Renders the interactive questionnaire wizard
│   │   │   │   └── page.tsx    # Mounts PenpalIntervention.tsx
│   │   │   ├── report/         # Final clinical report page for doctor consultations
│   │   │   │   └── page.tsx    # Renders summaries, guidance, and print layouts
│   │   │   └── survey/         # Post-intervention SUS (System Usability Scale) survey
│   │   │       └── page.tsx    # Survey questions, validation, and logout handlers
│   │   └── page.tsx            # Root landing page (links to Control, Intervention, Admin)
│   ├── api/                    # REST / API Endpoint Routes
│   │   ├── export/             # CSV exports gateway (responses and telemetry event logs)
│   │   │   └── route.ts        # Dynamic CSV generation using Papaparse
│   │   └── survey/             # Receives post-intervention feedback
│   │       └── route.ts        # Updates session status to COMPLETED and stores survey JSON
│   └── globals.css             # Tailwind CSS styles and theme variables
│
├── components/                 # Reusable React UI Components
│   ├── common/                 # Global UI widgets (Loader, etc.)
│   └── questionnaire/          # Modules driving the clinical wizard
│       ├── AudioPlayer.tsx     # Voiceover system (supports custom speeds and view logging)
│       ├── PenpalIntervention.tsx # Flow manager, handles local progress fallback and step transitions
│       ├── QuestionnaireEngine.tsx # Layout renderer for choice, slider, and narrative screens
│       └── actions.ts          # Server Actions (submitAnswer, loadQuestionnaireProgress, IP binding)
│
├── config/                     # Static Configuration
│   └── questionnaire.ts        # JSON schema defining the wizard questions, logic, and audio assets
│
├── lib/                        # Core Library Utilities & Middleware
│   ├── prisma.ts               # Shared Prisma DB Client singleton
│   ├── rate-limit.ts           # Thread-safe, in-memory sliding-window rate limiter
│   ├── security.ts             # Cryptographic operations (HMAC signatures, Base32, SHA-256)
│   ├── tracking.ts             # Server Action for logging event metrics (EventLog)
│   └── utils.ts                # Tailwind CSS styling mergers
│
├── messages/                   # Translation bundles for next-intl
│   ├── en.json                 # English dictionaries
│   └── es.json                 # Spanish dictionaries
│
├── prisma/                     # Database Configuration
│   └── schema.prisma           # Prisma Schema defining Postgres SQL models
└── scripts/                    # CLI scripts (create-token, cleanup-expired-tokens)
```

---

## 2. Core Application Flows

The application is split into three main pathways: the **Control Site** (static parent education), the **Intervention Site** (interactive parent assessment wizard), and the **Admin Telemetry Portal**.

### A. Participant Entry & Token Authentication Flow

1. **Access with an existing Token**: The participant enters their raw token. The app triggers `validateAndConsumeToken()`.
2. **Request Token via Research ID (Self-Service)**: The participant enters a Research ID. The app calls `generateSecureUrl()`.
   - If the participant exists, it reconstructs the token and returns it.
   - If new, it creates the participant and generates/hashes/signs a secure token, storing it in the database and returning the raw value.
3. **Consumption**: The user enters the token, triggering rate-limiting, HMAC check, TTL verification, and atomic update transactions. A session is created, set in secure cookies, and the user enters the study.

---

### B. Interactive Questionnaire & Telemetry Flow

The questionnaire is dynamically populated from `config/questionnaire.ts`. This enables researchers to edit question wording, add options, or configure branching logic without rewriting UI code.

1. **Restoring Progress**: When mounting `PenpalIntervention.tsx`, the client invokes `loadQuestionnaireProgress()`.
   - The server verifies session cookies and checks client IP-binding.
   - It fetches all stored questionnaire responses for the participant.
   - It computes the furthest completed step by tracing logic rules in the questionnaire config.
   - If server-side database retrieval fails, it falls back to parsing cached answers in `localStorage`.
2. **Telemetry Logging**: For every screen viewed or answer selected:
   - The UI calls `submitAnswer()` to write the response values to `QuestionnaireResponse`.
   - The UI runs `logInteraction()` to write telemetry events (e.g. `QUESTION_VIEW`, `QUESTION_ANSWER`, `AUDIO_PLAY`) directly to `EventLog` for audit tracking.

---

### C. Completion Flow (Report & Survey)

1. **Final Report Page**: Renders the participant's symptoms and identified conditions based on answers, providing printable advice templates.
2. **Proceed to Survey**: The participant clicks to proceed to the usability evaluation.
3. **POST /api/survey**: Stores survey responses, completes the session and consumed tokens.
4. **Exit/Logout**: Clears HTTP-only cookies and redirects the user home.

---

## 3. Cryptographic Token Security & Lifecycle System

To avoid collecting Personally Identifiable Information (PII) like parent names or phone numbers, PEN-PAL uses a secure, ticket-based token authentication mechanism.

### A. Token Wire Format
The issued token utilizes the following structure:
$$PEN - \{Base32RandomString\}$$

*   **Prefix (`PEN`)**: A static visual marker.
*   **Payload (`{Base32RandomString}`)**:
    *   `Base32RandomString`: A 6-character string generated from cryptographically secure random bytes. Base32 alphabet `[A-Z2-7]` is used to remain URL-safe.
    *   Total Length: Exactly 10 characters (e.g. `PEN-ABCDEF`).
    *   Legacy tokens (`PEN-{participantId}:{8Base32}-{64HexHMAC}`) are also supported for backward compatibility.

### B. Database Storage Strategy (Plaintext Storage)
For development transparency and ease of auditing/management in Prisma Studio, tokens are stored in plaintext in the database. The `ParticipantToken` model contains:
*   `tokenPayload`: Stored in plaintext (e.g. `ABCDEF`).
*   `hmacTag`: Stored in plaintext (empty for short tokens, containing signature for legacy tokens).
*   `tokenHash`: Stores the **actual raw token** in plaintext (e.g. `PEN-ABCDEF`).

When validating a token, the server queries the database for `tokenHash` matching the normalized token string directly.

---

### C. Security Controls and Gates (Server-Enforced)

The `validateAndConsumeToken` Server Action enforces a series of consecutive security checks:

1. **Gate 1: Rate Limiter**: Checked using `checkRateLimit` based on IP and User-Agent. Max 15 validation attempts per minute. Prevents brute-forcing.
2. **Gate 2: Parse Regex**: Validates formatting matching the short or legacy format regex.
3. **Gate 3: HMAC Signature Check (Legacy Only)**: Verifies the HMAC signature using `verifyTokenCrypto` for legacy tokens. Short tokens skip this step as they are checked directly by database lookup.
4. **Gate 4: Database Hash Lookup**: Computes SHA-256 and searches `tokenHash` in the DB.
5. **Gate 5: Status Validation**: Rejects tokens whose status is not `PENDING` or `ACTIVE`.
6. **Gate 6: Expiry Date Validation**: Rejects expired tokens.
7. **Gate 7: Use Limit Audit**: Rejects if use count meets limit.
8. **Atomic Prisma Transaction**: Marks the token as CONSUMED and creates the Session.

#### Session IP-Fingerprint Binding (Anti-Hijacking)
When a session is successfully established, the server extracts the participant's current IP address and stores a fingerprint of it in the `Session` model using `ipOctetPrefix` (the first 3 octets, e.g. `192.168.1`).
During subsequent requests (e.g. loading progress, saving answers, displaying the report):
*   The system compares the current client IP prefix with the fingerprint stored during the initial login transaction.
*   If a mismatch is detected, the request is rejected with a `SESSION_IP_MISMATCH` log.
*   This protects participants from session hijacking if their access URL is shared or intercepted by another user on a different network.

#### Atomic Single-Use Lock
To prevent double-spend or concurrent race condition attacks, the transition of a token to `CONSUMED` and the creation of a `Session` are executed inside a database transaction (`prisma.$transaction`).
If two concurrent requests attempt to validate the same token simultaneously, the transaction will fail to update on one of the threads, resulting in a rejection with the code `TOKEN_CONCURRENT_CONSUMED`.

---

## 4. Telemetry Logging and Security Audit Ledger

The system logs all core activities to build an audit trail.

### A. EventLog (User Telemetry)
Chronologically tracks behavioral events. Main metrics exported by `/api/export`:
*   `TOKEN_VALIDATED` / `TOKEN_INVALID`
*   `SESSION_START`
*   `QUESTION_VIEW` / `QUESTION_ANSWER`
*   `AUDIO_PLAY`

### B. TokenSecurityEvent (Security Audit Ledger)
Stores security anomalies and lifecycle events:
*   `TOKEN_ISSUED`: A new secure token was written.
*   `TOKEN_RETRIEVED_EXISTING`: A user requested their token via Research ID again.
*   `TOKEN_VALIDATED`: Verification passed.
*   `TOKEN_CONSUMED`: Transaction completed and session started.
*   `TOKEN_EXPIRED`: Rejection due to lifespan timeout.
*   `TOKEN_ALREADY_USED` / `TOKEN_OVERUSED`: Rejection due to previous consumption.
*   `TOKEN_TAMPERED`: Rejection due to cryptographic signature mismatch.
*   `TOKEN_GEN_RATE_LIMITED` / `TOKEN_VALIDATE_RATE_LIMITED`: Rejection due to rate limits.
*   `SESSION_IP_MISMATCH`: Security warning for network environment mismatch.
