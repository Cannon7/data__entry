import { useEffect, useState } from "react";
import { getErrorMessage } from "../lib/errors";
import { fetchUnfilledPreOrders, markPreOrderFilled } from "../lib/preOrders";
import type { PreOrderWithRelations } from "../lib/types";
import { OrderListItem } from "./OrderListItem";

interface PreOrdersPanelProps {
  active: boolean;
  refreshKey: number;
}

export function PreOrdersPanel({ active, refreshKey }: PreOrdersPanelProps) {
  const [preOrders, setPreOrders] = useState<PreOrderWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchUnfilledPreOrders();
        if (cancelled) return;
        setPreOrders(data);
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

  async function handleMarkFilled(id: number) {
    setMarkingId(id);
    setError(null);

    try {
      await markPreOrderFilled(id);
      setPreOrders((current) => current.filter((order) => order.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setMarkingId(null);
    }
  }

  if (!active) return null;

  if (loading && !loaded) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted">Loading pre-orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Open pre-orders</h2>
          <p className="text-sm text-muted">
            {preOrders.length} unfilled pre-order{preOrders.length === 1 ? "" : "s"}
          </p>
        </div>
        {loading && <span className="text-xs text-muted">Refreshing...</span>}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {preOrders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted">No open pre-orders.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border px-5">
            {preOrders.map((order) => (
              <OrderListItem
                key={order.id}
                order={order}
                action={
                  <button
                    type="button"
                    onClick={() => void handleMarkFilled(order.id)}
                    disabled={markingId === order.id}
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {markingId === order.id ? "Marking..." : "Mark as filled"}
                  </button>
                }
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
