export type Track = 'technical' | 'governance' | 'biology' | 'operations';
export type Region = 'EU' | 'UK' | 'US' | 'Other';
export type Passport =
  | 'eu'
  | 'irish'
  | 'british'
  | 'american'
  | 'other'
  | 'unsure';
export type Kind =
  | 'Advice'
  | 'Course'
  | 'Fellowship'
  | 'Funding'
  | 'Community'
  | 'Research'
  | 'Jobs';
export type Profile = {
  tracks: Track[];
  experience: 'exploring' | 'professional' | 'ai' | '';
  hours: '5' | '15' | '30' | '40' | '';
  schedule: 'flexible' | 'predictable' | 'unsure';
  funding: 'income' | 'support' | 'self' | 'unsure' | '';
  mobility: 'stay' | 'visit' | 'move' | '';
  travel: 'yes' | 'no' | 'unsure';
  home: Region | '';
  passports: Passport[];
  rights: Region[];
  permission: 'listed' | 'need' | 'unsure';
};
export const emptyProfile: Profile = {
  tracks: [],
  experience: '',
  hours: '',
  schedule: 'unsure',
  funding: '',
  mobility: '',
  travel: 'unsure',
  home: '',
  passports: [],
  rights: [],
  permission: 'unsure',
};
export type Opportunity = {
  id: string;
  organisation: string;
  title: string;
  url: string;
  summary: string;
  tracks: Track[];
  kind: Kind;
  regions: Region[];
  format: 'remote' | 'in-person' | 'hybrid' | 'varies';
  location: string;
  minHours: number | null;
  time: string;
  duration: string;
  weeks?: number;
  partTimeException?: boolean;
  minExceptionHours?: number;
  level?: 'intro' | 'experienced' | 'founder';
  importantChecks?: string[];
  fundingType:
    | 'salary'
    | 'stipend'
    | 'grant'
    | 'expenses'
    | 'free'
    | 'varies'
    | 'unknown';
  funding: string;
  visaStatus: 'support' | 'none' | 'unknown' | 'na';
  visa: string;
  requiresWorkRights?: boolean;
  travel: 'none' | 'required' | 'optional' | 'unknown';
  entry: string;
  status: 'open' | 'closed' | 'rolling' | 'check' | 'resource' | 'invite';
  statusNote: string;
  deadline?: string;
  deadlineAt?: string;
  sources: { label: string; url: string }[];
};
