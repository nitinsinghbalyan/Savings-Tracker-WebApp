function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function buildCsvRow(values: (string | number | null | undefined)[]): string {
  return values.map(escapeCsvValue).join(",");
}

export function buildTransactionsCsv(
  rows: {
    planName: string;
    amountPaise: number;
    transactionType: string;
    source: string | null;
    note: string | null;
    transactionDate: string;
    createdAt: string;
  }[],
): string {
  const header = buildCsvRow([
    "plan_name",
    "amount_rupees",
    "amount_paise",
    "transaction_type",
    "source",
    "note",
    "transaction_date",
    "created_at",
  ]);

  const body = rows.map((row) =>
    buildCsvRow([
      row.planName,
      (row.amountPaise / 100).toFixed(2),
      row.amountPaise,
      row.transactionType,
      row.source,
      row.note,
      row.transactionDate,
      row.createdAt,
    ]),
  );

  return [header, ...body].join("\n");
}

export function buildPlansCsv(
  rows: {
    name: string;
    category: string;
    targetAmountPaise: number;
    targetDate: string | null;
    priority: string;
    status: string;
    createdAt: string;
  }[],
): string {
  const header = buildCsvRow([
    "name",
    "category",
    "target_amount_rupees",
    "target_amount_paise",
    "target_date",
    "priority",
    "status",
    "created_at",
  ]);

  const body = rows.map((row) =>
    buildCsvRow([
      row.name,
      row.category,
      (row.targetAmountPaise / 100).toFixed(2),
      row.targetAmountPaise,
      row.targetDate,
      row.priority,
      row.status,
      row.createdAt,
    ]),
  );

  return [header, ...body].join("\n");
}
