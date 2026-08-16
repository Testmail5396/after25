import { useMemo, useState } from "react";
import { Plus, Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import type { OrderInput, OrderRecord, ProductCategory } from "@shared/types";
import { useData } from "../context/DataContext";
import { useToast } from "../components/ui/Toast";
import { Sheet } from "../components/ui/Sheet";
import { FilterBottomSheet } from "../components/ui/FilterBottomSheet";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ListItemSkeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { BottomActionDock } from "../components/ui/BottomActionDock";
import { MobilePageHeader } from "../components/layout/MobilePageHeader";
import { OrderForm } from "../components/sales/OrderForm";
import { OrderCard } from "../components/sales/OrderCard";
import { PAGE_BOTTOM_PADDING_DOCK } from "../components/layout/layoutTokens";

type CategoryFilter = "All" | ProductCategory;
type SortOrder = "newest" | "oldest";

export function SalesPage() {
  const { orders, loading, addOrder, editOrder, removeOrder } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState<CategoryFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState<CategoryFilter>(category);
  const [draftDateFrom, setDraftDateFrom] = useState(dateFrom);
  const [draftDateTo, setDraftDateTo] = useState(dateTo);
  const [draftSort, setDraftSort] = useState<SortOrder>(sort);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<OrderRecord | null>(null);

  const activeFilterCount =
    (category !== "All" ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0) + (sort !== "newest" ? 1 : 0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const phoneDigits = search.replace(/\D/g, "");
    const result = orders
      .filter((o) => category === "All" || o.productCategory === category)
      .filter((o) => (dateFrom ? o.saleDate >= dateFrom : true))
      .filter((o) => (dateTo ? o.saleDate <= dateTo : true))
      .filter((o) => {
        if (!query) return true;
        const matchesText =
          o.customerName.toLowerCase().includes(query) || o.productName.toLowerCase().includes(query);
        const matchesPhone = phoneDigits.length >= 3 && o.phoneNumber.replace(/\D/g, "").includes(phoneDigits);
        return matchesText || matchesPhone;
      });

    result.sort((a, b) => {
      if (a.saleDate !== b.saleDate) {
        return sort === "newest" ? (a.saleDate < b.saleDate ? 1 : -1) : a.saleDate < b.saleDate ? -1 : 1;
      }
      return sort === "newest" ? (a.createdAt < b.createdAt ? 1 : -1) : a.createdAt < b.createdAt ? -1 : 1;
    });
    return result;
  }, [orders, search, category, dateFrom, dateTo, sort]);

  function openAdd() {
    setEditingOrder(undefined);
    setSheetOpen(true);
  }

  function openEdit(order: OrderRecord) {
    setEditingOrder(order);
    setSheetOpen(true);
  }

  function openFilter() {
    setDraftCategory(category);
    setDraftDateFrom(dateFrom);
    setDraftDateTo(dateTo);
    setDraftSort(sort);
    setFilterOpen(true);
  }

  function applyFilter() {
    setCategory(draftCategory);
    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);
    setSort(draftSort);
    setFilterOpen(false);
  }

  function clearFilter() {
    setDraftCategory("All");
    setDraftDateFrom("");
    setDraftDateTo("");
    setDraftSort("newest");
    setCategory("All");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
    setFilterOpen(false);
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
    <div className={`flex flex-col gap-3 ${PAGE_BOTTOM_PADDING_DOCK}`}>
      <MobilePageHeader
        title="Sales"
        meta={`${filtered.length} sale${filtered.length === 1 ? "" : "s"}`}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openFilter}
              aria-label="Filter sales"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-white text-cocoa-500"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              {activeFilterCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-berry-500 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <Button onClick={openAdd} className="hidden gap-1.5 sm:inline-flex">
              <Plus className="h-4 w-4" aria-hidden />
              Add Sale
            </Button>
          </div>
        }
      />

      <div className="relative hidden sm:block">
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

      <BottomActionDock actionIcon={Plus} actionLabel="Add sale" onAction={openAdd}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sales"
            aria-label="Search sales"
            className="h-11 w-full rounded-full border border-cream-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-berry-400"
          />
        </div>
      </BottomActionDock>

      <Sheet open={sheetOpen} title={editingOrder ? "Edit sale" : "Add sale"} onClose={() => setSheetOpen(false)}>
        <OrderForm initial={editingOrder} onSubmit={handleSubmit} onCancel={() => setSheetOpen(false)} />
      </Sheet>

      <FilterBottomSheet
        open={filterOpen}
        title="Filter sales"
        onClose={() => setFilterOpen(false)}
        onApply={applyFilter}
        onReset={clearFilter}
        resetLabel="Clear"
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-cocoa-600">Category</p>
            <div className="grid grid-cols-3 gap-2">
              {(["All", "Cake", "Brownie"] as CategoryFilter[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDraftCategory(c)}
                  className={`h-11 rounded-xl border text-sm font-semibold ${
                    draftCategory === c
                      ? "border-berry-400 bg-blush-100 text-berry-600"
                      : "border-cream-300 bg-white text-cocoa-500"
                  }`}
                  aria-pressed={draftCategory === c}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-cocoa-500">
              From
              <input
                type="date"
                value={draftDateFrom}
                onChange={(e) => setDraftDateFrom(e.target.value)}
                className="h-11 rounded-lg border border-cream-300 bg-white px-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-cocoa-500">
              To
              <input
                type="date"
                value={draftDateTo}
                onChange={(e) => setDraftDateTo(e.target.value)}
                className="h-11 rounded-lg border border-cream-300 bg-white px-2 text-sm"
              />
            </label>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-cocoa-600">Sort by date</p>
            <div className="grid grid-cols-2 gap-2">
              {(["newest", "oldest"] as SortOrder[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraftSort(s)}
                  className={`h-11 rounded-xl border text-sm font-semibold capitalize ${
                    draftSort === s
                      ? "border-berry-400 bg-blush-100 text-berry-600"
                      : "border-cream-300 bg-white text-cocoa-500"
                  }`}
                  aria-pressed={draftSort === s}
                >
                  {s === "newest" ? "Newest first" : "Oldest first"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FilterBottomSheet>

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
