import { useMemo, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import type { PurchaseInput, PurchaseRecord } from "@shared/types";
import { useData } from "../context/DataContext";
import { useToast } from "../components/ui/Toast";
import { Sheet } from "../components/ui/Sheet";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ListItemSkeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PurchaseForm } from "../components/purchases/PurchaseForm";
import { PurchaseCard } from "../components/purchases/PurchaseCard";
import { sumPurchases } from "../lib/calculations";
import { formatCurrency } from "../lib/format";

export function PurchasesPage() {
  const { purchases, loading, addPurchase, editPurchase, removePurchase } = useData();
  const { showToast } = useToast();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<PurchaseRecord | null>(null);

  const filtered = useMemo(() => {
    return purchases
      .filter((p) => (dateFrom ? p.purchaseDate >= dateFrom : true))
      .filter((p) => (dateTo ? p.purchaseDate <= dateTo : true))
      .sort((a, b) => (a.purchaseDate < b.purchaseDate ? 1 : a.purchaseDate > b.purchaseDate ? -1 : (a.createdAt < b.createdAt ? 1 : -1)));
  }, [purchases, dateFrom, dateTo]);

  const periodTotal = useMemo(() => sumPurchases(filtered), [filtered]);

  function openAdd() {
    setEditingPurchase(undefined);
    setSheetOpen(true);
  }

  function openEdit(purchase: PurchaseRecord) {
    setEditingPurchase(purchase);
    setSheetOpen(true);
  }

  async function handleSubmit(input: PurchaseInput) {
    if (editingPurchase) {
      await editPurchase(editingPurchase.id, input);
      showToast("success", "Purchase updated");
    } else {
      await addPurchase(input);
      showToast("success", "Purchase added");
    }
    setSheetOpen(false);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await removePurchase(pendingDelete.id);
      showToast("success", "Purchase deleted");
    } catch {
      showToast("error", "Could not delete this purchase");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-cocoa-700">Purchases</h1>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="h-4 w-4" aria-hidden />
          Add Purchase
        </Button>
      </div>

      <Card className="flex items-center justify-between">
        <span className="text-sm text-cocoa-500">Total for selected period</span>
        <span className="text-lg font-bold text-cocoa-700">{formatCurrency(periodTotal)}</span>
      </Card>

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
            icon={Wallet}
            title={purchases.length === 0 ? "No purchases recorded yet" : "No purchases in this range"}
            description={
              purchases.length === 0
                ? "Add your first purchase to start tracking spend on materials."
                : "Try a different date range."
            }
            action={
              purchases.length === 0 ? (
                <Button onClick={openAdd} className="mt-1 gap-1.5">
                  <Plus className="h-4 w-4" aria-hidden />
                  Add Purchase
                </Button>
              ) : undefined
            }
          />
        ) : (
          filtered.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onEdit={() => openEdit(purchase)}
              onDelete={() => setPendingDelete(purchase)}
            />
          ))
        )}
      </div>

      <Sheet open={sheetOpen} title={editingPurchase ? "Edit purchase" : "Add purchase"} onClose={() => setSheetOpen(false)}>
        <PurchaseForm initial={editingPurchase} onSubmit={handleSubmit} onCancel={() => setSheetOpen(false)} />
      </Sheet>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this purchase?"
        description="This will permanently remove this purchase record. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
