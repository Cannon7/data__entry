import { supabase } from "./supabase";
import type { OrderInsert, PreOrderWithRelations } from "./types";

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

function toOrderInsert(preOrder: PreOrderWithRelations): OrderInsert {
  return {
    product_id: preOrder.product_id!,
    custom: preOrder.custom ?? false,
    design: preOrder.design,
    customer_id: preOrder.customer_id!,
    employee: preOrder.employee ?? "",
    notes: preOrder.notes,
    card: preOrder.card ?? true,
    double_sided: preOrder.double_sided ?? false,
    price_override: preOrder.price_override,
    pre_order: true,
  };
}

export async function markPreOrderFilled(id: number) {
  const { data: preOrder, error: fetchError } = await supabase
    .from(PRE_ORDERS_TABLE)
    .select(PRE_ORDER_SELECT)
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;
  if (!preOrder) throw new Error("Pre-order not found.");

  const row = preOrder as unknown as PreOrderWithRelations;
  if (!row.product_id || !row.customer_id) {
    throw new Error("Pre-order is missing required product or customer.");
  }

  const { error: orderError } = await supabase
    .from("orders")
    .insert(toOrderInsert(row));

  if (orderError) throw orderError;

  const { error: updateError } = await supabase
    .from(PRE_ORDERS_TABLE)
    .update({ pre_order_filled: true })
    .eq("id", id);

  if (updateError) throw updateError;
}
