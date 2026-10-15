const products = [
  {id:1,name:"Wireless Headphones",category:"Electronics",price:2499,emoji:"🎧",tag:"Popular"},
  {id:2,name:"Smart Watch",category:"Electronics",price:3299,emoji:"⌚",tag:"Trending"},
  {id:3,name:"Bluetooth Speaker",category:"Electronics",price:1599,emoji:"🔊",tag:"Value pick"},
  {id:4,name:"Desk Lamp",category:"Home",price:899,emoji:"💡",tag:"Everyday"},
  {id:5,name:"Coffee Mug Set",category:"Home",price:599,emoji:"☕",tag:"Budget pick"},
  {id:6,name:"Backpack",category:"Accessories",price:1299,emoji:"🎒",tag:"Popular"},
  {id:7,name:"Phone Stand",category:"Accessories",price:399,emoji:"📱",tag:"Low cost"},
  {id:8,name:"Keyboard",category:"Electronics",price:1899,emoji:"⌨️",tag:"Work setup"}
];
let cart = {};
let selectedCategory = "All";
let budget = 5000;
const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
const $ = id => document.getElementById(id);
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2200)}
function renderProducts(){
  const query=$("searchInput").value.trim().toLowerCase();
  const shown=products.filter(p=>(selectedCategory==="All"||p.category===selectedCategory)&&(p.name.toLowerCase().includes(query)||p.category.toLowerCase().includes(query)));
  $("productGrid").innerHTML=shown.map(p=>`<article class="product-card"><div class="product-visual"><span class="tag">${p.tag}</span>${p.emoji}</div><div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div></div></article>`).join("");
  $("emptyState").classList.toggle("hidden",shown.length!==0);
}
function renderCart(){
  const entries=Object.entries(cart).filter(([,qty])=>qty>0);
  const total=entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===Number(id)).price*qty,0);
  $("cartCount").textContent=entries.reduce((sum,[,qty])=>sum+qty,0);
  $("cartTotal").textContent=money(total);
  $("cartItems").innerHTML=entries.length?entries.map(([id,qty])=>{const p=products.find(x=>x.id===Number(id));return `<div class="cart-row"><div class="cart-product"><div class="cart-emoji">${p.emoji}</div><div><strong>${p.name}</strong><span>${money(p.price)} each</span></div></div><div class="qty-controls"><button data-qty="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button><b>${qty}</b><button data-qty="${p.id}" data-delta="1" aria-label="Increase quantity">+</button></div><button class="remove-btn" data-remove="${p.id}">Remove</button></div>`}).join(""):'<p class="cart-empty">Your cart is empty. Add a product to get started.</p>';
  $("checkoutBtn").disabled=entries.length===0;
  updateBudget(total);renderRecommendations();
}
function updateBudget(total){
  const remaining=budget-total,used=budget>0?Math.min(total/budget*100,100):total>0?100:0;
  $("budgetTotal").textContent=money(total);$("budgetLeft").textContent=money(remaining);
  $("budgetProgress").style.width=used+"%";
  $("budgetProgress").style.background=remaining<0?"#c45145":"var(--green)";
  $("budgetStatus").textContent=remaining<0?"You are over budget by "+money(-remaining)+". Consider removing an item.":"Your cart is within budget.";
  $("budgetStatus").style.color=remaining<0?"#a63e34":"var(--green)";
}
function renderCompareOptions(){
  const options=products.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
  $("compareA").innerHTML=options;$("compareB").innerHTML=options;
  $("compareA").value="1";$("compareB").value="3";renderCompare();
}
function renderCompare(){
  const a=products.find(p=>p.id===Number($("compareA").value)),b=products.find(p=>p.id===Number($("compareB").value));
  if(!a||!b)return;
  const diff=Math.abs(a.price-b.price);
  const verdict=a.id===b.id?"Choose two different products to compare.":a.price===b.price?"Both products have the same sample price.":`${a.price<b.price?a.name:b.name} costs ${money(diff)} less in this sample catalog.`;
  $("compareResult").innerHTML=`<div class="compare-item"><strong>${a.emoji} ${a.name}</strong><span>${a.category}</span><p><b>${money(a.price)}</b></p></div><div class="compare-item"><strong>${b.emoji} ${b.name}</strong><span>${b.category}</span><p><b>${money(b.price)}</b></p></div><div class="compare-verdict">${verdict}</div>`;
}
function renderRecommendations(){
  const total=Object.entries(cart).reduce((sum,[id,qty])=>sum+products.find(p=>p.id===Number(id)).price*qty,0);
  let picks=products.filter(p=>!cart[p.id]&&p.price<=Math.max(budget-total,0)).sort((a,b)=>a.price-b.price).slice(0,3);
  if(!picks.length)picks=products.filter(p=>!cart[p.id]).sort((a,b)=>a.price-b.price).slice(0,3);
  $("recommendationGrid").innerHTML=picks.map(p=>`<div class="recommendation-card"><div class="emoji">${p.emoji}</div><div><strong>${p.name}</strong><span>${money(p.price)} · ${p.price<=Math.max(budget-total,0)?"Fits remaining budget":"Consider your budget"}</span></div></div>`).join("")||'<p>No more suggestions in the sample catalog.</p>';
}
$("productGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-add]");if(!btn)return;const id=Number(btn.dataset.add);cart[id]=(cart[id]||0)+1;renderCart();toast("Added to cart")});
$("cartItems").addEventListener("click",e=>{const qty=e.target.closest("[data-qty]"),remove=e.target.closest("[data-remove]");if(qty){const id=Number(qty.dataset.qty);cart[id]=(cart[id]||0)+Number(qty.dataset.delta);if(cart[id]<=0)delete cart[id];renderCart()}if(remove){delete cart[Number(remove.dataset.remove)];renderCart();toast("Item removed")}});
$("searchInput").addEventListener("input",renderProducts);
$("categories").addEventListener("click",e=>{const btn=e.target.closest("[data-category]");if(!btn)return;selectedCategory=btn.dataset.category;document.querySelectorAll(".category").forEach(x=>x.classList.toggle("active",x===btn));renderProducts()});
$("setBudget").addEventListener("click",()=>{const value=Number($("budgetInput").value);if(!Number.isFinite(value)||value<0){toast("Enter a valid budget");return}budget=value;renderCart();toast("Budget updated")});
$("compareA").addEventListener("change",renderCompare);$("compareB").addEventListener("change",renderCompare);
$("cartJump").addEventListener("click",()=>$("cart").scrollIntoView({behavior:"smooth"}));
$("checkoutBtn").addEventListener("click",()=>toast("Demo only — no order or payment processed."));
$("backTop").addEventListener("click",e=>{e.preventDefault();window.scrollTo({top:0,behavior:"smooth"})});
renderProducts();renderCompareOptions();renderCart();
