export interface ExternalGame {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  type: 'external_html' | 'internal';
  author?: string;
  tags?: string[];
}
