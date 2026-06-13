import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { calculateMonthlyLitres } from '../../models/budget.model';
import { BudgetStateService } from '../../services/budget-state.service';
import { FuelPriceService } from '../../services/fuel-price.service';
import { SimulatorService } from '../../services/simulator.service';

@Component({
  selector: 'app-lifestyle-simulator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lifestyle-simulator.component.html',
  styleUrl: './lifestyle-simulator.component.scss',
})
export class LifestyleSimulatorComponent {
  protected readonly Math = Math;

  private readonly budgetState = inject(BudgetStateService);
  private readonly fuelPrice = inject(FuelPriceService);
  private readonly simulator = inject(SimulatorService);

  readonly scenarios = this.simulator.scenarios;
  readonly selectedIds = signal<string[]>(['carpooling', 'refuel-timing']);
  readonly state = toSignal(this.budgetState.state$, {
    initialValue: this.budgetState.current(),
  });
  readonly snapshot = toSignal(this.fuelPrice.snapshot$, {
    initialValue: this.fuelPrice.currentSnapshot(),
  });
  readonly currentFuelCost = computed(() => {
    const product = this.fuelPrice.findProductInSnapshot(
      this.snapshot(),
      this.state().selectedFuelId,
      this.state().region,
    );
    return (
      product.pricePerLitre *
      calculateMonthlyLitres(
        this.state().weeklyKilometres,
        this.state().fuelEfficiencyLitresPer100Km,
      )
    );
  });
  readonly result = computed(() =>
    this.simulator.calculate(
      this.state().entries,
      this.currentFuelCost(),
      this.selectedIds(),
    ),
  );

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  toggle(id: string): void {
    this.selectedIds.update((current) =>
      current.includes(id)
        ? current.filter((selected) => selected !== id)
        : [...current, id],
    );
  }
}
