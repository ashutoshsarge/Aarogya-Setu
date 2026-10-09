import {
  INITIAL_PATIENTS,
  INITIAL_HOSPITALS,
  INITIAL_REFERRALS,
  INITIAL_MCH_RECORDS,
  INITIAL_CHRONIC_RECORDS,
  INITIAL_AUDIT_LOGS,
} from '../src/data/mockData';
import fs from 'fs';
import path from 'path';

function escapeSql(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number' || typeof val === 'boolean') return val.toString();
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

let seedSql = '';

// Seed Hospitals
for (const h of INITIAL_HOSPITALS) {
  seedSql += `INSERT INTO public.hospitals (id, name, type, taluka, village, address, phone, emergency_phone, distance_km_by_taluka, available_specialties, on_duty_doctors, diagnostic_facilities, medicine_stock, bed_availability, has_teleconsultation)
VALUES (${escapeSql(h.id)}, ${escapeSql(h.name)}, ${escapeSql(h.type)}, ${escapeSql(h.taluka)}, ${escapeSql(h.village)}, ${escapeSql(h.address)}, ${escapeSql(h.phone)}, ${escapeSql(h.emergencyPhone)}, ${escapeSql(h.distanceKmByTaluka)}, ${escapeSql(h.availableSpecialties)}, ${escapeSql(h.onDutyDoctors)}, ${escapeSql(h.diagnosticFacilities)}, ${escapeSql(h.medicineStock)}, ${escapeSql(h.bedAvailability)}, ${h.hasTeleconsultation})
ON CONFLICT (id) DO NOTHING;\n`;
}

// Seed Patients
for (const p of INITIAL_PATIENTS) {
  seedSql += `INSERT INTO public.patients (id, health_id, abha_number, name, age, gender, mobile, village, taluka, aadhaar_last4, emergency_contact, blood_group, existing_conditions, chronic_diseases, vitals, allergies, current_medications, consent_given, registered_at)
VALUES (${escapeSql(p.id)}, ${escapeSql(p.healthId)}, ${escapeSql(p.abhaNumber)}, ${escapeSql(p.name)}, ${p.age}, ${escapeSql(p.gender)}, ${escapeSql(p.mobile)}, ${escapeSql(p.village)}, ${escapeSql(p.taluka)}, ${escapeSql(p.aadhaarLast4)}, ${escapeSql(p.emergencyContact)}, ${escapeSql(p.bloodGroup)}, ${escapeSql(p.existingConditions)}, ${escapeSql(p.chronicDiseases)}, ${escapeSql(p.vitals)}, ${escapeSql(p.allergies)}, ${escapeSql(p.currentMedications)}, ${p.consentGiven}, ${escapeSql(p.registeredAt)})
ON CONFLICT (id) DO NOTHING;\n`;
}

// Seed Referrals
for (const r of INITIAL_REFERRALS) {
  seedSql += `INSERT INTO public.referrals (id, referral_number, patient_id, patient_name, patient_age, patient_gender, patient_health_id, patient_village, patient_taluka, patient_mobile, referring_facility, referring_health_worker, destination_hospital_id, destination_hospital_name, destination_taluka, alternative_hospital, triage_result, symptoms, appointment_date, appointment_slot, is_teleconsultation, status, timeline, created_at, reached_at, under_treatment_at, completed_at, doctor_notes, treating_doctor_name, prescriptions, test_results_summary, follow_up_date, follow_up_status, follow_up_checklist, feedback)
VALUES (${escapeSql(r.id)}, ${escapeSql(r.referralNumber)}, ${escapeSql(r.patientId)}, ${escapeSql(r.patientName)}, ${r.patientAge}, ${escapeSql(r.patientGender)}, ${escapeSql(r.patientHealthId)}, ${escapeSql(r.patientVillage)}, ${escapeSql(r.patientTaluka)}, ${escapeSql(r.patientMobile)}, ${escapeSql(r.referringFacility)}, ${escapeSql(r.referringHealthWorker)}, ${escapeSql(r.destinationHospitalId)}, ${escapeSql(r.destinationHospitalName)}, ${escapeSql(r.destinationTaluka)}, ${escapeSql(r.alternativeHospital)}, ${escapeSql(r.triageResult)}, ${escapeSql(r.symptoms)}, ${escapeSql(r.appointmentDate)}, ${escapeSql(r.appointmentSlot)}, ${r.isTeleconsultation}, ${escapeSql(r.status)}, ${escapeSql(r.timeline)}, ${escapeSql(r.createdAt)}, ${escapeSql(r.reachedAt)}, ${escapeSql(r.underTreatmentAt)}, ${escapeSql(r.completedAt)}, ${escapeSql(r.doctorNotes)}, ${escapeSql(r.treatingDoctorName)}, ${escapeSql(r.prescriptions)}, ${escapeSql(r.testResultsSummary)}, ${escapeSql(r.followUpDate)}, ${escapeSql(r.followUpStatus)}, ${escapeSql(r.followUpChecklist)}, ${escapeSql(r.feedback)})
ON CONFLICT (id) DO NOTHING;\n`;
}

// Seed MCH Records
for (const m of INITIAL_MCH_RECORDS) {
  seedSql += `INSERT INTO public.mch_records (id, patient_id, patient_name, health_id, age, village, taluka, lmp_date, edd_date, gestational_weeks, gravida, parity, is_high_risk, high_risk_reasons, anc_visits)
VALUES (${escapeSql(m.id)}, ${escapeSql(m.patientId)}, ${escapeSql(m.patientName)}, ${escapeSql(m.healthId)}, ${m.age}, ${escapeSql(m.village)}, ${escapeSql(m.taluka)}, ${escapeSql(m.lmpDate)}, ${escapeSql(m.eddDate)}, ${m.gestationalWeeks}, ${m.gravida}, ${m.parity}, ${m.isHighRisk}, ${escapeSql(m.highRiskReasons)}, ${escapeSql(m.ancVisits)})
ON CONFLICT (id) DO NOTHING;\n`;
}

// Seed Chronic Records
for (const c of INITIAL_CHRONIC_RECORDS) {
  seedSql += `INSERT INTO public.chronic_records (id, patient_id, patient_name, health_id, age, village, taluka, disease_type, regimen, last_reading, next_refill_date, next_checkup_date, status)
VALUES (${escapeSql(c.id)}, ${escapeSql(c.patientId)}, ${escapeSql(c.patientName)}, ${escapeSql(c.healthId)}, ${c.age}, ${escapeSql(c.village)}, ${escapeSql(c.taluka)}, ${escapeSql(c.diseaseType)}, ${escapeSql(c.regimen)}, ${escapeSql(c.lastReading)}, ${escapeSql(c.nextRefillDate)}, ${escapeSql(c.nextCheckupDate)}, ${escapeSql(c.status)})
ON CONFLICT (id) DO NOTHING;\n`;
}

// Seed Audit Logs
for (const a of INITIAL_AUDIT_LOGS) {
  seedSql += `INSERT INTO public.audit_logs (id, timestamp, actor, role, action, resource, details)
VALUES (${escapeSql(a.id)}, ${escapeSql(a.timestamp)}, ${escapeSql(a.actor)}, ${escapeSql(a.role)}, ${escapeSql(a.action)}, ${escapeSql(a.resource)}, ${escapeSql(a.details)})
ON CONFLICT (id) DO NOTHING;\n`;
}

const outputPath = path.resolve(process.cwd(), 'supabase/seed.sql');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, seedSql);
console.log('Successfully generated Supabase seed SQL at:', outputPath);
