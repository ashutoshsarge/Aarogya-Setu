import { SymptomEntry, TriageResult, TriageLevel, TriageScoreFactor } from '../types';
import { COMMON_SYMPTOMS } from '../data/mockData';

export function calculateTriage(
  entry: SymptomEntry,
  patientAge: number,
  patientGender: string
): TriageResult {
  const breakdown: TriageScoreFactor[] = [];
  let score = 0;
  let hasCriticalDangerSign = false;

  // 1. Danger Signs Check
  if (entry.dangerSigns && entry.dangerSigns.length > 0) {
    entry.dangerSigns.forEach((sign) => {
      const isCritical = sign.toLowerCase().includes('crushing chest pain') ||
        sign.toLowerCase().includes('loss of consciousness') ||
        sign.toLowerCase().includes('cyanosis') ||
        sign.toLowerCase().includes('uncontrolled bleeding') ||
        sign.toLowerCase().includes('pregnancy danger') ||
        sign.toLowerCase().includes('breathlessness at rest');

      const points = isCritical ? 40 : 25;
      score += points;
      if (isCritical) hasCriticalDangerSign = true;

      breakdown.push({
        factor: sign,
        contribution: points,
        type: 'danger_sign',
        detail: isCritical ? 'Red Flag emergency danger sign' : 'Significant clinical warning sign',
      });
    });
  }

  // 2. Vital Signs Assessment
  const { vitals } = entry;

  // SpO2
  if (vitals.spo2 > 0) {
    if (vitals.spo2 < 90) {
      score += 35;
      hasCriticalDangerSign = true;
      breakdown.push({
        factor: `Severe Hypoxia: SpO2 ${vitals.spo2}%`,
        contribution: 35,
        type: 'vital_abnormal',
        detail: 'Critical arterial desaturation (<90%). Immediate oxygenation needed.',
      });
    } else if (vitals.spo2 <= 93) {
      score += 20;
      breakdown.push({
        factor: `Moderate Hypoxia: SpO2 ${vitals.spo2}%`,
        contribution: 20,
        type: 'vital_abnormal',
        detail: 'Sub-optimal oxygen saturation (90-93%).',
      });
    }
  }

  // Blood Pressure
  if (vitals.bpSystolic > 0 && vitals.bpDiastolic > 0) {
    if (vitals.bpSystolic >= 180 || vitals.bpDiastolic >= 110) {
      score += 30;
      breakdown.push({
        factor: `Hypertensive Crisis: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`,
        contribution: 30,
        type: 'vital_abnormal',
        detail: 'Severely elevated blood pressure risk of stroke or heart failure.',
      });
    } else if (vitals.bpSystolic < 85 || vitals.bpDiastolic < 55) {
      score += 35;
      hasCriticalDangerSign = true;
      breakdown.push({
        factor: `Hypotensive Shock: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`,
        contribution: 35,
        type: 'vital_abnormal',
        detail: 'Low perfusion pressure / suspected septic or cardiogenic shock.',
      });
    } else if (vitals.bpSystolic >= 145 || vitals.bpDiastolic >= 95) {
      score += 15;
      breakdown.push({
        factor: `Elevated Blood Pressure: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`,
        contribution: 15,
        type: 'vital_abnormal',
        detail: 'Stage 2 Hypertension.',
      });
    }
  }

  // Heart Rate
  if (vitals.heartRate > 0) {
    if (vitals.heartRate > 125) {
      score += 20;
      breakdown.push({
        factor: `Severe Tachycardia: ${vitals.heartRate} bpm`,
        contribution: 20,
        type: 'vital_abnormal',
        detail: 'Heart rate significantly above safe resting rate.',
      });
    } else if (vitals.heartRate < 48) {
      score += 25;
      breakdown.push({
        factor: `Severe Bradycardia: ${vitals.heartRate} bpm`,
        contribution: 25,
        type: 'vital_abnormal',
        detail: 'Heart rate dangerously low; risk of conduction block or syncope.',
      });
    } else if (vitals.heartRate > 105) {
      score += 10;
      breakdown.push({
        factor: `Mild Tachycardia: ${vitals.heartRate} bpm`,
        contribution: 10,
        type: 'vital_abnormal',
        detail: 'Elevated pulse rate.',
      });
    }
  }

  // Temperature
  if (vitals.temperature >= 103) {
    score += 18;
    breakdown.push({
      factor: `High Grade Hyperpyrexia: ${vitals.temperature}°F`,
      contribution: 18,
      type: 'vital_abnormal',
      detail: 'High fever (>103°F) risk of febrile delirium or septic shock.',
    });
  } else if (vitals.temperature >= 100.4) {
    score += 8;
    breakdown.push({
      factor: `Fever: ${vitals.temperature}°F`,
      contribution: 8,
      type: 'vital_abnormal',
      detail: 'Febrile state indicating inflammatory/infectious process.',
    });
  }

  // Respiratory Rate
  if (vitals.respiratoryRate > 0) {
    if (vitals.respiratoryRate >= 28 || vitals.respiratoryRate <= 9) {
      score += 25;
      breakdown.push({
        factor: `Abnormal Respiratory Rate: ${vitals.respiratoryRate}/min`,
        contribution: 25,
        type: 'vital_abnormal',
        detail: 'Severe tachypnea or bradypnea; acute respiratory compromise.',
      });
    }
  }

  // Blood Glucose (optional)
  if (vitals.bloodGlucose && vitals.bloodGlucose > 0) {
    if (vitals.bloodGlucose > 350 || vitals.bloodGlucose < 60) {
      score += 22;
      breakdown.push({
        factor: `Critical Glycemia: ${vitals.bloodGlucose} mg/dL`,
        contribution: 22,
        type: 'vital_abnormal',
        detail: vitals.bloodGlucose < 60 ? 'Hypoglycemia alert' : 'Severe hyperglycemia / DKA risk',
      });
    }
  }

  // 3. Pain Severity and Duration
  if (entry.painSeverity >= 8) {
    score += 15;
    breakdown.push({
      factor: `Excruciating Pain (${entry.painSeverity}/10)`,
      contribution: 15,
      type: 'severity',
      detail: 'Severe acute somatic or visceral distress reported.',
    });
  } else if (entry.painSeverity >= 5) {
    score += 8;
    breakdown.push({
      factor: `Moderate Pain (${entry.painSeverity}/10)`,
      contribution: 8,
      type: 'severity',
      detail: 'Noticeable discomfort affecting mobility.',
    });
  }

  // 4. Vulnerable Demographics
  if (patientAge < 5) {
    score += 12;
    breakdown.push({
      factor: 'Pediatric Patient (<5 Years)',
      contribution: 12,
      type: 'vulnerable_group',
      detail: 'Infants and toddlers have fast physiological decompensation rates.',
    });
  } else if (patientAge > 65) {
    score += 10;
    breakdown.push({
      factor: 'Geriatric Patient (>65 Years)',
      contribution: 10,
      type: 'vulnerable_group',
      detail: 'Elderly population has multiple frailty co-morbidities.',
    });
  }

  // Normalize max score
  score = Math.min(score, 100);

  // Determine Triage Level
  let level: TriageLevel = 'LOW';
  let ambulanceRequired = false;

  if (hasCriticalDangerSign || score >= 65) {
    level = 'HIGH';
    ambulanceRequired = true;
  } else if (score >= 35) {
    level = 'MEDIUM';
  } else {
    level = 'LOW';
  }

  // Specialty & Diagnostic Test Mapping
  let recommendedSpecialty = 'General Medicine';
  const requiredTestsSet = new Set<string>();

  entry.chiefComplaints.forEach((c) => {
    const match = COMMON_SYMPTOMS.find((s) => s.labelEn === c || s.id === c);
    if (match) {
      if (match.specialty !== 'General Medicine') {
        recommendedSpecialty = match.specialty;
      }
      match.tests.forEach((t) => requiredTestsSet.add(t));
    }
  });

  // Fallback defaults
  if (requiredTestsSet.size === 0) {
    requiredTestsSet.add('Complete Blood Count (CBC)');
    if (level === 'HIGH' || level === 'MEDIUM') {
      requiredTestsSet.add('12-Lead ECG');
    }
  }

  // Clinical Justification Summary
  let clinicalJustification = '';
  if (level === 'HIGH') {
    clinicalJustification = `CRITICAL PRIORITY: Patient presents with ${breakdown.map((b) => b.factor).slice(0, 3).join(', ')}. Requires immediate stabilization and emergency tertiary referral.`;
  } else if (level === 'MEDIUM') {
    clinicalJustification = `URGENT REFERRAL: Patient presents with ${breakdown.map((b) => b.factor).slice(0, 2).join(', ')}. Clinical examination within 24-48 hours at a Sub-District or District facility is advised.`;
  } else {
    clinicalJustification = `ROUTINE / PRIMARY CARE: Vital signs stable without acute red-flag symptoms. Can be managed at Primary Health Centre (PHC) or via teleconsultation with a specialist doctor.`;
  }

  let immediateAdvice = '';
  if (level === 'HIGH') {
    immediateAdvice = 'Ensure airway, breathing, circulation (ABC). Administer supplemental oxygen if SpO2 < 94%. Call 108 Emergency Ambulance immediately for rapid transit.';
  } else if (level === 'MEDIUM') {
    immediateAdvice = 'Keep patient hydrated. Avoid strenuous activity. Schedule an appointment at the recommended specialist facility within 24-48 hours.';
  } else {
    immediateAdvice = 'Provide symptomatic relief medication from PHC stock. Advise rest, oral fluids, and follow up in 3 days or sooner if danger signs appear.';
  }

  return {
    level,
    score,
    scoreBreakdown: breakdown,
    clinicalJustification,
    recommendedSpecialty,
    requiredTests: Array.from(requiredTestsSet),
    immediateAdvice,
    ambulanceRequired,
    timestamp: new Date().toISOString(),
  };
}
