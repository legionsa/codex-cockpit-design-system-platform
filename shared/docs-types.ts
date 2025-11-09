export interface EditorJSBlock {
  id?: string;
  type: string;
  data: any;
}
export interface EditorJSData {
  time: number;
  blocks: EditorJSBlock[];
  version: string;
}
export interface Page {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  order: number;
  content: EditorJSData;
  status: 'Published' | 'Draft' | 'Archived';
  lastUpdated: string;
}
export interface PageNode extends Page {
  children: PageNode[];
  path: string;
}
export interface User {
  id: string;
  name: string;
  passwordHash: string;
}
export interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  content: EditorJSData;
}