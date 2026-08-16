import { Outlet } from "react-router-dom";
import { WifiOff, RefreshCw } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { useData } from "../../context/DataContext";
import { formatDateDisplay } from "../../lib/format";
import { formatDateOnly } from "../../lib/dateRange";

export function AppShell() {
  const { isOffline, syncing, lastSyncedAt } = useData();

  return (
    <div className="min-h-screen bg-cream-100 sm:pl-60">
      <Sidebar />
      {isOffline && (
        <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-cocoa-600 px-4 py-2 text-center text-xs font-medium text-cream-100">
          <WifiOff className="h-4 w-4" aria-hidden />
          Offline — showing last synced data{lastSyncedAt ? ` (${formatDateDisplay(formatDateOnly(new Date(lastSyncedAt)))})` : ""}
        </div>
      )}
      {!isOffline && syncing && (
        <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-blush-200 px-4 py-1.5 text-center text-xs font-medium text-cocoa-600">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Syncing...
        </div>
      )}
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-4 sm:pb-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
