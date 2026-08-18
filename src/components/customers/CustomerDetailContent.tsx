import { useMemo, useState } from "react";
import { Phone, MessageCircle, Plus } from "lucide-react";
import type { OrderInput } from "@shared/types";
import { useData } from "../../context/DataContext";
import { useToast } from "../ui/Toast";
import { aggregateCustomers } from "../../lib/customers";
import { normalizePhoneNumber, telHref, whatsappHref } from "../../lib/phone";
import { formatCurrency, formatDateDisplay } from "../../lib/format";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";
import { Sheet } from "../ui/Sheet";
import { OrderForm } from "../sales/OrderForm";

interface CustomerDetailContentProps {
  phoneKey: string;
}

export function CustomerDetailContent({ phoneKey }: CustomerDetailContentProps) {
  const { orders, addOrder } = useData();
  const { showToast } = useToast();
  const [addSaleOpen, setAddSaleOpen] = useState(false);

  const customer = useMemo(() => aggregateCustomers(orders).find((c) => c.key === phoneKey), [orders, phoneKey]);

  const history = useMemo(
    () =>
      orders
        .filter((o) => (normalizePhoneNumber(o.phoneNumber) || o.phoneNumber) === phoneKey)
        .sort((a, b) => (a.saleDate < b.saleDate ? 1 : -1)),
    [orders, phoneKey],
  );

  if (!customer) {
    return (
      <EmptyState icon={Phone} title="Customer not found" description="This customer may no longer have any sales on record." />
    );
  }

  const message = `Hi ${customer.name.split(" ")[0]}, this is After25 Cakes. Thank you for being our customer!`;

  async function handleAddSale(input: OrderInput) {
    await addOrder(input);
    showToast("success", "Sale added");
    setAddSaleOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-cocoa-700">{customer.name}</h1>
        <p className="text-sm text-cocoa-500">{customer.phoneNumber}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a href={telHref(customer.phoneNumber)} className="flex items-center gap-1.5 rounded-full bg-cream-200 px-3.5 h-10 text-sm font-medium text-cocoa-600">
            <Phone className="h-4 w-4" aria-hidden /> Call
          </a>
          <a
            href={whatsappHref(customer.phoneNumber, message)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-cream-200 px-3.5 h-10 text-sm font-medium text-cocoa-600"
          >
            <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
          </a>
          <Button size="md" className="gap-1.5" onClick={() => setAddSaleOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Sale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-cocoa-400">Total spent</p>
          <p className="font-display text-lg font-bold text-cocoa-700">{formatCurrency(customer.totalSpent)}</p>
        </Card>
        <Card>
          <p className="text-xs text-cocoa-400">Orders</p>
          <p className="font-display text-lg font-bold text-cocoa-700">{customer.orderCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-cocoa-400">Average order value</p>
          <p className="font-display text-lg font-bold text-cocoa-700">{formatCurrency(customer.averageOrderValue)}</p>
        </Card>
        <Card>
          <p className="text-xs text-cocoa-400">Cake vs Brownie</p>
          <p className="text-sm font-semibold text-cocoa-700">
            {formatCurrency(customer.cakeSpent)} / {formatCurrency(customer.brownieSpent)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-cocoa-400">First order</p>
          <p className="text-sm font-semibold text-cocoa-700">{formatDateDisplay(customer.firstOrderDate)}</p>
        </Card>
        <Card>
          <p className="text-xs text-cocoa-400">Last order</p>
          <p className="text-sm font-semibold text-cocoa-700">{formatDateDisplay(customer.lastOrderDate)}</p>
        </Card>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-cocoa-600">Order history</p>
        <div className="flex flex-col gap-3">
          {history.map((order) => (
            <div key={order.id} className="rounded-xl2 bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-cocoa-700">
                    {order.productName} · {order.quantity} {order.quantityUnit}
                  </p>
                  <p className="text-xs text-cocoa-400">{order.productCategory}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-cocoa-700">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-cocoa-400">{formatDateDisplay(order.saleDate)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Sheet open={addSaleOpen} title={`Add sale for ${customer.name}`} onClose={() => setAddSaleOpen(false)}>
        <OrderForm
          lockedCustomer={{ name: customer.name, phoneNumber: customer.phoneNumber }}
          onSubmit={handleAddSale}
          onCancel={() => setAddSaleOpen(false)}
        />
      </Sheet>
    </div>
  );
}
