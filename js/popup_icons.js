// Symbole für die Popups der Schutzgebiete. Die Zuordnung erfolgt über Stichwörter im lesbaren Text
// (Tiername bzw. Regeltext); was nicht erkannt wird, bekommt ein neutrales Symbol. Reines Modul (kein DOM, kein Leaflet).

// ---------- Wildlife ----------
// Zuordnung nach dem Wortende eines Namensteils (deutsche Zusammensetzungen: Birkhuhn, Rothirsch, Zwergfledermaus).
// Ein Muster passt nur am Ende eines Wortes (Teile getrennt an Leerzeichen, Bindestrich, Schrägstrich, Klammer).
// Dadurch werden Fehlgriffe vermieden: "Kegelrobbe" ist kein Egel, "Braunkehlchen" keine Unke. "Austernfischer" steht bei
// den Wasservögeln, nicht bei den Fischen. Was nicht erkannt wird, bekommt das neutrale Pfotensymbol.
// Die Reihenfolge zählt: der erste passende Eintrag gewinnt (spezifische Begriffe vor allgemeinen).
var WILDLIFE_ICONS = [
  ['eule|uhu|kauz', '🦉'],
  ['adler|geier|bussard|falke|habicht|sperber|milan|weihe|greifvogel', '🦅'],
  ['huhn|fasan|wachtel', '🐔'],
  ['austernfischer|gans|ente|schwan|taucher|reiher|storch|kranich|möwe|seeschwalbe|säger|löffler|kormoran|pelikan|ibis|dommel', '🦆'],
  ['specht|meise|fink|lerche|drossel|star|rabe|krähe|dohle|kuckuck|ammer|pieper|schmätzer|schwalbe|segler|kleiber|zaunkönig|stelze|sänger|spötter|schwirl|hänfling|gimpel|sperling|häher|taube|rotschwanz|kehlchen|vogel|wiedehopf|ziegenmelker|pirol|würger|läufer|regenpfeifer|kiebitz|bekassine|schnepfe|amsel|zeisig|girlitz|stieglitz|grasmücke|goldhähnchen|trappe|ralle|schnäpper|ortolan|kernbeißer', '🐦'],
  ['kreuzotter|natter|viper|schlange|eidechse|blindschleiche|echse', '🐍'],
  ['schildkröte', '🐢'],
  ['fischotter', '🦦'],
  ['gams|gämse|steinbock|ziege|mufflon|schaf', '🐐'],
  ['hirsch|reh|rotwild|damwild|elch', '🦌'],
  ['wildschwein|keiler|sau', '🐗'],
  ['braunbär', '🐻'],
  ['wolf', '🐺'],
  ['luchs|wildkatze|katze', '🐈'],
  ['fuchs', '🦊'],
  ['dachs|marder|iltis|wiesel|hermelin', '🦡'],
  ['fledermaus|mausohr|abendsegler|langohr|hufeisennase', '🦇'],
  ['hamster', '🐹'],
  ['murmeltier|biber|hörnchen|siebenschläfer|schläfer|haselmaus|bilch|ratte|schermaus|maus', '🐿️'],
  ['hase|kaninchen', '🐇'],
  ['frosch|kröte|unke|molch|salamander|lurch', '🐸'],
  ['robbe', '🦭'],
  ['forelle|saibling|äsche|huchen|koppe|groppe|neunauge|lachs|hecht|barbe|karpfen|elritze|aal|schmerle|bitterling|stichling|barsch|gründling|finte|hasel|nase|schleie|döbel|rotauge|rotfeder|zander|wels|aitel|stör|quappe|trüsche|fisch', '🐟'],
  ['krebs|muschel|schnecke|egel', '🐚'],
  ['falter|widderchen|bläuling|weißling|gelbling|admiral|schwalbenschwanz|spinner|spanner', '🦋'],
  ['biene|hummel|wespe|ameise|hornisse', '🐝'],
  ['käfer|libelle|jungfer|heuschrecke|grille|schrecke|anbeterin', '🐞'],
  ['spinne|skorpion', '🕷️']
].map(function (r) { return [new RegExp('(?:' + r[0] + ')$', 'i'), r[1]]; });
var WILDLIFE_DEFAULT = '🐾';
// Art laut Datenquelle (Digitize API, Feld type des Schutzguts): Pflanzen und Lebensräume bekommen ein festes Symbol,
// Tiere (FAUNA, oder keine Angabe) eines nach dem Namen.
var ENTITY_TYPE_ICONS = { FLORA: '🌿', HABITAT: '🏞️' };

export function wildlifeIcon(name, type) {
  if (ENTITY_TYPE_ICONS[type]) return ENTITY_TYPE_ICONS[type];
  var words = String(name || '').split(/[\s\-\/()]+/);
  for (var w = 0; w < words.length; w++) {
    if (!words[w]) continue;
    for (var i = 0; i < WILDLIFE_ICONS.length; i++) {
      if (WILDLIFE_ICONS[i][0].test(words[w])) return WILDLIFE_ICONS[i][1];
    }
  }
  return WILDLIFE_DEFAULT;
}

// ---------- Regeln ----------
// Themensymbol nach dem Gegenstand der Regel (erster Treffer gewinnt) ...
var RULE_ICONS = [
  [/hund/i, '🐕'],
  [/drohne|flugmodell/i, '🚁'],
  [/luftsport|paraglider|gleitschirm|ballon|segelflieger|ultraleicht|drachen/i, '🪂'],
  [/wassersport|wasserfahrzeug|boot|kanu|kajak|surf|schwimmhilfe/i, '🛶'],
  [/kraftfahrzeug|fahrzeug(?!.*(kutsch|anhänger))/i, '🚗'],
  [/camping|zelt|lagern|biwak|übernacht/i, '⛺'],
  [/feuer|grill/i, '🔥'],
  [/rauchen/i, '🚬'],
  [/abfall|müll/i, '🗑️'],
  [/lärm|musik|tonband|abspielgerät/i, '🔊'],
  [/pilz/i, '🍄'],
  [/pflanze|blume|kräuter/i, '🌿'],
  [/bäume|baum|holz/i, '🌳'],
  [/mineral|fossil|stein/i, '🪨'],
  [/reiten|kutsche|bespannt|pferd/i, '🐴'],
  [/rad|bike/i, '🚴'],
  [/ski|snowboard|schnee|rodeln|schlitten|langlauf|schneeschuh/i, '⛷️'],
  [/klettern/i, '🧗'],
  [/tauch/i, '🤿'],
  [/baden|schwimm/i, '🏊'],
  [/angeln|fischen|fischerei/i, '🎣'],
  [/fotografier|film/i, '📷'],
  [/füttern|tiere/i, '🐾'],
  [/toilette/i, '🚻'],
  [/betreten|wege|weg\b/i, '🥾']
];
var RULE_DEFAULT = '📌';

// ... und Art der Regel aus dem Wortlaut: ban = Verbot, limit = eingeschränkt/Pflicht/nicht empfohlen,
// allow = erlaubt, info = sonstiges. Der Text selbst bleibt unverändert; die Art steuert nur die Farbe.
export function ruleInfo(text) {
  var t = String(text || '');
  var kind = 'info';
  if (/nicht empfohlen|empfohlen\b/i.test(t) && !/verboten|untersagt/i.test(t)) kind = 'limit';
  else if (/verboten|untersagt|nicht erlaubt|nicht gestattet/i.test(t)) kind = 'ban';
  else if (/\bnur\b|pflicht|genehmig|erlaubnis|eingeschränkt|bewilligung/i.test(t)) kind = 'limit';
  else if (/erlaubt|gestattet/i.test(t)) kind = 'allow';

  var icon = RULE_DEFAULT;
  for (var i = 0; i < RULE_ICONS.length; i++) {
    if (RULE_ICONS[i][0].test(t)) { icon = RULE_ICONS[i][1]; break; }
  }
  return { icon: icon, kind: kind };
}

// Zeitraum am Ende ("(01.12.–30.04.)") getrennt darstellbar machen, ohne den Text zu verändern.
export function splitSeason(text) {
  var m = /^(.*?)\s*(\(\d{2}\.\d{2}\.–\d{2}\.\d{2}\.\))$/.exec(String(text || ''));
  return m ? { main: m[1], season: m[2] } : { main: String(text || ''), season: '' };
}
