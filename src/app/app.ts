import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BudgetImpactComponent } from './components/budget-impact/budget-impact.component';
import { FuelPriceService } from './services/fuel-price.service';

@Component({
  selector: 'app-root',
  imports: [BudgetImpactComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly fuelPrice = inject(FuelPriceService);

  readonly snapshot = toSignal(this.fuelPrice.snapshot$, {
    initialValue: this.fuelPrice.currentSnapshot(),
  });

  readonly effectiveMonthYear = computed(() => {
    const dateStr = this.snapshot().effectiveFrom;
    if (!dateStr || dateStr.length < 7) return 'Current';
    const [year, month] = dateStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' });
  });
}
