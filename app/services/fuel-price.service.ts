import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import {
  FuelPriceSnapshot,
  FuelProductId,
  FuelProductPrice,
  FuelRegion,
} from '../models/fuel-price.model';
import { FALLBACK_FUEL_PRICE_SNAPSHOT } from '../data/fuel-prices';
import { API_ENDPOINTS } from './api-endpoints';

interface FuelPriceApiResponse {
  success: boolean;
  data?: RemoteFuelPriceData;
}

interface RemoteFuelPriceData {
  month?: string;
  monthLabel?: string;
  prices?: {
    petrol?: {
      p93Inland?: number;
      p95Inland?: number;
      p95Coastal?: number;
    };
    diesel?: {
      d500Inland?: number;
      d500Coastal?: number;
      d50Inland?: number;
      d50Coastal?: number;
    };
  };
  source?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class FuelPriceService {
  private readonly http = inject(HttpClient);
  private readonly endpoints = inject(API_ENDPOINTS);
  private readonly snapshotSubject = new BehaviorSubject<FuelPriceSnapshot>(
    FALLBACK_FUEL_PRICE_SNAPSHOT,
  );
  private cachedSnapshot: FuelPriceSnapshot | null = null;

  readonly snapshot$ = this.snapshotSubject.asObservable();

  loadSnapshot(endpoint = this.endpoints.fuelPrices): Observable<FuelPriceSnapshot> {
    return this.http.get<unknown>(endpoint).pipe(
      map((payload) => this.parseSnapshot(payload)),
      tap((snapshot) => {
        this.cachedSnapshot = structuredClone(snapshot);
        this.snapshotSubject.next(snapshot);
      }),
      catchError(() =>
        endpoint === '/data/fuel-prices.json'
          ? of(this.snapshotSubject.value)
          : this.loadSnapshot('/data/fuel-prices.json'),
      ),
    );
  }

  currentSnapshot(): FuelPriceSnapshot {
    return this.snapshotSubject.value;
  }

  resetSnapshot(): void {
    if (this.cachedSnapshot) {
      this.snapshotSubject.next(structuredClone(this.cachedSnapshot));
    }
  }

  private parseSnapshot(payload: unknown): FuelPriceSnapshot {
    const response = payload as FuelPriceApiResponse;
    const data = response.success && response.data ? response.data : undefined;

    if (!data || !data.prices) {
      return FALLBACK_FUEL_PRICE_SNAPSHOT;
    }

    const products: FuelProductPrice[] = [
      {
        id: 'petrol-93',
        label: 'Petrol 93 ULP',
        region: 'inland',
        pricePerLitre: this.toNumber(data.prices.petrol?.p93Inland),
        previousPricePerLitre: this.toNumber(data.prices.petrol?.p93Inland),
        monthlyChange: 0,
        kind: 'petrol',
      },
      {
        id: 'petrol-95',
        label: 'Petrol 95 ULP',
        region: 'inland',
        pricePerLitre: this.toNumber(data.prices.petrol?.p95Inland),
        previousPricePerLitre: this.toNumber(data.prices.petrol?.p95Inland),
        monthlyChange: 0,
        kind: 'petrol',
      },
      {
        id: 'petrol-95',
        label: 'Petrol 95 ULP',
        region: 'coastal',
        pricePerLitre: this.toNumber(data.prices.petrol?.p95Coastal),
        previousPricePerLitre: this.toNumber(data.prices.petrol?.p95Coastal),
        monthlyChange: 0,
        kind: 'petrol',
      },
      {
        id: 'diesel-500ppm',
        label: 'Diesel 500 ppm',
        region: 'inland',
        pricePerLitre: this.toNumber(data.prices.diesel?.d500Inland),
        previousPricePerLitre: this.toNumber(data.prices.diesel?.d500Inland),
        monthlyChange: 0,
        kind: 'diesel',
        note: 'Wholesale diesel benchmark. Retail prices vary by forecourt.',
      },
      {
        id: 'diesel-500ppm',
        label: 'Diesel 500 ppm',
        region: 'coastal',
        pricePerLitre: this.toNumber(data.prices.diesel?.d500Coastal),
        previousPricePerLitre: this.toNumber(data.prices.diesel?.d500Coastal),
        monthlyChange: 0,
        kind: 'diesel',
        note: 'Wholesale diesel benchmark. Retail prices vary by forecourt.',
      },
      {
        id: 'diesel-50ppm',
        label: 'Diesel 50 ppm',
        region: 'inland',
        pricePerLitre: this.toNumber(data.prices.diesel?.d50Inland),
        previousPricePerLitre: this.toNumber(data.prices.diesel?.d50Inland),
        monthlyChange: 0,
        kind: 'diesel',
        note: 'Wholesale diesel benchmark. Retail prices vary by forecourt.',
      },
      {
        id: 'diesel-50ppm',
        label: 'Diesel 50 ppm',
        region: 'coastal',
        pricePerLitre: this.toNumber(data.prices.diesel?.d50Coastal),
        previousPricePerLitre: this.toNumber(data.prices.diesel?.d50Coastal),
        monthlyChange: 0,
        kind: 'diesel',
        note: 'Wholesale diesel benchmark. Retail prices vary by forecourt.',
      },
    ];

    return {
      effectiveFrom: data.month ?? data.updatedAt ?? FALLBACK_FUEL_PRICE_SNAPSHOT.effectiveFrom,
      nextReview: FALLBACK_FUEL_PRICE_SNAPSHOT.nextReview,
      sourceName: data.source ?? FALLBACK_FUEL_PRICE_SNAPSHOT.sourceName,
      sourceUrl: 'https://sa-fuel-api.guerillagardeningkzn.workers.dev/',
      products: products.map((product) => ({
        ...product,
        pricePerLitre: this.roundMoney(product.pricePerLitre),
        previousPricePerLitre: this.roundMoney(product.previousPricePerLitre),
        monthlyChange: this.roundMoney(product.monthlyChange),
      })),
    };
  }

  findProduct(
    productId: FuelProductId | string,
    region: FuelRegion,
  ): FuelProductPrice {
    return this.findProductInSnapshot(this.snapshotSubject.value, productId, region);
  }

  findProductInSnapshot(
    snapshot: FuelPriceSnapshot,
    productId: FuelProductId | string,
    region: FuelRegion,
  ): FuelProductPrice {
    return (
      snapshot.products.find(
        (product) => product.id === productId && product.region === region,
      ) ??
      snapshot.products.find((product) => product.region === region) ??
      snapshot.products[0]
    );
  }

  simulatePriceMove(percentMove: number): void {
    const current = this.snapshotSubject.value;
    const products = current.products.map((product) => {
      const nextPrice = this.roundMoney(product.pricePerLitre * (1 + percentMove / 100));

      return {
        ...product,
        previousPricePerLitre: product.pricePerLitre,
        pricePerLitre: nextPrice,
        monthlyChange: this.roundMoney(nextPrice - product.pricePerLitre),
      };
    });

    this.snapshotSubject.next({
      ...current,
      products,
      sourceName: `${current.sourceName} with simulated live movement`,
    });
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private toNumber(value: number | undefined): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }
}
