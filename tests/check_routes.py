from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.request import urlopen
from functools import partial


ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    "index.html", "products.html", "product.html?id=aero-buds", "budget.html",
    "compare.html", "recommendations.html", "cart.html", "wishlist.html",
    "about.html", "contact.html", "privacy.html", "terms.html",
]
ASSETS = ["css/style.css", "js/app.js", "js/products.js", "assets/image-unavailable.svg"]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


handler = partial(QuietHandler, directory=str(ROOT))
server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
base = f"http://127.0.0.1:{server.server_port}/"
try:
    for path in PAGES + ASSETS:
        with urlopen(base + path, timeout=5) as response:
            body = response.read()
            if response.status != 200 or not body:
                raise SystemExit(f"route check failed: {path} returned {response.status}")
            if path.endswith(".html") and b"<main id=\"main\"" not in body:
                raise SystemExit(f"page response has no main landmark: {path}")
    print(f"SmartCart HTTP route check passed for {len(PAGES)} page URLs and {len(ASSETS)} local assets.")
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=2)
