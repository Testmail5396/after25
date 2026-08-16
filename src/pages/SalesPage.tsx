import { useMemo, useState } from "react";
import { Plus, Search, ShoppingBag } from "lucide-react";
import type { OrderInput, OrderRecord, ProductCategory } from "@shared/types";
import { useData } from "../context/DataContext";
import { useToast } from "../components/ui/Toast";
import { Sheet } from "../components/ui/Sheet";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ListItemSkeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { OrderForm } from "../components/sales/OrderForm";
import { OrderCard } from "../components/sales/OrderCard";

type CategoryFilter = "All" | ProductCategory;

export function SalesPage() {
  const { orders, loading, addOrder, editOrder, removeOrder } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<OrderRecord | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const phoneDigits = search.replace(/\D/g, "");
    return orders
      .filter((o) => category === "All" || o.productCategory === category)
      .filter((o) => (dateFrom ? o.saleDate >= dateFrom : true))
      .filter((o) => (dateTo ? o.saleDate <= dateTo : true))
      .filter((o) => {
        if (!query) return true;
        const matchesText =
          o.customerName.toLowerCase().includes(query) || o.productName.toLowerCase().includes(query);
        const matchesPhone = phoneDigits.length >= 3 && o.phoneNumber.replace(/\D/g, "").includes(phoneDigits);
        return matchesText || matchesPhone;
      })
      .sort((a, b) => (a.saleDate < b.saleDate ? 1 : a.saleDate > b.saleDate ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
  }, [orders, search, category, dateFrom, dateTo]);

  function openAdd() {
    setEditingOrder(undefined);
    setSheetOpen(true);
  }

  function openEdit(order: OrderRecord) {
    setEditingOrder(order);
    setSheetOpen(true);
  }

  async function handleSubmit(input: OrderInput) {
    if (editingOrder) {
      await editOrder(editingOrder.id, input);
      showToast("success", "Sale updated");
    } else {
      await addOrder(input);
      showToast("success", "Sale added");
    }
    setSheetOpen(false);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await removeOrder(pendingDelete.id);
      showToast("success", "Sale deleted");
    } catch {
      showToast("error", "Could not delete this sale");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-cocoa-700">Sales</h1>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" aria-hidden />
          Add Sale
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone or product"
          aria-label="Search sales"
          className="h-11 w-full rounded-xl border border-cream-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-berry-400"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {(["All", "Cake", "Brownie"] as CategoryFilter[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium ${
              category === c ? "bg-berry-500 text-white" : "bg-white text-cocoa-500 border border-cream-300"
            }`}
            aria-pressed={category === c}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs text-cocoa-500">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 rounded-lg border border-cream-300 bg-white px-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-cocoa-500">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 rounded-lg border border-cream-300 bg-white px-2 text-sm"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <ListItemSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={orders.length === 0 ? "No sales recorded yet" : "No sales match your filters"}
            description={
              orders.length === 0
                ? "Add your first sale to start tracking income."
                : "Try a different search or clear the filters."
            }
            action={
              orders.length === 0 ? (
                <Button onClick={openAdd} className="mt-1 gap-1.5">
                  <Plus className="h-4 w-4" aria-hidden />
                  Add Sale
                </Button>
              ) : undefined
            }
          />
        ) : (
          filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onEdit={() => openEdit(order)}
              onDelete={() => setPendingDelete(order)}
            />
          ))
        )}
      </div>

      <Sheet open={sheetOpen} title={editingOrder ? "Edit sale" : "Add sale"} onClose={() => setSheetOpen(false)}>
        <OrderForm initial={editingOrder} onSubmit={handleSubmit} onCancel={() => setSheetOpen(false)} />
      </Sheet>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this sale?"
        description={`This will permanently remove ${pendingDelete?.customerName}'s order. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
