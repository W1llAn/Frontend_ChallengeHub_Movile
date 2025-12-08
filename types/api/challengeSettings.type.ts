

export type ValidationType = "PHOTO" | "PDF";
export type Frequency = "DAILY" | "WEEKLY" | "CUSTOM";


export interface ChallengeSettingsResponseDTO {
  id: number;
  challengeId: number;
  validationType: ValidationType;
  frequency: Frequency;
  requireReview: boolean;
  pointsPerSubmission: number;
}


export interface ChallengeSettingsUpsertDTO {
  challengeId: number;
  validationType: ValidationType;
  frequency: Frequency;
  requireReview: boolean;
  pointsPerSubmission: number;
}
