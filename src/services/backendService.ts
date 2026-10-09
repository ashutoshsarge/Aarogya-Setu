import { supabase, checkBackendHealth, BackendStatus } from '../lib/supabase';
import {
  Patient,
  Referral,
  Hospital,
  MchRecord,
  ChronicRecord,
  AuditLog,
  ReferralStatus,
  FollowUpStatus,
  PatientFeedback,
  UserRole,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_HOSPITALS,
  INITIAL_REFERRALS,
  INITIAL_MCH_RECORDS,
  INITIAL_CHRONIC_RECORDS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { DEMO_PROFILES } from '../data/demoUsers';
import { queueOfflineAction } from '../utils/serviceWorker';

// ====================================================================
// DATA MAPPERS (Database snake_case <-> TypeScript camelCase)
// ====================================================================

export function mapPatientFromDb(row: any): Patient {
  return {
    id: row.id,
    healthId: row.health_id,
    abhaNumber: row.abha_number,
    name: row.name,
    age: row.age,
    gender: row.gender,
    mobile: row.mobile,
    village: row.village,
    taluka: row.taluka,
    aadhaarLast4: row.aadhaar_last4,
    emergencyContact: row.emergency_contact,
    bloodGroup: row.blood_group,
    existingConditions: row.existing_conditions || [],
    chronicDiseases: row.chronic_diseases || [],
    vitals: row.vitals || {},
    allergies: row.allergies || [],
    currentMedications: row.current_medications || [],
    consentGiven: row.consent_given ?? true,
    registeredAt: row.registered_at,
  };
}

export function mapPatientToDb(patient: Patient) {
  return {
    id: patient.id,
    health_id: patient.healthId,
    abha_number: patient.abhaNumber,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    mobile: patient.mobile,
    village: patient.village,
    taluka: patient.taluka,
    aadhaar_last4: patient.aadhaarLast4,
    emergency_contact: patient.emergencyContact,
    blood_group: patient.bloodGroup,
    existing_conditions: patient.existingConditions || [],
    chronic_diseases: patient.chronicDiseases || [],
    vitals: patient.vitals || {},
    allergies: patient.allergies || [],
    current_medications: patient.currentMedications || [],
    consent_given: patient.consentGiven,
    registered_at: patient.registeredAt || new Date().toISOString(),
  };
}

export function mapReferralFromDb(row: any): Referral {
  return {
    id: row.id,
    referralNumber: row.referral_number,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientAge: row.patient_age,
    patientGender: row.patient_gender,
    patientHealthId: row.patient_health_id,
    patientVillage: row.patient_village,
    patientTaluka: row.patient_taluka,
    patientMobile: row.patient_mobile,
    referringFacility: row.referring_facility,
    referringHealthWorker: row.referring_health_worker,
    destinationHospitalId: row.destination_hospital_id,
    destinationHospitalName: row.destination_hospital_name,
    destinationTaluka: row.destination_taluka,
    alternativeHospital: row.alternative_hospital,
    triageResult: row.triage_result,
    symptoms: row.symptoms,
    appointmentDate: row.appointment_date,
    appointmentSlot: row.appointment_slot,
    isTeleconsultation: row.is_teleconsultation ?? false,
    status: row.status,
    timeline: row.timeline || [],
    createdAt: row.created_at,
    reachedAt: row.reached_at,
    underTreatmentAt: row.under_treatment_at,
    completedAt: row.completed_at,
    doctorNotes: row.doctor_notes,
    treatingDoctorName: row.treating_doctor_name,
    prescriptions: row.prescriptions || [],
    testResultsSummary: row.test_results_summary,
    followUpDate: row.follow_up_date,
    followUpStatus: row.follow_up_status || 'PENDING',
    followUpChecklist: row.follow_up_checklist,
    feedback: row.feedback,
  };
}

export function mapReferralToDb(referral: Referral) {
  return {
    id: referral.id,
    referral_number: referral.referralNumber,
    patient_id: referral.patientId,
    patient_name: referral.patientName,
    patient_age: referral.patientAge,
    patient_gender: referral.patientGender,
    patient_health_id: referral.patientHealthId,
    patient_village: referral.patientVillage,
    patient_taluka: referral.patientTaluka,
    patient_mobile: referral.patientMobile,
    referring_facility: referral.referringFacility,
    referring_health_worker: referral.referringHealthWorker,
    destination_hospital_id: referral.destinationHospitalId,
    destination_hospital_name: referral.destinationHospitalName,
    destination_taluka: referral.destinationTaluka,
    alternative_hospital: referral.alternativeHospital,
    triage_result: referral.triageResult,
    symptoms: referral.symptoms,
    appointment_date: referral.appointmentDate,
    appointment_slot: referral.appointmentSlot,
    is_teleconsultation: referral.isTeleconsultation,
    status: referral.status,
    timeline: referral.timeline || [],
    created_at: referral.createdAt || new Date().toISOString(),
    reached_at: referral.reachedAt,
    under_treatment_at: referral.underTreatmentAt,
    completed_at: referral.completedAt,
    doctor_notes: referral.doctorNotes,
    treating_doctor_name: referral.treatingDoctorName,
    prescriptions: referral.prescriptions || [],
    test_results_summary: referral.testResultsSummary,
    follow_up_date: referral.followUpDate,
    follow_up_status: referral.followUpStatus,
    follow_up_checklist: referral.followUpChecklist,
    feedback: referral.feedback,
  };
}

export function mapHospitalFromDb(row: any): Hospital {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    taluka: row.taluka,
    village: row.village,
    address: row.address,
    phone: row.phone,
    emergencyPhone: row.emergency_phone,
    distanceKmByTaluka: row.distance_km_by_taluka || {},
    availableSpecialties: row.available_specialties || [],
    onDutyDoctors: row.on_duty_doctors || [],
    diagnosticFacilities: row.diagnostic_facilities || [],
    medicineStock: row.medicine_stock || [],
    bedAvailability: row.bed_availability || { icuBeds: 0, oxygenBeds: 0, generalBeds: 0 },
    hasTeleconsultation: row.has_teleconsultation ?? false,
  };
}

export function mapMchFromDb(row: any): MchRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    healthId: row.health_id,
    age: row.age,
    village: row.village,
    taluka: row.taluka,
    lmpDate: row.lmp_date,
    eddDate: row.edd_date,
    gestationalWeeks: row.gestational_weeks,
    gravida: row.gravida,
    parity: row.parity,
    isHighRisk: row.is_high_risk ?? false,
    highRiskReasons: row.high_risk_reasons || [],
    ancVisits: row.anc_visits || [],
  };
}

export function mapChronicFromDb(row: any): ChronicRecord {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    healthId: row.health_id,
    age: row.age,
    village: row.village,
    taluka: row.taluka,
    diseaseType: row.disease_type,
    regimen: row.regimen,
    lastReading: row.last_reading,
    nextRefillDate: row.next_refill_date,
    nextCheckupDate: row.next_checkup_date,
    status: row.status,
  };
}

export function mapAuditLogFromDb(row: any): AuditLog {
  return {
    id: row.id,
    timestamp: row.timestamp,
    actor: row.actor,
    role: row.role,
    action: row.action,
    resource: row.resource,
    details: row.details,
  };
}

// ====================================================================
// PATIENTS API
// ====================================================================

export async function fetchPatients(): Promise<Patient[]> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to local storage or initial patients
      const local = localStorage.getItem('aarogya_patients');
      return local ? JSON.parse(local) : INITIAL_PATIENTS;
    }

    const mapped = data.map(mapPatientFromDb);
    localStorage.setItem('aarogya_patients', JSON.stringify(mapped));
    return mapped;
  } catch (e) {
    const local = localStorage.getItem('aarogya_patients');
    return local ? JSON.parse(local) : INITIAL_PATIENTS;
  }
}

export async function savePatient(patient: Patient): Promise<Patient> {
  try {
    const dbPayload = mapPatientToDb(patient);
    const { error } = await supabase.from('patients').upsert(dbPayload);

    if (error) {
      queueOfflineAction({
        type: 'UPSERT_PATIENT',
        payload: patient,
      });
    }
  } catch (err) {
    queueOfflineAction({
      type: 'UPSERT_PATIENT',
      payload: patient,
    });
  }

  // Always update local cache
  const local = localStorage.getItem('aarogya_patients');
  const current: Patient[] = local ? JSON.parse(local) : INITIAL_PATIENTS;
  const updated = [patient, ...current.filter((p) => p.id !== patient.id)];
  localStorage.setItem('aarogya_patients', JSON.stringify(updated));

  return patient;
}

// ====================================================================
// REFERRALS API
// ====================================================================

export async function fetchReferrals(): Promise<Referral[]> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const local = localStorage.getItem('aarogya_referrals');
      return local ? JSON.parse(local) : INITIAL_REFERRALS;
    }

    const mapped = data.map(mapReferralFromDb);
    localStorage.setItem('aarogya_referrals', JSON.stringify(mapped));
    return mapped;
  } catch (e) {
    const local = localStorage.getItem('aarogya_referrals');
    return local ? JSON.parse(local) : INITIAL_REFERRALS;
  }
}

export async function saveReferral(referral: Referral): Promise<Referral> {
  try {
    const dbPayload = mapReferralToDb(referral);
    const { error } = await supabase.from('referrals').upsert(dbPayload);

    if (error) {
      queueOfflineAction({
        type: 'UPSERT_REFERRAL',
        payload: referral,
      });
    }
  } catch (err) {
    queueOfflineAction({
      type: 'UPSERT_REFERRAL',
      payload: referral,
    });
  }

  // Update local storage
  const local = localStorage.getItem('aarogya_referrals');
  const current: Referral[] = local ? JSON.parse(local) : INITIAL_REFERRALS;
  const updated = [referral, ...current.filter((r) => r.id !== referral.id)];
  localStorage.setItem('aarogya_referrals', JSON.stringify(updated));

  return referral;
}

export async function updateReferralInDb(
  referralId: string,
  updates: Partial<Referral>
): Promise<void> {
  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.timeline !== undefined) payload.timeline = updates.timeline;
    if (updates.reachedAt !== undefined) payload.reached_at = updates.reachedAt;
    if (updates.underTreatmentAt !== undefined) payload.under_treatment_at = updates.underTreatmentAt;
    if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
    if (updates.doctorNotes !== undefined) payload.doctor_notes = updates.doctorNotes;
    if (updates.treatingDoctorName !== undefined) payload.treating_doctor_name = updates.treatingDoctorName;
    if (updates.prescriptions !== undefined) payload.prescriptions = updates.prescriptions;
    if (updates.followUpStatus !== undefined) payload.follow_up_status = updates.followUpStatus;
    if (updates.followUpChecklist !== undefined) payload.follow_up_checklist = updates.followUpChecklist;
    if (updates.feedback !== undefined) payload.feedback = updates.feedback;

    const { error } = await supabase
      .from('referrals')
      .update(payload)
      .eq('id', referralId);

    if (error) {
      queueOfflineAction({
        type: 'UPDATE_REFERRAL',
        payload: { referralId, updates },
      });
    }
  } catch (err) {
    queueOfflineAction({
      type: 'UPDATE_REFERRAL',
      payload: { referralId, updates },
    });
  }
}

// ====================================================================
// HOSPITALS API
// ====================================================================

export async function fetchHospitals(): Promise<Hospital[]> {
  try {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      const local = localStorage.getItem('aarogya_hospitals');
      return local ? JSON.parse(local) : INITIAL_HOSPITALS;
    }

    const mapped = data.map(mapHospitalFromDb);
    localStorage.setItem('aarogya_hospitals', JSON.stringify(mapped));
    return mapped;
  } catch (e) {
    const local = localStorage.getItem('aarogya_hospitals');
    return local ? JSON.parse(local) : INITIAL_HOSPITALS;
  }
}

// ====================================================================
// MCH & CHRONIC & AUDIT LOGS
// ====================================================================

export async function fetchMchRecords(): Promise<MchRecord[]> {
  try {
    const { data, error } = await supabase
      .from('mch_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_MCH_RECORDS;
    }
    return data.map(mapMchFromDb);
  } catch {
    return INITIAL_MCH_RECORDS;
  }
}

export async function updateMchRecordInDb(record: MchRecord): Promise<void> {
  try {
    await supabase.from('mch_records').upsert({
      id: record.id,
      patient_id: record.patientId,
      patient_name: record.patientName,
      health_id: record.healthId,
      age: record.age,
      village: record.village,
      taluka: record.taluka,
      lmp_date: record.lmpDate,
      edd_date: record.eddDate,
      gestational_weeks: record.gestationalWeeks,
      gravida: record.gravida,
      parity: record.parity,
      is_high_risk: record.isHighRisk,
      high_risk_reasons: record.highRiskReasons,
      anc_visits: record.ancVisits,
    });
  } catch {
    // offline resilient
  }
}

export async function fetchChronicRecords(): Promise<ChronicRecord[]> {
  try {
    const { data, error } = await supabase
      .from('chronic_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_CHRONIC_RECORDS;
    }
    return data.map(mapChronicFromDb);
  } catch {
    return INITIAL_CHRONIC_RECORDS;
  }
}

export async function updateChronicRecordInDb(record: ChronicRecord): Promise<void> {
  try {
    await supabase.from('chronic_records').upsert({
      id: record.id,
      patient_id: record.patientId,
      patient_name: record.patientName,
      health_id: record.healthId,
      age: record.age,
      village: record.village,
      taluka: record.taluka,
      disease_type: record.diseaseType,
      regimen: record.regimen,
      last_reading: record.lastReading,
      next_refill_date: record.nextRefillDate,
      next_checkup_date: record.nextCheckupDate,
      status: record.status,
    });
  } catch {
    // offline resilient
  }
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return INITIAL_AUDIT_LOGS;
    }
    return data.map(mapAuditLogFromDb);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export async function recordAuditLog(log: AuditLog): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      actor: log.actor,
      role: log.role,
      action: log.action,
      resource: log.resource,
      details: log.details,
    });
  } catch {
    // local fallback
  }
}

// ====================================================================
// REAL-TIME COLLABORATIVE SUBSCRIPTIONS
// ====================================================================

export function subscribeToReferralUpdates(
  onReferralChange: (referral: Referral) => void
): () => void {
  try {
    const channel = supabase
      .channel('aarogya_realtime_referrals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referrals' },
        (payload) => {
          if (payload.new) {
            const mapped = mapReferralFromDb(payload.new);
            onReferralChange(mapped);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription not supported or offline:', err);
    return () => {};
  }
}

// ====================================================================
// AUTHENTICATION & PROFILES
// ====================================================================

export interface AuthUserSession {
  id: string;
  name: string;
  role: UserRole;
  healthId?: string;
  facility?: string;
  isDemo?: boolean;
  email?: string;
}

export async function authenticateUser(
  identifier: string,
  password?: string
): Promise<{ user: AuthUserSession | null; error?: string }> {
  const cleanId = identifier.trim();

  // Check Demo profiles first for 1-click & instant demo convenience
  const matchedDemo = DEMO_PROFILES.find(
    (d) =>
      d.id === cleanId ||
      d.email.toLowerCase() === cleanId.toLowerCase() ||
      d.mobile === cleanId ||
      d.name.toLowerCase() === cleanId.toLowerCase()
  );

  if (matchedDemo) {
    return {
      user: {
        id: matchedDemo.id,
        name: matchedDemo.name,
        role: matchedDemo.role,
        healthId: matchedDemo.healthId,
        facility: matchedDemo.facility,
        isDemo: true,
        email: matchedDemo.email,
      },
    };
  }

  // Try Supabase Auth
  try {
    const emailToUse = cleanId.includes('@')
      ? cleanId
      : `${cleanId.replace(/\D/g, '')}@aarogya.mah.gov.in`;

    if (password && password.length >= 6) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (!authError && authData.user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        return {
          user: {
            id: authData.user.id,
            name:
              profileData?.name ||
              authData.user.user_metadata?.name ||
              cleanId.split('@')[0],
            role: (profileData?.role || authData.user.user_metadata?.role || 'patient') as UserRole,
            healthId: profileData?.health_id || authData.user.user_metadata?.healthId,
            facility: profileData?.facility || authData.user.user_metadata?.facility,
            isDemo: false,
            email: emailToUse,
          },
        };
      }
    }
  } catch (err: any) {
    console.warn('Supabase auth check failed, falling back to local credentials:', err?.message);
  }

  // Fallback for valid format if Supabase Auth user not registered yet
  if (password && password.length >= 6) {
    return {
      user: {
        id: `usr_${Date.now()}`,
        name: cleanId.includes('@') ? cleanId.split('@')[0] : `User (${cleanId})`,
        role: 'patient',
        healthId: `HID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        isDemo: false,
      },
    };
  }

  return { user: null, error: 'Invalid credentials. Password must be at least 6 characters.' };
}

export async function registerNewUser(data: {
  fullName: string;
  mobile: string;
  role: 'patient' | 'health_worker';
  taluka: string;
  village: string;
  password: string;
  generatedId: string;
}): Promise<{ user: AuthUserSession | null; error?: string }> {
  const email = `${data.mobile.replace(/\D/g, '')}@aarogya.mah.gov.in`;

  try {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          name: data.fullName,
          role: data.role,
          healthId: data.generatedId,
          village: data.village,
          taluka: data.taluka,
        },
      },
    });

    const userId = authData.user?.id || `usr_${Date.now()}`;

    // Create Profile in Supabase
    await supabase.from('profiles').upsert({
      id: userId,
      user_id: authData.user?.id || null,
      name: data.fullName,
      role: data.role,
      health_id: data.generatedId,
      mobile: data.mobile,
      email,
      taluka: data.taluka,
      village: data.village,
    });

    // If patient, also create patient entry
    if (data.role === 'patient') {
      const newPatient: Patient = {
        id: `pat_${Date.now()}`,
        healthId: data.generatedId,
        name: data.fullName,
        age: 35,
        gender: 'Male',
        mobile: data.mobile,
        village: data.village,
        taluka: data.taluka,
        aadhaarLast4: 'XXXX',
        emergencyContact: data.mobile,
        bloodGroup: 'B+',
        existingConditions: [],
        allergies: [],
        currentMedications: [],
        consentGiven: true,
        registeredAt: new Date().toISOString(),
      };
      await savePatient(newPatient);
    }

    return {
      user: {
        id: userId,
        name: data.fullName,
        role: data.role,
        healthId: data.generatedId,
        facility: data.role === 'health_worker' ? `${data.taluka} Health Centre` : undefined,
        isDemo: false,
        email,
      },
    };
  } catch (err: any) {
    // Offline / fallback creation
    const userId = `usr_${Date.now()}`;
    return {
      user: {
        id: userId,
        name: data.fullName,
        role: data.role,
        healthId: data.generatedId,
        facility: data.role === 'health_worker' ? `${data.taluka} Health Centre` : undefined,
        isDemo: false,
      },
    };
  }
}
