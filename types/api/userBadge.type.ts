import type { BadgeResponseDTO } from "./badge.type";
export type BadgesDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export interface BadgeWithUserCountDTO {
  id: number;
  name: string;
  description: string;
  difficulty: BadgesDifficulty; // ENUM
  userCount: number;
}

export interface CreateUserBadgeDTO {
  userId: number;
  badgeId: number;
}

export interface UserBadgeResponseDTO {
  id: number;
  userId: number;
  userName: string;
  badgeId: number;
  badgeName: string;
  badgeDescription: string;
  badgeDifficulty: string;
  earnedAt: string; // ISO string (LocalDateTime)
}


export interface UserBadgesSummaryDTO {
  userId: number;
  userName: string;
  totalBadges: number;
  badges: BadgeResponseDTO[];
}
