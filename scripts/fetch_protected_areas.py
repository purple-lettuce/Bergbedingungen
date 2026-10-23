#!/usr/bin/env python3

import datetime
import json
import os
import time
import urllib.request

BASE = "https://platform.digitizetheplanet.org/api/v2"

DATA_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data"
)

OUT_AREAS = os.path.join(DATA_DIR, "protected_areas.json")
OUT_CATEGORIES = os.path.join(DATA_DIR, "protected_area_categories.json")

UA = "bergbedingungen-snapshot"
PAUSE = 0.3


def get_json(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "application/json"
        }
    )

    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def fetch_all(url):
    rows = []

    while url:
        data = get_json(url)

        if isinstance(data, list):
            rows.extend(data)
            break

        rows.extend(data.get("results", []))
        url = data.get("next")

        time.sleep(PAUSE)

    return rows


def main():
    print("Lade Schutzgebiets-Kategorien...")

    categories = fetch_all(
        BASE + "/protected-area-categories"
    )

    print(f"{len(categories)} Kategorien geladen")

    print("Lade Schutzgebiete...")

    areas = fetch_all(
        BASE + "/protected-areas"
    )

    print(f"{len(areas)} Schutzgebiete geladen")

    KEEP_CATEGORIES = {
        1,   # Nationalpark
        2,   # Naturschutzgebiet
        17,  # Ruhezone
        18,  # Wald-Wild-Schongebiet
        19,  # Wildschutzgebiet
        20,  # Wildruhezone
        41,  # Wald- und Wildschutzzone
        45,  # Winterruhezone
        48,  # Jagdrechtliches Betretungsverbot
        54,  # Freiwillige Wildruhezone
        55   # Ruhegebiet
    }

    ALPINE_COUNTRIES = {
        2,   # Slowenien
        11   # Liechtenstein
    }

    ALPINE_STATES = {

        # Deutschland
        1,   # Baden-Württemberg
        2,   # Bayern

        # Österreich
        30, 31, 32, 33, 34, 35, 36,

        # Schweiz
        43, 46, 47, 51, 52, 53, 55,
        58, 59, 60, 61,

        # Italien
        112, 114, 115, 118,
        122, 124, 125,

        # Frankreich
        164, 165
    }

    areas = [
        a for a in areas
        if a.get("category_id") in KEEP_CATEGORIES
    ]

    print(
        f"{len(areas)} relevante Schutzgebiete nach Kategorien"
    )

    now = datetime.datetime.now(
        datetime.timezone.utc
    ).replace(microsecond=0)

    categories_doc = {
        "generated": now.isoformat().replace("+00:00", "Z"),
        "source": BASE + "/protected-area-categories",
        "results": categories
    }

    areas_doc = {
        "generated": now.isoformat().replace("+00:00", "Z"),
        "source": BASE + "/protected-areas",
        "results": areas
    }

    os.makedirs(DATA_DIR, exist_ok=True)

    with open(
        OUT_CATEGORIES,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            categories_doc,
            f,
            ensure_ascii=False,
            indent=2
        )

    with open(
        OUT_AREAS,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            areas_doc,
            f,
            ensure_ascii=False,
            indent=2
        )

    print("Dateien geschrieben.")


if __name__ == "__main__":
    main()