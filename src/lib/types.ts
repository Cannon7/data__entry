export interface Product {
  id: number;
  product: string | null;
  COGS: number | null;
  campus_premade: number | null;
  campus_custom: number | null;
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
  customer_id: number | null;
  employee: string | null;
  notes: string | null;
  card: boolean | null;
}

export interface OrderWithRelations extends Order {
  products: Pick<Product, "product" | "campus_premade" | "campus_custom"> | null;
  customers: Pick<Customer, "name" | "email" | "phone_number"> | null;
}

export function getProductPrice(
  product: Pick<Product, "campus_premade" | "campus_custom">,
  custom: boolean
): number | null {
  return custom ? product.campus_custom : product.campus_premade;
}

export function getOrderRevenue(order: OrderWithRelations): number | null {
  if (!order.products) return null;
  return getProductPrice(order.products, order.custom ?? false);
}
