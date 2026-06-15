import { supabase } from "../lib/supabase";
import type { OrderWithRelations } from "../lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSaleType(saleType: string | null) {
  if (saleType === "campus") return "Campus";
  if (saleType === "fm") return "FM";
  return saleType ?? "—";
}

interface RecentOrdersProps {
  orders: OrderWithRelations[];
  loading: boolean;
  error?: string | null;
}

export function RecentOrders({ orders, loading, error }: RecentOrdersProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
        <p className="mt-4 text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
        <p className="mt-4 text-sm text-amber-800">{error}</p>
        <p className="mt-2 text-xs text-amber-700">
          Run the SQL in <code className="font-mono">supabase/setup.sql</code> to
          grant access to the orders table.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No orders recorded yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {orders.map((order) => (
            <li key={order.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">
                  {order.products?.product ?? "Unknown product"}
                  {order.custom ? " (custom)" : " (premade)"}
                </p>
                <p className="truncate text-sm text-muted">
                  {order.customers?.name ?? "Walk-in"} · {formatSaleType(order.sale_type)}
                  {!order.custom && order.design != null && ` · Design #${order.design}`}
                </p>
                {order.notes && (
                  <p className="mt-0.5 truncate text-sm text-slate-600">{order.notes}</p>
                )}
              </div>
              <div className="shrink-0 text-right text-sm">
                <p className="text-muted">{formatDate(order.created_at)}</p>
                <p className="font-medium text-slate-700">{order.employee ?? "—"}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function fetchRecentOrders(): Promise<OrderWithRelations[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      product_id,
      custom,
      design,
      sale_type,
      customer_id,
      employee,
      notes,
      products ( product ),
      customers ( name, email, phone_number )
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data ?? []) as unknown as OrderWithRelations[];
}
