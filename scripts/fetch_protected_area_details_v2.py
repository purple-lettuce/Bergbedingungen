import json
import os
import time
import urllib.request
import urllib.error

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

CHECKPOINT_FILE = os.path.join(
    DATA_DIR,
    "protected_areas_alps_checkpoint.json"
)

PAUSE = 0.3
TIMEOUT = 30

ALPINE_COUNTRIES = {
    2,   # Slowenien
    11   # Liechtenstein
}

ALPINE_STATES = {

    # Deutschland
    1, 2,

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

    with urllib.request.urlopen(
        req,
        timeout=TIMEOUT
    ) as r:

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


def save_progress(
    alpine,
    processed
):

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

    with open(
        CHECKPOINT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            {
                "processed": processed
            },
            f
        )


def load_checkpoint():

    if not os.path.exists(
        CHECKPOINT_FILE
    ):
        return 0

    with open(
        CHECKPOINT_FILE,
        encoding="utf-8"
    ) as f:

        return json.load(f).get(
            "processed",
            0
        )


def load_existing_alpine():

    if not os.path.exists(
        OUTPUT_FILE
    ):
        return []

    with open(
        OUTPUT_FILE,
        encoding="utf-8"
    ) as f:

        return json.load(f)


def main():

    with open(
        INPUT_FILE,
        encoding="utf-8"
    ) as f:

        source = json.load(f)

    areas = source["results"]

    start_index = load_checkpoint()

    alpine = load_existing_alpine()

    print(
        f"Fortsetzen bei Datensatz "
        f"{start_index}"
    )

    print(
        f"Bisher gespeichert: "
        f"{len(alpine)}"
    )

    for index in range(
        start_index,
        len(areas)
    ):

        area = areas[index]

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
                f"Fehler bei {uuid}"
            )

            print(e)

            continue

        if index % 50 == 0:

            save_progress(
                alpine,
                index
            )

            print(
                f"{index}/{len(areas)} "
                f"geprüft "
                f"({len(alpine)} Alpen)"
            )

        time.sleep(PAUSE)

    save_progress(
        alpine,
        len(areas)
    )

    print()
    print("FERTIG")
    print(
        f"{len(alpine)} Alpengebiete gespeichert"
    )


if __name__ == "__main__":
    main()