import { TestBed } from '@angular/core/testing';
import { DEFAULT_BUDGET_ENTRIES } from '../models/budget.model';
import { SimulatorService } from './simulator.service';

describe('SimulatorService', () => {
  it('calculates monthly and annual scenario savings', () => {
    const service = TestBed.inject(SimulatorService);

    const result = service.calculate(DEFAULT_BUDGET_ENTRIES, 2500, [
      'carpooling',
      'insurance',
    ]);

    expect(result.monthlySavings).toBeGreaterThan(0);
    expect(result.annualSavings).toBeCloseTo(result.monthlySavings * 12);
    expect(result.simulatedMonthlyCost).toBeLessThan(result.originalMonthlyCost);
  });

  it('does not show entertainment savings for remote work', () => {
    const service = TestBed.inject(SimulatorService);

    const result = service.calculate(DEFAULT_BUDGET_ENTRIES, 2500, ['remote-work']);

    expect(result.details.some((detail) => detail.label === 'Entertainment')).toBe(false);
  });
});
