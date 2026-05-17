import { Component } from '@angular/core';
import { BudgetImpactComponent } from './components/budget-impact/budget-impact.component';
import { LifestyleSimulatorComponent } from './components/lifestyle-simulator/lifestyle-simulator.component';

@Component({
  selector: 'app-root',
  imports: [
    BudgetImpactComponent,
    LifestyleSimulatorComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
