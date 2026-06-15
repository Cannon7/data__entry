export type SaleType = "campus" | "fm";

export interface Product {
  id: number;
  product: string | null;
  COGS: number | null;
  campus_premade: number | null;
  campus_custom: number | null;
  fm_premade: number | null;
  fm_custom: number | null;
}

export interface Customer {
  id: number;
  created_at: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
}

export interface Order {
  id: number;
  created_at: string;
  product_id: number | null;
  custom: boolean | null;
  design: number | null;
  sale_type: string | null;
  customer_id: number | null;
  employee: string | null;
  notes: string | null;
}

export interface OrderWithRelations extends Order {
  products: Pick<Product, "product"> | null;
  customers: Pick<Customer, "name" | "email" | "phone_number"> | null;
}

export function getProductPrice(
  product: Product,
  saleType: SaleType,
  custom: boolean
): number | null {
  if (saleType === "campus") {
    return custom ? product.campus_custom : product.campus_premade;
  }
  return custom ? product.fm_custom : product.fm_premade;
}
