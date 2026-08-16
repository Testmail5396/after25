import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  Cake,
  Cookie,
  CakeSlice,
  Croissant,
  Package,
  Gift,
  MoreVertical,
} from "lucide-react";
import type { OrderRecord } from "@shared/types";
import { formatCurrency, formatDateDisplayShort } from "../../lib/format";
import { telHref, whatsappHref } from "../../lib/phone";
import { OverflowActionMenu, type OverflowAction } from "../ui/OverflowActionMenu";

interface OrderCardProps {
  order: OrderRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const categoryIcon = {
  Cake,
  Brownie: Cookie,
  Cupcake: CakeSlice,
  Biscuits: Croissant,
  "Bento Cake": Package,
};

export function OrderCard({ order, onEdit, onDelete }: OrderCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = categoryIcon[order.productCategory];
  const whatsappMessage = `Hi ${order.customerName.split(" ")[0]}, this is After25 Cakes following up on your order.`;

  const actions: OverflowAction[] = [
    { key: "call", label: "Call", icon: Phone, href: telHref(order.phoneNumber) },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      href: whatsappHref(order.phoneNumber, whatsappMessage),
      target: "_blank",
      rel: "noreferrer",
    },
    { key: "edit", label: "Edit sale", icon: Pencil, onClick: onEdit },
    { key: "delete", label: "Delete sale", icon: Trash2, onClick: onDelete, destructive: true },
  ];

  return (
    <div className="rounded-xl2 bg-white p-3 shadow-card">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-100 text-berry-500">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-cocoa-700">{order.customerName}</p>
            <p className="shrink-0 text-sm font-semibold text-cocoa-700">{formatCurrency(order.totalAmount)}</p>
          </div>
          <p className="truncate text-xs text-cocoa-500">
            {order.productName} · {order.quantity} {order.quantityUnit}
          </p>
          <p className="text-[11px] text-cocoa-400">
            {formatDateDisplayShort(order.saleDate)}
            {order.pickupOrDeliveryTime ? ` · ${order.pickupOrDeliveryTime}` : ""}
          </p>
          {order.occasion !== "None" && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-berry-500">
              <Gift className="h-3 w-3" aria-hidden />
              {order.occasion}
              {order.occasionDate ? ` · ${formatDateDisplayShort(order.occasionDate)}` : ""}
            </p>
          )}
          {order.occasionNote && <p className="mt-0.5 truncate text-[11px] italic text-cocoa-400">{order.occasionNote}</p>}
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={`More actions for ${order.customerName}`}
          className="flex h-11 w-11 shrink-0 -mr-2 -mt-2 items-center justify-center rounded-full text-cocoa-400 hover:bg-cream-100"
        >
          <MoreVertical className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <OverflowActionMenu
        open={menuOpen}
        title={order.customerName}
        actions={actions}
        onClose={() => setMenuOpen(false)}
      />
    </div>
  );
}
