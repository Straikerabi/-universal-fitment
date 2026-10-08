import {extendCatalogPack} from './catalog-extensions.js';
import {observedParts} from './vorwerk-extra.js';
// Official German Vorwerk sources, checked 2026-10-07. Product designations are not numeric article numbers.
const basePack={
  "brand": "Vorwerk",
  "models": [
    {
      "brand": "Vorwerk",
      "code": "VK7",
      "model": "Kobold VK7",
      "deviceReferences": [
        "VK7"
      ],
      "series": "Kobold Akku",
      "deviceType": "cordless",
      "type": "Akku-Staubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/akku-staubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/akku-staubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "FP7",
      "aliases": [
        "Kobold 7"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/akku-staubsauger/gebrauchsanleitung_kobold-vk7-system_vorwerk-de.pdf"
        }
      ],
      "variantNote": "Grundgerät VK7 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 3,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK7"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK7",
        "note": "3 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VB100",
      "model": "Kobold VB100",
      "deviceReferences": [
        "VB100"
      ],
      "series": "Kobold Akku",
      "deviceType": "cordless",
      "type": "Akku-Staubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/akku-staubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/akku-staubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "FP100",
      "aliases": [],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/akku-staubsauger/gebrauchsanleitung_kobold-vb100-akku-staubsauger_ga_24682-02_vb100-ebb100_de_0918.pdf"
        }
      ],
      "variantNote": "Grundgerät VB100 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 3,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VB100"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VB100",
        "note": "3 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK200",
      "model": "Kobold VK200",
      "deviceReferences": [
        "VK200"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 200"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung beim Hersteller suchen",
          "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger"
        }
      ],
      "variantNote": "Grundgerät VK200 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 3,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK200"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK200",
        "note": "3 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK150",
      "model": "Kobold VK150",
      "deviceReferences": [
        "VK150"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 150"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung beim Hersteller suchen",
          "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger"
        }
      ],
      "variantNote": "Grundgerät VK150 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 4,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK150"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK150",
        "note": "4 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK140",
      "model": "Kobold VK140",
      "deviceReferences": [
        "VK140"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 140"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung beim Hersteller suchen",
          "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger"
        }
      ],
      "variantNote": "Grundgerät VK140 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 4,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK140"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK140",
        "note": "4 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK136",
      "model": "Kobold VK136",
      "deviceReferences": [
        "VK136"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 136"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/handstaubsauger/gebrauchsanleitung_kobold-vk136-handstaubsauger_44343-0907-30.pdf"
        }
      ],
      "variantNote": "Grundgerät VK136 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 2,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK136"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK136",
        "note": "2 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK135",
      "model": "Kobold VK135",
      "deviceReferences": [
        "VK135"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 135"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/handstaubsauger/gebrauchsanleitung_kobold-vk135-handstaubsauger_21644-0805-30.pdf"
        }
      ],
      "variantNote": "Grundgerät VK135 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 2,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK135"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK135",
        "note": "2 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK131",
      "model": "Kobold VK131",
      "deviceReferences": [
        "VK131"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 131"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/handstaubsauger/gebrauchsanleitung_kobold-vk131-handstaubsauger_21344-0300-60.pdf"
        }
      ],
      "variantNote": "Grundgerät VK131 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 3,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK131"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK131",
        "note": "3 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK130",
      "model": "Kobold VK130",
      "deviceReferences": [
        "VK130"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 130"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/handstaubsauger/gebrauchsanleitung_kobold-vk130-handstaubsauger.pdf"
        }
      ],
      "variantNote": "Grundgerät VK130 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 3,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK130"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK130",
        "note": "3 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK122",
      "model": "Kobold VK122",
      "deviceReferences": [
        "VK122"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 122"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/handstaubsauger/gebrauchsanleitung_kobold-vk122-handstaubsauger_01529-0495-80.pdf"
        }
      ],
      "variantNote": "Grundgerät VK122 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 0,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK122"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK122",
        "note": "Geräteanleitung erfasst; noch keine belegte Originalteil-Zuordnung zu diesem Grundgerät. Zubehörtyp und aktuelle Ersatzteilversorgung beim Hersteller prüfen."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK121",
      "model": "Kobold VK121",
      "deviceReferences": [
        "VK121"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 121"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/handstaubsauger/gebrauchsanleitung_kobold-vk121-handstaubsauger_01609-0894-80.pdf"
        }
      ],
      "variantNote": "Grundgerät VK121 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 0,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK121"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK121",
        "note": "Geräteanleitung erfasst; noch keine belegte Originalteil-Zuordnung zu diesem Grundgerät. Zubehörtyp und aktuelle Ersatzteilversorgung beim Hersteller prüfen."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VK120",
      "model": "Kobold VK120",
      "deviceReferences": [
        "VK120"
      ],
      "series": "Kobold VK",
      "deviceType": "bagged",
      "type": "Handgeführter Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Kobold 120"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/handstaubsauger/gebrauchsanleitung_kobold-vk120-handstaubsauger_01530-0984-70.pdf"
        }
      ],
      "variantNote": "Grundgerät VK120 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 0,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VK120"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VK120",
        "note": "Geräteanleitung erfasst; noch keine belegte Originalteil-Zuordnung zu diesem Grundgerät. Zubehörtyp und aktuelle Ersatzteilversorgung beim Hersteller prüfen."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VT300",
      "model": "Kobold VT300",
      "deviceReferences": [
        "VT300"
      ],
      "series": "Tiger / Kobold VT",
      "deviceType": "bagged",
      "type": "Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Tiger 300",
        "Tiger VT300"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung beim Hersteller suchen",
          "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger"
        }
      ],
      "variantNote": "Grundgerät VT300 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 2,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VT300"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VT300",
        "note": "2 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VT270",
      "model": "Kobold VT270",
      "deviceReferences": [
        "VT270"
      ],
      "series": "Tiger / Kobold VT",
      "deviceType": "bagged",
      "type": "Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Tiger 270",
        "Tiger VT270"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung beim Hersteller suchen",
          "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger"
        }
      ],
      "variantNote": "Grundgerät VT270 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 3,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VT270"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VT270",
        "note": "3 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VT265",
      "model": "Kobold VT265",
      "deviceReferences": [
        "VT265"
      ],
      "series": "Tiger / Kobold VT",
      "deviceType": "bagged",
      "type": "Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Tiger 265",
        "Tiger VT265"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung beim Hersteller suchen",
          "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger"
        }
      ],
      "variantNote": "Grundgerät VT265 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 5,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VT265"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VT265",
        "note": "5 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VT260",
      "model": "Tiger 260",
      "deviceReferences": [
        "VT260"
      ],
      "series": "Tiger / Kobold VT",
      "deviceType": "bagged",
      "type": "Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Tiger 260",
        "Tiger VT260"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/bodenstaubsauger/gebrauchsanleitung_kobold-vt260-bodenstaubsauger_20100906_gal46242_deat_01.pdf"
        }
      ],
      "variantNote": "Grundgerät VT260 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 2,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VT260"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VT260",
        "note": "2 ausgewählte Originalartikel mit erfasster Hersteller-Zuordnung. Weitere Baugruppen und Vorsatzgeräte sind offen; numerische Artikelnummern sind in diesen Quellen nicht erfasst."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VT252",
      "model": "Tiger 252",
      "deviceReferences": [
        "VT252"
      ],
      "series": "Tiger / Kobold VT",
      "deviceType": "bagged",
      "type": "Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Tiger 252",
        "Tiger VT252"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/bodenstaubsauger/gebrauchsanleitung_kobold-vt252-bodenstaubsauger_21641-0304-5.pdf"
        }
      ],
      "variantNote": "Grundgerät VT252 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 0,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VT252"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VT252",
        "note": "Geräteanleitung erfasst; noch keine belegte Originalteil-Zuordnung zu diesem Grundgerät. Zubehörtyp und aktuelle Ersatzteilversorgung beim Hersteller prüfen."
      }
    },
    {
      "brand": "Vorwerk",
      "code": "VT251",
      "model": "Tiger 251",
      "deviceReferences": [
        "VT251"
      ],
      "series": "Tiger / Kobold VT",
      "deviceType": "bagged",
      "type": "Bodenstaubsauger mit Beutel",
      "url": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "guideUrl": "https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/bodenstaubsauger",
      "partsUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
      "checkedAt": "2026-10-07",
      "bagSystem": "am Gerät prüfen",
      "aliases": [
        "Tiger 251",
        "Tiger VT251"
      ],
      "manuals": [
        {
          "label": "Gebrauchsanweisung",
          "url": "https://www.vorwerk.com/de/de/c/dam-home/downloads/user-manuals/bodenstaubsauger/gebrauchsanleitung_kobold-vt251-bodenstaubsauger_01625-0595-20.pdf"
        }
      ],
      "variantNote": "Grundgerät VT251 am Typenschild vergleichen. Aufgesteckte Elektrobürsten, Düsen und Saugwischer besitzen eigene Typkennungen; die Grundgerätekennung bestätigt deren Teile nicht.",
      "sourceNote": "Grundgerät im offiziellen deutschen Vorwerk-Anleitungsverzeichnis. Zubehör, Roboter und Verkaufssets sind keine zusätzlichen Grundmodelle.",
      "partCount": 0,
      "facts": [
        {
          "label": "Grundgerätekennung",
          "value": "VT251"
        },
        {
          "label": "Vorsatzgeräte",
          "value": "Typ des tatsächlich vorhandenen Vorsatzgeräts separat ablesen"
        }
      ],
      "partListCoverage": {
        "sourceUrl": "https://www.vorwerk.com/de/de/shop/kategorien/kobold/kobold-zubehoer",
        "reference": "VT251",
        "note": "Geräteanleitung erfasst; noch keine belegte Originalteil-Zuordnung zu diesem Grundgerät. Zubehörtyp und aktuelle Ersatzteilversorgung beim Hersteller prüfen."
      }
    }
  ],
  "parts": [
    {
      "brand": "Vorwerk",
      "code": "FP7 Premium Filtertüten Set (12 Stk.)",
      "identifierType": "manufacturer-designation",
      "name": "Kobold FP7 Premium Filtertüten Set (12 Stk.)",
      "url": "https://www.vorwerk.com/de/de/s/shop/kobold-fp7-premium-filtertueten-set-12stk-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Staubsaugerbeutel",
      "relationships": [
        {
          "code": "VK7",
          "model": "Kobold VK7",
          "reference": "VK7",
          "url": "https://www.vorwerk.com/de/de/s/shop/kobold-fp7-premium-filtertueten-set-12stk-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 38.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "2 Packungen Kobold FP7 Premium Filtertüten (je 6 Stk.)",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "FP265-300 Premium Filtertüte (5 Stk.)",
      "identifierType": "manufacturer-designation",
      "name": "Kobold FP265-300 Premium Filtertüte (5 Stk.)",
      "url": "https://www.vorwerk.com/de/de/s/shop/premium-filtertueten-3-in-1-vt265-300-5stk-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Staubsaugerbeutel",
      "relationships": [
        {
          "code": "VT300",
          "model": "Kobold VT300",
          "reference": "VT300",
          "url": "https://www.vorwerk.com/de/de/s/shop/premium-filtertueten-3-in-1-vt265-300-5stk-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VT270",
          "model": "Kobold VT270",
          "reference": "VT270",
          "url": "https://www.vorwerk.com/de/de/s/shop/premium-filtertueten-3-in-1-vt265-300-5stk-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VT265",
          "model": "Kobold VT265",
          "reference": "VT265",
          "url": "https://www.vorwerk.com/de/de/s/shop/premium-filtertueten-3-in-1-vt265-300-5stk-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 23.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "5 Kobold FP265-300 Premium Filtertüten",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "FP140/150 Premium Filtertüte (6 Stk.)",
      "identifierType": "manufacturer-designation",
      "name": "Kobold FP140/150 Premium Filtertüte (6 Stk.)",
      "url": "https://www.vorwerk.com/de/de/s/shop/premium-filtertueten-vk140-150-6stk-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Staubsaugerbeutel",
      "relationships": [
        {
          "code": "VK150",
          "model": "Kobold VK150",
          "reference": "VK150",
          "url": "https://www.vorwerk.com/de/de/s/shop/premium-filtertueten-vk140-150-6stk-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK140",
          "model": "Kobold VK140",
          "reference": "VK140",
          "url": "https://www.vorwerk.com/de/de/s/shop/premium-filtertueten-vk140-150-6stk-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 23.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "6 Kobold FP140/150 Premium Filtertüten",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "FP200 Premium Filtertüte (6 Stk.)",
      "identifierType": "manufacturer-designation",
      "name": "Kobold FP200 Premium Filtertüte (6 Stk.)",
      "url": "https://www.vorwerk.com/de/de/s/shop/kobold-fp200-premium-filtertueten-6stk-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Staubsaugerbeutel",
      "relationships": [
        {
          "code": "VK200",
          "model": "Kobold VK200",
          "reference": "VK200",
          "url": "https://www.vorwerk.com/de/de/s/shop/kobold-fp200-premium-filtertueten-6stk-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 23.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "6 Kobold FP200 Premium Filtertüten",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "VK130/131 Hygiene-Mikrofilter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold VK130/131 Hygiene-Mikrofilter",
      "url": "https://www.vorwerk.com/de/de/s/shop/hygiene-mikrofilter-kobold130-131-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK131",
          "model": "Kobold VK131",
          "reference": "VK131",
          "url": "https://www.vorwerk.com/de/de/s/shop/hygiene-mikrofilter-kobold130-131-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK130",
          "model": "Kobold VK130",
          "reference": "VK130",
          "url": "https://www.vorwerk.com/de/de/s/shop/hygiene-mikrofilter-kobold130-131-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 19.9,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold VK130/131 Hygiene-Mikrofilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "VK135/136 Motorschutzfilter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold VK135/136 Motorschutzfilter",
      "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-kobold135-136-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK136",
          "model": "Kobold VK136",
          "reference": "VK136",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-kobold135-136-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK135",
          "model": "Kobold VK135",
          "reference": "VK135",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-kobold135-136-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 9.9,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold VK135/136 Motorschutzfilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "ESS270 Elektrosaugschlauch",
      "identifierType": "manufacturer-designation",
      "name": "Kobold ESS270 Elektrosaugschlauch",
      "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-ess270-vt265-270-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VT270",
          "model": "Kobold VT270",
          "reference": "VT270",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-ess270-vt265-270-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VT265",
          "model": "Kobold VT265",
          "reference": "VT265",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-ess270-vt265-270-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 99.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold ESS270 Elektrosaugschlauch",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "ESS260/265 Elektrosaugschlauch",
      "identifierType": "manufacturer-designation",
      "name": "Kobold ESS260/265 Elektrosaugschlauch",
      "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-ess265-tiger260-vt265-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VT265",
          "model": "Kobold VT265",
          "reference": "VT265",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-ess265-tiger260-vt265-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VT260",
          "model": "Tiger 260",
          "reference": "VT260",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-ess265-tiger260-vt265-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 99.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold ESS260/265 Elektrosaugschlauch",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "ESR260/265 Elektrosaugrohr",
      "identifierType": "manufacturer-designation",
      "name": "Kobold ESR260/265 Elektrosaugrohr",
      "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugrohr-esr265-tiger260-vt265-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VT265",
          "model": "Kobold VT265",
          "reference": "VT265",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugrohr-esr265-tiger260-vt265-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VT260",
          "model": "Tiger 260",
          "reference": "VT260",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugrohr-esr265-tiger260-vt265-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 79.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold ESR260/265 Elektrosaugrohr",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "VK140/150 Anschlusskabel",
      "identifierType": "manufacturer-designation",
      "name": "Kobold VK140/150 Anschlusskabel",
      "url": "https://www.vorwerk.com/de/de/s/shop/anschlusskabel-lang-vk140-150-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK150",
          "model": "Kobold VK150",
          "reference": "VK150",
          "url": "https://www.vorwerk.com/de/de/s/shop/anschlusskabel-lang-vk140-150-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK140",
          "model": "Kobold VK140",
          "reference": "VK140",
          "url": "https://www.vorwerk.com/de/de/s/shop/anschlusskabel-lang-vk140-150-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 19.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold VK140/150 Anschlusskabel",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "ESS150/200 Elektrosaugschlauch",
      "identifierType": "manufacturer-designation",
      "name": "Kobold ESS150/200 Elektrosaugschlauch",
      "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-vk150-200-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK200",
          "model": "Kobold VK200",
          "reference": "VK200",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-vk150-200-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK150",
          "model": "Kobold VK150",
          "reference": "VK150",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-vk150-200-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK140",
          "model": "Kobold VK140",
          "reference": "VK140",
          "url": "https://www.vorwerk.com/de/de/s/shop/elektro-saugschlauch-vk150-200-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 59.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold ESS150 Elektrosaugschlauch",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "FP135/136 Filtertüten mit Aktiv-Geruchsfilter (6 Stk.)",
      "identifierType": "manufacturer-designation",
      "name": "Kobold FP135/136 Filtertüten mit Aktiv-Geruchsfilter (6 Stk.)",
      "url": "https://www.vorwerk.com/de/de/s/shop/filtertueten-mit-aktiv-geruchsfilter-kobold135-136-6stk-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Staubsaugerbeutel",
      "relationships": [
        {
          "code": "VK136",
          "model": "Kobold VK136",
          "reference": "VK136",
          "url": "https://www.vorwerk.com/de/de/s/shop/filtertueten-mit-aktiv-geruchsfilter-kobold135-136-6stk-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK135",
          "model": "Kobold VK135",
          "reference": "VK135",
          "url": "https://www.vorwerk.com/de/de/s/shop/filtertueten-mit-aktiv-geruchsfilter-kobold135-136-6stk-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 23.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "6 Kobold FP135/136 Filtertüten mit Aktiv-Geruchsfilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "VK130/131 Aktiv-Geruchsfilter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold VK130/131 Aktiv-Geruchsfilter",
      "url": "https://www.vorwerk.com/de/de/s/shop/aktiv-geruchsfilter-kobold130-131-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK131",
          "model": "Kobold VK131",
          "reference": "VK131",
          "url": "https://www.vorwerk.com/de/de/s/shop/aktiv-geruchsfilter-kobold130-131-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK130",
          "model": "Kobold VK130",
          "reference": "VK130",
          "url": "https://www.vorwerk.com/de/de/s/shop/aktiv-geruchsfilter-kobold130-131-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 12.9,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold VK130/131 Aktiv-Geruchsfilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "MF7 Motorschutzfilter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold MF7 Motorschutzfilter",
      "url": "https://www.vorwerk.com/de/de/s/shop/kobold-mf7-motorschutzfilter-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK7",
          "model": "Kobold VK7",
          "reference": "VK7",
          "url": "https://www.vorwerk.com/de/de/s/shop/kobold-mf7-motorschutzfilter-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 9.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold MF7 Motorschutzfilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "VT265-300 Motorschutzfilter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold VT265-300 Motorschutzfilter",
      "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vt265-270-300-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VT300",
          "model": "Kobold VT300",
          "reference": "VT300",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vt265-270-300-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VT270",
          "model": "Kobold VT270",
          "reference": "VT270",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vt265-270-300-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VT265",
          "model": "Kobold VT265",
          "reference": "VT265",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vt265-270-300-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 9.9,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold VT265-300 Motorschutzfilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "VK140/150 Motorschutzfilter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold VK140/150 Motorschutzfilter",
      "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vk140-150-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK150",
          "model": "Kobold VK150",
          "reference": "VK150",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vk140-150-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK140",
          "model": "Kobold VK140",
          "reference": "VK140",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vk140-150-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 9.9,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold VK140/150 Motorschutzfilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "FL-M200 Motorschutzfilter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold FL-M200 Motorschutzfilter",
      "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-fl-m200-vk200-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK200",
          "model": "Kobold VK200",
          "reference": "VK200",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-fl-m200-vk200-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 9.9,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold FL-M200 Motorschutzfilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "FP100 Premium Filtertüte (5 Stk.)",
      "identifierType": "manufacturer-designation",
      "name": "Kobold FP100 Premium Filtertüte (5 Stk.)",
      "url": "https://www.vorwerk.com/de/de/s/shop/filtertuete-fp100-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Staubsaugerbeutel",
      "relationships": [
        {
          "code": "VB100",
          "model": "Kobold VB100",
          "reference": "VB100",
          "url": "https://www.vorwerk.com/de/de/s/shop/filtertuete-fp100-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 23.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "5 Kobold FP100 Premium Filtertüten",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "FP130/131 Filtertüten (6 Stk.)",
      "identifierType": "manufacturer-designation",
      "name": "Kobold FP130/131 Filtertüten (6 Stk.)",
      "url": "https://www.vorwerk.com/de/de/s/shop/filtertueten-kobold130-131-6stk-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Staubsaugerbeutel",
      "relationships": [
        {
          "code": "VK131",
          "model": "Kobold VK131",
          "reference": "VK131",
          "url": "https://www.vorwerk.com/de/de/s/shop/filtertueten-kobold130-131-6stk-de",
          "checkedAt": "2026-10-07"
        },
        {
          "code": "VK130",
          "model": "Kobold VK130",
          "reference": "VK130",
          "url": "https://www.vorwerk.com/de/de/s/shop/filtertueten-kobold130-131-6stk-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 23.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "6 Kobold FP130/131 Filtertüten",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "VB100 Motorschutzfilter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold VB100 Motorschutzfilter",
      "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vb100-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VB100",
          "model": "Kobold VB100",
          "reference": "VB100",
          "url": "https://www.vorwerk.com/de/de/s/shop/motorschutzfilter-vb100-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 9.9,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold VB100 Motorschutzfilter",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "SC7 Ladegerät",
      "identifierType": "manufacturer-designation",
      "name": "Kobold SC7 Ladegerät",
      "url": "https://www.vorwerk.com/de/de/s/shop/kobold-sc7-ladegeraet-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [],
      "price": 29.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold SC7 Ladegerät",
      "sourceCoverage": "Hersteller nennt Vorsatz- oder Ladekomponenten. Keine Zuordnung zu einem Grundgerät aus einer Zubehörkette abgeleitet.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "CA7 Ladeadapter",
      "identifierType": "manufacturer-designation",
      "name": "Kobold CA7 Ladeadapter",
      "url": "https://www.vorwerk.com/de/de/s/shop/kobold-ca7-ladeadapter-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [],
      "price": 20.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold CA7 Ladeadapter",
      "sourceCoverage": "Hersteller nennt Vorsatz- oder Ladekomponenten. Keine Zuordnung zu einem Grundgerät aus einer Zubehörkette abgeleitet.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "BY7 Akku",
      "identifierType": "manufacturer-designation",
      "name": "Kobold BY7 Akku",
      "url": "https://www.vorwerk.com/de/de/s/shop/kobold-by7-akku-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VK7",
          "model": "Kobold VK7",
          "reference": "VK7",
          "url": "https://www.vorwerk.com/de/de/s/shop/kobold-by7-akku-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 149.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold BY7 Akku",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Aktionspreis vom 07.10.2026. Laut Quelle galt die Aktion vom 05.–12.10.2026; aktuellen Preis im Shop prüfen."
    },
    {
      "brand": "Vorwerk",
      "code": "VB100 Ladegerät",
      "identifierType": "manufacturer-designation",
      "name": "Kobold VB100 Ladegerät",
      "url": "https://www.vorwerk.com/de/de/s/shop/ladegeraet-vb100-de",
      "checkedAt": "2026-10-07",
      "kind": "Original-Ersatzteil / Zubehör",
      "relationships": [
        {
          "code": "VB100",
          "model": "Kobold VB100",
          "reference": "VB100",
          "url": "https://www.vorwerk.com/de/de/s/shop/ladegeraet-vb100-de",
          "checkedAt": "2026-10-07"
        }
      ],
      "price": 25.0,
      "vatIncluded": true,
      "stock": "unknown",
      "unitLabel": "1 Kobold VB100 Ladegerät",
      "sourceCoverage": "Ausgewählte Hersteller-Zuordnungen zum Grundgerät. Vorsatzgeräte und Ladezubehör haben eigene Typkennungen.",
      "sourceAgeNote": "Gespeicherter Hersteller-Shopstand vom 07.10.2026; aktueller Preis und Lagerbestand müssen im Shop geprüft werden.",
      "priceNote": "Erfasster Preis der angegebenen Verkaufseinheit, keine Live-Abfrage. Lieferumfang und aktuellen Shoppreis prüfen."
    }
  ]
};

export const brandPack=extendCatalogPack(basePack,observedParts);
