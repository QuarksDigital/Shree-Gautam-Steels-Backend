export type ProductCategory =
  | 'Cookware'
  | 'Serveware'
  | 'Storage'
  | 'Thalis'
  | 'Spice Boxes';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Cookware',
  'Serveware',
  'Storage',
  'Thalis',
  'Spice Boxes',
];

export interface ProductSpec {
  material: string;
  gauge?: string;
  capacity?: string;
  finish?: string;
  dimensions?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  image: string;
  specs: ProductSpec;
  /** Display price as shown on the source listing, e.g. "₹ 450 / Piece". */
  price?: string;
  /** Minimum order quantity in units. */
  moq: number;
  featured?: boolean;
}
