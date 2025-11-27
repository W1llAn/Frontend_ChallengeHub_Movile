// types/api/category.type.ts

export interface Category {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface AddUserCategoryParams {
  userId: number;
  categoryId: number;
}
