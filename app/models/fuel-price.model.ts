export type FuelRegion = 'inland' | 'coastal';

export type FuelProductId =
  | 'petrol-93'
  | 'petrol-95'
  | 'diesel-50ppm'
  | 'diesel-500ppm';

export interface FuelProductPrice {
  id: FuelProductId;
  label: string;
  region: FuelRegion;
  pricePerLitre: number;
  previousPricePerLitre: number;
  monthlyChange: number;
  kind: 'petrol' | 'diesel';
  note?: string;
}

export interface FuelPriceSnapshot {
  effectiveFrom: string;
  nextReview: string;
  sourceName: string;
  sourceUrl: string;
  products: FuelProductPrice[];
}
