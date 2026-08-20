import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import type { ProductRateInput, ProductRateRecord } from "@shared/types";
import { useData } from "../context/DataContext";
import { useToast } from "../components/ui/Toast";
import { Sheet } from "../components/ui/Sheet";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ListItemSkeleton } from "../components/ui/Skeleton";
import { Button } from "../components/ui/Button";
import { FloatingActionButton } from "../components/ui/FloatingActionButton";
import { ProductRateForm } from "../components/products/ProductRateForm";
import { formatCurrency } from "../lib/format";
import { PAGE_BOTTOM_PADDING_FAB } from "../components/layout/layoutTokens";

export function ProductRatesPage() {
  const { productRates, loading, addProductRate, editProductRate, removeProductRate } = useData();
  const { showToast } = useToast();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRateRecord | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<ProductRateRecord | null>(null);

  const sorted = useMemo(
    () => [...productRates].sort((a, b) => a.productName.localeCompare(b.productName)),
    [productRates],
  );

  function openAdd() {
    setEditingProduct(undefined);
    setSheetOpen(true);
  }

  function openEdit(product: ProductRateRecord) {
    setEditingProduct(product);
    setSheetOpen(true);
  }

  async function handleSubmit(input: ProductRateInput) {
    if (editingProduct) {
      await editProductRate(editingProduct.id, input);
      showToast("success", "Product updated");
    } else {
      await addProductRate(input);
      showToast("success", "Product added");
    }
    setSheetOpen(false);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await removeProductRate(pendingDelete.id);
      showToast("success", "Product deleted");
    } catch {
      showToast("error", "Could not delete this product");
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className={`flex flex-col gap-3.5 ${PAGE_BOTTOM_PADDING_FAB}`}>
      <Link to="/more" className="flex items-center gap-1 text-sm font-medium text-cocoa-500">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to more
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-cocoa-700">Product Rates</h1>
          <p className="text-sm text-cocoa-500">
            Set a rate per kg for each product — sale amounts prefill from this, and stay fully editable.
          </p>
        </div>
        <Button onClick={openAdd} className="hidden shrink-0 gap-1.5 sm:inline-flex">
          <Plus className="h-4 w-4" aria-hidden />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <ListItemSkeleton key={i} />)
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No products added yet"
            description="Add a product and its rate per kg to start auto-filling sale amounts."
            action={
              <Button onClick={openAdd} className="mt-1 gap-1.5">
                <Plus className="h-4 w-4" aria-hidden />
                Add Product
              </Button>
            }
          />
        ) : (
          sorted.map((product) => (
            <div key={product.id} className="flex items-center gap-3 rounded-xl2 bg-white p-3.5 shadow-card">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-cocoa-700">{product.productName}</p>
                <p className="text-xs text-cocoa-500">
                  {product.category} · {formatCurrency(product.rate)}/{product.rateUnit === "pcs" ? "pc" : "kg"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(product)}
                aria-label={`Edit ${product.productName}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cocoa-500 hover:bg-cream-100"
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(product)}
                aria-label={`Delete ${product.productName}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))
        )}
      </div>

      <FloatingActionButton icon={Plus} label="Add product" onClick={openAdd} />

      <Sheet open={sheetOpen} title={editingProduct ? "Edit product" : "Add product"} onClose={() => setSheetOpen(false)}>
        <ProductRateForm initial={editingProduct} onSubmit={handleSubmit} onCancel={() => setSheetOpen(false)} />
      </Sheet>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this product?"
        description={`This will remove ${pendingDelete?.productName} from your rate list. Existing sales already recorded are not affected.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
