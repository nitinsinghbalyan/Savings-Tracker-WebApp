const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toRupees(amountPaise: number): number {
  return amountPaise / 100;
}

export function formatINR(amountPaise: number): string {
  return inrFormatter.format(toRupees(amountPaise));
}

export function formatCompactINR(amountPaise: number): string {
  const rupees = toRupees(amountPaise);
  const absRupees = Math.abs(rupees);
  const sign = rupees < 0 ? "-" : "";

  if (absRupees >= 1_00_00_000) {
    return `${sign}₹${(absRupees / 1_00_00_000).toFixed(2).replace(/\.?0+$/, "")}Cr`;
  }

  if (absRupees >= 1_00_000) {
    return `${sign}₹${(absRupees / 1_00_000).toFixed(2).replace(/\.?0+$/, "")}L`;
  }

  if (absRupees >= 1_000) {
    return `${sign}₹${(absRupees / 1_000).toFixed(1).replace(/\.?0+$/, "")}K`;
  }

  return formatINR(amountPaise);
}
