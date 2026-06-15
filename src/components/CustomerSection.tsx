import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Customer } from "../lib/types";

interface CustomerSectionProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

export function CustomerSection({
  selectedCustomer,
  onSelect,
}: CustomerSectionProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const term = `%${search.trim()}%`;
      const { data, error: searchError } = await supabase
        .from("customers")
        .select("*")
        .or(`name.ilike.${term},email.ilike.${term},phone_number.ilike.${term}`)
        .order("name")
        .limit(8);

      if (!searchError) setResults(data ?? []);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  async function handleCreateCustomer() {
    if (!newName.trim()) {
      setError("Customer name is required.");
      return;
    }

    setCreating(true);
    setError(null);

    const payload = {
      name: newName.trim(),
      email: newEmail.trim() || null,
      phone_number: newPhone.trim() || null,
    };

    const { data, error: createError } = await supabase
      .from("customers")
      .insert(payload)
      .select()
      .single();

    if (createError) {
      // Insert may succeed even if returning the row fails (RLS SELECT).
      const { data: found, error: findError } = await supabase
        .from("customers")
        .select("*")
        .eq("name", payload.name)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!findError && found) {
        onSelect(found);
        setShowNewForm(false);
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setSearch("");
        setResults([]);
        setCreating(false);
        return;
      }

      setCreating(false);
      setError(createError.message);
      return;
    }

    setCreating(false);
    onSelect(data);
    setShowNewForm(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setSearch("");
    setResults([]);
  }

  if (selectedCustomer) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              Customer
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {selectedCustomer.name}
            </p>
            <div className="mt-1 space-y-0.5 text-sm text-muted">
              {selectedCustomer.email && <p>{selectedCustomer.email}</p>}
              {selectedCustomer.phone_number && (
                <p>{selectedCustomer.phone_number}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <label htmlFor="customer-search" className="mb-1.5 block text-sm font-medium text-slate-700">
          Search customer
        </label>
        <input
          id="customer-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, email, or phone..."
          className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        {searching && (
          <span className="absolute right-3 top-[2.6rem] text-xs text-muted">
            Searching...
          </span>
        )}
      </div>

      {results.length > 0 && (
        <ul className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          {results.map((customer) => (
            <li key={customer.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(customer);
                  setSearch("");
                  setResults([]);
                }}
                className="w-full border-b border-border px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{customer.name}</p>
                <p className="text-sm text-muted">
                  {[customer.email, customer.phone_number]
                    .filter(Boolean)
                    .join(" · ") || "No contact info"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {search.trim() && !searching && results.length === 0 && (
        <p className="text-sm text-muted">No customers found.</p>
      )}

      {!showNewForm ? (
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="text-sm font-medium text-brand-600 transition hover:text-brand-700"
        >
          + Add new customer
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-border bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">New customer</p>
          <div>
            <label htmlFor="new-name" className="mb-1 block text-sm font-medium text-slate-700">
              Name <span className="text-danger">*</span>
            </label>
            <input
              id="new-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleCreateCustomer();
                }
              }}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label htmlFor="new-email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label htmlFor="new-phone" className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              id="new-phone"
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleCreateCustomer()}
              disabled={creating}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {creating ? "Saving..." : "Save customer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewForm(false);
                setError(null);
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted transition hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
