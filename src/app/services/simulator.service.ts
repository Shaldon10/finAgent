import { Injectable } from '@angular/core';
import { BudgetEntry } from '../models/budget.model';
import { ScenarioResult, SimulatorScenario } from '../models/scenario.model';

export const SCENARIOS: SimulatorScenario[] = [
  {
    id: 'carpooling',
    title: 'Carpooling',
    description: 'Share three commute days each week.',
    fuelSavingPercent: 24,
  },
  {
    id: 'insurance',
    title: 'Cheaper insurance',
    description: 'Move to a lower premium after comparing quotes.',
    categoryAdjustments: { insurance: -350 },
  },
  {
    id: 'ride-share',
    title: 'Ride-sharing swap',
    description: 'Use e-hailing for short trips and avoid parking costs.',
    fuelSavingPercent: 10,
    categoryAdjustments: { misc: 250 },
  },
  {
    id: 'refuel-timing',
    title: 'Refueling timing',
    description: 'Fill strategically before confirmed monthly increases.',
    fuelSavingPercent: 3,
  },
  {
    id: 'remote-work',
    title: 'Remote work',
    description: 'Work from home two days each week.',
    fuelSavingPercent: 22,
    categoryAdjustments: { groceries: 280 },
  },
];

@Injectable({ providedIn: 'root' })
export class SimulatorService {
  readonly scenarios = SCENARIOS;

  calculate(
    entries: BudgetEntry[],
    currentFuelCost: number,
    selectedIds: string[],
  ): ScenarioResult {
    const originalMonthlyCost = this.sumBudget(entries, currentFuelCost);
    const selectedScenarios = this.scenarios.filter((scenario) =>
      selectedIds.includes(scenario.id),
    );

    let simulatedFuelCost = currentFuelCost;
    const details: ScenarioResult['details'] = [];
    const categoryAdjustments = new Map<string, number>();

    for (const scenario of selectedScenarios) {
      if (scenario.fuelSavingPercent) {
        const saving = simulatedFuelCost * (scenario.fuelSavingPercent / 100);
        simulatedFuelCost -= saving;
        details.push({ label: scenario.title, saving: this.roundMoney(saving) });
      }

      if (scenario.monthlyFixedSaving) {
        details.push({
          label: scenario.title,
          saving: this.roundMoney(scenario.monthlyFixedSaving),
        });
      }

      for (const [category, adjustment] of Object.entries(
        scenario.categoryAdjustments ?? {},
      )) {
        categoryAdjustments.set(
          category,
          (categoryAdjustments.get(category) ?? 0) + adjustment,
        );
      }
    }

    const adjustedEntries = entries.map((entry) =>
      entry.category === 'fuel'
        ? { ...entry, amount: simulatedFuelCost }
        : { ...entry, amount: entry.amount + (categoryAdjustments.get(entry.category) ?? 0) },
    );

    const fixedSavings = selectedScenarios.reduce(
      (total, scenario) => total + (scenario.monthlyFixedSaving ?? 0),
      0,
    );
    const simulatedMonthlyCost = Math.max(
      0,
      this.sumBudget(adjustedEntries, simulatedFuelCost) - fixedSavings,
    );
    const monthlySavings = Math.max(0, originalMonthlyCost - simulatedMonthlyCost);

    for (const [category, adjustment] of categoryAdjustments) {
      if (adjustment < 0) {
        details.push({ label: this.humanize(category), saving: Math.abs(adjustment) });
      }
    }

    return {
      selectedIds,
      originalMonthlyCost: this.roundMoney(originalMonthlyCost),
      simulatedMonthlyCost: this.roundMoney(simulatedMonthlyCost),
      monthlySavings: this.roundMoney(monthlySavings),
      annualSavings: this.roundMoney(monthlySavings * 12),
      details,
    };
  }

  private sumBudget(entries: BudgetEntry[], fuelCost: number): number {
    return entries.reduce(
      (total, entry) => total + (entry.category === 'fuel' ? fuelCost : entry.amount),
      0,
    );
  }

  private humanize(value: string): string {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
