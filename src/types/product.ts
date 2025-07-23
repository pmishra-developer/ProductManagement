export interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  availability: 'In Stock' | 'Out of Stock' | 'Low Stock';
}

export interface BulkUploadResult {
  successful: Product[];
  failed: Array<{ row: number; error: string; data: any }>;
}