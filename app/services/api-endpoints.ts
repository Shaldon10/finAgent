import { InjectionToken } from '@angular/core';

export interface ApiEndpoints {
  fuelPrices: string;
}

export const API_ENDPOINTS = new InjectionToken<ApiEndpoints>('API_ENDPOINTS', {
  providedIn: 'root',
  factory: () => ({
    fuelPrices: 'https://sa-fuel-api.guerillagardeningkzn.workers.dev/v1/prices/latest',
  }),
});
