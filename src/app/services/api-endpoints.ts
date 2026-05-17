import { InjectionToken } from '@angular/core';

export interface ApiEndpoints {
  fuelPrices: string;
}

export const API_ENDPOINTS = new InjectionToken<ApiEndpoints>('API_ENDPOINTS', {
  providedIn: 'root',
  factory: () => ({
    fuelPrices: '/api/fuel-prices',
  }),
});
