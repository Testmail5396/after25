import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  Backup,
  OrderInput,
  OrderRecord,
  ProductRateInput,
  ProductRateRecord,
  PurchaseInput,
  PurchaseRecord,
} from "@shared/types";
import * as api from "../lib/api";
import {
  cacheOrders,
  cacheProducts,
  cachePurchases,
  getCachedOrders,
  getCachedProducts,
  getCachedPurchases,
  getLastSyncedAt,
  setLastSyncedAt,
} from "../lib/db";

interface DataContextValue {
  orders: OrderRecord[];
  purchases: PurchaseRecord[];
  productRates: ProductRateRecord[];
  loading: boolean;
  syncing: boolean;
  isOffline: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  addOrder: (input: OrderInput) => Promise<void>;
  editOrder: (id: string, input: OrderInput) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
  dismissReminder: (id: string, forYear: number) => Promise<void>;
  addPurchase: (input: PurchaseInput) => Promise<void>;
  editPurchase: (id: string, input: PurchaseInput) => Promise<void>;
  removePurchase: (id: string) => Promise<void>;
  addProductRate: (input: ProductRateInput) => Promise<void>;
  editProductRate: (id: string, input: ProductRateInput) => Promise<void>;
  removeProductRate: (id: string) => Promise<void>;
  exportBackupData: () => Promise<Backup>;
  importBackupData: (backup: Backup) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [productRates, setProductRates] = useState<ProductRateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSyncedAt, setLastSyncedAtState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setSyncing(true);
    try {
      const [freshOrders, freshPurchases, freshProducts] = await Promise.all([
        api.fetchOrders(),
        api.fetchPurchases(),
        api.fetchProductRates(),
      ]);
      setOrders(freshOrders);
      setPurchases(freshPurchases);
      setProductRates(freshProducts);
      setIsOffline(false);
      setError(null);
      const now = new Date().toISOString();
      await Promise.all([
        cacheOrders(freshOrders),
        cachePurchases(freshPurchases),
        cacheProducts(freshProducts),
        setLastSyncedAt(now),
      ]);
      setLastSyncedAtState(now);
    } catch (err) {
      const isNetworkError = err instanceof api.ApiError && err.status === 0;
      if (isNetworkError) {
        setIsOffline(true);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong while syncing");
      }
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cachedOrders, cachedPurchases, cachedProducts, syncedAt] = await Promise.all([
        getCachedOrders(),
        getCachedPurchases(),
        getCachedProducts(),
        getLastSyncedAt(),
      ]);
      if (cancelled) return;
      setOrders(cachedOrders);
      setPurchases(cachedPurchases);
      setProductRates(cachedProducts);
      setLastSyncedAtState(syncedAt);
      setLoading(false);
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleOnline = () => refresh();
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refresh]);

  const addOrder = useCallback(
    async (input: OrderInput) => {
      await api.createOrder(input);
      await refresh();
    },
    [refresh],
  );

  const editOrder = useCallback(
    async (id: string, input: OrderInput) => {
      await api.updateOrder(id, input);
      await refresh();
    },
    [refresh],
  );

  const removeOrder = useCallback(
    async (id: string) => {
      await api.deleteOrder(id);
      await refresh();
    },
    [refresh],
  );

  const dismissReminder = useCallback(
    async (id: string, forYear: number) => {
      await api.dismissOrderReminder(id, forYear);
      await refresh();
    },
    [refresh],
  );

  const addPurchase = useCallback(
    async (input: PurchaseInput) => {
      await api.createPurchase(input);
      await refresh();
    },
    [refresh],
  );

  const editPurchase = useCallback(
    async (id: string, input: PurchaseInput) => {
      await api.updatePurchase(id, input);
      await refresh();
    },
    [refresh],
  );

  const removePurchase = useCallback(
    async (id: string) => {
      await api.deletePurchase(id);
      await refresh();
    },
    [refresh],
  );

  const addProductRate = useCallback(
    async (input: ProductRateInput) => {
      await api.createProductRate(input);
      await refresh();
    },
    [refresh],
  );

  const editProductRate = useCallback(
    async (id: string, input: ProductRateInput) => {
      await api.updateProductRate(id, input);
      await refresh();
    },
    [refresh],
  );

  const removeProductRate = useCallback(
    async (id: string) => {
      await api.deleteProductRate(id);
      await refresh();
    },
    [refresh],
  );

  const exportBackupData = useCallback(() => api.exportBackup(), []);

  const importBackupData = useCallback(
    async (backup: Backup) => {
      await api.importBackup(backup);
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      orders,
      purchases,
      productRates,
      loading,
      syncing,
      isOffline,
      lastSyncedAt,
      error,
      refresh,
      addOrder,
      editOrder,
      removeOrder,
      dismissReminder,
      addPurchase,
      editPurchase,
      removePurchase,
      addProductRate,
      editProductRate,
      removeProductRate,
      exportBackupData,
      importBackupData,
    }),
    [
      orders,
      purchases,
      productRates,
      loading,
      syncing,
      isOffline,
      lastSyncedAt,
      error,
      refresh,
      addOrder,
      editOrder,
      removeOrder,
      dismissReminder,
      addPurchase,
      editPurchase,
      removePurchase,
      addProductRate,
      editProductRate,
      removeProductRate,
      exportBackupData,
      importBackupData,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
