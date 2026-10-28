"""Baut data/protected_areas_alps.geojson aus data/protected_areas_alps.json.

Neben Geometrie, Name, Kategorie und Beschreibung werden lesbare Informationen zu
Wildlife und Regeln übernommen (nur das, was das Frontend im Popup anzeigt):

- Wildlife: Die Schutzgebiete verweisen nur per ID auf Verknüpfungseinträge (mit protected_entity_id).
  Die Namen werden über data/wildlife_entities.json aufgelöst (scripts/fetch_wildlife.py, nur Daten aus der
  Digitize API). Was dort nicht steht, wird nicht angezeigt; es gibt keine eigenen Zuordnungstabellen.
- Regeln: Es wird der ausgeschriebene Regeltext der API übernommen (text_de, sonst
  text, sonst text_en). Regeln ohne Text werden bewusst weggelassen: Aus Aktivität
  und Bedingungen allein lässt sich nicht sicher ableiten, ob etwas erlaubt oder
  verboten ist.

Kompakt: Namen und Regeltexte stehen einmal in Tabellen am Ende der FeatureCollection
("wildlife_names", "rule_texts"), die Gebiete verweisen darauf über Indizes
(properties.w, properties.r). IDs von Wildlife und Regeln gelangen nicht in die Datei.

Aufruf:
  python3 scripts/build_geojson.py [--wildlife-key SCHLUESSEL]

--wildlife-key legt fest, in welchem Feld eines Wildlife-Eintrags der Verweis auf die
Referenzliste steht, falls die automatische Erkennung ihn nicht findet.
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from wildlife_lookup import entity_pairs  # noqa: E402

DATA_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data"
)

INPUT_FILE = os.path.join(DATA_DIR, "protected_areas_alps.json")
WILDLIFE_FILE = os.path.join(DATA_DIR, "wildlife_entities.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "protected_areas_alps.geojson")

NAME_KEYS = ("name_de", "name", "name_en")
TEXT_KEYS = ("text_de", "text", "text_en")

# Felder, in denen ein Verweis auf die Wildlife-Referenzliste stehen kann (in dieser Reihenfolge).
REF_KEYS = ("protected_entity_id", "wildlife_id", "wildlife", "wildlife_species_id", "species_id", "species")
# Felder mit "_id", die sicher etwas anderes bezeichnen.
NOT_REF_KEYS = {"protected_area_id", "area_id", "parent_id", "category_id", "organization_id",
                "source_id", "activity_id", "state_id", "country_id"}

MAX_RULES = 8  # Regeln pro Gebiet, wichtige (is_important) zuerst


def pick_text(d, keys):
    """Erster nicht leerer Text aus den angegebenen Feldern eines Dicts."""
    if not isinstance(d, dict):
        return None
    for k in keys:
        v = d.get(k)
        if isinstance(v, str) and v.strip():
            return " ".join(v.split())
    return None


def as_key(v):
    """Vergleichsschlüssel für IDs (Zahl oder Zahl als Text)."""
    if isinstance(v, bool):
        return None
    if isinstance(v, int):
        return v
    if isinstance(v, str) and v.strip().lstrip("-").isdigit():
        return int(v)
    return None


def load_wildlife_lookup(path):
    """Kennung des Schutzguts -> lesbarer Name aus data/wildlife_entities.json."""
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        doc = json.load(f)
    lookup = {}
    for key, name in (doc.get("entities") or {}).items():
        ident = as_key(key)
        if ident is not None and isinstance(name, str) and name.strip():
            lookup[ident] = name.strip()
    return lookup


def resolve_wildlife(item, lookup, forced_key=None):
    """Liefert (Name, verwendetes Feld) oder (None, None).

    Es wird nie über das Feld "id" des Eintrags aufgelöst: Bei Verknüpfungsdatensätzen
    ist das die ID der Verknüpfung, nicht die der Tierart, und würde falsche Namen liefern.
    """
    if isinstance(item, str):
        return (item.strip() or None), "text"
    if not isinstance(item, dict):
        return None, None

    # 1. Name steht direkt im Eintrag
    name = pick_text(item, NAME_KEYS)
    if name:
        return name, "name"

    # 2. Verschachteltes Wildlife-/Schutzgut-Objekt mit Namen
    for _, nested_name in entity_pairs(item):
        return nested_name, "verschachtelt"

    # 3. Verweis auf die Referenzliste
    keys = [forced_key] if forced_key else list(REF_KEYS) + sorted(
        k for k in item
        if (k.endswith("_id") or k.endswith("_uuid")) and k not in REF_KEYS and k not in NOT_REF_KEYS and k != "id"
    )
    for k in keys:
        v = item.get(k)
        if isinstance(v, dict):  # verschachtelt: {"wildlife": {"id": .., "name_de": ..}}
            name = pick_text(v, NAME_KEYS)
            if name:
                return name, k
            v = v.get("id")
        ident = as_key(v)
        if ident is not None and ident in lookup:
            return lookup[ident], k
    return None, None


def season_text(rule):
    """'01.12.–30.04.' aus season_start/season_end (Jahr 2000), sonst None."""
    def fmt(v):
        if isinstance(v, str) and len(v) >= 10 and v[4] == "-" and v[7] == "-":
            return f"{v[8:10]}.{v[5:7]}."
        return None
    a, b = fmt(rule.get("season_start")), fmt(rule.get("season_end"))
    return f"{a}–{b}" if a and b else None


def readable_rules(rules):
    """Regeltexte eines Gebiets: wichtige zuerst, ohne Doppelte, begrenzt."""
    if not isinstance(rules, list):
        return []
    items = []
    for i, rule in enumerate(rules):
        text = pick_text(rule, TEXT_KEYS)
        if not text:
            continue
        season = season_text(rule)
        if season and season not in text:
            text += f" ({season})"
        important = isinstance(rule, dict) and bool(rule.get("is_important"))
        items.append((0 if important else 1, i, text))
    items.sort()
    out = []
    for _, _, text in items:
        if text not in out:
            out.append(text)
    return out[:MAX_RULES]


class Table:
    """String-Tabelle: jeder Text steht einmal, Verweise sind Indizes."""

    def __init__(self):
        self.items = []
        self.index = {}

    def add(self, text):
        if text not in self.index:
            self.index[text] = len(self.items)
            self.items.append(text)
        return self.index[text]


def build(areas, lookup, forced_key=None):
    """Gibt (geojson, Statistik) zurück."""
    wildlife_table, rule_table = Table(), Table()
    stats = {"areas": 0, "wildlife_items": 0, "wildlife_resolved": 0, "wildlife_unresolved_samples": [],
             "wildlife_keys": {}, "rule_items": 0, "rules_kept": 0}
    features = []

    for area in areas:
        geometry = (area.get("geodata") or {}).get("geometry")
        if not geometry:
            continue
        stats["areas"] += 1

        props = {
            "uuid": area.get("uuid"),
            "name": area.get("name"),
            "category_id": area.get("category_id"),
            "summary": area.get("summary_de")
                       or area.get("summary")
                       or "",
        }

        wild = []
        for item in area.get("wildlife") or []:
            stats["wildlife_items"] += 1
            name, via = resolve_wildlife(item, lookup, forced_key)
            if name:
                stats["wildlife_resolved"] += 1
                stats["wildlife_keys"][via] = stats["wildlife_keys"].get(via, 0) + 1
                idx = wildlife_table.add(name)
                if idx not in wild:
                    wild.append(idx)
            elif len(stats["wildlife_unresolved_samples"]) < 3:
                stats["wildlife_unresolved_samples"].append(item)
        if wild:
            props["w"] = wild

        stats["rule_items"] += len(area.get("rules") or [])
        texts = readable_rules(area.get("rules"))
        stats["rules_kept"] += len(texts)
        if texts:
            props["r"] = [rule_table.add(t) for t in texts]

        features.append({"type": "Feature", "geometry": geometry, "properties": props})

    geojson = {"type": "FeatureCollection", "features": features}
    if wildlife_table.items:
        geojson["wildlife_names"] = wildlife_table.items
    if rule_table.items:
        geojson["rule_texts"] = rule_table.items
    return geojson, stats


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--wildlife-key", help="Feld mit dem Verweis auf die Wildlife-Referenzliste")
    args = parser.parse_args()

    with open(INPUT_FILE, encoding="utf-8") as f:
        areas = json.load(f)

    lookup = load_wildlife_lookup(WILDLIFE_FILE)
    if not lookup:
        print("Hinweis: data/wildlife_entities.json fehlt oder ist leer (scripts/fetch_wildlife.py ausführen, "
              "siehe docs/WILDLIFE_ANALYSE.md). Wildlife wird nur übernommen, wenn der Name direkt im Eintrag steht.")

    geojson, st = build(areas, lookup, args.wildlife_key)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, separators=(",", ":"))

    print(f"{st['areas']} Features geschrieben")
    print(f"Wildlife: {st['wildlife_resolved']} von {st['wildlife_items']} Einträgen aufgelöst "
          f"({len(geojson.get('wildlife_names', []))} verschiedene Namen)")
    if st["wildlife_keys"]:
        print("  aufgelöst über Feld:", ", ".join(f"{k} ({n})" for k, n in st["wildlife_keys"].items()))
    if st["wildlife_resolved"] < st["wildlife_items"]:
        print("  WARNUNG: nicht aufgelöste Wildlife-Einträge, Beispiele:")
        for s in st["wildlife_unresolved_samples"]:
            print("   ", json.dumps(s, ensure_ascii=False)[:300])
        print("  Tipp: --wildlife-key <Feld> angeben, wenn der Verweis in einem anderen Feld steht.")
        if any(isinstance(s, dict) and as_key(s.get("id")) in lookup for s in st["wildlife_unresolved_samples"]):
            print("  Die id dieser Einträge kommt in der Referenzliste vor. Bezeichnet sie die Tierart selbst "
                  "(und nicht eine Verknüpfung), dann: --wildlife-key id")
    print(f"Regeln: {st['rules_kept']} Texte übernommen aus {st['rule_items']} Regeln "
          f"({len(geojson.get('rule_texts', []))} verschiedene Texte); Regeln ohne Text werden ausgelassen")
    print(f"Größe: {os.path.getsize(OUTPUT_FILE) / 1e6:.1f} MB")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    sys.exit(main())
