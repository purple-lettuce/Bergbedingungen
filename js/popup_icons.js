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
