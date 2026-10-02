/** SAIN's public chapter directory, checked 2 October 2026. Points are city anchors. */
export type SainChapter = {
  id: string;
  name: string;
  city: string;
  status: 'active' | 'prospective';
  coordinates: [number, number];
  url: string;
  description: string;
  coordinateSource: string;
};
export const sainChapters: SainChapter[] = [
  {
    id: 'sain-groningen', name: 'SAIN Groningen', city: 'Groningen', status: 'active',
    coordinates: [6.56667, 53.21917], url: 'https://safeainetherlands.org/chapters/groningen',
    description: 'The original AISIG community, with local courses, discussion groups and research activity.',
    coordinateSource: 'https://www.geonames.org/2755251/groningen.html',
  },
  {
    id: 'sain-utrecht', name: 'SAIN Utrecht', city: 'Utrecht', status: 'active',
    coordinates: [5.12222, 52.09083], url: 'https://safeainetherlands.org/chapters/utrecht',
    description: 'Volunteer-run AI safety education, discussion and research connections in Utrecht.',
    coordinateSource: 'https://www.geonames.org/2745912/utrecht.html',
  },
  {
    id: 'sain-amsterdam', name: 'SAIN Amsterdam', city: 'Amsterdam', status: 'active',
    coordinates: [4.88969, 52.37403], url: 'https://safeainetherlands.org/chapters/amsterdam',
    description: 'Technical AI safety and frontier governance courses, research and a local community.',
    coordinateSource: 'https://www.geonames.org/2759794/amsterdam.html',
  },
];
export const sainChapterSource = 'https://safeainetherlands.org/community';
export const sainCheckedAt = '2026-10-02';
