export type Job = {
  id: string;
  title: string;
  organisation: string;
  city: string;
  /** Explicitly advertised work cities. Empty means no city has been established. */
  cities?: string[];
  location: string;
  category: string;
  type: string;
  compensation: 'paid' | 'volunteer' | 'unknown';
  workMode: string;
  experience: string;
  summary: string;
  safetyRelevance: 'Direct AI safety' | 'AI governance' | 'Broader AI';
  url: string;
  sourceUrl: string;
  checkedAt: string;
  deadline?: string;
  salary?: string;
  hours?: string;
  sponsorship?: string;
  eligibility?: string;
  status: 'listed' | 'rolling';
};
export type JobDataset = {
  checkedAt: string;
  jobs: Job[];
  notes: string[];
  discoveryLinks?: { name: string; url: string; description: string }[];
};
export type JobFilters = {
  query: string; city: string; category: string; type: string; workMode: string;
  focus: string; paidOnly: boolean; sainOnly: boolean; savedOnly: boolean;
};
export const emptyJobFilters: JobFilters = {
  query: '', city: '', category: '', type: '', workMode: '', focus: '',
  paidOnly: false, sainOnly: false, savedOnly: false,
};
export function isExpired(job: Job, today: string): boolean {
  return Boolean(job.deadline && job.deadline < today);
}
export function isSainJob(job: Job): boolean {
  return /safe ai netherlands|\bsain\b/i.test(job.organisation);
}
/** A multi-location advertisement remains one job, but is discoverable in each stated city. */
export function jobCities(job: Job): string[] {
  const source = job.cities ?? job.city.split(' / ');
  return [...new Set(source.map(city => city.trim()).filter(city => city && !/^(netherlands|remote|the netherlands|netherlands-wide|not specified)$/i.test(city)))];
}
export const unlocatedCityFilter = '__no_city__';
export function filterJobs(jobs: Job[], filters: JobFilters, saved: string[], today: string): Job[] {
  const terms = filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return jobs.filter(job => {
    const text = [job.title, job.organisation, job.city, jobCities(job).join(' '), job.location, job.category, job.summary, job.safetyRelevance].join(' ').toLocaleLowerCase();
    return !isExpired(job, today) && terms.every(term => text.includes(term)) &&
      (!filters.city || (filters.city === unlocatedCityFilter ? jobCities(job).length === 0 : jobCities(job).includes(filters.city))) &&
      (!filters.category || job.category === filters.category) &&
      (!filters.type || job.type === filters.type) &&
      (!filters.workMode || job.workMode === filters.workMode) &&
      (!filters.focus || job.safetyRelevance === filters.focus) &&
      (!filters.paidOnly || job.compensation === 'paid') &&
      (!filters.sainOnly || isSainJob(job)) &&
      (!filters.savedOnly || saved.includes(job.id));
  });
}
export function displayDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
}
