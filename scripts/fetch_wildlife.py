#!/usr/bin/env python3
"""Holt die Wildlife-Referenzliste der Digitize API (GET /wildlife).

Die Schutzgebiets-Details enthalten bei "wildlife" nur Verweise (IDs). Die lesbaren
Namen stehen in dieser Liste. build_geojson.py löst die IDs damit auf.

Ergebnis: data/wildlife.json (klein, nur Referenzdaten).
"""

import datetime
import json
import os

from fetch_protected_areas import BASE, DATA_DIR, fetch_all

OUT_WILDLIFE = os.path.join(DATA_DIR, "wildlife.json")


def main():
    print("Lade Wildlife-Referenzliste...")
    rows = fetch_all(BASE + "/wildlife")
    print(f"{len(rows)} Wildlife-Einträge geladen")

    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
    doc = {
        "generated": now.isoformat().replace("+00:00", "Z"),
        "source": BASE + "/wildlife",
        "results": rows,
    }

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUT_WILDLIFE, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)

    if rows:
        print("Felder eines Eintrags:", ", ".join(sorted(rows[0].keys())))
    print(OUT_WILDLIFE)


if __name__ == "__main__":
    main()
