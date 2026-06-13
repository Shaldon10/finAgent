import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  calculateMonthlyKilometres,
  calculateMonthlyLitres,
} from '../../models/budget.model';
import { FuelProductId, FuelRegion } from '../../models/fuel-price.model';
import { BudgetStateService } from '../../services/budget-state.service';
import { FuelPriceService } from '../../services/fuel-price.service';

@Component({
  selector: 'app-budget-impact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-impact.component.html',
  styleUrl: './budget-impact.component.scss',
})
export class BudgetImpactComponent {
  private readonly budgetState = inject(BudgetStateService);
  private readonly fuelPrice = inject(FuelPriceService);

  readonly state = toSignal(this.budgetState.state$, {
    initialValue: this.budgetState.current(),
  });
  readonly snapshot = toSignal(this.fuelPrice.snapshot$, {
    initialValue: this.fuelPrice.currentSnapshot(),
  });

  readonly product = computed(() =>
    this.fuelPrice.findProductInSnapshot(
      this.snapshot(),
      this.state().selectedFuelId,
      this.state().region,
    ),
  );
  readonly availableProducts = computed(() =>
    this.snapshot().products.filter((product) => product.region === this.state().region),
  );
  readonly monthlyKilometres = computed(() =>
    this.roundMoney(calculateMonthlyKilometres(this.state().weeklyKilometres)),
  );
  readonly averageOfficeDayKm = computed(() =>
    this.state().officeDaysPerWeek > 0
      ? this.roundMoney(this.state().weeklyKilometres / this.state().officeDaysPerWeek)
      : 0,
  );
  readonly calculatedMonthlyLitres = computed(() =>
    this.roundMoney(
      calculateMonthlyLitres(
        this.state().weeklyKilometres,
        this.state().fuelEfficiencyLitresPer100Km,
      ),
    ),
  );
  readonly weeklyFuelCost = computed(() =>
    this.roundMoney(
      (this.calculatedMonthlyLitres() * this.product().pricePerLitre) / 4.345,
    ),
  );
  readonly currentFuelCost = computed(() =>
    this.roundMoney(this.calculatedMonthlyLitres() * this.product().pricePerLitre),
  );
  readonly originalTotal = computed(() =>
    this.state().entries.reduce((total, entry) => total + entry.amount, 0),
  );
  readonly adjustedTotal = computed(() =>
    this.originalTotal() - this.fuelBudget() + this.currentFuelCost(),
  );
  readonly monthlyDelta = computed(() =>
    this.roundMoney(this.currentFuelCost() - this.fuelBudget()),
  );
  readonly disposableIncome = computed(() =>
    this.roundMoney(this.state().income - this.adjustedTotal()),
  );
  readonly fuelImpactPercent = computed(() =>
    this.state().income > 0
      ? this.roundMoney((this.currentFuelCost() / this.state().income) * 100)
      : 0,
  );

  // UI state for the collapsible calculation steps
  showCalculation = false;

  constructor() {
    this.fuelPrice.loadSnapshot().subscribe();
  }

  updateIncome(value: number | string): void {
    this.budgetState.update({ income: this.toNumber(value) });
  }

  updateOfficeDays(value: number | string): void {
    this.budgetState.update({
      officeDaysPerWeek: Math.min(7, this.toNumber(value)),
    });
  }

  updateWeeklyKilometres(value: number | string): void {
    this.budgetState.update({ weeklyKilometres: this.toNumber(value) });
  }

  updateEfficiency(value: number | string): void {
    this.budgetState.update({
      fuelEfficiencyLitresPer100Km: this.toNumber(value),
    });
  }

  updateRegion(region: FuelRegion): void {
    const nextProduct =
      this.snapshot().products.find((product) => product.region === region)?.id ??
      this.state().selectedFuelId;
    this.budgetState.update({ region, selectedFuelId: nextProduct });
  }

  updateProduct(productId: FuelProductId): void {
    this.budgetState.update({ selectedFuelId: productId });
  }

  simulateMove(percent: number): void {
    this.fuelPrice.simulatePriceMove(percent);
  }

  resetPrices(): void {
    this.fuelPrice.resetSnapshot();
  }

  private fuelBudget(): number {
    return (
      this.state().entries.find((entry) => entry.category === 'fuel')?.amount ?? 0
    );
  }

  private toNumber(value: number | string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
