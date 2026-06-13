export type BudgetCategory =
  | 'fuel'
  | 'entertainment'
  | 'groceries'
  | 'subscriptions'
  | 'medicalAid'
  | 'insurance'
  | 'carInstallment'
  | 'savings'
  | 'bondRent'
  | 'misc';

export interface BudgetEntry {
  category: BudgetCategory;
  label: string;
  amount: number;
}

export interface BudgetState {
  income: number;
  litresPerMonth: number;
  officeDaysPerWeek: number;
  weeklyKilometres: number;
  fuelEfficiencyLitresPer100Km: number;
  selectedFuelId: string;
  region: 'inland' | 'coastal';
  entries: BudgetEntry[];
}

export const DEFAULT_BUDGET_ENTRIES: BudgetEntry[] = [
  { category: 'fuel', label: 'Fuel', amount: 2400 },
  { category: 'entertainment', label: 'Entertainment', amount: 1400 },
  { category: 'groceries', label: 'Groceries', amount: 5200 },
  { category: 'subscriptions', label: 'Subscriptions', amount: 650 },
  { category: 'medicalAid', label: 'Medical aid', amount: 2800 },
  { category: 'insurance', label: 'Insurance', amount: 1650 },
  { category: 'carInstallment', label: 'Car installment', amount: 5200 },
  { category: 'savings', label: 'Savings', amount: 3500 },
  { category: 'bondRent', label: 'Bond/Rent', amount: 11000 },
  { category: 'misc', label: 'Misc', amount: 1800 },
];

export function calculateMonthlyKilometres(weeklyKilometres: number): number {
  return weeklyKilometres * 4.345;
}

export function calculateMonthlyLitres(
  weeklyKilometres: number,
  fuelEfficiencyLitresPer100Km: number,
): number {
  return (calculateMonthlyKilometres(weeklyKilometres) * fuelEfficiencyLitresPer100Km) / 100;
}
