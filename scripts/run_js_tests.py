#!/usr/bin/env python3
"""Führt die JavaScript-Tests (scripts/test_*.html: Lawinenlage, Schutzgebiete) in einem Headless-Browser aus.

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

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PAGES = ["test_avalanche_logic.html", "test_avalanche_frontend.html", "test_protected_areas.html"]
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


def run_page(browser, url):
    import html
    with tempfile.TemporaryDirectory() as profile:
        cmd = [browser, "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--user-data-dir=" + profile,
               "--virtual-time-budget=10000", "--dump-dom", url]
        try:
            out = subprocess.run(cmd, capture_output=True, timeout=120).stdout.decode("utf-8", "replace")
        except subprocess.TimeoutExpired:
            print("Browser-Zeitüberschreitung")
            return 1
    m = re.search(r'<pre id="result">(.*?)</pre>', out, re.S)
    if not m:
        print("Kein Testergebnis im Browser (JavaScript-Fehler beim Laden?)")
        return 1
    res = json.loads(html.unescape(m.group(1)))
    for r in res["results"]:
        print(("ok   " if r["ok"] else "FEHL ") + r["name"] + ("" if r["ok"] else ": " + r["error"]))
    print("%d bestanden, %d fehlgeschlagen" % (res["passed"], res["failed"]))
    return 1 if res["failed"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))