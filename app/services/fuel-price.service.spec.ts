import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FuelPriceService } from './fuel-price.service';

describe('FuelPriceService', () => {
  let service: FuelPriceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(FuelPriceService);
  });

  it('returns a selected product by region', () => {
    const product = service.findProduct('petrol-95', 'inland');

    expect(product.label).toContain('Petrol 95');
    expect(product.pricePerLitre).toBeGreaterThan(0);
  });

  it('applies simulated price updates to all products', () => {
    const before = service.findProduct('petrol-95', 'inland').pricePerLitre;

    service.simulatePriceMove(10);

    expect(service.findProduct('petrol-95', 'inland').pricePerLitre).toBeCloseTo(
      before * 1.1,
      1,
    );
  });
});
