"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import {
  exportPlansCsv,
  exportTransactionsCsv,
} from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function downloadCsvFile(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SettingsDataManagement() {
  const [error, setError] = useState<string | null>(null);
  const [isExportingTransactions, setIsExportingTransactions] = useState(false);
  const [isExportingPlans, setIsExportingPlans] = useState(false);

  async function handleExportTransactions() {
    setError(null);
    setIsExportingTransactions(true);

    try {
      const result = await exportTransactionsCsv();

      if ("error" in result) {
        toast.error("Export failed", { description: result.error });
        setError(result.error);
        return;
      }

      downloadCsvFile(result.csv, result.filename);
      toast.success("Transactions exported");
    } finally {
      setIsExportingTransactions(false);
    }
  }

  async function handleExportPlans() {
    setError(null);
    setIsExportingPlans(true);

    try {
      const result = await exportPlansCsv();

      if ("error" in result) {
        toast.error("Export failed", { description: result.error });
        setError(result.error);
        return;
      }

      downloadCsvFile(result.csv, result.filename);
      toast.success("Plans exported");
    } finally {
      setIsExportingPlans(false);
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Data management</CardTitle>
        <CardDescription>
          Download a copy of your savings plans and transactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          type="button"
          variant="outline"
          size="touch"
          className="w-full justify-center gap-2"
          onClick={handleExportTransactions}
          disabled={isExportingTransactions || isExportingPlans}
        >
          <Download className="size-4" />
          {isExportingTransactions
            ? "Exporting…"
            : "Export transactions as CSV"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="touch"
          className="w-full justify-center gap-2"
          onClick={handleExportPlans}
          disabled={isExportingTransactions || isExportingPlans}
        >
          <Download className="size-4" />
          {isExportingPlans ? "Exporting…" : "Export plans as CSV"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
