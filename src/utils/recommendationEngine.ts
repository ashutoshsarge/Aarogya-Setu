import { Hospital, HospitalRecommendation, TriageResult } from '../types';

export function rankHospitals(
  hospitals: Hospital[],
  patientTaluka: string,
  triage: TriageResult
): HospitalRecommendation[] {
  const recommendations: HospitalRecommendation[] = hospitals.map((hospital) => {
    const reasons: string[] = [];
    
    // 1. Distance & Estimated Travel Time
    // Lookup distance or estimate based on default
    const distanceKm = hospital.distanceKmByTaluka[patientTaluka] ?? 45;
    // Average speed ~ 40 km/h on rural Maharashtra roads
    const estimatedTravelMinutes = Math.round((distanceKm / 40) * 60);

    // 2. Specialty Match Score (Max 35)
    let specialtyMatchScore = 0;
    const hasDirectSpecialty = hospital.availableSpecialties.includes(triage.recommendedSpecialty);
    const hasGeneralMedicine = hospital.availableSpecialties.includes('General Medicine');

    if (hasDirectSpecialty) {
      specialtyMatchScore = 35;
      reasons.push(`Dedicated ${triage.recommendedSpecialty} department available`);
    } else if (hasGeneralMedicine) {
      specialtyMatchScore = 18;
      reasons.push(`General Medicine department available for initial stabilization`);
    } else {
      specialtyMatchScore = 5;
    }

    // 3. Specialist Doctor On-Duty & Slot Score (Max 25)
    let doctorAvailabilityScore = 0;
    const matchingDoctor = hospital.onDutyDoctors.find(
      (d) => d.specialty === triage.recommendedSpecialty && d.onDutyToday
    );
    const generalDoctor = hospital.onDutyDoctors.find(
      (d) => d.specialty === 'General Medicine' && d.onDutyToday
    );

    let recommendedSlot = '10:00 AM - 12:00 PM';

    if (matchingDoctor) {
      doctorAvailabilityScore = 25;
      if (matchingDoctor.availableSlots.length > 0) {
        recommendedSlot = matchingDoctor.availableSlots[0];
      }
      reasons.push(`${matchingDoctor.name} (${triage.recommendedSpecialty}) is on-duty today`);
    } else if (generalDoctor) {
      doctorAvailabilityScore = 15;
      if (generalDoctor.availableSlots.length > 0) {
        recommendedSlot = generalDoctor.availableSlots[0];
      }
      reasons.push(`Medical Officer on-duty today`);
    } else {
      doctorAvailabilityScore = 5;
    }

    // 4. Diagnostic Facilities Readiness Score (Max 20)
    let diagnosticReadinessScore = 0;
    let availableTestsCount = 0;
    const required = triage.requiredTests;

    if (required.length > 0) {
      required.forEach((testName) => {
        const found = hospital.diagnosticFacilities.find(
          (df) => df.testName.toLowerCase().includes(testName.toLowerCase()) || testName.toLowerCase().includes(df.testName.toLowerCase())
        );
        if (found && found.isAvailableToday) {
          availableTestsCount++;
        }
      });

      const ratio = availableTestsCount / required.length;
      diagnosticReadinessScore = Math.round(ratio * 20);
      if (ratio === 1) {
        reasons.push(`All required diagnostic tests (${required.length}/${required.length}) operational today`);
      } else if (availableTestsCount > 0) {
        reasons.push(`${availableTestsCount}/${required.length} required tests ready on-site`);
      } else {
        reasons.push(`Limited diagnostic test readiness today`);
      }
    } else {
      diagnosticReadinessScore = 15;
    }

    // 5. Distance Score (Max 15)
    let distanceScore = 0;
    if (distanceKm <= 10) {
      distanceScore = 15;
      reasons.push(`Nearest facility (${distanceKm} km, ~${estimatedTravelMinutes} mins)`);
    } else if (distanceKm <= 30) {
      distanceScore = 12;
      reasons.push(`Moderate transit distance (${distanceKm} km)`);
    } else if (distanceKm <= 60) {
      distanceScore = 8;
    } else {
      distanceScore = 4;
    }

    // 6. Slots and Emergency Readiness Score (Max 5)
    let slotScore = 5;
    if (triage.level === 'HIGH') {
      if (hospital.bedAvailability.icuBeds > 0) {
        slotScore += 5; // bonus for ICU availability in emergency
        reasons.push(`ICU Beds available (${hospital.bedAvailability.icuBeds} open)`);
      }
    }

    // Calculate Total Score
    let totalScore = specialtyMatchScore + doctorAvailabilityScore + diagnosticReadinessScore + distanceScore + slotScore;

    // Emergency urgency adjustments
    if (triage.level === 'HIGH') {
      // In emergencies, if distance is very far (>80km), apply penalty unless it's the only tertiary centre
      if (distanceKm > 80 && hospital.type !== 'Tertiary / Medical College') {
        totalScore -= 15;
      }
      if (hospital.type === 'Tertiary / Medical College') {
        totalScore += 10; // boost tertiary centers for high severity
        reasons.push(`Tertiary Care & Super-speciality emergency facilities`);
      }
    }

    // Clamp score
    totalScore = Math.max(10, Math.min(100, Math.round(totalScore)));

    return {
      hospital,
      totalScore,
      distanceKm,
      estimatedTravelMinutes,
      specialtyMatchScore,
      doctorAvailabilityScore,
      diagnosticReadinessScore,
      distanceScore,
      slotScore,
      matchReasons: reasons,
      recommendedSlot,
    };
  });

  // Sort descending by total match score
  return recommendations.sort((a, b) => b.totalScore - a.totalScore);
}
