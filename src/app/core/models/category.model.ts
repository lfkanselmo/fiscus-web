export interface Category {
  id: string;
  name: string;
  color_hex: string;
  monthly_budget_cents: number | null;
}

export interface CategoryCreate {
  name: string;
  color_hex: string;
  monthly_budget_cents: number | null;
}

export interface CategoryUpdate {
  name: string;
  color_hex: string;
  monthly_budget_cents: number | null;
}
