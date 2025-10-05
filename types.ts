export interface ScrapeResult {
  url: string;
  emails: string[];
  status: 'pending' | 'success' | 'error';
}
