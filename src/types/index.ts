// Core product type stored in Supabase inventory table
export interface Product {
  id: string;
  name: string;
  barcode: string;
  quantity: number;
  price: number; // price per unit
  expiry_date: string | null; // ISO date string
  category: string | null;
  brand: string | null;
  created_at: string;
  updated_at: string;
}

// Item in the billing cart (before finalizing)
export interface CartItem {
  product: Product;
  qty: number; // quantity being billed
  total: number; // price * qty
}

// OpenFoodFacts API response shape (minimal)
export interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  code?: string;
}

export interface OpenFoodFactsResponse {
  status: number; // 1 = found, 0 = not found
  product?: OpenFoodFactsProduct;
}
