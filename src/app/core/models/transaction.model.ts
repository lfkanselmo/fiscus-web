export interface Transaction {
  id: string;
  occurred_at: string;
  merchant: string;
  amount_cents: number;
  currency: string;
  category_id: string;
  raw_description: string;
}

export interface TransactionFilters {
  category_id?: string;
  merchant?: string;
  occurred_from?: string;
  occurred_to?: string;
}
