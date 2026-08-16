import { Phone, MessageCircle, Pencil, Trash2, Cake, Cookie, Gift } from "lucide-react";
import type { OrderRecord } from "@shared/types";
import { formatCurrency, formatDateDisplay } from "../../lib/format";
import { telHref, whatsappHref } from "../../lib/phone";

interface OrderCardProps {
  order: OrderRecord;
  onEdit: () => void;
  onDelete: () => void;
}

const categoryIcon = { Cake, Brownie: Cookie };

export function OrderCard({ order, onEdit, onDelete }: OrderCardProps) {
  const Icon = categoryIcon[order.productCategory];
  const whatsappMessage = `Hi ${order.customerName.split(" ")[0]}, this is After25 Cakes following up on your order.`;

  return (
    <div className="rounded-xl2 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-100 text-berry-500">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-cocoa-700">{order.customerName}</p>
            <p className="text-sm text-cocoa-500">
              {order.productName} · {order.quantity} {order.quantityUnit}
            </p>
            {order.occasion !== "None" && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-berry-500">
                <Gift className="h-3.5 w-3.5" aria-hidden />
                {order.occasion}
                {order.occasionDate ? ` · ${formatDateDisplay(order.occasionDate)}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-cocoa-700">{formatCurrency(order.totalAmount)}</p>
          <p className="text-xs text-cocoa-400">{formatDateDisplay(order.saleDate)}</p>
        </div>
      </div>

      {order.pickupOrDeliveryTime && (
        <p className="mt-2 text-xs text-cocoa-400">Pickup/Delivery: {order.pickupOrDeliveryTime}</p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-cream-200 pt-3">
        <div className="flex gap-2">
          <a
            href={telHref(order.phoneNumber)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-200 text-cocoa-600"
            aria-label={`Call ${order.customerName}`}
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>
          <a
            href={whatsappHref(order.phoneNumber, whatsappMessage)}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-200 text-cocoa-600"
            aria-label={`WhatsApp ${order.customerName}`}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
          </a>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-11 w-11 items-center justify-center rounded-full text-cocoa-500 hover:bg-cream-200"
            aria-label={`Edit sale for ${order.customerName}`}
          >
            <Pencil className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-11 w-11 items-center justify-center rounded-full text-red-500 hover:bg-red-50"
            aria-label={`Delete sale for ${order.customerName}`}
          >
            <Trash2 className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
