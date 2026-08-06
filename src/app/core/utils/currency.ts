const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCents(amountCents: number): string {
  return COP_FORMATTER.format(amountCents / 100);
}
