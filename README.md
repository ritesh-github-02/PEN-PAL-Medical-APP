# PEN-PAL — Project Build, Hosting & Deployment Documentation

## 1. Project Overview

**PEN-PAL** is a Next.js web application backed by PostgreSQL and Prisma ORM. The application can be deployed in two university-hosting scenarios:

1. **University provides only the university domain; the application is hosted on our AWS infrastructure.**
2. **University provides the domain and requires the application to be hosted on the university's own server/infrastructure.**

The application architecture is designed so that the domain, application server, and PostgreSQL database can be managed independently.

---

# 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js / React / TypeScript |
| Backend | Next.js App Router / API Routes / Server Actions |
| ORM | Prisma |
| Database | PostgreSQL |
| Cloud Database Option | Neon PostgreSQL |
| Hosting — Scenario 1 | AWS |
| Hosting — Scenario 2 | University Server |
| Web Server | Nginx (recommended for server-based deployment) |
| Process Manager | PM2 (recommended for Node.js server deployment) |
| Domain | University-provided domain/subdomain |
| SSL | HTTPS / TLS certificate |
| Source Control | Git / GitHub |

> **Important:** The PostgreSQL connection string contains database credentials. Never commit the real `DATABASE_URL` to GitHub or place it in client-side code. If a real database password has previously been exposed publicly, rotate that database password before production deployment.

---

# 3. High-Level Architecture

```text
                         UNIVERSITY DOMAIN
                                |
                                | HTTPS
                                v
                    +-----------------------+
                    | DNS / Domain Provider |
                    +-----------+-----------+
                                |
                 +--------------+--------------+
                 |                             |
                 v                             v
        SCENARIO 1: AWS              SCENARIO 2: UNIVERSITY
        Application Hosting          Application Hosting
                 |                             |
                 v                             v
        +----------------+           +---------------------+
        | AWS Web Server |           | University Server   |
        | Next.js        |           | Next.js             |
        | Nginx + PM2    |           | Nginx + PM2         |
        +-------+--------+           +----------+----------+
                |                               |
                +---------------+---------------+
                                |
                                v
                     +----------------------+
                     | PostgreSQL Database  |
                     | Neon / AWS RDS /     |
                     | University PostgreSQL|
                     +----------------------+
```

The university domain points to whichever environment the university selects. The Next.js application communicates with PostgreSQL through Prisma using the server-side `DATABASE_URL` environment variable.

---

# 4. Scenario 1 — University Domain + AWS Hosting

## 4.1 What this scenario means

The university gives us a domain or subdomain, for example:

```text
penpal.university.edu
```

The university does **not** host the application. The application runs on our AWS infrastructure.

The university only needs to configure DNS so that the university domain points to our AWS endpoint.

## 4.2 Scenario 1 Flow

```text
University Domain
      |
      | DNS record
      v
AWS Public IP / Load Balancer
      |
      v
Nginx / HTTPS
      |
      v
Next.js Application
      |
      | Prisma
      v
PostgreSQL / Neon
```

## 4.3 Implementation Steps

### Step 1 — Prepare the production application

Make sure the project builds successfully locally:

```bash
npm install
npx prisma generate
npm run build
```

Run the production server locally to verify the build:

```bash
npm start
```

### Step 2 — Prepare PostgreSQL

Use a production PostgreSQL database. The database can be hosted by:

- Neon PostgreSQL
- AWS RDS PostgreSQL
- Another approved managed PostgreSQL provider

Create a production database and keep its connection string private.

Example `.env` structure:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXT_PUBLIC_APP_URL="https://penpal.university.edu"
ADMIN_SECRET="YOUR_SECURE_SECRET"
```

Do not commit `.env` to Git.

### Step 3 — Configure Prisma

Generate the Prisma client:

```bash
npx prisma generate
```

Apply the production database schema using the project's selected migration strategy. For a migration-based production workflow:

```bash
npx prisma migrate deploy
```

If the project intentionally uses `db push` instead of migrations, use that only according to the project's database-management policy.

### Step 4 — Create the AWS server

A server-based deployment can use an AWS EC2 instance.

Recommended high-level setup:

```text
AWS EC2
 ├── Ubuntu/Linux
 ├── Node.js LTS
 ├── Git
 ├── Nginx
 ├── PM2
 └── Next.js application
```

### Step 5 — Deploy the code to AWS

Example workflow:

```bash
git clone <repository-url>
cd pen-pal
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

### Step 6 — Start Next.js with PM2

```bash
pm2 start npm --name pen-pal -- start
pm2 save
pm2 startup
```

### Step 7 — Configure Nginx

Nginx receives public HTTPS requests and forwards them to the Next.js application.

```text
Internet
   |
   v
HTTPS :443
   |
   v
Nginx
   |
   | proxy
   v
Next.js :3000
```

### Step 8 — Configure the university DNS

The university's DNS administrator creates the required record.

For an EC2 public IP, this is commonly an `A` record:

```text
Type: A
Name: penpal
Value: <AWS_PUBLIC_IP>
```

If AWS provides a hostname/load balancer endpoint, the university may instead configure the appropriate `CNAME`/alias record according to its DNS system.

### Step 9 — Configure HTTPS

The production site must use HTTPS:

```text
https://penpal.university.edu
```

The TLS certificate can be managed using an AWS certificate/load-balancer setup or directly on Nginx with an approved certificate-management method.

### Step 10 — Verify the complete system

Test:

```text
University Domain
       |
       v
HTTPS
       |
       v
AWS
       |
       v
Next.js
       |
       v
Prisma
       |
       v
PostgreSQL
```

Verify authentication, application pages, API routes, database reads/writes, admin functionality, exports, and HTTPS.

---

# 5. Scenario 2 — University Domain + University Server

## 5.1 What this scenario means

The university provides:

- The university domain/subdomain
- A server or VM where the application must run
- Network/firewall access required for the application
- Server administration or access credentials

In this scenario, our AWS application server is not required for the web application.

## 5.2 Scenario 2 Flow

```text
University Domain
      |
      | DNS
      v
University Firewall / Load Balancer
      |
      v
University Server
      |
      +--> Nginx / HTTPS
      |
      +--> Next.js + PM2
      |
      v
PostgreSQL
```

## 5.3 Implementation Steps

### Step 1 — Obtain server requirements from the university

Confirm:

- Operating system
- CPU / RAM / disk
- Node.js version policy
- Whether SSH access is available
- Whether Docker is permitted
- Whether Nginx or another reverse proxy is already installed
- Firewall rules
- Required inbound ports
- Outbound internet access
- PostgreSQL availability
- SSL certificate process
- Backup policy
- Monitoring/logging requirements

### Step 2 — Prepare the server

Install the required runtime and tools according to university policy:

```text
Node.js LTS
npm
Git
Nginx
PM2
```

If Docker is approved, the application can instead be packaged and deployed as a Docker container.

### Step 3 — Deploy the project

```bash
git clone <repository-url>
cd pen-pal
npm install
npx prisma generate
```

Configure the production environment variables on the server.

### Step 4 — Configure PostgreSQL

There are two common database placements:

**Option A — University PostgreSQL**

```text
University Server --> University PostgreSQL
```

**Option B — Managed PostgreSQL such as Neon**

```text
University Server --> Secure Internet Connection --> Neon PostgreSQL
```

The choice depends on the university's security, compliance, network, and data-hosting requirements.

### Step 5 — Apply the database schema

For migration-based production deployment:

```bash
npx prisma migrate deploy
```

Then build the application:

```bash
npm run build
```

### Step 6 — Start the application

```bash
pm2 start npm --name pen-pal -- start
pm2 save
```

### Step 7 — Configure Nginx

```text
University Internet
       |
       v
HTTPS :443
       |
       v
Nginx
       |
       v
Next.js :3000
       |
       v
PostgreSQL
```

### Step 8 — Configure the university DNS

The DNS record points the university hostname to the university's public IP, load balancer, or approved reverse proxy.

Example:

```text
Type: A
Name: penpal
Value: <UNIVERSITY_PUBLIC_IP>
```

The exact record depends on the university's DNS architecture.

### Step 9 — Configure HTTPS

The university's IT/security team should provide or approve the TLS certificate and certificate-renewal process.

The final URL should be:

```text
https://penpal.university.edu
```

### Step 10 — Verify production

Test:

- DNS resolution
- HTTPS certificate
- Next.js pages
- API routes
- Prisma database connection
- Authentication/session behavior
- Database writes and reads
- Admin features
- CSV exports
- Logs and monitoring
- Restart/recovery behavior

---

# 6. Scenario 1 vs Scenario 2

| Item | Scenario 1 — AWS | Scenario 2 — University Server |
|---|---|---|
| Domain | University | University |
| Application hosting | AWS | University infrastructure |
| Web server | AWS server / Nginx | University server / Nginx |
| Next.js | AWS | University server |
| Database | Neon / AWS RDS / approved PostgreSQL | University PostgreSQL or approved managed PostgreSQL |
| DNS managed by | University | University |
| SSL | AWS or approved certificate setup | University IT/security process |
| Server maintenance | Our team/cloud operations | University IT + project team as agreed |
| AWS application server required | Yes | No |
| Main dependency | AWS availability + DNS configuration | University infrastructure + network policy |

---

# 7. Recommended Production Architecture

## Scenario 1

```text
                    +----------------------+
                    | University DNS       |
                    | penpal.university.edu|
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | AWS                  |
                    | EC2 / Load Balancer  |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Nginx + HTTPS        |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Next.js / Node.js    |
                    | PM2                  |
                    +----------+-----------+
                               |
                               | Prisma
                               v
                    +----------------------+
                    | PostgreSQL           |
                    | Neon / AWS RDS       |
                    +----------------------+
```

## Scenario 2

```text
                    +----------------------+
                    | University DNS       |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | University Firewall  |
                    | / Load Balancer      |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | University Server    |
                    | Nginx + HTTPS        |
                    | Next.js + PM2        |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | PostgreSQL           |
                    | University / Managed |
                    +----------------------+
```

---

# 8. Complete Project Build Flow

```text
1. Develop
   |
   v
2. Test Locally
   |
   v
3. Configure PostgreSQL
   |
   v
4. Configure Prisma
   |
   v
5. Run Database Migrations
   |
   v
6. Git Commit / Push
   |
   v
7. Choose Hosting Scenario
   |
   +------------------------------+
   |                              |
   v                              v
AWS Hosting                 University Hosting
   |                              |
   v                              v
Deploy Server                Prepare University Server
   |                              |
   +--------------+---------------+
                  |
                  v
            Install Dependencies
                  |
                  v
              npm run build
                  |
                  v
            Start Next.js App
                  |
                  v
             Configure Nginx
                  |
                  v
             Configure HTTPS
                  |
                  v
              Configure DNS
                  |
                  v
             Production Test
                  |
                  v
               GO LIVE
```

---

# 9. Local Development Setup

## Prerequisites

Use a supported Node.js LTS version for the project's Next.js/Prisma versions. The project should avoid using an unsupported Node.js version with an older Prisma release.

Install:

- Node.js LTS
- npm
- Git
- PostgreSQL or access to Neon PostgreSQL

## Install dependencies

```bash
cd D:\pen-pal\pen-pal
npm install
```

## Environment variables

Create `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_SECRET="YOUR_SECURE_SECRET"
```

Never commit the real `.env` file.

## Generate Prisma Client

```bash
npx prisma generate
```

## Database setup

For a migration-based project:

```bash
npx prisma migrate dev
```

For a project intentionally using schema push during development:

```bash
npx prisma db push
```

## Start development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 10. Production Build Commands

The normal production build flow is:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

If migrations are not used by the project's approved database workflow, replace the migration command with the approved schema-deployment command.

---

# 11. Environment Variables by Environment

## Local

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_SECRET="..."
```

## AWS Production

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://penpal.university.edu"
ADMIN_SECRET="..."
```

## University Production

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://penpal.university.edu"
ADMIN_SECRET="..."
```

The production secrets must be stored securely on the hosting server or approved secret-management system.

---

# 12. Domain and DNS Process

The domain process is the same conceptually in both scenarios:

```text
1. University approves hostname
        |
        v
2. University provides DNS access/process
        |
        v
3. Hosting team provides target IP/hostname
        |
        v
4. University creates DNS record
        |
        v
5. DNS propagates
        |
        v
6. HTTPS certificate configured
        |
        v
7. Domain opens the Next.js application
```

Example hostname:

```text
penpal.university.edu
```

Do not assume the exact DNS record type until the university's DNS/IT team confirms whether it uses an IP address, load balancer, reverse proxy, or another approved routing mechanism.

---

# 13. PostgreSQL + Prisma Architecture

```text
Next.js Server
      |
      v
Prisma Client
      |
      | DATABASE_URL
      v
PostgreSQL
      |
      +--> Participants
      +--> Tokens
      +--> Sessions
      +--> Questionnaire Responses
      +--> Slide Metrics
      +--> Survey Responses
      +--> Event Logs
```

Prisma is responsible for database access from the server-side application. The browser must never receive the private PostgreSQL connection string.

---

# 14. Security Checklist

Before production:

- [ ] HTTPS enabled
- [ ] Production secrets stored securely
- [ ] Real database password rotated if it was exposed
- [ ] `.env` excluded from Git
- [ ] PostgreSQL network access restricted
- [ ] Database backups configured
- [ ] Admin secret configured securely
- [ ] Firewall/security-group rules reviewed
- [ ] Only required ports exposed
- [ ] Node.js and dependencies updated according to the project's compatibility policy
- [ ] Prisma migrations reviewed
- [ ] Application logs configured
- [ ] Server restart/recovery tested
- [ ] DNS and SSL tested

---

# 15. Production Testing Checklist

### Application

- [ ] Homepage loads
- [ ] All required routes work
- [ ] Mobile layout works
- [ ] Desktop layout works
- [ ] Forms work
- [ ] API routes work

### Database

- [ ] PostgreSQL connection succeeds
- [ ] Prisma client works
- [ ] Read operations work
- [ ] Write operations work
- [ ] Migrations are applied

### Hosting

- [ ] Domain resolves
- [ ] HTTPS works
- [ ] Nginx/reverse proxy works
- [ ] Next.js process stays running
- [ ] Server restart restores the application

### Security

- [ ] Secrets are not exposed
- [ ] Database is not publicly open unnecessarily
- [ ] Admin routes are protected
- [ ] Logs do not expose credentials

---

# 16. Final Deployment Decision

## Option 1 — University Domain + AWS Hosting

Use this when the university is comfortable providing the domain/DNS while allowing the project team to operate the application infrastructure on AWS.

```text
University
   |
   +--> Domain / DNS

Our Team
   |
   +--> AWS
        +--> Next.js
        +--> Nginx
        +--> PM2

Database
   |
   +--> Neon / AWS RDS / Approved PostgreSQL
```

## Option 2 — University Domain + University Server

Use this when university policy requires the application to remain inside university-controlled infrastructure.

```text
University
   |
   +--> Domain / DNS
   +--> Server
   +--> Firewall
   +--> HTTPS
   +--> PostgreSQL (if required)

Our Team
   |
   +--> Application deployment
   +--> Next.js configuration
   +--> Prisma configuration
   +--> Application maintenance
```

---

# 17. Go-Live Sequence

```text
                    START
                      |
                      v
              Finalize Application
                      |
                      v
               Finalize Database
                      |
                      v
             Run Production Build
                      |
                      v
              Security Review
                      |
                      v
             Choose Hosting Model
                 /          \
                /            \
               v              v
          AWS Hosting    University Hosting
               |              |
               v              v
          Deploy App      Deploy App
               |              |
               +------+-+-----+
                      |
                      v
                 Configure DNS
                      |
                      v
                Configure HTTPS
                      |
                      v
                Production Test
                      |
                      v
                    GO LIVE
                      |
                      v
              Monitoring + Backup
```

---

# 18. Operational Ownership

| Responsibility | AWS Scenario | University Server Scenario |
|---|---|---|
| Domain | University | University |
| DNS | University / joint coordination | University |
| Application code | Project team | Project team |
| Application deployment | Project team | Project team / university coordination |
| Server | Project team / AWS | University IT |
| OS patching | Project team / AWS process | University IT |
| Database | Approved DB owner | University or approved DB owner |
| SSL | Project team / AWS | University IT or approved certificate owner |
| Backups | AWS/DB owner | University/DB owner |
| Monitoring | Project team | Shared / university policy |

---

# 19. Summary

The PEN-PAL Next.js application can be deployed under either university hosting model without changing the core application architecture.

**Scenario 1:** The university owns/provides the domain, while the application runs on AWS. DNS points the university hostname to the AWS infrastructure, and the Next.js application connects to PostgreSQL through Prisma.

**Scenario 2:** The university owns/provides both the domain and application server. DNS points to the university infrastructure, Nginx forwards requests to Next.js, and Prisma connects to PostgreSQL hosted either by the university or an approved managed PostgreSQL provider.

The recommended implementation sequence is:

```text
Build → Test → PostgreSQL → Prisma → Production Build →
Hosting Setup → DNS → HTTPS → Production Test → Go Live → Monitoring/Backup
```
