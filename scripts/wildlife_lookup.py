"""Gemeinsame Hilfen für die Auflösung von Wildlife-Verweisen (fetch_wildlife.py, build_geojson.py).

Grundsatz: Ein Name wird nur übernommen, wenn die Digitize API ihn ausdrücklich zusammen mit der
Kennung des Schutzguts (protected_entity_id) liefert. Es gibt keine eigenen Zuordnungstabellen und
es werden keine Namen abgeleitet oder erraten.
"""

NAME_KEYS = ("name_de", "name", "name_en")

# Schlüsselwörter, an denen ein verschachteltes Objekt als Wildlife-/Schutzgut-Objekt erkannt wird
# (so wird nicht versehentlich der Name des Schutzgebiets oder einer Organisation übernommen).
ENTITY_WORDS = ("entity", "entities", "wildlife", "species", "animal")


def pick_text(d, keys=NAME_KEYS):
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


def entity_pairs(obj, bare_id_is_entity=False):
    """Liefert (Kennung des Schutzguts, Name) aus einem Antwort-Eintrag.

    Erkannt werden:
      1. Verknüpfungseintrag mit protected_entity_id und Name im selben Eintrag,
      2. verschachteltes Wildlife-/Schutzgut-Objekt mit eigener id und Name
         (oder mit protected_entity_id im umgebenden Eintrag),
      3. bei bare_id_is_entity=True (Antwort eines Endpunkts, der die Schutzgüter selbst auflistet):
         Eintrag mit id und Name.
    """
    if not isinstance(obj, dict):
        return
    own = as_key(obj.get("protected_entity_id"))
    name = pick_text(obj)

    if name:
        if own is not None:
            yield own, name
        elif bare_id_is_entity and as_key(obj.get("id")) is not None:
            yield as_key(obj.get("id")), name

    for key, value in obj.items():
        if isinstance(value, dict) and any(w in key.lower() for w in ENTITY_WORDS):
            n = pick_text(value)
            if n:
                eid = as_key(value.get("id"))
                eid = eid if eid is not None else own
                if eid is not None:
                    yield eid, n
        elif isinstance(value, list) and any(w in key.lower() for w in ENTITY_WORDS):
            for item in value:
                yield from entity_pairs(item, bare_id_is_entity=False)
