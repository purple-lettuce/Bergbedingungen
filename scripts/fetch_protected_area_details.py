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

INPUT_FILE = os.path.join(
    DATA_DIR,
    "protected_areas.json"
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "protected_areas_alps.json"
)

PAUSE = 0.3


ALPINE_COUNTRIES = {
    2,   # Slowenien
    11   # Liechtenstein
}

ALPINE_STATES = {

    # Deutschland
    1,
    2,

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


def get_json(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "bergbedingungen"
        }
    )

    with urllib.request.urlopen(req) as r:
        return json.load(r)


def is_alpine(area):

    states = set(
        area.get("state_ids", [])
    )

    countries = set(
        area.get("country_ids", [])
    )

    if states & ALPINE_STATES:
        return True

    if countries & ALPINE_COUNTRIES:
        return True

    return False


def main():

    with open(
        INPUT_FILE,
        encoding="utf-8"
    ) as f:
        source = json.load(f)

    areas = source["results"]

    print(
        f"{len(areas)} Schutzgebiete werden geprüft"
    )

    alpine = []

    for i, area in enumerate(
        areas,
        start=1
    ):

        uuid = area["uuid"]

        url = (
            f"{BASE}/protected-areas/"
            f"{uuid}?fields=all"
        )

        try:

            detail = get_json(url)

            if is_alpine(detail):
                alpine.append(detail)

        except Exception as e:

            print(
                f"Fehler bei {uuid}: {e}"
            )

        if i % 100 == 0:

            print(
                f"{i}/{len(areas)} geprüft "
                f"({len(alpine)} Alpen)"
            )

        time.sleep(PAUSE)

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            alpine,
            f,
            ensure_ascii=False,
            indent=2
        )

    print()
    print(
        f"{len(alpine)} alpine Schutzgebiete gespeichert"
    )
    print(
        OUTPUT_FILE
    )


if __name__ == "__main__":
    main()