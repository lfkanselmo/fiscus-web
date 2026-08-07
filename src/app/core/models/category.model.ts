export interface Category {
  id: string;
  name: string;
  color_hex: string;
}

export interface CategoryCreate {
  name: string;
  color_hex: string;
}

export interface CategoryUpdate {
  name: string;
  color_hex: string;
}
