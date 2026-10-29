# Offizielle ALBINA-Symbole

Herkunft: https://gitlab.com/albina-euregio/albina-website, Verzeichnis `public/images/pro/` (Stand Oktober 2026), unverändert übernommen.

| Ordner | Inhalt | Originalpfad |
| --- | --- | --- |
| `pictos/` | Gefahrenstufen-Piktogramme `levels_<unten>_<oben>.webp` (`levels_0_0` = ohne Stufe, `levels_1_1` bis `levels_5_5` = Stufe in allen Höhen, übrige Kombinationen = Teilung an einer Höhengrenze) | `warning-pictos/` |
| `problems/` | Lawinenproblem-Icons (8 Typen) | `avalanche-problems/` |

Expositionsrose und Höhen-Piktogramm sind nicht als Bilddateien hier, sondern als SVG im Code (`js/avalanche.js`), nach den Pfaddaten aus `app/components/icons/exposition-icon.tsx` und `elevation-icon.tsx` der ALBINA-Website.

Verwendung: für alle Lawinenquellen (Euregio und Schweiz), weil beide Dienste die EAWS-Standardpiktogramme verwenden und der SLF keine eigenen Icon-Downloads anbietet (Stand Oktober 2026). Bei Bedarf beim SLF nachfragen (data@slf.ch).

Lizenz: Die Daten des Lawinenreports stehen unter CC BY 4.0, das Repository `albina-website` unter AGPL-3.0. Eine eigene Lizenz für die Grafiken nennt das Repository nicht. **Vor einer öffentlichen Veröffentlichung klären** (Kontakt laut ALBINA-README: lawine@tirol.gv.at). Siehe [docs/LAWINENLAGE_ANALYSE.md](../../docs/LAWINENLAGE_ANALYSE.md), Abschnitt 10.