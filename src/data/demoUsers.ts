import { UserRole } from '../types';

export interface DemoUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  mobile: string;
  avatarLabel: string;
  title: string;
  location: string;
  healthId?: string;
  specialty?: string;
  facility?: string;
  isDefault?: boolean;
}

export const ENABLE_DEMO_LOGIN = true;

export const DEMO_PROFILES: DemoUser[] = [
  {
    id: 'demo_patient_01',
    role: 'patient',
    name: 'Ramesh Patil',
    email: 'ramesh.patil@ruralhealth.mah.gov.in',
    mobile: '9822104523',
    avatarLabel: 'RP',
    title: '54 yrs, Male · Village: Velhe, Pune District',
    location: 'Village: Velhe, Pune District',
    healthId: 'HID-2026-0001',
    facility: 'Velhe Sub-Centre',
    isDefault: true,
  },
  {
    id: 'demo_worker_01',
    role: 'health_worker',
    name: 'Sunita Jadhav (ASHA)',
    email: 'sunita.asha@velhe.phc.gov.in',
    mobile: '9765412390',
    avatarLabel: 'SJ',
    title: 'ASHA Worker · Velhe Sub-Centre',
    location: 'Velhe Sub-Centre, Pune',
    facility: 'Velhe Sub-Centre',
  },
  {
    id: 'demo_phc_01',
    role: 'phc_doctor',
    name: 'Dr. Rajesh Shinde',
    email: 'dr.shinde@velhe.phc.gov.in',
    mobile: '9822004411',
    avatarLabel: 'RS',
    title: 'Medical Officer (MBBS) · Velhe PHC',
    specialty: 'Primary & Community Health',
    facility: 'Velhe Primary Health Centre (PHC)',
    location: 'Velhe Taluka Bhor, Pune',
  },
  {
    id: 'demo_doctor_01',
    role: 'doctor',
    name: 'Dr. Anil Kulkarni',
    email: 'dr.kulkarni@sassoonhospital.edu.in',
    mobile: '9423019876',
    avatarLabel: 'AK',
    title: 'Cardiologist · Sassoon General Hospital',
    specialty: 'Cardiology',
    facility: 'Sassoon General Hospital',
    location: 'Sassoon General Hospital, Pune',
  },
  {
    id: 'demo_admin_01',
    role: 'admin',
    name: 'District Health Officer, Pune',
    email: 'dho.pune@zppune.gov.in',
    mobile: '9823001122',
    avatarLabel: 'DH',
    title: 'District Health Officer · Zilla Parishad Pune',
    facility: 'Zilla Parishad Pune Public Health Division',
    location: 'Pune District Headquarters',
  },
];
