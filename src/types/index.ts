export type UserRole = 'health_worker' | 'patient' | 'doctor' | 'phc_doctor' | 'admin';

export type Language = 'en' | 'mr' | 'hi';

export type TriageLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReferralStatus = 'REFERRED' | 'REACHED' | 'UNDER_TREATMENT' | 'COMPLETED';

export type FollowUpStatus = 'PENDING' | 'DONE' | 'MISSED_ALERT';

export type MedicineStockStatus = 'In Stock' | 'Low' | 'Out of Stock';

export interface Vitals {
  bpSystolic: number;
  bpDiastolic: number;
  heartRate: number;
  spo2: number;
  temperature: number;
  respiratoryRate: number;
  bloodGlucose?: number;
}

export interface Patient {
  id: string;
  healthId: string; // e.g. MH-PUN-2026-4821
  abhaNumber?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  village: string;
  taluka: string;
  aadhaarLast4: string;
  emergencyContact: string;
  bloodGroup: string;
  existingConditions: string[];
  chronicDiseases?: string[];
  vitals?: any;
  allergies: string[];
  currentMedications: string[];
  consentGiven: boolean;
  registeredAt: string;
}

export interface DangerSignItem {
  id: string;
  labelEn: string;
  labelMr: string;
  labelHi: string;
  severity: 'HIGH' | 'CRITICAL';
  bodyArea?: 'chest' | 'head' | 'respiratory' | 'abdomen' | 'maternal' | 'general';
}

export interface SymptomEntry {
  chiefComplaints: string[];
  durationDays: number;
  painSeverity: number; // 1-10
  description: string;
  dangerSigns: string[];
  vitals: Vitals;
}

export interface TriageScoreFactor {
  factor: string;
  contribution: number;
  type: 'danger_sign' | 'vital_abnormal' | 'severity' | 'vulnerable_group';
  detail: string;
}

export interface TriageResult {
  level: TriageLevel;
  score: number; // 0 to 100
  scoreBreakdown: TriageScoreFactor[];
  clinicalJustification: string;
  recommendedSpecialty: string;
  requiredTests: string[];
  immediateAdvice: string;
  ambulanceRequired: boolean;
  timestamp: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Tertiary / Medical College' | 'District Hospital' | 'Sub-District Hospital' | 'Community Health Centre' | 'Primary Health Centre';
  taluka: string;
  village: string;
  address: string;
  phone: string;
  distanceKmByTaluka: Record<string, number>;
  availableSpecialties: string[];
  onDutyDoctors: {
    name: string;
    specialty: string;
    onDutyToday: boolean;
    availableSlots: string[];
  }[];
  diagnosticFacilities: {
    testName: string;
    isAvailableToday: boolean;
    estimatedTurnaround: string;
  }[];
  medicineStock: {
    medicineName: string;
    category: string;
    status: MedicineStockStatus;
    quantityOnHand?: number;
  }[];
  bedAvailability: {
    icuBeds: number;
    oxygenBeds: number;
    generalBeds: number;
  };
  hasTeleconsultation: boolean;
  emergencyPhone: string;
}

export interface HospitalRecommendation {
  hospital: Hospital;
  totalScore: number; // 0 - 100
  distanceKm: number;
  estimatedTravelMinutes: number;
  specialtyMatchScore: number;
  doctorAvailabilityScore: number;
  diagnosticReadinessScore: number;
  distanceScore: number;
  slotScore: number;
  matchReasons: string[];
  recommendedSlot: string;
}

export interface TimelineEvent {
  stage: string;
  timestamp: string;
  operator: string;
  facility: string;
  note?: string;
}

export interface PatientFeedback {
  rating: number; // 1-5
  waitingTimeRating: 'Less than 30 mins' | '30 to 60 mins' | '1 to 2 hours' | 'More than 2 hours';
  feedbackNote?: string;
  submittedAt: string;
}

export interface Referral {
  id: string;
  referralNumber: string; // e.g. REF-2026-PUN-0149
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientHealthId: string;
  patientVillage: string;
  patientTaluka: string;
  patientMobile: string;
  
  referringFacility: string;
  referringHealthWorker: string;
  
  destinationHospitalId: string;
  destinationHospitalName: string;
  destinationTaluka: string;
  
  alternativeHospital?: {
    id: string;
    name: string;
    reason: string;
  };
  
  triageResult: TriageResult;
  symptoms: SymptomEntry;
  
  appointmentDate: string;
  appointmentSlot: string;
  isTeleconsultation: boolean;
  
  status: ReferralStatus;
  timeline: TimelineEvent[];
  createdAt: string;
  reachedAt?: string;
  underTreatmentAt?: string;
  completedAt?: string;
  
  doctorNotes?: string;
  treatingDoctorName?: string;
  prescriptions?: {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  testResultsSummary?: string;
  
  followUpDate?: string;
  followUpStatus: FollowUpStatus;
  followUpChecklist?: {
    homeVisited: boolean;
    medicationAdherence: boolean;
    symptomsRelieved: boolean;
    notes: string;
  };

  feedback?: PatientFeedback;
}

export interface AncVisit {
  visitNumber: number;
  scheduledDate: string;
  completedDate?: string;
  bp?: string;
  hb?: number;
  weightKg?: number;
  status: 'DONE' | 'DUE' | 'OVERDUE';
}

export interface MchRecord {
  id: string;
  patientId: string;
  patientName: string;
  healthId: string;
  age: number;
  village: string;
  taluka: string;
  lmpDate: string;
  eddDate: string;
  gestationalWeeks: number;
  gravida: number;
  parity: number;
  isHighRisk: boolean;
  highRiskReasons: string[];
  ancVisits: AncVisit[];
}

export interface ChronicRecord {
  id: string;
  patientId: string;
  patientName: string;
  healthId: string;
  age: number;
  village: string;
  taluka: string;
  diseaseType: 'Diabetes' | 'Hypertension' | 'Tuberculosis' | 'COPD';
  regimen: string;
  lastReading: string; // e.g. "BP: 142/90" or "RBS: 168 mg/dL"
  nextRefillDate: string;
  nextCheckupDate: string;
  status: 'UP_TO_DATE' | 'REFILL_DUE' | 'OVERDUE';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  details: string;
}
