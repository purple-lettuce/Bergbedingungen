#!/usr/bin/env python3
"""Einmalige Erkundung der Digitize-the-Planet-API (Wegwerf-Skript, nur auf dem Branch explore/dtp-api)."""
import json, os, urllib.request, urllib.error, urllib.parse, time

HOST = "https://platform.digitizetheplanet.org"
BASE = HOST + "/api/v2"
OUT = os.path.join(os.path.dirname(__file__), "result.json")
CAP = 8000
res = {}

def get(url, key=None, cap=CAP, headers=None):
    key = key or url
    h = {"User-Agent": "bergbedingungen-explore", "Accept": "application/json"}
    if headers: h.update(headers)
    req = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode("utf-8", "replace")
            res[key] = {"status": r.status, "ctype": r.headers.get("Content-Type"), "len": len(body), "body": body[:cap]}
            return body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        res[key] = {"status": e.code, "ctype": e.headers.get("Content-Type"), "len": len(body), "body": body[:1500]}
    except Exception as e:
        res[key] = {"error": repr(e)}
    time.sleep(0.3)
    return None

def save():
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)

# 1) Schema / Dokumentation / Wurzel
for u in [BASE + "/", BASE, BASE + "/schema/", BASE + "/schema", BASE + "/openapi.json", BASE + "/openapi.yaml",
          BASE + "/swagger.json", BASE + "/docs/", HOST + "/api/schema/", HOST + "/api/v2/schema/?format=json",
          HOST + "/api/openapi.json", HOST + "/api/swagger.json", HOST + "/openapi.json", HOST + "/api/v2/openapi/",
          HOST + "/en/api/docs/v2/", HOST + "/api/docs/", HOST + "/api/"]:
    body = get(u, cap=3000)
    time.sleep(0.2)
save()

# 2) falls ein OpenAPI-Dokument gefunden wurde: Pfade und wildlife-/entity-bezogene Schemas vollständig sichern
spec = None
for k, v in res.items():
    if v.get("status") == 200 and "json" in (v.get("ctype") or "") and v.get("len", 0) > 2000:
        try:
            doc = json.loads(get(k, key="__spec__:" + k, cap=0) or "null")
        except Exception:
            doc = None
        if isinstance(doc, dict) and ("paths" in doc or "openapi" in doc or "swagger" in doc):
            spec = (k, doc); break
if spec:
    k, doc = spec
    res["__spec_url__"] = k
    res["__spec_paths__"] = sorted(doc.get("paths", {}).keys())
    comps = (doc.get("components") or {}).get("schemas") or doc.get("definitions") or {}
    res["__spec_schema_names__"] = sorted(comps.keys())
    pick = {n: s for n, s in comps.items() if any(w in n.lower() for w in ("wildlife", "entity", "entities", "species", "protectedarea", "rule"))}
    res["__spec_schemas_wildlife__"] = pick
    pp = {p: v for p, v in doc.get("paths", {}).items() if any(w in p.lower() for w in ("wildlife", "entit", "species", "rule"))}
    res["__spec_paths_wildlife__"] = pp
save()

# 3) Wildlife-Endpunkte und mögliche Referenzendpunkte
for path in ["/wildlife", "/wildlife?page_size=3", "/wildlife?limit=3", "/wildlife?fields=all", "/wildlife/14", "/wildlife/14?fields=all",
             "/protected-entities", "/protected-entities/4626", "/protected-entity", "/protected_entities", "/protected-entity-types",
             "/entities", "/entities/4626", "/species", "/wildlife-species", "/wildlife-types", "/wildlife-categories",
             "/taxa", "/taxons", "/animals", "/protected-area-wildlife", "/protected-area-entities", "/protection-objects",
             "/conservation-objectives", "/conservation-targets", "/protected-objects", "/categories", "/activities?limit=2"]:
    get(BASE + path, cap=2500)
save()

# 4) Details eines Gebiets mit Wildlife
area = "afc76604-4f04-41d5-bcab-421818dee828"
for path in [f"/protected-areas/{area}?fields=all", f"/protected-areas/{area}/wildlife", f"/protected-areas/{area}/wildlife?fields=all",
             f"/protected-areas/{area}/rules?limit=3", f"/protected-areas/{area}", f"/protected-areas/{area}?fields=wildlife",
             f"/protected-areas/{area}?fields=wildlife,conservation_objectives"]:
    get(BASE + path, cap=CAP)
save()

# 5) OPTIONS auf /wildlife (DRF liefert Feldbeschreibung)
try:
    req = urllib.request.Request(BASE + "/wildlife", method="OPTIONS", headers={"User-Agent": "bergbedingungen-explore", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        b = r.read().decode("utf-8", "replace"); res["OPTIONS /wildlife"] = {"status": r.status, "body": b[:4000]}
except Exception as e:
    res["OPTIONS /wildlife"] = {"error": repr(e)}
save()
print("fertig,", len(res), "Abfragen")
for k, v in res.items():
    if not k.startswith("__"):
        print(v.get("status", v.get("error")), (v.get("ctype") or "")[:30], v.get("len"), k)
