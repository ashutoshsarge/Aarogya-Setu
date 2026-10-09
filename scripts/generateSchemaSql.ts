import fs from 'fs';
import path from 'path';

const ddl = `-- ====================================================================
-- AAROGYA-SETU BACKEND DATABASE SCHEMA
-- Project ID: tvxzsdzowbrnpoeqyyft
-- Description: Digital Triage, Emergency Red-Flag Referral & Public Health Registry
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Linked to Supabase Auth & Demo Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'health_worker', 'doctor', 'phc_doctor', 'admin')),
  health_id TEXT,
  mobile TEXT,
  email TEXT,
  facility TEXT,
  taluka TEXT,
  village TEXT,
  specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Rural Patients Registry
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
  health_id TEXT UNIQUE NOT NULL,
  abha_number TEXT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  mobile TEXT NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  aadhaar_last4 TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  existing_conditions JSONB DEFAULT '[]'::jsonb,
  chronic_diseases JSONB DEFAULT '[]'::jsonb,
  vitals JSONB DEFAULT '{}'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  current_medications JSONB DEFAULT '[]'::jsonb,
  consent_given BOOLEAN DEFAULT true,
  registered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Hospital & Health Facility Network
CREATE TABLE IF NOT EXISTS public.hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  taluka TEXT NOT NULL,
  village TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  distance_km_by_taluka JSONB DEFAULT '{}'::jsonb,
  available_specialties JSONB DEFAULT '[]'::jsonb,
  on_duty_doctors JSONB DEFAULT '[]'::jsonb,
  diagnostic_facilities JSONB DEFAULT '[]'::jsonb,
  medicine_stock JSONB DEFAULT '[]'::jsonb,
  bed_availability JSONB DEFAULT '{"icuBeds": 0, "oxygenBeds": 0, "generalBeds": 0}'::jsonb,
  has_teleconsultation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Digital Referral Slips & Clinical Triage Vouchers
CREATE TABLE IF NOT EXISTS public.referrals (
  id TEXT PRIMARY KEY,
  referral_number TEXT UNIQUE NOT NULL,
  patient_id TEXT,
  patient_name TEXT NOT NULL,
  patient_age INTEGER NOT NULL,
  patient_gender TEXT NOT NULL,
  patient_health_id TEXT NOT NULL,
  patient_village TEXT NOT NULL,
  patient_taluka TEXT NOT NULL,
  patient_mobile TEXT NOT NULL,
  referring_facility TEXT NOT NULL,
  referring_health_worker TEXT NOT NULL,
  destination_hospital_id TEXT NOT NULL,
  destination_hospital_name TEXT NOT NULL,
  destination_taluka TEXT NOT NULL,
  alternative_hospital JSONB,
  triage_result JSONB NOT NULL,
  symptoms JSONB NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_slot TEXT NOT NULL,
  is_teleconsultation BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'REFERRED' CHECK (status IN ('REFERRED', 'REACHED', 'UNDER_TREATMENT', 'COMPLETED')),
  timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  reached_at TIMESTAMPTZ,
  under_treatment_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  doctor_notes TEXT,
  treating_doctor_name TEXT,
  prescriptions JSONB DEFAULT '[]'::jsonb,
  test_results_summary TEXT,
  follow_up_date TEXT,
  follow_up_status TEXT DEFAULT 'PENDING' CHECK (follow_up_status IN ('PENDING', 'DONE', 'MISSED_ALERT')),
  follow_up_checklist JSONB,
  feedback JSONB
);

-- 6. Maternal & Child Health (MCH) Antenatal Cohort
CREATE TABLE IF NOT EXISTS public.mch_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  health_id TEXT NOT NULL,
  age INTEGER NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  lmp_date TEXT NOT NULL,
  edd_date TEXT NOT NULL,
  gestational_weeks INTEGER NOT NULL,
  gravida INTEGER NOT NULL,
  parity INTEGER NOT NULL,
  is_high_risk BOOLEAN DEFAULT false,
  high_risk_reasons JSONB DEFAULT '[]'::jsonb,
  anc_visits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Non-Communicable Chronic Disease Registry (Hypertension, Diabetes, COPD)
CREATE TABLE IF NOT EXISTS public.chronic_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  health_id TEXT NOT NULL,
  age INTEGER NOT NULL,
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  disease_type TEXT NOT NULL,
  regimen TEXT NOT NULL,
  last_reading TEXT NOT NULL,
  next_refill_date TEXT NOT NULL,
  next_checkup_date TEXT NOT NULL,
  status TEXT DEFAULT 'UP_TO_DATE' CHECK (status IN ('UP_TO_DATE', 'REFILL_DUE', 'OVERDUE')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Clinical Compliance & Audit Trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  actor TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT NOT NULL
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_patients_health_id ON public.patients(health_id);
CREATE INDEX IF NOT EXISTS idx_patients_taluka ON public.patients(taluka);
CREATE INDEX IF NOT EXISTS idx_referrals_number ON public.referrals(referral_number);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_destination ON public.referrals(destination_hospital_id);
CREATE INDEX IF NOT EXISTS idx_referrals_patient ON public.referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_mch_health_id ON public.mch_records(health_id);
CREATE INDEX IF NOT EXISTS idx_chronic_health_id ON public.chronic_records(health_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chronic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read & write for anonymous and authenticated users for frictionless healthcare operations
DO $$ 
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
  DROP POLICY IF EXISTS "Public profiles insert" ON public.profiles;
  DROP POLICY IF EXISTS "Public profiles update" ON public.profiles;
  CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
  CREATE POLICY "Public profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE USING (true);

  -- Patients
  DROP POLICY IF EXISTS "Public patients read" ON public.patients;
  DROP POLICY IF EXISTS "Public patients insert" ON public.patients;
  DROP POLICY IF EXISTS "Public patients update" ON public.patients;
  CREATE POLICY "Public patients read" ON public.patients FOR SELECT USING (true);
  CREATE POLICY "Public patients insert" ON public.patients FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public patients update" ON public.patients FOR UPDATE USING (true);

  -- Hospitals
  DROP POLICY IF EXISTS "Public hospitals read" ON public.hospitals;
  DROP POLICY IF EXISTS "Public hospitals insert" ON public.hospitals;
  DROP POLICY IF EXISTS "Public hospitals update" ON public.hospitals;
  CREATE POLICY "Public hospitals read" ON public.hospitals FOR SELECT USING (true);
  CREATE POLICY "Public hospitals insert" ON public.hospitals FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public hospitals update" ON public.hospitals FOR UPDATE USING (true);

  -- Referrals
  DROP POLICY IF EXISTS "Public referrals read" ON public.referrals;
  DROP POLICY IF EXISTS "Public referrals insert" ON public.referrals;
  DROP POLICY IF EXISTS "Public referrals update" ON public.referrals;
  CREATE POLICY "Public referrals read" ON public.referrals FOR SELECT USING (true);
  CREATE POLICY "Public referrals insert" ON public.referrals FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public referrals update" ON public.referrals FOR UPDATE USING (true);

  -- MCH Records
  DROP POLICY IF EXISTS "Public mch read" ON public.mch_records;
  DROP POLICY IF EXISTS "Public mch insert" ON public.mch_records;
  DROP POLICY IF EXISTS "Public mch update" ON public.mch_records;
  CREATE POLICY "Public mch read" ON public.mch_records FOR SELECT USING (true);
  CREATE POLICY "Public mch insert" ON public.mch_records FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public mch update" ON public.mch_records FOR UPDATE USING (true);

  -- Chronic Records
  DROP POLICY IF EXISTS "Public chronic read" ON public.chronic_records;
  DROP POLICY IF EXISTS "Public chronic insert" ON public.chronic_records;
  DROP POLICY IF EXISTS "Public chronic update" ON public.chronic_records;
  CREATE POLICY "Public chronic read" ON public.chronic_records FOR SELECT USING (true);
  CREATE POLICY "Public chronic insert" ON public.chronic_records FOR INSERT WITH CHECK (true);
  CREATE POLICY "Public chronic update" ON public.chronic_records FOR UPDATE USING (true);

  -- Audit Logs
  DROP POLICY IF EXISTS "Public audit read" ON public.audit_logs;
  DROP POLICY IF EXISTS "Public audit insert" ON public.audit_logs;
  CREATE POLICY "Public audit read" ON public.audit_logs FOR SELECT USING (true);
  CREATE POLICY "Public audit insert" ON public.audit_logs FOR INSERT WITH CHECK (true);
END $$;

-- Enable Realtime for Referrals and Patients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'referrals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'patients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Publication might not exist in local/mock environments
END $$;

-- ====================================================================
-- SEED DATA (Hospitals, Patients, Referrals, MCH, Chronic & Audit)
-- ====================================================================
`;

const seedPath = path.resolve(process.cwd(), 'supabase/seed.sql');
const seedContent = fs.existsSync(seedPath) ? fs.readFileSync(seedPath, 'utf8') : '';

const fullSchema = ddl + '\n' + seedContent;
const schemaPath = path.resolve(process.cwd(), 'supabase/schema.sql');
fs.writeFileSync(schemaPath, fullSchema);
console.log('Successfully created complete schema.sql at:', schemaPath, 'Total bytes:', fullSchema.length);
