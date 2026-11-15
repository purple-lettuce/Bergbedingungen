"""Minimaler Chrome-DevTools-Client nur mit der Standardbibliothek (Socket, WebSocket von Hand), ohne Playwright oder websockets.
Gebraucht für Tests mit echter Zeit (z. B. IndexedDB), die der Modus --dump-dom mit virtueller Zeit nicht abwarten kann."""
import socket, base64, os, json, struct, sys, subprocess, time, urllib.request, tempfile

class CDP:
    def __init__(self, browser, url, w=1440, h=900, port=9333):
        self.prof = tempfile.mkdtemp()
        self.p = subprocess.Popen([browser, "--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", "--remote-debugging-port=%d" % port, "--user-data-dir=" + self.prof, "--window-size=%d,%d" % (w, h), "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            try:
                tabs = json.load(urllib.request.urlopen("http://127.0.0.1:%d/json/list" % port)); break
            except Exception: time.sleep(0.2)
        ws = [t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"]
        host, rest = ws[5:].split("/", 1)
        h_, p_ = host.split(":")
        self.s = socket.create_connection((h_, int(p_)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall(("GET /%s HTTP/1.1\r\nHost: %s\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n" % (rest, host, key)).encode())
        buf = b""
        while b"\r\n\r\n" not in buf: buf += self.s.recv(1)
        self.n = 0; self.events = []
        self.call("Page.enable"); self.call("Runtime.enable")
        self.call("Page.navigate", url=url)
    def _send(self, text):
        d = text.encode(); mask = os.urandom(4); n = len(d)
        hdr = b"\x81" + (bytes([0x80 | n]) if n < 126 else b"\xfe" + struct.pack(">H", n) if n < 65536 else b"\xff" + struct.pack(">Q", n))
        self.s.sendall(hdr + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(d)))
    def _rx(self, n):
        b = b""
        while len(b) < n:
            c = self.s.recv(n - len(b))
            if not c: raise EOFError
            b += c
        return b
    def _recv(self):
        data = b""
        while True:
            b0, b1 = self._rx(2); n = b1 & 0x7f
            if n == 126: n = struct.unpack(">H", self._rx(2))[0]
            elif n == 127: n = struct.unpack(">Q", self._rx(8))[0]
            data += self._rx(n)
            if b0 & 0x80: return json.loads(data.decode())
    def call(self, method, **params):
        self.n += 1; i = self.n
        self._send(json.dumps({"id": i, "method": method, "params": params}))
        while True:
            m = self._recv()
            if m.get("id") == i:
                if "error" in m: raise RuntimeError(m["error"])
                return m["result"]
            self.events.append(m)
    def ev(self, expr, wait=True):
        r = self.call("Runtime.evaluate", expression=expr, awaitPromise=wait, returnByValue=True)
        if "exceptionDetails" in r: raise RuntimeError(json.dumps(r["exceptionDetails"])[:600])
        return r["result"].get("value")
    def shot(self, path):
        open(path, "wb").write(base64.b64decode(self.call("Page.captureScreenshot", format="png")["data"]))
    def close(self):
        self.p.kill()
