## Plan: South Africa Fuel Price Angular App

TL;DR: Build a clean Angular application that tracks South African fuel prices, shows the budget impact in real time, forecasts future prices from news, and simulates lifestyle choices for savings.

**Steps**
1. Initialize the Angular workspace and app structure.
   - Create a new Angular app using Angular CLI.
   - Add feature modules for budget impact, price prediction, and lifestyle simulator.
   - Add shared core services and models for fuel prices, budget, news sentiment, and scenarios.

2. Define the data model and API strategy.
   - Design models for current fuel prices, budget entries, predicted price trends, and simulator scenarios.
   - Use a real-time South African fuel price API or feed for live price updates.
   - Keep user budget and scenario data client-side only so no personal expense data leaves the user’s browser.
   - Define service interfaces for price updates and prediction input.

3. Implement Feature 1: Budget impact dashboard.
   - Build a fuel price service to fetch current prices and emit updates.
   - Create a budget calculator component that accepts monthly costs, fuel usage, and the following expense categories:
     - Fuel
     - Entertainment
     - Groceries
     - Subscriptions
     - Medical aid
     - Insurance
     - Car installment
     - Savings
     - Bond/Rent
     - Misc
   - Wire the component to update calculations in real time when fuel prices change.
   - Display results clearly: current fuel cost, adjusted budget, and percentage impact.

4. Implement Feature 2: Future fuel price prediction.
   - Create a prediction component with an explanation panel.
   - Implement a news-analysis service that fetches recent news headlines and derives a trend score.
   - Use a simple rule-based forecast for MVP (e.g. sentiment + recent price direction) and mark it as an estimate.
   - Display forecasted price ranges and the rationale from news topics.

5. Implement Feature 3: Lifestyle simulator.
   - Define scenario options: carpooling, cheaper insurance, ride-sharing, refueling timing, remote work.
   - Build a simulator service that adjusts monthly expenses according to selected scenarios.
   - Create a UI to select scenarios, compare current cost vs simulated savings, and show charts or a table.
   - Add real-time feedback when scenario selections change.

6. Build navigation and dashboard UX.
   - Add a landing dashboard summarizing all three features.
   - Use a single-page layout with tabs or scroll sections for Budget, Prediction, and Simulator.
   - Follow best practices for UI design: clear section hierarchy, responsive cards, accessible controls, and a single live-update panel.
   - Apply a green-and-white theme for a fresh, professional look with clean spacing, subtle shadows, and consistent typography.
   - Keep the interface neat and polished: no clutter, no confusing controls, and strong visual consistency across all sections.
   - Add responsive layout for desktop and mobile.

7. Test and validate.
   - Add unit tests for services and components.
   - Validate data updates correctly when fuel prices change.
   - Verify the simulator compares scenarios and shows savings.
   - Run the app locally and verify navigation and feature flows.

**Relevant files**
- `src/app/app.module.ts` — root imports and routing configuration.
- `src/app/services/fuel-price.service.ts` — current price fetch and update stream.
- `src/app/services/news-prediction.service.ts` — news fetch and price trend estimator.
- `src/app/services/simulator.service.ts` — scenario savings calculations.
- `src/app/components/budget-impact/budget-impact.component.ts` — budget calculator UI.
- `src/app/components/price-prediction/price-prediction.component.ts` — forecast display UI.
- `src/app/components/lifestyle-simulator/lifestyle-simulator.component.ts` — scenario picker and savings summary.
- `src/app/models/*.ts` — data shapes for prices, budget, news sentiment, scenarios.

**Verification**
1. Run the app with `ng serve` and confirm the dashboard loads.
2. Enter monthly costs, then simulate fuel price updates and confirm the budget impact updates immediately.
3. Validate the prediction panel shows a forecast plus source rationale.
4. Verify scenario selection changes the savings estimate and updates the simulator summary.
5. Add and run unit tests for the fuel price service, prediction service, and simulator service.

**Decisions**
- This plan assumes a front-end-first Angular app with all user budget and scenario data stored only in the browser.
- Use a real-time South African fuel price API or feed for live updates, while keeping all personal data client-side.
- For MVP, use a simple prediction engine with news sentiment and recent price direction rather than a full ML model.
- Scenario rules can be initially hard-coded, then extended to support more detailed savings formulas.

**Further Considerations**
1. Do you want a real South African fuel price API and specific news source, or should the first version use mock/sample data?
2. Should the prediction feature be a purely frontend estimate or later connect to a backend model/service?
3. Would you prefer a single-page dashboard or separate routed pages for each feature?