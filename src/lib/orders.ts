import { supabase } from "./supabase";
import { getOrderRevenue, type OrderWithRelations } from "./types";

export const ORDER_SELECT = `
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
  pre_order,
  products ( product, campus_premade, campus_custom ),
  customers ( name, email, phone_number )
`;

export function formatCurrency(dollars: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

export function formatPaymentMethod(card: boolean | null) {
  if (card === true) return "Card";
  if (card === false) return "Cash";
  return "—";
}

export function formatOrderTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatOrderDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getLocalDayKey(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDayLabel(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameLocalDay(date, today)) return "Today";
  if (isSameLocalDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export interface OrdersByDay {
  dayKey: string;
  label: string;
  orders: OrderWithRelations[];
  revenue: number;
}

function sumDayRevenue(orders: OrderWithRelations[]) {
  return orders.reduce((sum, order) => sum + (getOrderRevenue(order) ?? 0), 0);
}

export function groupOrdersByDay(orders: OrderWithRelations[]): OrdersByDay[] {
  const groups = new Map<string, OrderWithRelations[]>();

  for (const order of orders) {
    const dayKey = getLocalDayKey(order.created_at);
    const existing = groups.get(dayKey);
    if (existing) {
      existing.push(order);
    } else {
      groups.set(dayKey, [order]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dayKey, dayOrders]) => ({
      dayKey,
      label: formatDayLabel(dayKey),
      orders: dayOrders,
      revenue: sumDayRevenue(dayOrders),
    }));
}

async function fetchOrders(limit?: number) {
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (limit != null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as OrderWithRelations[];
}

export function fetchRecentOrders() {
  return fetchOrders(10);
}

export function fetchAllOrders() {
  return fetchOrders();
}
