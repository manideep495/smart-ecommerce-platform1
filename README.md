# SmartCart - Smart Shopping Assistant

SmartCart is a static, multi-page shopping assistant built with HTML, CSS and vanilla JavaScript. Its 12-product sample catalog supports search, category filtering, sorting, product details, saved products, a persistent cart, rupee budget filtering, side-by-side comparison, rule-based recommendations and a simulated checkout.

Prices, descriptions, features, ratings, review counts and warranty details are retained sample data, not verified retail claims. Product photography is illustrative and loaded from Unsplash. Checkout and the contact form do not send information or process a payment.

## Run locally

From this folder, start a static server:

```sh
python -m http.server 8000
```

Open <http://localhost:8000>. Use normal page URLs such as `/products.html`, `/budget.html` and `/cart.html`; each page also loads directly after refresh. Browser storage is scoped to the local site origin.

## Validate

```sh
python tests/validate_html.py
python tests/check_routes.py
node --check js/app.js
node --check js/products.js
node tests/validate.mjs
```

The checks validate all 12 pages, balanced HTML structure, local link targets, direct HTTP page and asset routes, required feature controls, the full retained catalog, image references, accessible focus styling and page-specific application hooks. The GitHub Actions workflow runs these checks on pushes and pull requests to `main`. A browser and assistive-technology review remains useful.

## GitHub Pages setup

1. Create an empty GitHub repository, for example `smartcart`.
2. From this directory, initialize and push the project:

   ```sh
   git init
   git add .
   git commit -m "Build SmartCart shopping assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/smartcart.git
   git push -u origin main
   ```

3. In repository **Settings -> Pages**, choose **GitHub Actions** as the build source.
4. Keep default workflow permissions read-only. The deploy job grants Pages write and OIDC permissions only to the deployment job.
5. Check **Actions**. A successful push to `main` validates the site, uploads the Pages artifact and deploys it. The `github-pages` environment shows the deployed URL (typically `https://YOUR-USERNAME.github.io/smartcart/`).

All local links use project-relative paths, so pages and assets work under a GitHub Pages project-site path. The existing deployment workflow and optional Slack status notifications are retained.

## Optional Slack notifications

1. In Slack, enable **Incoming Webhooks** for an app and add a webhook to the intended channel.
2. In GitHub, open **Settings -> Secrets and variables -> Actions -> New repository secret**.
3. Name the secret `SLACK_WEBHOOK_URL` and paste the webhook URL as its value. Do not commit the URL.

The workflow sends a notification after a successful deployment and when validation or deployment fails. If the secret is missing, notification steps are skipped and deployment still works.

## Project pages

- `index.html` - Home
- `products.html` - Searchable, filterable, sortable catalog
- `product.html?id=...` - Product details
- `budget.html` - Filter products by an individual item price limit
- `compare.html` - Compare two or three products
- `recommendations.html` - Suggestions with their rule-based reasons
- `cart.html` - Quantity controls, subtotal, budget reminder and simulated checkout
- `wishlist.html` - Locally saved products
- `about.html`, `contact.html`, `privacy.html`, `terms.html` - Project and policy information

## Local storage and recommendation rules

Cart, wishlist and budget are stored in localStorage. Recommendations exclude cart items, prioritize products within the saved budget, then products in the same category as the first cart item, then illustrative ratings of 4.6 or above; listed price breaks remaining ties. The rules run in the browser and do not use AI or machine learning.

## College demonstration

1. Search and filter the catalog, then open a product detail page directly.
2. Save an item and add products to the cart; adjust quantities and refresh to show local persistence.
3. Set a rupee budget and show products at or below it, then observe the cart budget reminder.
4. Compare two or three products and point out the lowest listed price and actual dataset fields shown.
5. Explain recommendation priorities on the For You page.
6. Confirm a demo order. Point out that nothing is sent and no payment is processed.

## Limitations and remaining setup

This project has no accounts, live inventory, server, cross-device sync, real sales, shipping/tax calculation or payment processing. Sample product facts are illustrative. Product photos need a network connection to Unsplash; if an image is unavailable, a local neutral placeholder appears. The GitHub repository, Pages setting and optional Slack secret need to be configured by the project owner. Deployment is not claimed until the GitHub Pages environment confirms it.
