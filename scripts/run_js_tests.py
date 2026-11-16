#!/usr/bin/env python3
"""Führt die JavaScript-Tests (scripts/test_*.html: Lawinenlage, Schutzgebiete, Datenstatus-Leiste, Layout, Bottom Sheet, globale Suche, Landing Page, GPX-Parser, Routenmodell, Route laden, Routenstatistik, Höhenprofil, Routenverwaltung, Routenschnitt, Route entlang, Lawinenlage entlang, Lawinentexte, Wetter entlang) in einem Headless-Browser aus.

Gebraucht wird Chrome, Chromium oder Edge. Ohne Browser endet das Skript mit Hinweis (Exit 0), mit
--require-browser mit Fehler. Aufruf: python3 scripts/run_js_tests.py [--require-browser]
"""
import functools
import http.server
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PAGES = ["test_avalanche_logic.html", "test_avalanche_frontend.html", "test_protected_areas.html", "test_status_bar_logic.html", "test_layout.html", "test_sheet_logic.html", "test_search_logic.html", "test_landing.html", "test_gpx.html", "test_route_model.html", "test_route_load.html", "test_route_stats.html", "test_profile.html", "test_route_store.html", "test_route_overlay.html", "test_route_context.html", "test_route_avalanche.html", "test_route_avalanche_logic.html", "test_route_weather.html"]
REALTIME_PAGES = {"test_route_store.html", "test_route_overlay.html", "test_route_avalanche.html", "test_route_weather.html"}   # brauchen echte Zeit (IndexedDB läuft in einem eigenen Thread); laufen über scripts/cdp_client.py
CANDIDATES = [
    os.environ.get("BROWSER", ""),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]


def find_browser():
    for c in CANDIDATES:
        if c and os.path.exists(c):
            return c
    for name in ("google-chrome", "chromium", "chromium-browser", "msedge"):
        found = shutil.which(name)
        if found:
            return found
    return None


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main(argv):
    browser = find_browser()
    if not browser:
        print("Kein Chrome/Chromium/Edge gefunden, JavaScript-Tests übersprungen (BROWSER=Pfad setzen).")
        return 1 if "--require-browser" in argv else 0
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = "http://127.0.0.1:%d/scripts/" % server.server_address[1]
    exit_code = 0
    try:
        for page in PAGES:
            print("== " + page)
            exit_code |= run_page(browser, base + page)
    finally:
        server.shutdown()
    return exit_code


def fetch_dom(browser, url):
    with tempfile.TemporaryDirectory() as profile:
        cmd = [browser, "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--user-data-dir=" + profile,
               "--virtual-time-budget=60000", "--dump-dom", url]
        try:
            out = subprocess.run(cmd, capture_output=True, timeout=120).stdout.decode("utf-8", "replace")
        except subprocess.TimeoutExpired:
            print("Browser-Zeitüberschreitung")
            return None
    m = re.search(r'<pre id="result">(.*?)</pre>', out, re.S)
    if not m:
        print("Kein Testergebnis im Browser (JavaScript-Fehler beim Laden?)")
        return None
    import html
    return html.unescape(m.group(1))


def fetch_realtime(browser, url):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from cdp_client import CDP
    page = CDP(browser, url)
    try:
        for _ in range(120):
            time.sleep(0.5)
            text = page.ev("document.getElementById('result').textContent", False)
            if text and text.startswith("{"):
                return text
        print("Browser-Zeitüberschreitung")
        return None
    finally:
        page.close()


def run_page(browser, url):
    out = fetch_realtime(browser, url) if url.rsplit("/", 1)[-1] in REALTIME_PAGES else fetch_dom(browser, url)
    if out is None:
        return 1
    res = json.loads(out)
    for r in res["results"]:
        print(("ok   " if r["ok"] else "FEHL ") + r["name"] + ("" if r["ok"] else ": " + r["error"]))
    print("%d bestanden, %d fehlgeschlagen" % (res["passed"], res["failed"]))
    return 1 if res["failed"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))