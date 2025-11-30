// types/api/user-category.type.ts

export interface UserCategory {
  id: number;
  userId: number;
  username: string;
  categoryId: number;
  categoryName: string;
}

export interface UserCategoryChallenge {
  challengeId: number;
  title: string;
  description: string;
  objective: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  progressPercent: number;
}

export interface DeleteUserCategoryParams {
  userId: number;
  categoryId: number;
}

export interface GetChallengesByCategoryParams {
  userId: number;
  categoryId: number;
}

export interface CreatorChallengeCount {
  userId: number;
  username: string;
  challengeCount: number;
}
