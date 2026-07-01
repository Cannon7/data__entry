export const DOUBLE_SIDED_SURCHARGE = 3;

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
  double_sided: boolean | null;
  price_override: number | null;
  pre_order: boolean | null;
}

export interface PreOrder extends Order {
  pre_order_filled: boolean | null;
}

export interface OrderWithRelations extends Order {
  products: Pick<Product, "product" | "campus_premade" | "campus_custom"> | null;
  customers: Pick<Customer, "name" | "email" | "phone_number"> | null;
}

export interface PreOrderWithRelations extends PreOrder {
  products: Pick<Product, "product" | "campus_premade" | "campus_custom"> | null;
  customers: Pick<Customer, "name" | "email" | "phone_number"> | null;
}

export interface OrderInsert {
  product_id: number;
  custom: boolean;
  design: number | null;
  customer_id: number;
  employee: string;
  notes: string | null;
  card: boolean;
  double_sided: boolean;
  price_override: number | null;
  pre_order?: boolean;
}

export function getProductPrice(
  product: Pick<Product, "campus_premade" | "campus_custom">,
  custom: boolean
): number | null {
  return custom ? product.campus_custom : product.campus_premade;
}

export function getCalculatedUnitPrice(
  product: Pick<Product, "campus_premade" | "campus_custom"> | null,
  custom: boolean,
  doubleSided: boolean
): number | null {
  if (!product) return null;
  const base = getProductPrice(product, custom);
  if (base == null) return null;
  return base + (doubleSided ? DOUBLE_SIDED_SURCHARGE : 0);
}

export function getOrderRevenue(order: {
  custom: boolean | null;
  double_sided: boolean | null;
  price_override: number | null;
  products: Pick<Product, "campus_premade" | "campus_custom"> | null;
}): number | null {
  if (order.price_override != null) return order.price_override;
  return getCalculatedUnitPrice(
    order.products,
    order.custom ?? false,
    order.double_sided ?? false
  );
}
