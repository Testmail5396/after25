import { useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, DatabaseBackup, LogOut, ChevronRight, FlaskConical } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useToast } from "../components/ui/Toast";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { buildSeedOrders, buildSeedPurchases } from "../lib/seedData";

export function MorePage() {
  const { user, logout } = useAuth();
  const { addOrder, addPurchase } = useData();
  const { showToast } = useToast();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function loadSampleData() {
    setSeeding(true);
    try {
      for (const order of buildSeedOrders()) {
        await addOrder(order);
      }
      for (const purchase of buildSeedPurchases()) {
        await addPurchase(purchase);
      }
      showToast("success", "Sample data loaded");
    } catch {
      showToast("error", "Could not load sample data");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-cocoa-700">More</h1>
        <p className="text-sm text-cocoa-500">Signed in as {user?.username}</p>
      </div>

      <nav className="flex flex-col divide-y divide-cream-200 overflow-hidden rounded-xl2 bg-white shadow-card">
        <Link to="/more/reminders" className="flex items-center gap-3 px-4 py-4">
          <BellRing className="h-5 w-5 text-berry-500" aria-hidden />
          <span className="flex-1 text-cocoa-700">Reminders</span>
          <ChevronRight className="h-5 w-5 text-cocoa-300" aria-hidden />
        </Link>
        <Link to="/more/backup" className="flex items-center gap-3 px-4 py-4">
          <DatabaseBackup className="h-5 w-5 text-berry-500" aria-hidden />
          <span className="flex-1 text-cocoa-700">Backup &amp; Data</span>
          <ChevronRight className="h-5 w-5 text-cocoa-300" aria-hidden />
        </Link>
      </nav>

      {import.meta.env.DEV && (
        <div className="rounded-xl2 border border-dashed border-cream-300 bg-white/60 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-cocoa-600">
            <FlaskConical className="h-4 w-4" aria-hidden />
            Developer tools
          </p>
          <p className="mb-3 text-xs text-cocoa-500">
            Loads sample sales and purchases for local testing. Never available in production.
          </p>
          <button
            type="button"
            onClick={loadSampleData}
            disabled={seeding}
            className="h-10 rounded-xl bg-cream-200 px-4 text-sm font-semibold text-cocoa-600 disabled:opacity-50"
          >
            {seeding ? "Loading sample data..." : "Load sample data"}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setLogoutConfirmOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl2 bg-white p-4 text-sm font-semibold text-red-600 shadow-card"
      >
        <LogOut className="h-5 w-5" aria-hidden />
        Log out
      </button>

      <p className="text-center text-xs text-cocoa-400">After25 Cakes · Internal tracker</p>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Log out?"
        description="You'll need to sign in again to access sales, purchases and customer data."
        confirmLabel="Log out"
        onConfirm={() => void logout()}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </div>
  );
}
