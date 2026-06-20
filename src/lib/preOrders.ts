import { supabase } from "./supabase";
import type { PreOrderWithRelations } from "./types";

export const PRE_ORDERS_TABLE = "pre-orders";

export const PRE_ORDER_SELECT = `
  id,
  created_at,
  product_id,
  custom,
  design,
  customer_id,
  employee,
  notes,
  card,
  double_sided,
  price_override,
  pre_order_filled,
  products ( product, campus_premade, campus_custom ),
  customers ( name, email, phone_number )
`;

export async function fetchUnfilledPreOrders(): Promise<PreOrderWithRelations[]> {
  const { data, error } = await supabase
    .from(PRE_ORDERS_TABLE)
    .select(PRE_ORDER_SELECT)
    .or("pre_order_filled.is.null,pre_order_filled.eq.false")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PreOrderWithRelations[];
}

export async function markPreOrderFilled(id: number) {
  const { error } = await supabase
    .from(PRE_ORDERS_TABLE)
    .update({ pre_order_filled: true })
    .eq("id", id);

  if (error) throw error;
}
