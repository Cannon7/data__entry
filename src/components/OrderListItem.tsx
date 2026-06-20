import { formatOrderDateTime, formatOrderTime, formatPaymentMethod, formatCurrency } from "../lib/orders";
import { getOrderRevenue } from "../lib/types";
import type { OrderWithRelations } from "../lib/types";

interface OrderListItemProps {
  order: OrderWithRelations;
  showDate?: boolean;
  action?: React.ReactNode;
}

export function OrderListItem({ order, showDate = true, action }: OrderListItemProps) {
  const revenue = getOrderRevenue(order);

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900">
            {order.products?.product ?? "Unknown product"}
            {order.custom ? " (custom)" : " (premade)"}
            {order.double_sided && " · Double-sided"}
          </p>
          <p className="truncate text-sm text-muted">
            {order.customers?.name ?? "Walk-in"} · {formatPaymentMethod(order.card)}
            {!order.custom && order.design != null && ` · Design #${order.design}`}
            {revenue != null && ` · ${formatCurrency(revenue)}`}
            {order.price_override != null && " (override)"}
          </p>
          {order.notes && (
            <p className="mt-0.5 truncate text-sm text-slate-600">{order.notes}</p>
          )}
        </div>
        <div className="shrink-0 text-right text-sm">
          <p className="text-muted">
            {showDate ? formatOrderDateTime(order.created_at) : formatOrderTime(order.created_at)}
          </p>
          <p className="font-medium text-slate-700">{order.employee ?? "—"}</p>
        </div>
      </div>
      {action && <div className="mt-3">{action}</div>}
    </li>
  );
}
