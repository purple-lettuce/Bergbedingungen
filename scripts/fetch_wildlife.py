#!/usr/bin/env python3
"""Löst die Wildlife-Verweise der Digitize API (DTP) zu lesbaren Namen auf.

Ausgangslage: Ein Schutzgebiet verweist bei "wildlife" nur auf Verknüpfungseinträge. Auch GET /wildlife
liefert in der Grundeinstellung nur Verknüpfungen (id, protected_area_uuid, protected_entity_id), keine
Namen. Dieses Skript sucht die Namen ausschließlich in offiziellen DTP-Quellen, in dieser Reihenfolge:

  1. GET /wildlife?fields=all      (laut Doku lässt sich die Antwort über "fields" erweitern)
  2. Endpunkte, die das offizielle OpenAPI-Schema (GET /schema/) für Schutzgüter/Arten deklariert
  3. GET /protected-areas/{uuid}/wildlife   (nur wenn 1. und 2. nicht genügen)

Übernommen wird nur, was die API selbst zusammen mit der Kennung des Schutzguts (protected_entity_id)
liefert. Keine eigenen Zuordnungstabellen, keine erfundenen Namen.

Ergebnis:
  data/wildlife_entities.json   Kennung -> Name, Kennung -> Art (FAUNA, FLORA, HABITAT) und Verknüpfung -> Kennung
                                (klein, wird von build_geojson.py gelesen)
  data/wildlife_probe.json      Diagnosebericht: was geprüft wurde, was die API geliefert hat, was fehlt
"""

import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from fetch_protected_areas import BASE, DATA_DIR, PAUSE, UA, fetch_all, get_json  # noqa: E402
from wildlife_lookup import ENTITY_WORDS, as_key, entity_pairs  # noqa: E402

OUT_ENTITIES = os.path.join(DATA_DIR, "wildlife_entities.json")
OUT_PROBE = os.path.join(DATA_DIR, "wildlife_probe.json")

NESTED_SAMPLE = 5          # so viele Gebiete werden zuerst probeweise über den verschachtelten Endpunkt abgefragt
KEYWORDS = ("wildlife", "entit", "species", "animal")


# ---------- Schema (OpenAPI) ----------

def load_schema():
    """OpenAPI-Dokument der API (JSON oder YAML) oder None."""
    last = None
    for suffix in ("/schema/?format=json", "/schema/"):
        try:
            req = urllib.request.Request(BASE + suffix, headers={
                "User-Agent": UA, "Accept": "application/vnd.oai.openapi+json, application/json, application/yaml;q=0.5"})
            with urllib.request.urlopen(req, timeout=60) as r:
                raw = r.read().decode("utf-8")
            try:
                return json.loads(raw)
            except ValueError:
                try:
                    import yaml  # vorhanden auf GitHub-Runnern; sonst bleibt nur JSON
                    return yaml.safe_load(raw)
                except Exception as e:  # noqa: BLE001
                    last = e
        except Exception as e:  # noqa: BLE001
            last = e
    print("Hinweis: OpenAPI-Schema nicht abrufbar:", last)
    return None


def resolve_ref(schema, node, depth=0):
    """Löst ein $ref im Schema auf (flach, mit Tiefenbegrenzung)."""
    while isinstance(node, dict) and "$ref" in node and depth < 5:
        target = schema
        for part in node["$ref"].lstrip("#/").split("/"):
            target = target.get(part, {}) if isinstance(target, dict) else {}
        node, depth = target, depth + 1
    return node


def response_fields(schema, op):
    """Feldnamen der 200-Antwort einer Operation (bei Listen: der Einträge)."""
    try:
        content = op["responses"]["200"]["content"]
        body = next(iter(content.values()))["schema"]
    except (KeyError, StopIteration, TypeError):
        return []
    body = resolve_ref(schema, body)
    props = (body or {}).get("properties", {})
    if "results" in props:  # Seitenantwort
        body = resolve_ref(schema, props["results"])
        body = resolve_ref(schema, body.get("items", body))
        props = (body or {}).get("properties", {})
    elif body.get("type") == "array":
        body = resolve_ref(schema, body.get("items", {}))
        props = (body or {}).get("properties", {})
    return sorted(props)


def relevant_paths(schema):
    """Pfade des Schemas, die Wildlife, Schutzgüter oder Arten betreffen: {pfad: {Methode: Feldnamen}}."""
    found = {}
    for path, item in (schema or {}).get("paths", {}).items():
        if any(k in path.lower() for k in KEYWORDS):
            found[path] = {m: response_fields(schema, op) for m, op in item.items()
                           if isinstance(op, dict) and "responses" in op}
    return found


def entity_endpoints(paths):
    """Listen-Endpunkte (ohne Pfadparameter), die Schutzgüter/Arten selbst auflisten, nicht die Verknüpfungen."""
    return [p for p in paths
            if "{" not in p and ("entit" in p.lower() or "species" in p.lower()) and "get" in paths[p]]


# ---------- Abruf ----------

def fetch_variants(url, variants, log):
    """Ruft url mit den Query-Varianten der Reihe nach ab; die erste funktionierende gewinnt."""
    for q in variants:
        full = url + (("?" + q) if q else "")
        try:
            rows = fetch_all(full)
            log.append({"url": full.replace(BASE, ""), "ok": True, "rows": len(rows),
                        "fields": sorted(rows[0]) if rows and isinstance(rows[0], dict) else []})
            return rows
        except urllib.error.HTTPError as e:
            log.append({"url": full.replace(BASE, ""), "ok": False, "error": f"HTTP {e.code}"})
        except Exception as e:  # noqa: BLE001
            log.append({"url": full.replace(BASE, ""), "ok": False, "error": str(e)[:120]})
    return None


def collect(entities, rows, bare_id_is_entity=False):
    n = 0
    for row in rows or []:
        for eid, name in entity_pairs(row, bare_id_is_entity):
            if entities.get(eid) != name:
                entities[eid] = name
                n += 1
    return n


def collect_types(types, rows, rows_are_entities=False):
    """Art des Schutzguts (FAUNA, FLORA, HABITAT ...), wie die API sie im Feld type des Schutzguts liefert.

    Gelesen wird nur der Eintrag eines Schutzgut-Endpunkts (rows_are_entities=True: id und type im selben Eintrag) oder
    ein verschachteltes Schutzgut-Objekt mit eigener id. Die id eines Verknüpfungseintrags (/wildlife) ist nie die eines
    Schutzguts. Fehlt die Angabe, bleibt die Art unbekannt.
    """
    for row in rows or []:
        if not isinstance(row, dict):
            continue
        candidates = [row] if rows_are_entities else []
        candidates += [v for k, v in row.items() if isinstance(v, dict) and any(w in k.lower() for w in ENTITY_WORDS)]
        for obj in candidates:
            eid, t = as_key(obj.get("id")), obj.get("type")
            if eid is not None and isinstance(t, str) and t.strip():
                types[eid] = t.strip().upper()


def main():
    probe = {"generated": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
             "steps": [], "schema": {}, "wildlife_sample": None}
    entities = {}
    types = {}

    # 0. Offizielles Schema: welche Endpunkte zu Wildlife/Schutzgütern gibt es, welche Felder liefern sie?
    schema = load_schema()
    paths = relevant_paths(schema)
    probe["schema"] = {"available": schema is not None, "relevant_paths": paths}
    print("OpenAPI-Schema:", "abrufbar" if schema else "nicht abrufbar")
    for p, m in paths.items():
        print("  ", p, {k: v for k, v in m.items()})

    # 1. GET /wildlife (mit fields=all, sonst wie bisher)
    log = probe["steps"]
    rows = fetch_variants(BASE + "/wildlife", ["fields=all", ""], log)
    rows = rows or []
    if rows:
        probe["wildlife_sample"] = rows[0]
    wanted = {as_key(r.get("protected_entity_id")) for r in rows if isinstance(r, dict)} - {None}
    areas = sorted({r.get("protected_area_uuid") for r in rows if isinstance(r, dict) and r.get("protected_area_uuid")})
    # Verknüpfungen: Die id eines Wildlife-Eintrags im Schutzgebiet ist die id dieser Verknüpfung. Über sie führt der Weg
    # zum Schutzgut (protected_entity_id), ohne dass IDs verwechselt werden (siehe docs/WILDLIFE_ANALYSE.md, Abschnitt 7).
    links = {}
    for r in rows:
        if isinstance(r, dict) and as_key(r.get("id")) is not None and as_key(r.get("protected_entity_id")) is not None:
            links[as_key(r["id"])] = as_key(r["protected_entity_id"])
    print(f"/wildlife: {len(rows)} Verknüpfungen, {len(wanted)} verschiedene Schutzgüter, {len(areas)} Gebiete")
    collect(entities, rows)
    collect_types(types, rows)
    print(f"  Namen aus /wildlife: {len(set(entities) & wanted)} von {len(wanted)}")

    # 2. Endpunkte für Schutzgüter/Arten laut Schema
    if wanted - set(entities):
        for p in entity_endpoints(paths):
            r = fetch_variants(BASE + p, ["fields=all", ""], log)
            collect(entities, r, bare_id_is_entity=True)
            collect_types(types, r, rows_are_entities=True)
            print(f"  {p}: {len(r or [])} Einträge, aufgelöst jetzt {len(set(entities) & wanted)} von {len(wanted)}")
            if not (wanted - set(entities)):
                break

    # 3. GET /protected-areas/{uuid}/wildlife
    if wanted - set(entities) and areas:
        sample = areas[:NESTED_SAMPLE]
        got = 0
        for uuid in sample:
            r = fetch_variants(f"{BASE}/protected-areas/{uuid}/wildlife", ["fields=all", ""], log)
            got += collect(entities, r)
            collect_types(types, r)
            time.sleep(PAUSE)
        print(f"  /protected-areas/{{uuid}}/wildlife (Stichprobe {len(sample)} Gebiete): {got} Namen")
        if got:
            for uuid in areas[NESTED_SAMPLE:]:
                r = fetch_variants(f"{BASE}/protected-areas/{uuid}/wildlife", ["fields=all"], [])
                collect(entities, r)
                collect_types(types, r)
                time.sleep(PAUSE)

    resolved = len(set(entities) & wanted)
    probe["result"] = {"entities_needed": len(wanted), "entities_resolved": resolved,
                       "complete": bool(wanted) and resolved == len(wanted)}
    print(f"Ergebnis: {resolved} von {len(wanted)} Schutzgütern mit Namen aufgelöst")
    if wanted and not resolved:
        print("WARNUNG: Die API liefert in den abgefragten Quellen keine Namen zu protected_entity_id. "
              "Siehe data/wildlife_probe.json und docs/WILDLIFE_ANALYSE.md (Ursache und Lösungswege).")

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUT_ENTITIES, "w", encoding="utf-8") as f:
        json.dump({"generated": probe["generated"], "source": BASE,
                   "entities": {str(k): v for k, v in sorted(entities.items()) if k in wanted or not wanted},
                   "types": {str(k): v for k, v in sorted(types.items()) if k in wanted or not wanted},
                   "links": {str(k): v for k, v in sorted(links.items())}},
                  f, ensure_ascii=False, separators=(",", ":"))
    with open(OUT_PROBE, "w", encoding="utf-8") as f:
        json.dump(probe, f, ensure_ascii=False, indent=2)
    print(OUT_ENTITIES)
    print(OUT_PROBE)


if __name__ == "__main__":
    main()
