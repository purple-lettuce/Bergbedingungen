import json
import os

DATA_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data"
)

INPUT_FILE = os.path.join(
    DATA_DIR,
    "protected_areas_alps.json"
)

OUTPUT_FILE = os.path.join(
    DATA_DIR,
    "protected_areas_alps.geojson"
)


def main():

    with open(
        INPUT_FILE,
        encoding="utf-8"
    ) as f:

        areas = json.load(f)

    features = []

    for area in areas:

        geometry = (
            area
            .get("geodata", {})
            .get("geometry")
        )

        if not geometry:
            continue

        feature = {
            "type": "Feature",
            "geometry": geometry,
            "properties": {
                "uuid": area.get("uuid"),
                "name": area.get("name"),
                "category_id": area.get("category_id"),
                "summary": area.get("summary_de")
                           or area.get("summary")
                           or "",
            }
        }

        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            geojson,
            f,
            ensure_ascii=False
        )

    print(
        f"{len(features)} Features geschrieben"
    )

    print(
        OUTPUT_FILE
    )


if __name__ == "__main__":
    main()