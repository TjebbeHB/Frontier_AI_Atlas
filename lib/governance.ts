export type Layer = 'Legal' | 'Institutional' | 'Voluntary' | 'Corporate';
export type PowerValue =
  | 'binding'
  | 'conditional'
  | 'internal'
  | 'voluntary'
  | 'research'
  | 'none'
  | 'future';
export type Entry = {
  id: string;
  name: string;
  short: string;
  kind: 'Actor' | 'Mechanism';
  region: string;
  location: [number, number] | null;
  layer: Layer;
  type: string;
  jurisdiction: string;
  status: string;
  date: string;
  description: string;
  mechanism: string;
  horizons: string[];
  power: string;
  powers: { value: PowerValue; detail: string }[];
  gaps: { type: string; detail: string }[];
  sources: string[];
  featured?: boolean;
};
export type Source = {
  id: string;
  title: string;
  url: string;
  kind: string;
  note: string;
  supplied?: boolean;
};
export type Edge = {
  from: string;
  to: string;
  label: string;
  kind: 'legal' | 'access' | 'control' | 'influence';
  source: string;
};
import dataset from './governance-data.json';
export const sources = dataset.sources as Source[];
export const nodes = dataset.nodes as Entry[];
export const edges = dataset.edges as Edge[];
import tutorial from './tutorial.json';
export const tour = tutorial;
