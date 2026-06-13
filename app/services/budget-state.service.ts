import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  BudgetCategory,
  BudgetEntry,
  BudgetState,
  DEFAULT_BUDGET_ENTRIES,
} from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetStateService {
  private readonly stateSubject = new BehaviorSubject<BudgetState>({
    income: 42000,
    litresPerMonth: 95,
    officeDaysPerWeek: 3,
    weeklyKilometres: 260,
    fuelEfficiencyLitresPer100Km: 8.4,
    selectedFuelId: 'petrol-95',
    region: 'inland',
    entries: DEFAULT_BUDGET_ENTRIES.map((entry) => ({ ...entry })),
  });

  readonly state$ = this.stateSubject.asObservable();

  current(): BudgetState {
    return this.stateSubject.value;
  }

  update(partial: Partial<Omit<BudgetState, 'entries'>>): void {
    this.stateSubject.next({ ...this.current(), ...partial });
  }

  updateEntry(category: BudgetCategory, amount: number): void {
    const entries = this.current().entries.map((entry) =>
      entry.category === category ? { ...entry, amount } : entry,
    );
    this.stateSubject.next({ ...this.current(), entries });
  }

  replaceFuelBudget(amount: number): void {
    this.updateEntry('fuel', amount);
  }

  entries(): BudgetEntry[] {
    return this.current().entries;
  }
}
