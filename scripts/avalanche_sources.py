"""Registry der Lawinenwarndienste. Ein neues Land ist eine Provider-Klasse (avalanche_providers.py) und eine Zeile hier.

Pipeline (fetch_avalanche.py), Workflow und Frontend bleiben unverändert. Anleitung: docs/AVALANCHE_ARCHITECTURE.md.
"""
from avalanche_providers import AlbinaProvider, SLFProvider, REGIONS_URL   # noqa: F401  (REGIONS_URL: Vorgabe der Pipeline)

PROVIDERS = [
    AlbinaProvider(),
    SLFProvider(),
    # FranceProvider(), ItalyProvider(), SloveniaProvider(): siehe docs/AVALANCHE_ARCHITECTURE.md
]


def get_provider(source_id):
    return next((p for p in PROVIDERS if p.id == source_id), None)
