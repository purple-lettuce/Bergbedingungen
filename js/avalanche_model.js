// Regionsdatensatz im Browser. Das Frontend lädt je Quelle eine Polygon-Datei und eine Bulletin-Datei (Aufbau:
// docs/AVALANCHE_ARCHITECTURE.md) und setzt daraus je Region denselben flachen Datensatz zusammen, den die Pipeline in
// Python als Standardmodell erzeugt (scripts/avalanche_schema.py, RECORD_FIELDS). Alles danach (Karte, Popup, Legende,
// spätere Analysen) arbeitet nur mit diesem Datensatz und kennt weder Quelle noch Dateiaufbau. Reines Modul.

// Felder des Standardmodells ohne die Geometrie (die hält die Kartenebene), gleiche Namen und Reihenfolge wie in Python
export const RECORD_FIELDS = [
  'source', 'country', 'region_id', 'region_name', 'label_point', 'bulletin_id', 'publication_time', 'valid_from',
  'valid_until', 'next_update', 'main_date', 'unscheduled', 'max_level', 'max_subdivision', 'danger_ratings',
  'danger_by_elevation', 'elevation_thresholds', 'avalanche_problems', 'aspects', 'problem_groups', 'danger_patterns',
  'highlights', 'bulletin_text'
];

const ASPECT_ORDER = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// props: Properties des Polygon-Features (source, country, region_id, region_name, label_point)
// bulletin: Bulletin aus der Bulletin-Datei oder null (Region ohne Bericht)
export function toRecord(props, bulletin) {
  const b = bulletin;
  const text = b && b.text ? b.text : {};
  const problems = b ? b.avalanche_problems : [];
  const aspects = ASPECT_ORDER.filter(function (a) { return problems.some(function (p) { return (p.aspects || []).indexOf(a) !== -1; }); });
  const bulletinText = {};
  Object.keys(text).forEach(function (k) { if (k !== 'headline') bulletinText[k] = text[k]; });
  return {
    source: props.source,
    country: props.country,
    region_id: props.region_id,
    region_name: props.region_name,
    label_point: props.label_point,
    bulletin_id: b ? b.id : null,
    publication_time: b ? b.publication_time : null,
    valid_from: b ? b.validity_period.start : null,
    valid_until: b ? b.validity_period.end : null,
    next_update: b && b.next_update ? b.next_update : null,
    main_date: b && b.main_date ? b.main_date : null,
    unscheduled: !!(b && b.unscheduled),
    max_level: b ? b.max_level : null,
    max_subdivision: b && b.max_subdivision ? b.max_subdivision : null,
    danger_ratings: b ? b.danger_ratings : [],
    danger_by_elevation: b ? b.danger_by_elevation : [],
    elevation_thresholds: b ? b.elevation_thresholds : [],
    avalanche_problems: problems,
    aspects: aspects,
    problem_groups: b && b.problem_groups ? b.problem_groups : [],
    danger_patterns: b && b.danger_patterns ? b.danger_patterns : [],
    highlights: text.headline || null,
    bulletin_text: bulletinText
  };
}
