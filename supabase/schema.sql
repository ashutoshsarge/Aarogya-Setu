-- ====================================================================
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

INSERT INTO public.hospitals (id, name, type, taluka, village, address, phone, emergency_phone, distance_km_by_taluka, available_specialties, on_duty_doctors, diagnostic_facilities, medicine_stock, bed_availability, has_teleconsultation)
VALUES ('hosp_sassoon', 'Sassoon General Hospital & B.J. Govt Medical College', 'Tertiary / Medical College', 'Haveli', 'Station Road, Pune City', 'Near Pune Railway Station, Sangamvadi, Pune - 411001', '020-26128000', '108 / 020-26122222', '{"Haveli":14,"Khed":38,"Baramati":92,"Junnar":88,"Ambegaon":68,"Shirur":62,"Purandar":34,"Daund":78,"Mulshi":32,"Bhor":54}'::jsonb, '["Cardiology","Pulmonology","General Medicine","General Surgery","Orthopedics","Obstetrics & Gynecology","Pediatrics","Neurology","Dermatology"]'::jsonb, '[{"name":"Dr. Anand Deshmukh, MD","specialty":"Cardiology","onDutyToday":true,"availableSlots":["10:00 AM - 11:30 AM","02:00 PM - 03:30 PM","04:00 PM - 05:30 PM"]},{"name":"Dr. Swati Joshi, MS","specialty":"General Surgery","onDutyToday":true,"availableSlots":["11:00 AM - 01:00 PM","03:00 PM - 04:30 PM"]},{"name":"Dr. Rahul Kamble, MD","specialty":"Pediatrics","onDutyToday":true,"availableSlots":["09:30 AM - 12:30 PM","02:30 PM - 04:30 PM"]},{"name":"Dr. Meena Gaikwad, MD","specialty":"Obstetrics & Gynecology","onDutyToday":true,"availableSlots":["10:00 AM - 01:00 PM"]},{"name":"Dr. Vinayak Patil, MD","specialty":"Pulmonology","onDutyToday":true,"availableSlots":["11:30 AM - 02:00 PM"]},{"name":"Dr. Pravin Shinde, MS","specialty":"Orthopedics","onDutyToday":true,"availableSlots":["10:30 AM - 01:30 PM","03:00 PM - 05:00 PM"]}]'::jsonb, '[{"testName":"12-Lead ECG","isAvailableToday":true,"estimatedTurnaround":"15 mins"},{"testName":"Serum Troponin-I","isAvailableToday":true,"estimatedTurnaround":"45 mins"},{"testName":"Digital X-Ray","isAvailableToday":true,"estimatedTurnaround":"30 mins"},{"testName":"Chest X-Ray (PA View)","isAvailableToday":true,"estimatedTurnaround":"30 mins"},{"testName":"Abdominal Ultrasound (USG)","isAvailableToday":true,"estimatedTurnaround":"1 hour"},{"testName":"Obstetric Ultrasound","isAvailableToday":true,"estimatedTurnaround":"45 mins"},{"testName":"Complete Blood Count (CBC)","isAvailableToday":true,"estimatedTurnaround":"30 mins"},{"testName":"Malaria / Dengue Serology","isAvailableToday":true,"estimatedTurnaround":"1 hour"},{"testName":"Brain CT Scan","isAvailableToday":true,"estimatedTurnaround":"45 mins"},{"testName":"Serum Electrolytes","isAvailableToday":true,"estimatedTurnaround":"40 mins"}]'::jsonb, '[{"medicineName":"Inj. Streptokinase / Tenecteplase","category":"Emergency Thrombolytic","status":"In Stock","quantityOnHand":48},{"medicineName":"Anti-Snake Venom (ASV)","category":"Emergency Antidote","status":"In Stock","quantityOnHand":120},{"medicineName":"Inj. Ceftriaxone 1g","category":"Antibiotic","status":"In Stock","quantityOnHand":350},{"medicineName":"Inj. Oxytocin","category":"Maternal Health","status":"In Stock","quantityOnHand":180},{"medicineName":"Inj. Insulin Regular","category":"Diabetic Care","status":"In Stock","quantityOnHand":95},{"medicineName":"Tab. Amlodipine 5mg","category":"Hypertension","status":"In Stock","quantityOnHand":1200},{"medicineName":"Oxygen Cylinders (Type D)","category":"Respiratory Support","status":"In Stock","quantityOnHand":42}]'::jsonb, '{"icuBeds":6,"oxygenBeds":24,"generalBeds":42}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.hospitals (id, name, type, taluka, village, address, phone, emergency_phone, distance_km_by_taluka, available_specialties, on_duty_doctors, diagnostic_facilities, medicine_stock, bed_availability, has_teleconsultation)
VALUES ('hosp_aundh', 'District Hospital Aundh, Pune', 'District Hospital', 'Haveli', 'Aundh Chest Hospital Campus', 'Near Sangvi Phata, Aundh, Pune - 411027', '020-27280424', '108 / 020-27280555', '{"Haveli":18,"Khed":30,"Baramati":104,"Junnar":78,"Ambegaon":58,"Shirur":68,"Purandar":46,"Daund":88,"Mulshi":22,"Bhor":60}'::jsonb, '["Pulmonology","General Medicine","General Surgery","Orthopedics","Pediatrics","Obstetrics & Gynecology"]'::jsonb, '[{"name":"Dr. Suresh More, MD","specialty":"Pulmonology","onDutyToday":true,"availableSlots":["09:30 AM - 12:00 PM","02:00 PM - 04:00 PM"]},{"name":"Dr. Sunita Kadam, MD","specialty":"General Medicine","onDutyToday":true,"availableSlots":["10:00 AM - 01:00 PM"]},{"name":"Dr. Mahesh Kulkarni, MS","specialty":"Orthopedics","onDutyToday":true,"availableSlots":["11:00 AM - 02:00 PM"]},{"name":"Dr. Archana Salve, DGO","specialty":"Obstetrics & Gynecology","onDutyToday":true,"availableSlots":["10:30 AM - 01:00 PM"]}]'::jsonb, '[{"testName":"12-Lead ECG","isAvailableToday":true,"estimatedTurnaround":"20 mins"},{"testName":"Chest X-Ray (PA View)","isAvailableToday":true,"estimatedTurnaround":"30 mins"},{"testName":"Digital X-Ray","isAvailableToday":true,"estimatedTurnaround":"40 mins"},{"testName":"Complete Blood Count (CBC)","isAvailableToday":true,"estimatedTurnaround":"30 mins"},{"testName":"Malaria / Dengue Serology","isAvailableToday":true,"estimatedTurnaround":"1 hour"},{"testName":"Obstetric Ultrasound","isAvailableToday":true,"estimatedTurnaround":"1 hour"}]'::jsonb, '[{"medicineName":"Inj. Ceftriaxone 1g","category":"Antibiotic","status":"In Stock","quantityOnHand":220},{"medicineName":"Anti-Snake Venom (ASV)","category":"Emergency Antidote","status":"In Stock","quantityOnHand":45},{"medicineName":"Inj. Insulin Regular","category":"Diabetic Care","status":"In Stock","quantityOnHand":60},{"medicineName":"Tab. Metformin 500mg","category":"Diabetic Care","status":"In Stock","quantityOnHand":850},{"medicineName":"Oxygen Cylinders (Type D)","category":"Respiratory Support","status":"In Stock","quantityOnHand":18}]'::jsonb, '{"icuBeds":4,"oxygenBeds":18,"generalBeds":35}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.hospitals (id, name, type, taluka, village, address, phone, emergency_phone, distance_km_by_taluka, available_specialties, on_duty_doctors, diagnostic_facilities, medicine_stock, bed_availability, has_teleconsultation)
VALUES ('hosp_ycm', 'YCM Hospital (Yashwantrao Chavan Memorial)', 'Tertiary / Medical College', 'Haveli', 'Pimpri-Chinchwad', 'Sant Tukaram Nagar, Pimpri, Pune - 411018', '020-67332222', '108 / 020-67332100', '{"Haveli":22,"Khed":24,"Baramati":110,"Junnar":70,"Ambegaon":52,"Shirur":66,"Purandar":48,"Daund":90,"Mulshi":26,"Bhor":65}'::jsonb, '["Cardiology","Pulmonology","General Medicine","General Surgery","Orthopedics","Obstetrics & Gynecology","Pediatrics"]'::jsonb, '[{"name":"Dr. Nitin Thorat, MD","specialty":"Cardiology","onDutyToday":true,"availableSlots":["11:00 AM - 01:00 PM","03:00 PM - 05:00 PM"]},{"name":"Dr. Pratibha Pawar, MD","specialty":"Pediatrics","onDutyToday":true,"availableSlots":["09:30 AM - 12:30 PM"]},{"name":"Dr. Sachin Bhosale, MS","specialty":"General Surgery","onDutyToday":true,"availableSlots":["10:00 AM - 01:30 PM"]}]'::jsonb, '[{"testName":"12-Lead ECG","isAvailableToday":true,"estimatedTurnaround":"15 mins"},{"testName":"Serum Troponin-I","isAvailableToday":true,"estimatedTurnaround":"45 mins"},{"testName":"Digital X-Ray","isAvailableToday":true,"estimatedTurnaround":"25 mins"},{"testName":"Chest X-Ray (PA View)","isAvailableToday":true,"estimatedTurnaround":"25 mins"},{"testName":"Complete Blood Count (CBC)","isAvailableToday":true,"estimatedTurnaround":"30 mins"},{"testName":"Abdominal Ultrasound (USG)","isAvailableToday":true,"estimatedTurnaround":"45 mins"}]'::jsonb, '[{"medicineName":"Inj. Streptokinase / Tenecteplase","category":"Emergency Thrombolytic","status":"In Stock","quantityOnHand":25},{"medicineName":"Anti-Snake Venom (ASV)","category":"Emergency Antidote","status":"In Stock","quantityOnHand":60},{"medicineName":"Inj. Ceftriaxone 1g","category":"Antibiotic","status":"In Stock","quantityOnHand":180}]'::jsonb, '{"icuBeds":5,"oxygenBeds":16,"generalBeds":28}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.hospitals (id, name, type, taluka, village, address, phone, emergency_phone, distance_km_by_taluka, available_specialties, on_duty_doctors, diagnostic_facilities, medicine_stock, bed_availability, has_teleconsultation)
VALUES ('hosp_baramati', 'Sub-District Hospital, Baramati', 'Sub-District Hospital', 'Baramati', 'Baramati Town', 'Near Subhash Chowk, Baramati, Pune - 413102', '02112-222444', '108 / 02112-222108', '{"Baramati":5,"Daund":42,"Purandar":58,"Haveli":86,"Bhor":76,"Shirur":78,"Khed":115,"Ambegaon":135,"Junnar":155,"Mulshi":110}'::jsonb, '["General Medicine","Obstetrics & Gynecology","Pediatrics","General Surgery","Orthopedics"]'::jsonb, '[{"name":"Dr. Rajesh Jagtap, MD","specialty":"General Medicine","onDutyToday":true,"availableSlots":["09:30 AM - 12:30 PM","02:30 PM - 04:30 PM"]},{"name":"Dr. Smita Shinde, DGO","specialty":"Obstetrics & Gynecology","onDutyToday":true,"availableSlots":["10:00 AM - 01:00 PM"]},{"name":"Dr. Kiran Bagal, DCH","specialty":"Pediatrics","onDutyToday":true,"availableSlots":["10:30 AM - 01:30 PM"]}]'::jsonb, '[{"testName":"12-Lead ECG","isAvailableToday":true,"estimatedTurnaround":"20 mins"},{"testName":"Digital X-Ray","isAvailableToday":true,"estimatedTurnaround":"35 mins"},{"testName":"Complete Blood Count (CBC)","isAvailableToday":true,"estimatedTurnaround":"30 mins"},{"testName":"Obstetric Ultrasound","isAvailableToday":true,"estimatedTurnaround":"1 hour"},{"testName":"Malaria / Dengue Serology","isAvailableToday":true,"estimatedTurnaround":"45 mins"}]'::jsonb, '[{"medicineName":"Anti-Snake Venom (ASV)","category":"Emergency Antidote","status":"In Stock","quantityOnHand":35},{"medicineName":"Inj. Oxytocin","category":"Maternal Health","status":"In Stock","quantityOnHand":90},{"medicineName":"Inj. Ceftriaxone 1g","category":"Antibiotic","status":"In Stock","quantityOnHand":140}]'::jsonb, '{"icuBeds":2,"oxygenBeds":12,"generalBeds":25}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.hospitals (id, name, type, taluka, village, address, phone, emergency_phone, distance_km_by_taluka, available_specialties, on_duty_doctors, diagnostic_facilities, medicine_stock, bed_availability, has_teleconsultation)
VALUES ('hosp_manchar', 'Sub-District Hospital, Manchar', 'Sub-District Hospital', 'Ambegaon', 'Manchar Town', 'Pune-Nashik Highway, Manchar, Ambegaon, Pune - 410503', '02133-223120', '108 / 02133-223108', '{"Ambegaon":4,"Junnar":22,"Khed":28,"Shirur":50,"Haveli":65,"Mulshi":75,"Purandar":95,"Daund":110,"Bhor":120,"Baramati":138}'::jsonb, '["General Medicine","Obstetrics & Gynecology","Pediatrics","Orthopedics"]'::jsonb, '[{"name":"Dr. Vivek Bhalerao, MD","specialty":"General Medicine","onDutyToday":true,"availableSlots":["09:00 AM - 12:00 PM","02:00 PM - 04:00 PM"]},{"name":"Dr. Kavita Bankar, DGO","specialty":"Obstetrics & Gynecology","onDutyToday":true,"availableSlots":["10:30 AM - 01:30 PM"]}]'::jsonb, '[{"testName":"12-Lead ECG","isAvailableToday":true,"estimatedTurnaround":"20 mins"},{"testName":"Digital X-Ray","isAvailableToday":true,"estimatedTurnaround":"40 mins"},{"testName":"Complete Blood Count (CBC)","isAvailableToday":true,"estimatedTurnaround":"35 mins"},{"testName":"Malaria / Dengue Serology","isAvailableToday":true,"estimatedTurnaround":"50 mins"}]'::jsonb, '[{"medicineName":"Anti-Snake Venom (ASV)","category":"Emergency Antidote","status":"In Stock","quantityOnHand":20},{"medicineName":"Inj. Oxytocin","category":"Maternal Health","status":"In Stock","quantityOnHand":45},{"medicineName":"Oral Rehydration Salts (ORS)","category":"Pediatric Care","status":"In Stock","quantityOnHand":400}]'::jsonb, '{"icuBeds":1,"oxygenBeds":8,"generalBeds":20}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.hospitals (id, name, type, taluka, village, address, phone, emergency_phone, distance_km_by_taluka, available_specialties, on_duty_doctors, diagnostic_facilities, medicine_stock, bed_availability, has_teleconsultation)
VALUES ('hosp_junnar', 'Rural Hospital / CHC, Junnar', 'Community Health Centre', 'Junnar', 'Junnar City', 'Near Shivneri Fort Foothills, Junnar, Pune - 410502', '02132-222045', '108 / 02132-222108', '{"Junnar":6,"Ambegaon":24,"Khed":48,"Shirur":70,"Haveli":88,"Mulshi":95,"Purandar":115,"Daund":130,"Bhor":145,"Baramati":155}'::jsonb, '["General Medicine","Obstetrics & Gynecology","Pediatrics"]'::jsonb, '[{"name":"Dr. Sanjay Kokate, MBBS","specialty":"General Medicine","onDutyToday":true,"availableSlots":["09:30 AM - 01:00 PM"]},{"name":"Dr. Jyoti Tambe, DGO","specialty":"Obstetrics & Gynecology","onDutyToday":true,"availableSlots":["10:00 AM - 01:30 PM"]}]'::jsonb, '[{"testName":"12-Lead ECG","isAvailableToday":true,"estimatedTurnaround":"25 mins"},{"testName":"Complete Blood Count (CBC)","isAvailableToday":true,"estimatedTurnaround":"45 mins"},{"testName":"Chest X-Ray (PA View)","isAvailableToday":false,"estimatedTurnaround":"Machine Under Maintenance"}]'::jsonb, '[{"medicineName":"Anti-Snake Venom (ASV)","category":"Emergency Antidote","status":"In Stock","quantityOnHand":15},{"medicineName":"Paracetamol Tabs 650mg","category":"General Medicine","status":"In Stock","quantityOnHand":600},{"medicineName":"Inj. Oxytocin","category":"Maternal Health","status":"Low","quantityOnHand":6}]'::jsonb, '{"icuBeds":0,"oxygenBeds":4,"generalBeds":15}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.hospitals (id, name, type, taluka, village, address, phone, emergency_phone, distance_km_by_taluka, available_specialties, on_duty_doctors, diagnostic_facilities, medicine_stock, bed_availability, has_teleconsultation)
VALUES ('hosp_wagholi_phc', 'Primary Health Centre (PHC) Wagholi', 'Primary Health Centre', 'Haveli', 'Wagholi', 'Near Gram Panchayat Office, Wagholi, Pune - 412207', '020-27051234', '108', '{"Haveli":4,"Shirur":38,"Khed":36,"Purandar":38,"Daund":62,"Baramati":84,"Ambegaon":64,"Junnar":84,"Mulshi":38,"Bhor":60}'::jsonb, '["General Medicine"]'::jsonb, '[{"name":"Dr. Pallavi Jadhav, MBBS (Medical Officer)","specialty":"General Medicine","onDutyToday":true,"availableSlots":["09:00 AM - 01:00 PM"]}]'::jsonb, '[{"testName":"Complete Blood Count (CBC)","isAvailableToday":true,"estimatedTurnaround":"1 hour"},{"testName":"12-Lead ECG","isAvailableToday":false,"estimatedTurnaround":"Not Available at PHC"}]'::jsonb, '[{"medicineName":"ORS Packets","category":"Oral Hydration","status":"In Stock","quantityOnHand":350},{"medicineName":"Paracetamol 500mg","category":"Analgesic","status":"In Stock","quantityOnHand":500},{"medicineName":"Amoxicillin 500mg","category":"Antibiotic","status":"Low","quantityOnHand":30},{"medicineName":"Anti-Snake Venom (ASV)","category":"Emergency Antidote","status":"Low","quantityOnHand":2}]'::jsonb, '{"icuBeds":0,"oxygenBeds":2,"generalBeds":6}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.patients (id, health_id, abha_number, name, age, gender, mobile, village, taluka, aadhaar_last4, emergency_contact, blood_group, existing_conditions, chronic_diseases, vitals, allergies, current_medications, consent_given, registered_at)
VALUES ('pat_01', 'HID-2026-0001', '91-4521-8932-1104', 'Ramesh Patil', 54, 'Male', '9822104523', 'Velhe', 'Haveli', '7104', 'Suresh Patil (Son) - 9822104529', 'B+', '["Hypertension"]'::jsonb, NULL, NULL, '["Penicillin / Ampicillin (Severe Skin Rash)"]'::jsonb, '["Tab. Amlodipine 5mg OD"]'::jsonb, true, '2026-09-15T09:30:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.patients (id, health_id, abha_number, name, age, gender, mobile, village, taluka, aadhaar_last4, emergency_contact, blood_group, existing_conditions, chronic_diseases, vitals, allergies, current_medications, consent_given, registered_at)
VALUES ('pat_02', 'MH-PUN-2026-5190', '91-8842-1903-5521', 'Savita Eknath Shinde', 26, 'Female', '9765412390', 'Narayangaon', 'Junnar', '3819', 'Eknath Shinde (Husband) - 9765412391', 'O+', '["Pregnancy - 32 Weeks (High-Risk Preeclampsia)"]'::jsonb, NULL, NULL, '["Sulfa Drugs"]'::jsonb, '["Tab. Calcium 500mg","Tab. IFA (Iron Folic Acid)"]'::jsonb, true, '2026-09-20T11:15:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.patients (id, health_id, abha_number, name, age, gender, mobile, village, taluka, aadhaar_last4, emergency_contact, blood_group, existing_conditions, chronic_diseases, vitals, allergies, current_medications, consent_given, registered_at)
VALUES ('pat_03', 'MH-PUN-2026-6314', '91-3310-9844-7712', 'Baban Tukaram Jadhav', 64, 'Male', '9423019876', 'Manchar Rural', 'Ambegaon', '9921', 'Rohit Jadhav (Son) - 9423019877', 'A+', '["Chronic Bronchitis / Smoker"]'::jsonb, NULL, NULL, '["None known"]'::jsonb, '["Inhaler Salbutamol as needed"]'::jsonb, true, '2026-09-28T14:00:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.patients (id, health_id, abha_number, name, age, gender, mobile, village, taluka, aadhaar_last4, emergency_contact, blood_group, existing_conditions, chronic_diseases, vitals, allergies, current_medications, consent_given, registered_at)
VALUES ('pat_04', 'MH-PUN-2026-7042', '91-6621-4309-8819', 'Aarav Sachin Jagtap', 3, 'Male', '9970812345', 'Karanje', 'Baramati', '4410', 'Sachin Jagtap (Father) - 9970812345', 'O+', '["Acute Gastroenteritis"]'::jsonb, NULL, NULL, '["None known"]'::jsonb, '["Zinc Syrup 20mg"]'::jsonb, true, '2026-10-01T08:45:00Z')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.referrals (id, referral_number, patient_id, patient_name, patient_age, patient_gender, patient_health_id, patient_village, patient_taluka, patient_mobile, referring_facility, referring_health_worker, destination_hospital_id, destination_hospital_name, destination_taluka, alternative_hospital, triage_result, symptoms, appointment_date, appointment_slot, is_teleconsultation, status, timeline, created_at, reached_at, under_treatment_at, completed_at, doctor_notes, treating_doctor_name, prescriptions, test_results_summary, follow_up_date, follow_up_status, follow_up_checklist, feedback)
VALUES ('ref_101', 'REF-2026-PUN-0891', 'pat_01', 'Ramesh Patil', 54, 'Male', 'HID-2026-0001', 'Velhe', 'Haveli', '9822104523', 'Velhe Sub-Centre', 'Sunita Jadhav (ASHA)', 'hosp_sassoon', 'Sassoon General Hospital', 'Haveli', '{"id":"hosp_aundh","name":"District Hospital Aundh, Pune","reason":"Backup facility with ICU beds if Sassoon emergency bed capacity exceeds 95%"}'::jsonb, '{"level":"HIGH","score":88,"scoreBreakdown":[{"factor":"Crushing chest pain radiating to left arm","contribution":40,"type":"danger_sign","detail":"Critical cardiac ischemia red flag"},{"factor":"Elevated Systolic Blood Pressure (188 mmHg)","contribution":25,"type":"vital_abnormal","detail":"Hypertensive crisis threshold (>180)"},{"factor":"Low SpO2 (91%) with mild diaphoresis","contribution":15,"type":"vital_abnormal","detail":"Sub-optimal arterial oxygenation"},{"factor":"Age > 55 with co-morbid diabetes","contribution":8,"type":"vulnerable_group","detail":"High cardiovascular risk profile"}],"clinicalJustification":"Suspected Acute Coronary Syndrome (ACS) / NSTEMI. Immediate tertiary facility with 24/7 Cath Lab, Cardiology team, and Troponin-I test required.","recommendedSpecialty":"Cardiology","requiredTests":["12-Lead ECG","Serum Troponin-I","Complete Blood Count (CBC)"],"immediateAdvice":"Keep patient calm in semi-recumbent posture. Administer Dispersible Aspirin 300mg stat if no contraindications. Dial 108 Emergency Ambulance immediately.","ambulanceRequired":true,"timestamp":"2026-10-03T10:15:00Z"}'::jsonb, '{"chiefComplaints":["Chest Pain / Discomfort","Breathlessness"],"durationDays":1,"painSeverity":9,"description":"Severe retrosternal pressure starting 3 hours ago after walking in farm, radiating to jaw and left arm. Cold sweating.","dangerSigns":["Crushing chest pain radiating to left arm / jaw","Severe breathlessness at rest / Inability to speak"],"vitals":{"bpSystolic":188,"bpDiastolic":104,"heartRate":112,"spo2":91,"temperature":98.4,"respiratoryRate":26,"bloodGlucose":210}}'::jsonb, '2026-10-03', '10:00 AM - 11:30 AM', false, 'UNDER_TREATMENT', '[{"stage":"REFERRED","timestamp":"2026-10-03T10:20:00Z","operator":"ASHA Sunita Waghmare","facility":"PHC Wagholi Sub-Centre","note":"Emergency referral generated with 108 transit alert"},{"stage":"REACHED","timestamp":"2026-10-03T11:45:00Z","operator":"Nurse In-Charge Pratima","facility":"Sassoon Hospital Emergency Triage","note":"Patient arrived via 108 Ambulance; QR code scanned"},{"stage":"UNDER_TREATMENT","timestamp":"2026-10-03T12:15:00Z","operator":"Dr. Anand Deshmukh","facility":"Sassoon Hospital ICCU","note":"Admitted to ICCU Bed 4; ECG & Troponin positive"}]'::jsonb, '2026-10-03T10:20:00Z', '2026-10-03T11:45:00Z', '2026-10-03T12:15:00Z', NULL, 'Admitted to ICCU Bed 4 under Dr. Anand Deshmukh. 12-lead ECG confirmed ST-depression in leads V4-V6. Troponin-I positive (1.8 ng/mL). Loaded with Dual Antiplatelet Therapy (DAPT) and Heparin.', 'Dr. Anand Deshmukh, MD Cardiology', '[{"medicineName":"Tab. Aspirin 75mg","dosage":"1 tablet","frequency":"Once daily after meals","duration":"30 days"},{"medicineName":"Tab. Clopidogrel 75mg","dosage":"1 tablet","frequency":"Once daily","duration":"30 days"},{"medicineName":"Tab. Atorvastatin 40mg","dosage":"1 tablet","frequency":"At bedtime","duration":"30 days"},{"medicineName":"Tab. Telmisartan 40mg","dosage":"1 tablet","frequency":"Morning","duration":"30 days"}]'::jsonb, 'ECG: Ischemic changes in anterolateral leads. Echo: LVEF 48%, regional wall motion abnormality in LAD territory.', '2026-10-17', 'PENDING', '{"homeVisited":false,"medicationAdherence":true,"symptomsRelieved":true,"notes":"Scheduled for post-discharge home visit on Day 7."}'::jsonb, '{"rating":5,"waitingTimeRating":"Less than 30 mins","feedbackNote":"Doctor attended immediately upon arrival via 108 ambulance.","submittedAt":"2026-10-03T18:00:00Z"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.referrals (id, referral_number, patient_id, patient_name, patient_age, patient_gender, patient_health_id, patient_village, patient_taluka, patient_mobile, referring_facility, referring_health_worker, destination_hospital_id, destination_hospital_name, destination_taluka, alternative_hospital, triage_result, symptoms, appointment_date, appointment_slot, is_teleconsultation, status, timeline, created_at, reached_at, under_treatment_at, completed_at, doctor_notes, treating_doctor_name, prescriptions, test_results_summary, follow_up_date, follow_up_status, follow_up_checklist, feedback)
VALUES ('ref_102', 'REF-2026-PUN-0740', 'pat_02', 'Savita Eknath Shinde', 26, 'Female', 'MH-PUN-2026-5190', 'Narayangaon', 'Junnar', '9765412390', 'Sub-Centre Narayangaon / PHC Junnar', 'ANM Rekha Korde', 'hosp_manchar', 'Sub-District Hospital, Manchar', 'Ambegaon', '{"id":"hosp_junnar","name":"Rural Hospital / CHC Junnar","reason":"Nearest primary maternity stabilization centre"}'::jsonb, '{"level":"MEDIUM","score":58,"scoreBreakdown":[{"factor":"Third trimester pregnancy with pedal edema","contribution":20,"type":"vulnerable_group","detail":"High-risk obstetric consideration"},{"factor":"Elevated BP (146/94 mmHg)","contribution":20,"type":"vital_abnormal","detail":"Suspected gestational hypertension / pre-eclampsia"},{"factor":"Mild persistent headache","contribution":18,"type":"severity","detail":"Neurological prodrome for pre-eclampsia"}],"clinicalJustification":"32-week primigravida with high BP and pedal edema. Specialist Obstetric evaluation and urine protein analysis needed at Sub-District Hospital Manchar.","recommendedSpecialty":"Obstetrics & Gynecology","requiredTests":["Obstetric Ultrasound","Complete Blood Count (CBC)","Urine Albumin / Protein"],"immediateAdvice":"Advise left lateral rest. Avoid strenuous agricultural work. Visit Manchar SDH within 24 hours.","ambulanceRequired":false,"timestamp":"2026-10-02T14:30:00Z"}'::jsonb, '{"chiefComplaints":["Pregnancy Complications / Labor Pain"],"durationDays":2,"painSeverity":5,"description":"Swelling over feet and face since 3 days, mild headache in forehead, no convulsions.","dangerSigns":[],"vitals":{"bpSystolic":146,"bpDiastolic":94,"heartRate":88,"spo2":98,"temperature":98.6,"respiratoryRate":18,"bloodGlucose":108}}'::jsonb, '2026-10-03', '10:30 AM - 01:30 PM', false, 'COMPLETED', '[{"stage":"REFERRED","timestamp":"2026-10-02T14:40:00Z","operator":"ANM Rekha Korde","facility":"Narayangaon Sub-Centre"},{"stage":"REACHED","timestamp":"2026-10-03T10:15:00Z","operator":"Staff Nurse Vandana","facility":"Manchar Sub-District Hospital"},{"stage":"UNDER_TREATMENT","timestamp":"2026-10-03T11:00:00Z","operator":"Dr. Kavita Bankar","facility":"Manchar SDH ANC Ward"},{"stage":"COMPLETED","timestamp":"2026-10-03T13:30:00Z","operator":"Dr. Kavita Bankar","facility":"Manchar SDH ANC Ward","note":"Discharged with oral Labetalol 100mg BD; fetal heart rate normal"}]'::jsonb, '2026-10-02T14:40:00Z', '2026-10-03T10:15:00Z', '2026-10-03T11:00:00Z', '2026-10-03T13:30:00Z', 'Evaluated by Dr. Kavita Bankar. Urine dipstick shows trace albumin. Started on oral Labetalol 100mg BD. Fetal heart sound regular (144 bpm). Non-stress test reassuring.', 'Dr. Kavita Bankar, DGO', '[{"medicineName":"Tab. Labetalol 100mg","dosage":"1 tablet","frequency":"Twice daily after food","duration":"14 days"},{"medicineName":"Tab. Calcium & Vitamin D3","dosage":"1 tablet","frequency":"Once daily","duration":"30 days"},{"medicineName":"Tab. Iron & Folic Acid (IFA)","dosage":"1 tablet","frequency":"Once daily","duration":"30 days"}]'::jsonb, 'USG Obstetric: Single live intrauterine fetus in cephalic presentation, ~32 weeks, AFI 11cm, placenta fundal.', '2026-10-10', 'DONE', '{"homeVisited":true,"medicationAdherence":true,"symptomsRelieved":true,"notes":"ANM Rekha Korde visited home on Oct 4. BP measured 128/82. Patient taking Labetalol regularly."}'::jsonb, '{"rating":4,"waitingTimeRating":"30 to 60 mins","feedbackNote":"Smooth checkup; medicines given at hospital pharmacy.","submittedAt":"2026-10-03T14:15:00Z"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.referrals (id, referral_number, patient_id, patient_name, patient_age, patient_gender, patient_health_id, patient_village, patient_taluka, patient_mobile, referring_facility, referring_health_worker, destination_hospital_id, destination_hospital_name, destination_taluka, alternative_hospital, triage_result, symptoms, appointment_date, appointment_slot, is_teleconsultation, status, timeline, created_at, reached_at, under_treatment_at, completed_at, doctor_notes, treating_doctor_name, prescriptions, test_results_summary, follow_up_date, follow_up_status, follow_up_checklist, feedback)
VALUES ('ref_103', 'REF-2026-PUN-0612', 'pat_03', 'Baban Tukaram Jadhav', 64, 'Male', 'MH-PUN-2026-6314', 'Manchar Rural', 'Ambegaon', '9423019876', 'PHC Manchar Sub-Centre', 'ASHA Manisha Thorat', 'hosp_aundh', 'District Hospital Aundh, Pune', 'Haveli', NULL, '{"level":"MEDIUM","score":62,"scoreBreakdown":[{"factor":"Chronic productive cough with breathlessness on exertion","contribution":25,"type":"severity","detail":"Probable COPD acute exacerbation"},{"factor":"SpO2 borderline low at 92%","contribution":22,"type":"vital_abnormal","detail":"Mild chronic hypoxemia"},{"factor":"Elderly patient with history of heavy bidi smoking","contribution":15,"type":"vulnerable_group","detail":"High respiratory disease burden"}],"clinicalJustification":"Suspected COPD with secondary chest infection. Dedicated Pulmonology assessment and Chest X-ray required at District Hospital Aundh (Chest Centre).","recommendedSpecialty":"Pulmonology","requiredTests":["Chest X-Ray (PA View)","Complete Blood Count (CBC)"],"immediateAdvice":"Keep warm, avoid smoke exposure. Nebulization with Salbutamol given at PHC.","ambulanceRequired":false,"timestamp":"2026-09-29T10:00:00Z"}'::jsonb, '{"chiefComplaints":["Difficulty in Breathing / Cough"],"durationDays":7,"painSeverity":4,"description":"Persistent yellow phlegm with breathlessness while walking to the field. Decreased appetite.","dangerSigns":[],"vitals":{"bpSystolic":132,"bpDiastolic":84,"heartRate":94,"spo2":92,"temperature":99.8,"respiratoryRate":24}}'::jsonb, '2026-09-30', '09:30 AM - 12:00 PM', false, 'REFERRED', '[{"stage":"REFERRED","timestamp":"2026-09-29T10:15:00Z","operator":"ASHA Manisha Thorat","facility":"PHC Manchar"}]'::jsonb, '2026-09-29T10:15:00Z', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-02', 'MISSED_ALERT', '{"homeVisited":false,"medicationAdherence":false,"symptomsRelieved":false,"notes":"FLAGGED ALERT: Patient did not reach District Hospital Aundh for his appointment! Health worker alerted to conduct emergency home visit or call family."}'::jsonb, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.mch_records (id, patient_id, patient_name, health_id, age, village, taluka, lmp_date, edd_date, gestational_weeks, gravida, parity, is_high_risk, high_risk_reasons, anc_visits)
VALUES ('mch_01', 'pat_02', 'Savita Eknath Shinde', 'MH-PUN-2026-5190', 26, 'Narayangaon', 'Junnar', '2026-02-20', '2026-11-27', 32, 1, 0, true, '["Gestational Hypertension (BP 146/94)","Bilateral Pedal Edema","Trace Proteinuria"]'::jsonb, '[{"visitNumber":1,"scheduledDate":"2026-05-10","completedDate":"2026-05-12","bp":"118/76","hb":11.2,"weightKg":52,"status":"DONE"},{"visitNumber":2,"scheduledDate":"2026-07-15","completedDate":"2026-07-16","bp":"124/80","hb":10.8,"weightKg":56,"status":"DONE"},{"visitNumber":3,"scheduledDate":"2026-09-20","completedDate":"2026-09-22","bp":"146/94","hb":10.2,"weightKg":61,"status":"DONE"},{"visitNumber":4,"scheduledDate":"2026-10-25","status":"DUE"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.chronic_records (id, patient_id, patient_name, health_id, age, village, taluka, disease_type, regimen, last_reading, next_refill_date, next_checkup_date, status)
VALUES ('chr_01', 'pat_01', 'Ramesh Baburao Patil', 'MH-PUN-2026-4821', 58, 'Uruli Kanchan', 'Haveli', 'Hypertension', 'Tab. Amlodipine 5mg + Telmisartan 40mg OD', 'BP: 148/92 mmHg', '2026-10-12', '2026-10-15', 'REFILL_DUE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.chronic_records (id, patient_id, patient_name, health_id, age, village, taluka, disease_type, regimen, last_reading, next_refill_date, next_checkup_date, status)
VALUES ('chr_02', 'pat_03', 'Baban Tukaram Jadhav', 'MH-PUN-2026-6314', 64, 'Manchar Rural', 'Ambegaon', 'Tuberculosis', 'DOTS Category-1 Intensive Phase (4-FDC)', 'Sputum AFB 2+ (Month 2 Checkup)', '2026-10-06', '2026-10-08', 'OVERDUE')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (id, timestamp, actor, role, action, resource, details)
VALUES ('aud_01', '2026-10-04T06:30:00Z', 'ASHA Sunita Waghmare', 'Health Worker', 'RECORD_VIEW', 'Patient: Ramesh Patil (MH-PUN-2026-4821)', 'Accessed patient record from Wagholi Sub-Centre kiosk')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (id, timestamp, actor, role, action, resource, details)
VALUES ('aud_02', '2026-10-04T06:45:00Z', 'Dr. Anand Deshmukh', 'Doctor', 'STATUS_UPDATE', 'Referral: REF-2026-PUN-0891', 'Status updated to UNDER_TREATMENT; clinical notes added')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_logs (id, timestamp, actor, role, action, resource, details)
VALUES ('aud_03', '2026-10-04T07:10:00Z', 'System Escalation Engine', 'System', 'ALERT_DISPATCH', 'Referral: REF-2026-PUN-0612', 'Loss-to-follow-up alert triggered (>48 hours non-arrival)')
ON CONFLICT (id) DO NOTHING;
