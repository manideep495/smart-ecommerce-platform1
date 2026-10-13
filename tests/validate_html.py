from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import re


ROOT = Path(__file__).resolve().parent.parent
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
PAGES = {
    "index.html": {"homeProducts"},
    "products.html": {"productGrid", "categoryFilters", "catalogSearch", "sortSelect"},
    "product.html": {"productView", "relatedProducts"},
    "budget.html": {"budgetForm", "budgetInput", "budgetProducts"},
    "compare.html": {"compareOne", "compareTwo", "compareThree", "compareResult"},
    "recommendations.html": {"recommendBudgetForm", "recommendationsList"},
    "cart.html": {"cartItems", "cartSubtotal", "checkoutButton", "checkoutForm"},
    "wishlist.html": {"wishlistProducts"},
    "about.html": set(), "contact.html": {"contactForm"},
    "privacy.html": set(), "terms.html": set(),
}


class PageCheck(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.stack = []
        self.errors = []
        self.ids = set()
        self.hrefs = []

    def handle_starttag(self, tag, raw_attrs):
        attrs = dict(raw_attrs)
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                self.errors.append(f"duplicate id: {element_id}")
            self.ids.add(element_id)
        href = attrs.get("href")
        if href:
            self.hrefs.append(href)
        for attribute in ("src", "href"):
            value = attrs.get(attribute, "")
            if value and not value.startswith(("https://", "http://", "mailto:", "tel:", "#")):
                local = urlsplit(value).path
                if not (ROOT / local).is_file():
                    self.errors.append(f"missing local {attribute}: {local}")
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            self.errors.append(f"void element has a closing tag: {tag}")
        elif not self.stack or self.stack[-1] != tag:
            self.errors.append(f"unexpected closing tag: {tag}")
        else:
            self.stack.pop()


errors = []
all_ids = {}
all_hrefs = {}
for filename, required_ids in PAGES.items():
    path = ROOT / filename
    if not path.is_file():
        errors.append(f"missing required page: {filename}")
        continue
    source = path.read_text(encoding="utf-8")
    parser = PageCheck(path)
    parser.feed(source)
    parser.close()
    if parser.stack:
        parser.errors.append("unclosed elements: " + ", ".join(parser.stack))
    if not re.search(r"<!doctype\s+html\s*>", source, re.I):
        parser.errors.append("missing HTML5 doctype")
    if not re.search(r'<html\s+lang="[a-z]{2}"', source, re.I):
        parser.errors.append("document language is missing")
    if "main" not in parser.ids:
        parser.errors.append("missing main landmark")
    for element_id in required_ids - parser.ids:
        parser.errors.append(f"missing required control: #{element_id}")
    for href in parser.hrefs:
        if href.startswith("#") and href != "#main":
            parser.errors.append(f"section-anchor navigation is not allowed: {href}")
    errors.extend(f"{filename}: {error}" for error in parser.errors)
    all_ids[filename] = parser.ids
    all_hrefs[filename] = parser.hrefs

for filename, hrefs in all_hrefs.items():
    ids = all_ids[filename]
    for href in hrefs:
        if href.startswith("#") and href[1:] not in ids:
            errors.append(f"{filename}: anchor target does not exist: {href}")

linked_pages = {urlsplit(href).path for hrefs in all_hrefs.values() for href in hrefs if href and not href.startswith(("#", "mailto:", "tel:", "http://", "https://"))}
for filename in PAGES:
    if filename != "product.html" and filename not in linked_pages:
        errors.append(f"no static site link leads to {filename}")

catalog = (ROOT / "js" / "products.js").read_text(encoding="utf-8")
if len(re.findall(r"\{id:'", catalog)) != 12:
    errors.append("the retained sample dataset must contain all 12 products")
app = (ROOT / "js" / "app.js").read_text(encoding="utf-8")
css = (ROOT / "css" / "style.css").read_text(encoding="utf-8")
if "scrollIntoView" in app or "localStorage" not in app:
    errors.append("page navigation/storage behavior is invalid")
if "product.html?id=" not in app:
    errors.append("catalog items must link to the direct product detail page")
for hook in ("headerSearch", "menuToggle", "catalogSearch", "categoryFilters", "sortSelect", "budgetForm", "compareOne", "compareTwo", "compareThree", "cartItems", "checkoutButton", "cancelCheckout", "checkoutForm", "confirmDemoOrder", "contactForm", "contactPreviewButton", "wishlistProducts", "recommendationsList", "data-add", "data-wishlist", "data-quantity", "data-remove"):
    if hook not in app:
        errors.append(f"application is missing feature handler: {hook}")
if len(re.findall(r"image:'https://images\.unsplash\.com", catalog)) != 12:
    errors.append("each retained sample product must have a photographic image source")
if not (ROOT / "assets" / "image-unavailable.svg").is_file():
    errors.append("local product image fallback is missing")
if "@media(max-width:600px)" not in css or ":focus-visible" not in css:
    errors.append("responsive or keyboard-focus styling is missing")
if any(token in css.lower() for token in ("linear-gradient", "radial-gradient", "glassmorphism", "scroll-behavior:smooth")):
    errors.append("avoid generic gradients, glass effects and smooth scroll navigation")
if errors:
    raise SystemExit("SmartCart validation failed:\n- " + "\n- ".join(errors))
print(f"SmartCart HTML validation passed for all {len(PAGES)} pages and their local links.")
