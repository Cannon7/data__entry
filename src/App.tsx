import { useEffect, useMemo, useState } from "react";
import { CustomerSection } from "./components/CustomerSection";
import { fetchRecentOrders, RecentOrders } from "./components/RecentOrders";
import { supabase } from "./lib/supabase";
import { getErrorMessage } from "./lib/errors";
import {
  getProductPrice,
  type Customer,
  type OrderWithRelations,
  type Product,
  type SaleType,
} from "./lib/types";

const EMPLOYEE_STORAGE_KEY = "order-entry-employee";

function formatPrice(dollars: number | null) {
  if (dollars == null) return null;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderWithRelations[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [employee, setEmployee] = useState(() =>
    localStorage.getItem(EMPLOYEE_STORAGE_KEY) ?? ""
  );
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [productId, setProductId] = useState("");
  const [saleType, setSaleType] = useState<SaleType>("campus");
  const [custom, setCustom] = useState(false);
  const [design, setDesign] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === Number(productId)) ?? null,
    [products, productId]
  );

  const price = useMemo(() => {
    if (!selectedProduct) return null;
    return getProductPrice(selectedProduct, saleType, custom);
  }, [selectedProduct, saleType, custom]);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("product");

      if (error) {
        setLoadError(`Products: ${error.message}`);
      } else {
        setProducts(data ?? []);
      }
      setLoadingProducts(false);
    }

    async function loadOrders() {
      try {
        const orders = await fetchRecentOrders();
        setRecentOrders(orders);
      } catch (err) {
        const message = getErrorMessage(err);
        setOrdersError(message);
      } finally {
        setLoadingOrders(false);
      }
    }

    loadProducts();
    loadOrders();
  }, []);

  useEffect(() => {
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, employee);
  }, [employee]);

  function resetForm() {
    setCustomer(null);
    setProductId("");
    setSaleType("campus");
    setCustom(false);
    setDesign("");
    setNotes("");
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!employee.trim()) {
      setSubmitError("Enter your name before submitting.");
      return;
    }
    if (!customer) {
      setSubmitError("Select or create a customer.");
      return;
    }
    if (!productId) {
      setSubmitError("Select a product.");
      return;
    }
    if (!custom && !design.trim()) {
      setSubmitError("Enter a design number for premade orders.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("orders").insert({
      product_id: Number(productId),
      custom,
      design: !custom ? Number(design) : null,
      sale_type: saleType,
      customer_id: customer.id,
      employee: employee.trim(),
      notes: notes.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    const productName = selectedProduct?.product ?? "Order";
    setSuccessMessage(`${productName} recorded for ${customer.name}.`);
    resetForm();

    try {
      const orders = await fetchRecentOrders();
      setRecentOrders(orders);
      setOrdersError(null);
    } catch {
      // Non-blocking — order was saved successfully.
    }
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-red-800">Unable to connect</h1>
          <p className="mt-2 text-sm text-red-700">{loadError}</p>
          <p className="mt-4 text-xs text-red-600">
            Check your .env file and Supabase RLS policies allow read/write for
            products, customers, and orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Order Entry
            </h1>
            <p className="text-sm text-muted">Record customer orders</p>
          </div>
          <div className="w-48 sm:w-56">
            <label htmlFor="employee" className="mb-1 block text-xs font-medium text-muted">
              Employee
            </label>
            <input
              id="employee"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">New order</h2>

            {successMessage && (
              <div
                role="status"
                className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
              >
                {successMessage}
              </div>
            )}

            <div className="mt-6 space-y-6">
              <CustomerSection selectedCustomer={customer} onSelect={setCustomer} />

              <div>
                <label htmlFor="product" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Product <span className="text-danger">*</span>
                </label>
                <select
                  id="product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  disabled={loadingProducts}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100"
                  required
                >
                  <option value="">
                    {loadingProducts ? "Loading products..." : "Select a product"}
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product ?? `Product #${p.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">
                  Sale type <span className="text-danger">*</span>
                </legend>
                <div className="flex gap-3">
                  {(["campus", "fm"] as const).map((type) => (
                    <label
                      key={type}
                      className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        saleType === type
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-border bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="saleType"
                        value={type}
                        checked={saleType === type}
                        onChange={() => setSaleType(type)}
                        className="sr-only"
                      />
                      {type === "campus" ? "Campus" : "FM"}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">
                  Order type <span className="text-danger">*</span>
                </legend>
                <div className="flex gap-3">
                  {[
                    { value: false, label: "Premade" },
                    { value: true, label: "Custom" },
                  ].map(({ value, label }) => (
                    <label
                      key={label}
                      className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        custom === value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-border bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderType"
                        checked={custom === value}
                        onChange={() => {
                          setCustom(value);
                          if (value) setDesign("");
                        }}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {!custom && (
                <div>
                  <label htmlFor="design" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Design number <span className="text-danger">*</span>
                  </label>
                  <input
                    id="design"
                    type="number"
                    min={1}
                    value={design}
                    onChange={(e) => setDesign(e.target.value)}
                    placeholder="e.g. 1042"
                    className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional order notes..."
                  rows={3}
                  className="w-full resize-y rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {selectedProduct && price != null && (
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Price
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-slate-900">
                    {formatPrice(price) ?? "—"}
                  </p>
                </div>
              )}
            </div>

            {submitError && (
              <p className="mt-4 text-sm text-danger">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting || loadingProducts}
              className="mt-6 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Recording order..." : "Record order"}
            </button>
          </form>
        </section>

        <aside className="lg:col-span-2">
          <RecentOrders
            orders={recentOrders}
            loading={loadingOrders}
            error={ordersError}
          />
        </aside>
      </main>
    </div>
  );
}
