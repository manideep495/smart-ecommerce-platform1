(() => {
  'use strict';
  const products = window.SMARTCART_PRODUCTS || [];
  const page = document.body.dataset.page;
  const $ = (selector, root = document) => root.querySelector(selector);
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const read = (key, fallback) => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const initialCart = read('smartcart-cart', {});
  const initialWishlist = read('smartcart-wishlist', []);
  const initialBudget = read('smartcart-budget', null);
  const state = {
    cart: initialCart && typeof initialCart === 'object' && !Array.isArray(initialCart) ? Object.fromEntries(Object.entries(initialCart).filter(([id, qty]) => products.some((p) => p.id === id) && Number.isFinite(Number(qty)) && Number(qty) > 0).map(([id, qty]) => [id, Math.floor(Number(qty))])) : {},
    wishlist: Array.isArray(initialWishlist) ? [...new Set(initialWishlist.filter((id) => products.some((p) => p.id === id)))] : [],
    budget: Number.isFinite(initialBudget) && initialBudget > 0 ? initialBudget : null
  };
  const money = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN')}`;
  const persist = () => { try { localStorage.setItem('smartcart-cart', JSON.stringify(state.cart)); localStorage.setItem('smartcart-wishlist', JSON.stringify(state.wishlist)); localStorage.setItem('smartcart-budget', JSON.stringify(state.budget)); } catch { /* Current page remains usable when local storage is unavailable. */ } };
  const cartCount = () => Object.values(state.cart).reduce((sum, qty) => sum + qty, 0);
  const subtotal = () => Object.entries(state.cart).reduce((sum, [id, qty]) => sum + (products.find((product) => product.id === id)?.price || 0) * qty, 0);
  const productById = (id) => products.find((product) => product.id === id);
  const heartSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.2-8.8 10.1-8.8 10.1S3.2 14 3.2 8.8A4.5 4.5 0 0 1 12 6.6a4.5 4.5 0 0 1 8.8 2.2Z"/></svg>';
  function updateHeader() { const cart = $('#cartCount'); const wish = $('#wishlistCount'); if (cart) cart.textContent = cartCount(); if (wish) wish.textContent = state.wishlist.length; }
  function imageMarkup(product, className = 'product-image') { return `<img class="${className}" src="${safe(product.image)}" alt="${safe(product.name)}" loading="lazy" decoding="async">`; }
  function productCard(product) {
    const saved = state.wishlist.includes(product.id);
    return `<article class="product-card"><a class="product-card-image" href="product.html?id=${encodeURIComponent(product.id)}">${imageMarkup(product)}<span class="image-category">${safe(product.category)}</span></a><button class="save-button ${saved ? 'is-saved' : ''}" type="button" data-wishlist="${safe(product.id)}" aria-label="${saved ? 'Remove' : 'Save'} ${safe(product.name)}" aria-pressed="${saved}">${heartSvg}</button><div class="product-card-info"><p class="product-category">${safe(product.category)}</p><h3><a href="product.html?id=${encodeURIComponent(product.id)}">${safe(product.name)}</a></h3><p class="sample-rating"><span aria-hidden="true">&#9733;</span> ${product.rating} <span>illustrative rating</span></p><div class="product-card-bottom"><strong>${money(product.price)}</strong><button type="button" class="add-button" data-add="${safe(product.id)}" aria-label="Add ${safe(product.name)} to cart">Add</button></div></div></article>`;
  }
  function renderCardList(target, list, emptyTitle, emptyText, link = 'products.html') {
    if (!target) return;
    target.innerHTML = list.length ? list.map(productCard).join('') : `<div class="empty-state"><h2>${safe(emptyTitle)}</h2><p>${safe(emptyText)}</p><a class="button button-outline" href="${link}">Browse products <span aria-hidden="true">&#8594;</span></a></div>`;
  }
  function flash(message) {
    let status = $('#liveStatus');
    if (!status) { status = document.createElement('p'); status.className = 'sr-only'; status.id = 'liveStatus'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); document.body.append(status); }
    status.textContent = message;
  }
  function addProduct(id) { const product = productById(id); if (!product) return; state.cart[id] = (state.cart[id] || 0) + 1; persist(); updateHeader(); if (page === 'cart') renderCart(); flash(`${product.name} added to cart.`); }
  function toggleWishlist(id) { const product = productById(id); if (!product) return; const saved = state.wishlist.includes(id); state.wishlist = saved ? state.wishlist.filter((item) => item !== id) : [...state.wishlist, id]; persist(); updateHeader(); flash(saved ? `${product.name} removed from saved products.` : `${product.name} saved.`); if (page === 'wishlist') renderWishlist(); else if (page === 'products') renderCatalog(); else if (page === 'home') renderHome(); else if (page === 'product') renderProduct(); }

  function renderHome() { renderCardList($('#homeProducts'), products.slice(0, 4), 'No products yet', 'The sample collection is not available.'); }
  function renderCatalog() {
    const grid = $('#productGrid'); if (!grid) return;
    const params = new URLSearchParams(location.search);
    const queryInput = $('#catalogSearch');
    if (queryInput && !queryInput.dataset.initialized) { queryInput.value = params.get('q') || ''; queryInput.dataset.initialized = 'true'; }
    const query = (queryInput?.value || '').trim().toLowerCase();
    const active = $('.filter-chip[aria-pressed="true"]')?.dataset.category || 'All';
    const order = $('#sortSelect')?.value || 'featured';
    let list = products.filter((product) => (active === 'All' || product.category === active) && (!query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query)));
    if (order === 'price-low') list.sort((a,b) => a.price-b.price);
    if (order === 'price-high') list.sort((a,b) => b.price-a.price);
    if (order === 'rating') list.sort((a,b) => b.rating-a.rating);
    const count = $('#resultCount'); if (count) count.textContent = `${list.length} ${list.length === 1 ? 'sample product' : 'sample products'}`;
    renderCardList(grid, list, 'No matching products', 'Try another search or category.');
  }
  function renderFilters() {
    const host = $('#categoryFilters'); if (!host) return;
    const categories = ['All', ...new Set(products.map((product) => product.category))];
    host.innerHTML = categories.map((category) => `<button class="filter-chip" type="button" data-category="${safe(category)}" aria-pressed="${category === 'All'}">${safe(category)}</button>`).join('');
  }
  function renderProduct() {
    const host = $('#productView'); if (!host) return;
    const id = new URLSearchParams(location.search).get('id');
    const product = productById(id);
    if (!product) { host.innerHTML = '<div class="empty-state"><h1>Product not found</h1><p>Choose a product from the catalog to see its details.</p><a class="button button-outline" href="products.html">Browse products</a></div>'; renderCardList($('#relatedProducts'), products.slice(0, 4), 'No products available', 'Please return to the catalog.'); return; }
    const saved = state.wishlist.includes(id);
    host.innerHTML = `<div class="detail-photo">${imageMarkup(product, 'detail-image')}</div><div class="detail-copy"><p class="kicker">${safe(product.category)} / SAMPLE PRODUCT</p><h1>${safe(product.name)}</h1><p class="sample-rating"><span aria-hidden="true">&#9733;</span> ${product.rating} <span>illustrative rating (${product.reviews} sample reviews)</span></p><p class="detail-price">${money(product.price)}</p><p class="detail-description">${safe(product.description)}</p><h2>Product details</h2><ul class="feature-list">${product.features.map((feature) => `<li>${safe(feature)}</li>`).join('')}</ul><p class="warranty-line"><strong>Sample warranty:</strong> ${safe(product.warranty)}</p><p class="sample-note">Specifications and image are illustrative sample content, not verified retail claims.</p><div class="detail-actions"><button class="button button-dark" type="button" data-add="${safe(id)}">Add to cart</button><button class="button button-outline save-detail ${saved ? 'is-saved' : ''}" type="button" data-wishlist="${safe(id)}" aria-pressed="${saved}">${saved ? 'Remove from saved' : 'Save for later'}</button></div></div>`;
    renderCardList($('#relatedProducts'), products.filter((item) => item.id !== id && item.category === product.category).slice(0, 4), 'No related products', 'Browse the full sample catalog.');
  }
  function renderBudgetProducts() {
    const input = $('#budgetInput'); if (!input) return;
    if (state.budget !== null && !input.value) input.value = state.budget;
    const target = $('#budgetProducts');
    if (state.budget === null) { if (target) target.innerHTML = '<div class="empty-state"><h2>Start with a budget</h2><p>Enter an amount above to see products at or below that price.</p><a class="button button-outline" href="products.html">Explore all products</a></div>'; $('#budgetSummary').textContent = 'Set a positive amount to see matching products.'; return; }
    const affordable = products.filter((product) => product.price <= state.budget).sort((a,b) => a.price-b.price);
    $('#budgetSummary').textContent = `${affordable.length} ${affordable.length === 1 ? 'product is' : 'products are'} priced at or below ${money(state.budget)}. This checks individual item price.`;
    renderCardList(target, affordable, 'No products within this amount', 'Try raising the budget or browse the full catalog.');
  }
  function renderCompareOptions() {
    ['compareOne','compareTwo','compareThree'].forEach((id) => { const select = $(`#${id}`); if (!select) return; const value = select.value; select.innerHTML = '<option value="">Choose a product</option>' + products.map((product) => `<option value="${safe(product.id)}">${safe(product.name)} (${money(product.price)})</option>`).join(''); select.value = value; });
  }
  function renderComparison() {
    const host = $('#compareResult'); if (!host) return;
    const ids = ['compareOne','compareTwo','compareThree'].map((id) => $(`#${id}`)?.value).filter(Boolean);
    if (ids.length < 2) { host.innerHTML = '<p class="empty-message">Choose two products to compare. A third is optional.</p>'; return; }
    if (new Set(ids).size !== ids.length) { host.innerHTML = '<p class="inline-error" role="alert">Choose a different product in each field.</p>'; return; }
    const chosen = ids.map(productById).filter(Boolean);
    const cheapest = Math.min(...chosen.map((product) => product.price));
    const rows = [['Price', (p) => money(p.price)], ['Category', (p) => safe(p.category)], ['Sample rating', (p) => `${p.rating} / 5`], ['Features', (p) => safe(p.features.join(', '))], ['Sample warranty', (p) => safe(p.warranty)]];
    host.innerHTML = `<div class="table-wrap"><table class="comparison-table"><caption>Comparison of selected sample products</caption><thead><tr><th scope="col">Product detail</th>${chosen.map((product) => `<th scope="col">${safe(product.name)}${product.price === cheapest ? '<span class="lowest-label">Lowest listed price</span>' : ''}</th>`).join('')}</tr></thead><tbody>${rows.map(([label, render]) => `<tr><th scope="row">${label}</th>${chosen.map((product) => `<td class="${label === 'Price' && product.price === cheapest ? 'lowest-price' : ''}">${render(product)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function renderCart() {
    const host = $('#cartItems'); if (!host) return;
    const entries = Object.entries(state.cart).filter(([id, qty]) => qty > 0 && productById(id));
    host.innerHTML = entries.length ? entries.map(([id, qty]) => { const product = productById(id); return `<article class="cart-row"><a class="cart-thumb" href="product.html?id=${encodeURIComponent(id)}">${imageMarkup(product)}</a><div class="cart-item-description"><p class="product-category">${safe(product.category)}</p><h2><a href="product.html?id=${encodeURIComponent(id)}">${safe(product.name)}</a></h2><strong>${money(product.price)}</strong><div class="quantity-control"><button type="button" data-quantity="${safe(id)}" data-delta="-1" aria-label="Decrease ${safe(product.name)} quantity">&#8722;</button><span>${qty}</span><button type="button" data-quantity="${safe(id)}" data-delta="1" aria-label="Increase ${safe(product.name)} quantity">+</button><button class="remove-link" type="button" data-remove="${safe(id)}">Remove</button></div></div><strong class="row-total">${money(product.price * qty)}</strong></article>`; }).join('') : '<div class="empty-state"><h2>Your cart is empty.</h2><p>Add a product to see it here.</p><a class="button button-outline" href="products.html">Browse products</a></div>';
    const count = cartCount(); const total = subtotal();
    $('#cartItemCount').textContent = String(count); $('#cartSubtotal').textContent = money(total);
    const budgetStatus = $('#cartBudgetStatus');
    if (budgetStatus) budgetStatus.textContent = state.budget === null ? 'Set a budget in Budget Buddy to track your cart total.' : total > state.budget ? `${money(total-state.budget)} over your ${money(state.budget)} budget.` : `${money(state.budget-total)} remaining in your budget.`;
    const checkout = $('#checkoutButton'); if (checkout) checkout.disabled = !count;
  }
  function renderWishlist() { renderCardList($('#wishlistProducts'), products.filter((product) => state.wishlist.includes(product.id)), 'Nothing saved yet.', 'Select Save on a product to keep it here.'); }
  function recommendationData() {
    const cartProducts = Object.keys(state.cart).map(productById).filter(Boolean);
    const firstCategory = cartProducts[0]?.category;
    return products.filter((product) => !state.cart[product.id]).map((product) => {
      const budgetFit = state.budget !== null && product.price <= state.budget;
      const categoryFit = Boolean(firstCategory && product.category === firstCategory);
      const score = Number(budgetFit) * 2 + Number(categoryFit) * 2 + Number(product.rating >= 4.6);
      const reason = budgetFit ? `Within your ${money(state.budget)} budget` : categoryFit ? `Same category as an item in your cart (${product.category})` : product.rating >= 4.6 ? 'Higher illustrative rating in this sample catalog' : 'A lower-priced option in the sample catalog';
      return {product, score, reason};
    }).sort((a,b) => b.score-a.score || a.product.price-b.product.price).slice(0, 6);
  }
  function renderRecommendations() {
    const host = $('#recommendationsList'); if (!host) return;
    const picks = recommendationData();
    host.innerHTML = picks.length ? picks.map(({product,reason}) => `<article class="recommendation-row"><a class="recommendation-image" href="product.html?id=${encodeURIComponent(product.id)}">${imageMarkup(product)}</a><div class="recommendation-info"><p class="kicker">WHY THIS PICK</p><h3><a href="product.html?id=${encodeURIComponent(product.id)}">${safe(product.name)}</a></h3><p>${safe(reason)}</p><strong>${money(product.price)}</strong></div><button type="button" class="add-button" data-add="${safe(product.id)}" aria-label="Add ${safe(product.name)} to cart">Add</button></article>`).join('') : '<div class="empty-state"><h2>No suggestions right now.</h2><p>Browse the products and add something to your cart to begin.</p><a class="button button-outline" href="products.html">Browse products</a></div>';
    const budgetInput = $('#recommendBudget'); if (budgetInput && state.budget !== null && !budgetInput.value) budgetInput.value = state.budget;
    const context = $('#recommendContext'); if (context) context.textContent = `Budget: ${state.budget === null ? 'not set' : money(state.budget)}. Cart items: ${cartCount()}.`;
  }
  function renderSavedQuery() { const input = $('#recommendBudget'); if (input && state.budget !== null && !input.value) input.value = state.budget; }

  updateHeader();
  if (page === 'home') renderHome();
  if (page === 'products') { renderFilters(); renderCatalog(); }
  if (page === 'product') renderProduct();
  if (page === 'budget') renderBudgetProducts();
  if (page === 'compare') { renderCompareOptions(); renderComparison(); }
  if (page === 'recommendations') { renderSavedQuery(); renderRecommendations(); }
  if (page === 'cart') renderCart();
  if (page === 'wishlist') renderWishlist();

  $('#headerSearch')?.addEventListener('submit', (event) => { event.preventDefault(); const query = $('#globalSearch').value.trim(); location.href = `products.html${query ? `?q=${encodeURIComponent(query)}` : ''}`; });
  $('#menuToggle')?.addEventListener('click', () => { const nav = $('#primaryNav'); const expanded = $('#menuToggle').getAttribute('aria-expanded') === 'true'; $('#menuToggle').setAttribute('aria-expanded', String(!expanded)); nav.classList.toggle('nav-open', !expanded); });
  $('#catalogSearch')?.addEventListener('input', renderCatalog);
  $('#sortSelect')?.addEventListener('change', renderCatalog);
  $('#categoryFilters')?.addEventListener('click', (event) => { const button = event.target.closest('[data-category]'); if (!button) return; $('#categoryFilters').querySelectorAll('[data-category]').forEach((item) => item.setAttribute('aria-pressed', String(item === button))); renderCatalog(); });
  ['compareOne','compareTwo','compareThree'].forEach((id) => $(`#${id}`)?.addEventListener('change', renderComparison));
  $('#budgetForm')?.addEventListener('submit', (event) => { event.preventDefault(); const value = Number($('#budgetInput').value); if (!Number.isFinite(value) || value <= 0) { $('#budgetInput').focus(); $('#budgetSummary').textContent = 'Enter a budget greater than zero.'; return; } state.budget = Math.floor(value); persist(); renderBudgetProducts(); });
  $('#recommendBudgetForm')?.addEventListener('submit', (event) => { event.preventDefault(); const value = $('#recommendBudget').value.trim(); state.budget = value && Number(value) > 0 ? Math.floor(Number(value)) : null; persist(); renderRecommendations(); flash(state.budget === null ? 'Budget cleared.' : `Budget saved as ${money(state.budget)}.`); });
  $('#checkoutButton')?.addEventListener('click', () => { const panel = $('#checkoutPanel'); panel.hidden = false; $('#customerName').focus(); });
  $('#cancelCheckout')?.addEventListener('click', () => { $('#checkoutPanel').hidden = true; });
  $('#confirmDemoOrder')?.addEventListener('click', () => { const form = $('#checkoutForm'); if (!form.reportValidity()) return; const name = $('#customerName').value.trim(); const message = $('#checkoutMessage'); message.innerHTML = `<p class="success-message">Demo order confirmed for ${safe(name)}. No payment was processed.</p><a href="products.html" class="underlined-link">Return to products <span aria-hidden="true">&#8594;</span></a>`; state.cart = {}; persist(); updateHeader(); renderCart(); form.hidden = true; });
  $('#contactPreviewButton')?.addEventListener('click', () => { const form = $('#contactForm'); if (!form.reportValidity()) return; $('#contactStatus').textContent = 'Message preview ready. Nothing was sent or stored.'; });
  document.addEventListener('click', (event) => {
    const add = event.target.closest('[data-add]'); if (add) addProduct(add.dataset.add);
    const save = event.target.closest('[data-wishlist]'); if (save) toggleWishlist(save.dataset.wishlist);
    const quantity = event.target.closest('[data-quantity]'); if (quantity) { const id = quantity.dataset.quantity; state.cart[id] = (state.cart[id] || 0) + Number(quantity.dataset.delta); if (state.cart[id] < 1) delete state.cart[id]; persist(); updateHeader(); renderCart(); }
    const remove = event.target.closest('[data-remove]'); if (remove) { delete state.cart[remove.dataset.remove]; persist(); updateHeader(); renderCart(); }
  });
  document.addEventListener('error', (event) => {
    const image = event.target;
    if (image instanceof HTMLImageElement && image.classList.contains('product-image') && !image.dataset.fallback) {
      image.dataset.fallback = 'true'; image.src = 'assets/image-unavailable.svg'; image.alt = 'Product image unavailable';
    }
  }, true);
})();
