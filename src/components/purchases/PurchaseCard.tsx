import { Pencil, Trash2, Receipt } from "lucide-react";
import type { PurchaseRecord } from "@shared/types";
import { formatCurrency, formatDateDisplay } from "../../lib/format";

interface PurchaseCardProps {
  purchase: PurchaseRecord;
  onEdit: () => void;
  onDelete: () => void;
}

export function PurchaseCard({ purchase, onEdit, onDelete }: PurchaseCardProps) {
  return (
    <div className="flex items-center justify-between rounded-xl2 bg-white p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-200 text-cocoa-500">
          <Receipt className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="font-semibold text-cocoa-700">{formatCurrency(purchase.totalAmount)}</p>
          <p className="text-xs text-cocoa-400">{formatDateDisplay(purchase.purchaseDate)}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-11 w-11 items-center justify-center rounded-full text-cocoa-500 hover:bg-cream-200"
          aria-label="Edit purchase"
        >
          <Pencil className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-11 w-11 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
          aria-label="Delete purchase"
        >
          <Trash2 className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
