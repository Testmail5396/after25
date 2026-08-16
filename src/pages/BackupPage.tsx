import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, FileJson, Upload } from "lucide-react";
import { backupSchema } from "@shared/schemas";
import type { Backup } from "@shared/types";
import { useData } from "../context/DataContext";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { downloadTextFile, ordersToCsv, purchasesToCsv } from "../lib/csv";

export function BackupPage() {
  const { orders, purchases, exportBackupData, importBackupData } = useData();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<Backup | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleExportJson() {
    setExporting(true);
    try {
      const backup = await exportBackupData();
      downloadTextFile(`after25cakes-backup-${backup.exportedAt.slice(0, 10)}.json`, JSON.stringify(backup, null, 2), "application/json");
      showToast("success", "Backup downloaded");
    } catch {
      showToast("error", "Could not export backup");
    } finally {
      setExporting(false);
    }
  }

  function handleExportOrdersCsv() {
    downloadTextFile(`after25cakes-sales-${new Date().toISOString().slice(0, 10)}.csv`, ordersToCsv(orders), "text/csv");
  }

  function handleExportPurchasesCsv() {
    downloadTextFile(`after25cakes-purchases-${new Date().toISOString().slice(0, 10)}.csv`, purchasesToCsv(purchases), "text/csv");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImportError(null);
    try {
      const text = await file.text();
      const parsed = backupSchema.safeParse(JSON.parse(text));
      if (!parsed.success) {
        setImportError("This file doesn't match the expected backup format.");
        return;
      }
      setPendingImport(parsed.data);
    } catch {
      setImportError("Could not read this file. Make sure it's a valid backup JSON file.");
    }
  }

  async function confirmImport() {
    if (!pendingImport) return;
    setImporting(true);
    try {
      await importBackupData(pendingImport);
      showToast("success", "Backup imported successfully");
    } catch {
      showToast("error", "Could not import this backup");
    } finally {
      setImporting(false);
      setPendingImport(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/more" className="flex items-center gap-1 text-sm font-medium text-cocoa-500">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to more
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-cocoa-700">Backup &amp; Data</h1>
        <p className="text-sm text-cocoa-500">Your data lives securely in Netlify Blobs. Keep a personal backup too.</p>
      </div>

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-cocoa-600">Export</p>
        <Button variant="secondary" className="justify-start gap-2" onClick={handleExportJson} loading={exporting}>
          <FileJson className="h-4 w-4" aria-hidden />
          Download full JSON backup
        </Button>
        <Button variant="secondary" className="justify-start gap-2" onClick={handleExportOrdersCsv}>
          <Download className="h-4 w-4" aria-hidden />
          Download sales as CSV
        </Button>
        <Button variant="secondary" className="justify-start gap-2" onClick={handleExportPurchasesCsv}>
          <Download className="h-4 w-4" aria-hidden />
          Download purchases as CSV
        </Button>
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-cocoa-600">Restore from backup</p>
        <p className="text-xs text-cocoa-500">
          Choose a JSON backup file exported from After25 Cakes. You'll be asked to confirm before anything is
          imported.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="hidden"
          id="backup-file-input"
        />
        <Button variant="secondary" className="justify-start gap-2" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" aria-hidden />
          Choose backup file
        </Button>
        {importError && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {importError}
          </p>
        )}
      </Card>

      <ConfirmDialog
        open={!!pendingImport}
        title="Import this backup?"
        description={`This file contains ${pendingImport?.orders.length ?? 0} sale(s) and ${
          pendingImport?.purchases.length ?? 0
        } purchase(s). Matching records will be updated and new ones added. Existing records not in the file will be kept.`}
        confirmLabel={importing ? "Importing..." : "Import"}
        danger={false}
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  );
}
