# AarogyaSetu Pune — Integrated Rural Healthcare Platform
> **Public Healthcare Triage, Smart Facility Matching, Digital Referrals, and Continuum-of-Care Tracking for Rural Maharashtra**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Auth-3ecf8e?logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-orange?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 1. Executive Summary & Motive

In rural India, specifically across the diverse topography of Maharashtra (such as Pune District's Western Ghats talukas like Velhe, Bhor, Junnar, and Ambegaon), the public healthcare delivery chain faces critical structural hurdles:

1. **Unstructured Triage at Point-of-Care:** Sub-Centres and Primary Health Centres (PHCs) staffed by ASHA and ANM workers often lack objective, standardized triage tools to rapidly distinguish between routine outpatient illnesses and life-threatening emergencies.
2. **Tertiary Hospital Congestion:** Patients are frequently transferred directly to crowded district hospitals (e.g., Sassoon General Hospital, Pune, or YCM Hospital, Pimpri) without verifying specialist availability, bed capacity, or diagnostic readiness, causing critical delays.
3. **Paper-Based Referral Leakage:** Paper slips are routinely misplaced, transit information is lost, and doctors at referral hospitals lack prior medical history or vital measurements taken at the village level.
4. **Follow-Up Breakdown:** Post-discharge monitoring, antenatal care (ANC) regimens, and non-communicable disease (NCD/chronic illness) medication compliance are rarely tracked back to the patient's home village.
5. **Connectivity Blackspots:** Remote rural sub-centres experience intermittent or absent internet connectivity, making cloud-only solutions unviable.

### Project Mission
**AarogyaSetu Pune** solves this continuum-of-care gap by providing an **offline-first, multilingual, digital health platform** that guides front-line health workers through structured clinical triage, calculates travel- and readiness-weighted hospital recommendations, generates tamper-evident digital referral slips (with QR codes and SMS/WhatsApp notifications), and provides closed-loop follow-up tracking for ASHA workers and district administrators.

---

## 2. Core Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React 19 SPA)                     │
│  - Vite + React 19 + TypeScript (Strict typing)                        │
│  - Tailwind CSS v4 (Artistic Glassmorphic Design System)               │
│  - Motion / Lucide React / Print stylesheets (Digital Referral Slip)   │
│  - i18n Localization Engine (English, मराठी, हिंदी)                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────┐
│     OFFLINE RESILIENCE LAYER         │     │     CLINICAL ALGORITHM ENGINES    │
│  - Service Worker (Cache API)        │     │  - Rule-based Emergency Triage    │
│  - LocalStorage / IndexedDB cache    │     │  - Multi-Criteria Hospital Match  │
│  - Offline action queue (Background) │     │  - Danger Sign Detection Engine   │
└──────────────────┬───────────────────┘     └─────────────────┬─────────────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 BACKEND & PERSISTENCE (Supabase Cloud)                 │
│  - PostgreSQL Database with Row-Level Security (RLS)                   │
│  - Supabase Auth (Email/Password, Session Restore, User Metadata)      │
│  - Realtime WebSocket Channels for Live Referral Tracking              │
│  - Trigger-based user profile auto-provisioning                        │
│  - Audit Logging compliant with DPDP Act 2023                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Technology Matrix
- **Framework & Runtime:** [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Node.js 22](https://nodejs.org/)
- **Programming Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict mode, ES2022)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) with custom glassmorphism, responsive typography (`Plus Jakarta Sans` and `Noto Sans Devanagari`), and dedicated print stylesheets.
- **Icons & Motion:** `lucide-react`, `motion`
- **Database & Auth:** [Supabase](https://supabase.com/) (`@supabase/supabase-js` v2)
  - PostgreSQL schema with foreign keys, checks, indexes, and RLS policies.
  - Supabase Auth integration with session persistence and user metadata synchronization.
- **PWA & Offline-First:** Custom Service Worker (`sw.js`) supporting Cache-First asset caching, Network-First API fallbacks, and an offline dispatch queue.

---

## 3. Key Feature Modules

### 3.1. Clinical Triage Engine (`src/utils/triageEngine.ts`)
Standardized emergency assessment scoring system:
- **Red Flag Danger Signs:** Immediate detection of acute myocardial infarction, loss of consciousness, cyanosis, acute respiratory distress, severe pre-eclampsia, and uncontrollable hemorrhage.
- **Vitals Assessment:** Evaluates SpO2 (arterial saturation thresholds <90%, 90–93%), Blood Pressure (Stage 2 hypertension, hypertensive crisis, hypotension shock), Heart Rate, Respiratory Rate, and Temperature.
- **Acuity Classification:** Categorizes cases into **HIGH** (immediate red-flag transfer), **MEDIUM** (urgent specialist consult within 24h), and **LOW** (PHC / primary management).
- **Auto-Recommended Specialty:** Suggests Cardiology, Obstetrics & Gynecology, Pediatrics, General Surgery, Pulmonology, Neurology, or General Medicine.

### 3.2. Smart Facility Matching Engine (`src/utils/recommendationEngine.ts`)
Multi-criteria decision analysis (MCDA) ranking public healthcare facilities:
- **Taluka Road Distance & Travel Time:** Pre-computed distance matrices across Pune's 14 rural talukas (Haveli, Baramati, Junnar, Ambegaon, Khed, Maval, Mulshi, Velhe, Bhor, Purandar, Daund, Indapur, Shirur).
- **Specialty Department Availability:** Confirms matching clinical specialty.
- **On-Duty Specialist Doctors:** Checks real-time doctor roster and available consultation time-slots.
- **Diagnostic Facilities Readiness:** Evaluates availability of CT, MRI, Ultrasound, 24/7 Lab, Blood Bank, and Oxygen plant.
- **Live Bed Availability:** Evaluates ICU, Oxygen, and General bed availability to prevent sending patients to full facilities.

### 3.3. Digital Referral Slip & QR Verification (`src/components/DigitalReferralSlip.tsx`)
- Unique referral ID format (e.g., `REF-2026-PUN-XXXX`).
- Full clinical summary: initial vitals, symptoms, triage level, destination hospital, appointment slot, and assigned ASHA worker.
- Scannable QR code for zero-touch arrival logging at hospital OPD desks (`QrScannerModal.tsx`).
- Browser-native print-ready layout for physical backup copies in rural outposts.
- Multi-channel notification simulations (SMS / WhatsApp / In-app alerts).

### 3.4. Continuum of Care & Follow-Up Tracking (`src/components/FollowUpModule.tsx`)
- Tracks patients across status transitions: `REFERRED` ➔ `REACHED` ➔ `UNDER_TREATMENT` ➔ `COMPLETED`.
- ASHA home-visit checklist (medication adherence verification, symptom relief check, post-treatment vitals).
- Automated missed-visit alerts for patients who failed to arrive at the referral facility.

### 3.5. Specialized Rural Health Programs
- **Maternal & Child Health (MCH) Module (`src/components/MchModule.tsx`):** Antenatal Care (ANC) visit schedule (Visits 1–4), gestational age calculation, Expected Date of Delivery (EDD), and High-Risk Pregnancy (HRP) red-flag tracking.
- **Non-Communicable Diseases (NCD) Module (`src/components/ChronicDiseaseModule.tsx`):** Hypertension, Type-2 Diabetes, COPD/Asthma management, prescription refill tracking, and default alert triggers.
- **Real-Time Medicine Stock Checker (`src/components/MedicineStockChecker.tsx`):** Public facility inventory visibility for essential medicines (ORS, Paracetamol, Metformin, Amlodipine, Iron Folic Acid, Antibiotics).

### 3.6. District Health Analytics Dashboard (`src/components/DistrictAnalytics.tsx`)
- Taluka-level referral flow heatmaps and disease burden distributions.
- Average Turnaround Time (TAT) from referral creation to arrival.
- Hospital workload distribution and bed utilization analytics.
- Exportable CSV datasets for SPPU research and state public health reporting.

### 3.7. Role-Based Access Control (RBAC) & Demo Access
Tailored views for 5 health personas:
1. **Patient:** View personal health records, digital referral slips, prescriptions, and feedback submission.
2. **ASHA / ANM Health Worker:** Field patient registration, triage execution, referral generation, and follow-up logging.
3. **PHC Medical Officer:** Sub-district clinical review, teleconsultation escalation, and emergency transfers.
4. **Hospital Specialist / Doctor:** OPD queue management, QR scan arrival verification, clinical notes, and discharge prescriptions.
5. **District Health Officer / Admin:** District-wide health governance, compliance audit trails, and facility capacity monitoring.

---

## 4. Repository Structure

```
├── .env.example                     # Environment variables template
├── README.md                        # Architecture, tech stack & domain documentation
├── index.html                       # Entry HTML with SEO & font imports
├── metadata.json                    # AI Studio applet configuration & capabilities
├── package.json                     # NPM dependencies and build scripts
├── public/
│   ├── icon.svg                     # Application emblem & PWA icon
│   ├── manifest.json                # Web App Manifest for PWA installation
│   └── sw.js                        # Service Worker for offline asset caching
├── src/
│   ├── App.tsx                      # Root component, routing & global state orchestration
│   ├── main.tsx                     # Entry point (ReactDOM mounting, ServiceWorker & AuthProvider)
│   ├── index.css                    # Tailwind CSS v4 directives & glassmorphic classes
│   ├── context/
│   │   └── AuthContext.tsx          # Supabase Auth Provider (signIn, signUp, signOut, session)
│   ├── components/
│   │   ├── auth/                    # Auth UI (LoginPage, SignUpPage, ForgotPasswordPage, etc.)
│   │   ├── dashboards/              # Role-specific dashboards (Patient, ASHA, PHC, Doctor, Admin)
│   │   ├── shared/                  # Common widgets (StatCard, GlobalSearch, Notifications, Filters)
│   │   ├── TriageFlow.tsx           # Multi-step clinical triage workflow
│   │   ├── DigitalReferralSlip.tsx  # Printable referral voucher with QR code
│   │   ├── ReferralsList.tsx        # Filterable master referral registry
│   │   ├── FollowUpModule.tsx       # ASHA post-discharge follow-up module
│   │   ├── MchModule.tsx            # Maternal & Child Health (ANC) tracker
│   │   ├── ChronicDiseaseModule.tsx # NCD & chronic medication refill tracker
│   │   ├── MedicineStockChecker.tsx # Facility-level drug inventory tracker
│   │   ├── DistrictAnalytics.tsx    # District-level clinical and referral analytics
│   │   ├── AuditLogView.tsx         # DPDP compliance and audit log inspector
│   │   ├── TeleconsultationModal.tsx# Simulated doctor-to-doctor rural teleconsult
│   │   ├── QrScannerModal.tsx       # QR code reader for arrival verification
│   │   ├── OfflineBanner.tsx        # Network status indicator & offline simulator
│   │   └── BackendStatusModal.tsx   # Supabase connection tester & migration helper
│   ├── data/
│   │   ├── mockData.ts              # Seed datasets: Pune hospitals, talukas, drugs, vitals
│   │   └── demoUsers.ts             # 1-Click instant login demo accounts
│   ├── lib/
│   │   └── supabase.ts              # Supabase Client singleton & live health check
│   ├── services/
│   │   └── backendService.ts        # Database adapters, camelCase/snake_case mappers, offline queue
│   ├── types/
│   │   └── index.ts                 # Full domain TypeScript interfaces and enums
│   └── utils/
│       ├── triageEngine.ts          # Emergency clinical scoring algorithm
│       ├── recommendationEngine.ts  # Multi-criteria facility ranking algorithm
│       ├── serviceWorker.ts         # Service worker registration & offline queue helper
│       └── translations.ts          # Complete i18n dictionaries (English, Marathi, Hindi)
└── supabase/
    ├── schema.sql                   # Full PostgreSQL database schema & initial seed data
    └── auth_profiles.sql            # Auth users trigger & public.profiles RLS policies
```

---

## 5. Database Schema (Supabase PostgreSQL)

The backend utilizes PostgreSQL with Row-Level Security (RLS) enabled on all tables:

1. **`public.profiles`**: Synchronized with `auth.users` via trigger upon sign-up (`id`, `full_name`, `email`, `avatar_url`, `created_at`).
2. **`public.patients`**: Core ABHA/Health ID demographic and medical history registry.
3. **`public.referrals`**: Complete referral lifecycle records, triage results, prescriptions, and timeline logs.
4. **`public.hospitals`**: Healthcare facility directories, available specialties, diagnostic equipment, and bed availability.
5. **`public.mch_records`**: Maternal and child health records, ANC checkup milestones, and risk indicators.
6. **`public.chronic_records`**: Non-communicable disease monitoring, regimen details, and refill dates.
7. **`public.audit_logs`**: Immutable audit logs capturing user actions, timestamps, and touched records.

---

## 6. Getting Started & Development

### Prerequisites
- Node.js 20+ or 22
- npm 10+

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ashutoshsarge/Aarogya-Setu.git
   cd Aarogya-Setu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Initialize Database Tables:**
   - Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
   - In the **SQL Editor**, execute `supabase/auth_profiles.sql` to configure the authentication trigger and profile table.
   - Execute `supabase/schema.sql` to provision the clinical tables, indexes, and initial reference data.

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application runs by default on `http://localhost:3000`.

6. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 7. Compliance & Standards

- **Digital Personal Data Protection (DPDP) Act 2023:** Explicit consent capture, patient-anonymized analytics, and timestamped audit logs for all medical data access.
- **ABHA (Ayushman Bharat Health Account) Alignment:** 14-digit ABHA numbering formats and standardized district health facility codes.
- **Offline Reliability:** Fully functional in zero-connectivity environments with local storage caching and automatic background synchronization upon network recovery.
- **WCAG 2.1 Accessibility & Typography:** Supports high-contrast viewports and native Indic scripts (`Noto Sans Devanagari`).

---

## 8. License & Acknowledgments

- **License:** Apache-2.0
- **Institution:** Developed as part of the Savitribai Phule Pune University (SPPU) Community Engagement Project (CEP) for public health enhancement across Pune District, Maharashtra.
