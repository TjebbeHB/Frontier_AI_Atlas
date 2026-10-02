/** Representative city centres from the official GeoNames NL dump, retrieved 2026-10-02.
 * Dataset: https://download.geonames.org/export/dump/NL.zip
 * Attribution: GeoNames, CC BY 4.0 https://creativecommons.org/licenses/by/4.0/
 * Duplicate names are disambiguated to the major city; Almere uses Almere Stad.
 * These points are cities, not employer offices or compulsory work locations.
 */
export type NetherlandsCity = {
  name: string; coordinates: [number, number]; coordinateSource: string;
  major: boolean; aliases: string[];
};
export const netherlandsCities: NetherlandsCity[] = [
  {
    "name": "Amsterdam",
    "coordinates": [
      4.88969,
      52.37403
    ],
    "coordinateSource": "https://www.geonames.org/2759794/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Rotterdam",
    "coordinates": [
      4.47917,
      51.9225
    ],
    "coordinateSource": "https://www.geonames.org/2747891/",
    "major": true,
    "aliases": []
  },
  {
    "name": "The Hague",
    "coordinates": [
      4.29861,
      52.07667
    ],
    "coordinateSource": "https://www.geonames.org/2747373/",
    "major": true,
    "aliases": [
      "Den Haag",
      "'s-Gravenhage",
      "s-Gravenhage"
    ]
  },
  {
    "name": "Utrecht",
    "coordinates": [
      5.12222,
      52.09083
    ],
    "coordinateSource": "https://www.geonames.org/2745912/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Eindhoven",
    "coordinates": [
      5.47778,
      51.44083
    ],
    "coordinateSource": "https://www.geonames.org/2756253/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Groningen",
    "coordinates": [
      6.56667,
      53.21917
    ],
    "coordinateSource": "https://www.geonames.org/2755251/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Enschede",
    "coordinates": [
      6.89583,
      52.21833
    ],
    "coordinateSource": "https://www.geonames.org/2756071/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Delft",
    "coordinates": [
      4.35556,
      52.00667
    ],
    "coordinateSource": "https://www.geonames.org/2757345/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Leiden",
    "coordinates": [
      4.49306,
      52.15833
    ],
    "coordinateSource": "https://www.geonames.org/2751773/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Nijmegen",
    "coordinates": [
      5.85278,
      51.8425
    ],
    "coordinateSource": "https://www.geonames.org/2750053/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Arnhem",
    "coordinates": [
      5.91111,
      51.98
    ],
    "coordinateSource": "https://www.geonames.org/2759661/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Wageningen",
    "coordinates": [
      5.66667,
      51.97
    ],
    "coordinateSource": "https://www.geonames.org/2745088/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Maastricht",
    "coordinates": [
      5.68889,
      50.84833
    ],
    "coordinateSource": "https://www.geonames.org/2751283/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Tilburg",
    "coordinates": [
      5.0913,
      51.55551
    ],
    "coordinateSource": "https://www.geonames.org/2746301/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Zwolle",
    "coordinates": [
      6.09444,
      52.5125
    ],
    "coordinateSource": "https://www.geonames.org/2743477/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Leeuwarden",
    "coordinates": [
      5.80973,
      53.20271
    ],
    "coordinateSource": "https://www.geonames.org/2751792/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Almere",
    "coordinates": [
      5.21413,
      52.37025
    ],
    "coordinateSource": "https://www.geonames.org/2759879/",
    "major": true,
    "aliases": [
      "Almere Stad"
    ]
  },
  {
    "name": "Haarlem",
    "coordinates": [
      4.63683,
      52.38084
    ],
    "coordinateSource": "https://www.geonames.org/2755003/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Breda",
    "coordinates": [
      4.77596,
      51.58656
    ],
    "coordinateSource": "https://www.geonames.org/2758401/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Amersfoort",
    "coordinates": [
      5.3875,
      52.155
    ],
    "coordinateSource": "https://www.geonames.org/2759821/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Apeldoorn",
    "coordinates": [
      5.96944,
      52.21
    ],
    "coordinateSource": "https://www.geonames.org/2759706/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Assen",
    "coordinates": [
      6.5625,
      52.99667
    ],
    "coordinateSource": "https://www.geonames.org/2759633/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Lelystad",
    "coordinates": [
      5.475,
      52.50833
    ],
    "coordinateSource": "https://www.geonames.org/2751738/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Middelburg",
    "coordinates": [
      3.61389,
      51.5
    ],
    "coordinateSource": "https://www.geonames.org/2750896/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Alkmaar",
    "coordinates": [
      4.74861,
      52.63167
    ],
    "coordinateSource": "https://www.geonames.org/2759899/",
    "major": true,
    "aliases": []
  },
  {
    "name": "Den Bosch",
    "coordinates": [
      5.30417,
      51.69917
    ],
    "coordinateSource": "https://www.geonames.org/2747351/",
    "major": true,
    "aliases": [
      "'s-Hertogenbosch",
      "’s-Hertogenbosch",
      "s-Hertogenbosch"
    ]
  },
  {
    "name": "Den Helder",
    "coordinates": [
      4.75933,
      52.95988
    ],
    "coordinateSource": "https://www.geonames.org/2757220/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Veldhoven",
    "coordinates": [
      5.40278,
      51.41833
    ],
    "coordinateSource": "https://www.geonames.org/2745706/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Rijswijk",
    "coordinates": [
      4.32501,
      52.03634
    ],
    "coordinateSource": "https://www.geonames.org/2748076/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Leidschendam",
    "coordinates": [
      4.39281,
      52.08167
    ],
    "coordinateSource": "https://www.geonames.org/2751769/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Woerden",
    "coordinates": [
      4.88333,
      52.085
    ],
    "coordinateSource": "https://www.geonames.org/2744248/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Hilversum",
    "coordinates": [
      5.17639,
      52.22333
    ],
    "coordinateSource": "https://www.geonames.org/2754064/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Dordrecht",
    "coordinates": [
      4.67361,
      51.81
    ],
    "coordinateSource": "https://www.geonames.org/2756669/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Zoetermeer",
    "coordinates": [
      4.49306,
      52.0575
    ],
    "coordinateSource": "https://www.geonames.org/2743856/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Gouda",
    "coordinates": [
      4.70833,
      52.01667
    ],
    "coordinateSource": "https://www.geonames.org/2755420/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Bilthoven",
    "coordinates": [
      5.20139,
      52.13
    ],
    "coordinateSource": "https://www.geonames.org/2758927/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Soesterberg",
    "coordinates": [
      5.28611,
      52.11833
    ],
    "coordinateSource": "https://www.geonames.org/2747030/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Helmond",
    "coordinates": [
      5.66111,
      51.48167
    ],
    "coordinateSource": "https://www.geonames.org/2754447/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Heerlen",
    "coordinates": [
      5.98154,
      50.88365
    ],
    "coordinateSource": "https://www.geonames.org/2754652/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Nieuwegein",
    "coordinates": [
      5.08056,
      52.02917
    ],
    "coordinateSource": "https://www.geonames.org/2750325/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Amstelveen",
    "coordinates": [
      4.86389,
      52.30083
    ],
    "coordinateSource": "https://www.geonames.org/2759798/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Diemen",
    "coordinates": [
      4.96256,
      52.33964
    ],
    "coordinateSource": "https://www.geonames.org/2756888/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Sittard",
    "coordinates": [
      5.86944,
      50.99833
    ],
    "coordinateSource": "https://www.geonames.org/2747203/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Hoofddorp",
    "coordinates": [
      4.68889,
      52.3025
    ],
    "coordinateSource": "https://www.geonames.org/2753801/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Leusden",
    "coordinates": [
      5.43194,
      52.1325
    ],
    "coordinateSource": "https://www.geonames.org/2751687/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Zeist",
    "coordinates": [
      5.23333,
      52.09
    ],
    "coordinateSource": "https://www.geonames.org/2743977/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Barendrecht",
    "coordinates": [
      4.53472,
      51.85667
    ],
    "coordinateSource": "https://www.geonames.org/2759426/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Rheden",
    "coordinates": [
      6.02917,
      52.005
    ],
    "coordinateSource": "https://www.geonames.org/2748201/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Baarn",
    "coordinates": [
      5.2875,
      52.21167
    ],
    "coordinateSource": "https://www.geonames.org/2759544/",
    "major": false,
    "aliases": []
  },
  {
    "name": "Hengelo",
    "coordinates": [
      6.79306,
      52.26583
    ],
    "coordinateSource": "https://www.geonames.org/2754394/",
    "major": false,
    "aliases": []
  }
];
const cityNames = new Map(netherlandsCities.flatMap(city => [city.name, ...city.aliases].map(name => [name.toLocaleLowerCase().trim(), city.name] as const)));
export function normalizeNetherlandsCity(name: string): string {
  return cityNames.get(name.toLocaleLowerCase().trim()) ?? name.trim();
}
