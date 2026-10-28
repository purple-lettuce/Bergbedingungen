// Symbole für die Popups der Schutzgebiete. Die Zuordnung erfolgt über Stichwörter im lesbaren Text
// (Tiername bzw. Regeltext); was nicht erkannt wird, bekommt ein neutrales Symbol.

// Die Reihenfolge zählt: der erste passende Eintrag gewinnt (spezifische Begriffe vor allgemeinen).
var WILDLIFE_ICONS = [
  [/eule|uhu|kauz/i, '🦉'],
  [/adler|geier|bussard|falke|habicht|sperber|milan|weihe|greif/i, '🦅'],
  [/specht/i, '🐦'],
  [/huhn|rebhuhn|fasan|wachtel|schnepfe|birkhuhn|auerhuhn|haselhuhn|schneehuhn/i, '🐔'],
  [/gans|ente|schwan|taucher|reiher|storch|kranich|möwe|seeschwalbe|kiebitz|wasservogel/i, '🦆'],
  [/vogel|meise|fink|lerche|drossel|star|rabe|krähe|dohle|kuckuck|ammer|pieper|steinschmätzer|schwalbe|mauersegler|bergdohle|alpendohle|kleiber|zaunkönig|wasseramsel|ringdrossel/i, '🐦'],
  [/gams|steinbock|ziege|mufflon|schaf|kitz/i, '🐐'],
  [/hirsch|reh|rotwild|rehwild|damwild|elch|wapiti/i, '🦌'],
  [/wildschwein|schwarzwild|sau\b|keiler/i, '🐗'],
  [/bär/i, '🐻'],
  [/wolf/i, '🐺'],
  [/luchs|wildkatze|katze/i, '🐈'],
  [/fuchs/i, '🦊'],
  [/schlange|natter|kreuzotter|viper|eidechse|blindschleiche|reptil|echse/i, '🐍'],
  [/otter/i, '🦦'],
  [/dachs|marder|iltis|wiesel|hermelin/i, '🦡'],
  [/fledermaus|fledermäuse|mausohr|abendsegler/i, '🦇'],
  [/murmel|biber|eichhörnchen|hörnchen|maus|siebenschläfer|haselmaus|bilch|ratte|schermaus/i, '🐿️'],
  [/hase|kaninchen/i, '🐇'],
  [/frosch|kröte|unke|molch|salamander|lurch|amphib|laubfrosch/i, '🐸'],
  [/fisch|forelle|saibling|äsche|huchen|koppe|neunauge|lachs|hecht|barbe|karpfen|elritze/i, '🐟'],
  [/krebs|muschel|schnecke|egel/i, '🐚'],
  [/schmetterling|falter|apollo|bläuling|scheckenfalter|widderchen/i, '🦋'],
  [/biene|hummel|wespe|ameise|hornisse/i, '🐝'],
  [/käfer|libelle|heuschrecke|grille|schrecke|insekt|laufkäfer|bockkäfer/i, '🐞'],
  [/spinne|skorpion/i, '🕷️']
];
var WILDLIFE_DEFAULT = '🐾';

export function wildlifeIcon(name) {
  var text = String(name || '');
  for (var i = 0; i < WILDLIFE_ICONS.length; i++) {
    if (WILDLIFE_ICONS[i][0].test(text)) return WILDLIFE_ICONS[i][1];
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
