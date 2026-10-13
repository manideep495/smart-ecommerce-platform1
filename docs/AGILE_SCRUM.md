# SmartCart Agile Scrum Plan

## Product vision and scope

SmartCart helps students and everyday shoppers discover useful products, compare choices and stay aware of spending. This static, no-cost demonstration includes a sample catalog, client-side cart and wishlist, budget awareness, transparent rule-based suggestions and a simulated checkout. It has no accounts, server, inventory or real payment processing.

## Product backlog

| Priority | Backlog item | Outcome |
| --- | --- | --- |
| P0 | Responsive catalog and product details | Browse, search, filter and sort sample products |
| P0 | Cart management | Add, remove, change quantities, calculate subtotal and persist locally |
| P0 | Budget Buddy | Set a rupee budget, filter affordable products and show remaining/over budget |
| P1 | Wishlist | Save and revisit products on the same browser |
| P1 | Smart Compare | Compare 2–3 products by price, category, rating, features and warranty |
| P1 | Rule-based recommendations | Explain affordable, complementary and high-rated picks |
| P1 | Demo checkout | Validate form, confirm order and clear cart without payment |
| P2 | GitHub Pages delivery | Validate changes and deploy successful `main` builds |
| P2 | Slack status updates | Send optional success/failure notices from a repository secret |
| P2 | Presentation and documentation | Provide setup, scope, acceptance criteria and demo sequence |

## User stories and acceptance criteria

### Catalog

**As a shopper, I want to discover and inspect products so I can make an informed choice.**

- At least 8 products show a name, category, rupee price, rating and visual.
- Search matches name, category and description; filters and sorting work together.
- Details include description, features and warranty.
- Empty results show a clear message and reset action.

### Cart and wishlist

**As a shopper, I want to manage a cart and save favourites so I can revisit my choices.**

- Add, remove and quantity controls update item count and subtotal immediately.
- Cart and wishlist persist after refresh in local storage.
- Empty states and accessible control labels are present.

### Budget Buddy

**As a budget-conscious shopper, I want to set a spending limit so I can choose affordable products.**

- Accept a positive rupee amount and reject invalid or zero values.
- Affordable view shows products priced at or below the budget.
- Cart and budget panels show remaining budget or the amount over budget.

### Smart Compare

**As a shopper, I want to compare products to see their tradeoffs together.**

- Two products are required; a third is optional; duplicate selections are called out.
- Table includes price, category, rating, features and warranty, marking the lowest price.

### Recommendations and checkout

**As a shopper, I want understandable suggestions and a safe demo checkout.**

- Suggestions use budget fit, cart category and sample rating, with a short reason.
- Checkout discloses simulation, validates name and consent, confirms the order, takes no payment and empties the cart.

## Sprint plan

### Sprint 1: UI and product catalog

- Build the responsive shell, product cards and details dialog.
- Add 12 sample products, category filtering, search and sorting.
- Acceptance: usable on mobile and desktop, with empty states and keyboard focus indicators.

### Sprint 2: Cart and wishlist

- Add cart drawer, quantity controls, removal, subtotal and local storage.
- Add wishlist toggles and empty state.
- Acceptance: refresh preserves state; subtotal follows quantity changes.

### Sprint 3: Budget Buddy, comparison and recommendations

- Add rupee budget and affordable product view.
- Add two/three product comparison and cheapest-price highlight.
- Add deterministic recommendation rules and reasons.
- Acceptance: states update clearly and recommendations explain their basis.

### Sprint 4: Testing, deployment and presentation

- Add demo checkout, documentation, static validation and Pages workflow.
- Document optional Slack secret configuration and a presentation sequence.
- Acceptance: validation passes; workflow deploys validated `main`; checkout never asks for payment.

## Definition of Done

- Requested interactions work with mouse and keyboard and show focus.
- Layout is readable at narrow mobile and desktop widths.
- Included validation finds no broken local references or JavaScript syntax errors.
- Cart, wishlist and budget persist locally; checkout clearly says no payment is processed.
- README covers local use, GitHub Pages, Slack setup and limitations.
- Deployment is called successful only after the Pages environment confirms it.

## Example daily stand-up notes

| Day | Yesterday | Today | Blockers |
| --- | --- | --- | --- |
| Sprint 1, Day 2 | Created page layout and sample catalog | Finish responsive cards and filtering | None |
| Sprint 2, Day 2 | Cart drawer and local persistence | Add wishlist and empty states | None |
| Sprint 3, Day 3 | Budget panel and compare table | Refine recommendation reasons and edge cases | None |
| Sprint 4, Day 2 | Workflow and setup notes | Run validation and rehearse demo | Owner must enable Pages |
