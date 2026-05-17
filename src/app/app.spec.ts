import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { FALLBACK_FUEL_PRICE_SNAPSHOT } from './data/fuel-prices';
import { FuelPriceService } from './services/fuel-price.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: FuelPriceService,
          useValue: {
            snapshot$: of(FALLBACK_FUEL_PRICE_SNAPSHOT),
            currentSnapshot: () => FALLBACK_FUEL_PRICE_SNAPSHOT,
            loadSnapshot: () => of(FALLBACK_FUEL_PRICE_SNAPSHOT),
            findProduct: (id: string, region: string) =>
              FALLBACK_FUEL_PRICE_SNAPSHOT.products.find(
                (product) => product.id === id && product.region === region,
              ) ?? FALLBACK_FUEL_PRICE_SNAPSHOT.products[0],
            findProductInSnapshot: (
              snapshot: typeof FALLBACK_FUEL_PRICE_SNAPSHOT,
              id: string,
              region: string,
            ) =>
              snapshot.products.find(
                (product) => product.id === id && product.region === region,
              ) ?? snapshot.products[0],
            simulatePriceMove: () => undefined,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the dashboard title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Track pump prices');
  });
});
