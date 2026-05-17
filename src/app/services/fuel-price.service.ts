import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import {
  FuelPriceSnapshot,
  FuelProductId,
  FuelProductPrice,
  FuelRegion,
} from '../models/fuel-price.model';
import { FALLBACK_FUEL_PRICE_SNAPSHOT } from '../data/fuel-prices';
import { API_ENDPOINTS } from './api-endpoints';

@Injectable({ providedIn: 'root' })
export class FuelPriceService {
  private readonly http = inject(HttpClient);
  private readonly endpoints = inject(API_ENDPOINTS);
  private readonly snapshotSubject = new BehaviorSubject<FuelPriceSnapshot>(
    FALLBACK_FUEL_PRICE_SNAPSHOT,
  );

  readonly snapshot$ = this.snapshotSubject.asObservable();

  loadSnapshot(endpoint = this.endpoints.fuelPrices): Observable<FuelPriceSnapshot> {
    return this.http.get<FuelPriceSnapshot>(endpoint).pipe(
      tap((snapshot) => this.snapshotSubject.next(snapshot)),
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
}
