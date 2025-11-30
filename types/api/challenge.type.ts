export interface Challenge {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  creatorId: number;
  creatorUsername?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  progress?: number;
  // Agrega aquí otros campos relevantes según el DTO del backend
}

export interface UserChallenge {
  id: number;
  userId: number;
  challenge: Challenge;
  assignedAt?: string;
  // Otros campos si el DTO lo requiere
}
