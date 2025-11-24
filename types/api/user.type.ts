export interface UserResponseDTO {
  id: number;
  email: string;
  username: string;
  role: string;
  avatarUrl: string;
  description: string;
  location: string;
  birthDate: string;
  points: number;
  profileStatus: string;
  createdAt: string;
}

export interface UserItselfUpdateDTO {
  username?: string;
  email?: string;
  avatarUrl?: string;
  description: string;
  location: string;
  birthDate: string;
  profileStatus: string;
}

export interface UserAdminUpdateDTO {
  role: string;
  profileStatus: string;
  points: number;
}
