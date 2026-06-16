import { fetchRecentOrders } from "../lib/orders";
import type { OrderWithRelations } from "../lib/types";
import { OrderListItem } from "./OrderListItem";

export { fetchRecentOrders };

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
            <OrderListItem key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}
