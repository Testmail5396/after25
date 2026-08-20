import { useState } from "react";
import { Pencil, Trash2, Receipt, MoreVertical } from "lucide-react";
import type { PurchaseRecord } from "@shared/types";
import { formatCurrency, formatDateDisplay } from "../../lib/format";
import { OverflowActionMenu, type OverflowAction } from "../ui/OverflowActionMenu";

interface PurchaseCardProps {
  purchase: PurchaseRecord;
  onEdit: () => void;
  onDelete: () => void;
}

export function PurchaseCard({ purchase, onEdit, onDelete }: PurchaseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const category = purchase.category ?? "General Groceries";

  const actions: OverflowAction[] = [
    { key: "edit", label: "Edit purchase", icon: Pencil, onClick: onEdit },
    { key: "delete", label: "Delete purchase", icon: Trash2, onClick: onDelete, destructive: true },
  ];

  return (
    <div className="flex items-center justify-between rounded-xl2 bg-white p-3 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-cocoa-500">
          <Receipt className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-cocoa-700">{formatCurrency(purchase.totalAmount)}</p>
          <p className="text-xs text-cocoa-400">
            {formatDateDisplay(purchase.purchaseDate)} · {category}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label="More actions for this purchase"
        className="flex h-11 w-11 items-center justify-center rounded-full text-cocoa-400 hover:bg-cream-100"
      >
        <MoreVertical className="h-5 w-5" aria-hidden />
      </button>

      <OverflowActionMenu
        open={menuOpen}
        title={formatCurrency(purchase.totalAmount)}
        actions={actions}
        onClose={() => setMenuOpen(false)}
      />
    </div>
  );
}
