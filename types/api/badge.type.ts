export interface BadgeCreateDTO {
  name: string;
  description: string;
  iconUrl: string;
}

export interface BadgeUpdateDTO {
  name?: string;
  description?: string;
  iconUrl?: string;
}

export interface BadgeAssignDTO {
  userId: number;
  awardedAt: string; // ISO date-time
}

export interface BadgeUserAssignmentResponseDTO {
  id: number;
  userId: number;
  awardedAt: string;
}

export interface BadgeResponseDTO {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  createdAt: string;
}


export interface BadgeWithAssignmentsDTO {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  createdAt: string;
  assignments: BadgeUserAssignmentResponseDTO[];
}


