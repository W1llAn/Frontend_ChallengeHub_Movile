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
  username?: string; // Se cambia porque en la edicion del perfil no se debe cambiar el username
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
