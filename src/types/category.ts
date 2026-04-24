export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  partsCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CategoryLookup {
  id: string;
  name: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}
