import { useEffect, useState } from "react";
import { getErrorMessage } from "../lib/errors";
import { fetchAllOrders, formatCurrency, groupOrdersByDay, type OrdersByDay } from "../lib/orders";
import { OrderListItem } from "./OrderListItem";

interface OrderHistoryProps {
  active: boolean;
  refreshKey: number;
}

export function OrderHistory({ active, refreshKey }: OrderHistoryProps) {
  const [groups, setGroups] = useState<OrdersByDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const orders = await fetchAllOrders();
        if (cancelled) return;
        setGroups(groupOrdersByDay(orders));
        setLoaded(true);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [active, refreshKey]);

  if (!active) return null;

  if (loading && !loaded) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted">Loading order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Order history</h2>
        <p className="mt-4 text-sm text-amber-800">{error}</p>
      </div>
    );
  }

  const totalOrders = groups.reduce((sum, group) => sum + group.orders.length, 0);
  const totalRevenue = groups.reduce((sum, group) => sum + group.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Order history</h2>
          <p className="text-sm text-muted">
            {totalOrders} order{totalOrders === 1 ? "" : "s"} across {groups.length} day
            {groups.length === 1 ? "" : "s"}
            {totalOrders > 0 && (
              <> · {formatCurrency(totalRevenue)} total revenue</>
            )}
          </p>
        </div>
        {loading && (
          <span className="text-xs text-muted">Refreshing...</span>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted">No orders recorded yet.</p>
        </div>
      ) : (
        groups.map((group) => (
          <section
            key={group.dayKey}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border bg-slate-50 px-5 py-3">
              <h3 className="font-semibold text-slate-900">{group.label}</h3>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{formatCurrency(group.revenue)}</p>
                <p className="text-sm text-muted">
                  {group.orders.length} order{group.orders.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <ul className="divide-y divide-border px-5">
              {group.orders.map((order) => (
                <OrderListItem key={order.id} order={order} showDate={false} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
