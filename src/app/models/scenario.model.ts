import { BudgetCategory } from './budget.model';

export interface SimulatorScenario {
  id: string;
  title: string;
  description: string;
  monthlyFixedSaving?: number;
  fuelSavingPercent?: number;
  categoryAdjustments?: Partial<Record<BudgetCategory, number>>;
}

export interface ScenarioResult {
  selectedIds: string[];
  originalMonthlyCost: number;
  simulatedMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  details: Array<{
    label: string;
    saving: number;
  }>;
}
