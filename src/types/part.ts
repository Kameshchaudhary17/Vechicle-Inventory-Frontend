export interface Part {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  brand?: string | null;
  unit: string;
  sellPrice: number;
  stockQty: number;
  reorderLevel: number;
  description?: string | null;
  imagePath?: string | null;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PartStats {
  total: number;
  active: number;
  lowStock: number;
  inventoryValue: number;
}

export interface PartPayload {
  code: string;
  name: string;
  categoryId: string;
  unit: string;
  sellPrice: number;
  reorderLevel: number;
  brand?: string;
  description?: string;
}
