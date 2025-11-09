import { IndexedEntity } from "./core-utils";
import type { Page } from "@shared/docs-types";
const NEW_PAGE_CONTENT = {
  time: Date.now(),
  blocks: [
    {
      type: "header",
      data: {
        text: "Untitled Page",
        level: 1,
      },
    },
    {
      type: "paragraph",
      data: {
        text: "Start writing your amazing documentation here.",
      },
    },
  ],
  version: "2.29.0",
};
const SEED_PAGES: Omit<Page, 'id' | 'order' | 'lastUpdated'>[] = [
  {
    title: 'Home',
    slug: 'home',
    parentId: null,
    status: 'Published',
    content: {
      time: 1731148800000,
      version: '2.29.0',
      blocks: [
        { type: 'header', data: { text: 'Cockpit Design System', level: 1 } },
        { type: 'paragraph', data: { text: 'Welcome to the single source of truth for the Cockpit Design System (CDS). This is where we merge design, code, and content into a single, living ecosystem.' } },
        { type: 'header', data: { text: 'Mission & Principles', level: 2 } },
        { type:Phase 3 connects our admin dashboard to a live backend powered by Cloudflare Durable Objects. I will replace all mock data with real API calls, implement the backend `PageEntity` for data persistence, and create a new Zustand store to manage state on the client. This will transform the dashboard into a fully functional content management system.
First, I'll remove the now-obsolete `src/lib/docs.ts` file.
```bash
rm src/lib/docs.ts
```
Next, I'll implement the backend entities and API routes.
```bash
# worker/entities.ts: Define the PageEntity for Durable Object storage, removing old demo entities.
cat > worker/entities.ts << 'EOF'
import { IndexedEntity } from "./core-utils";
import type { Page } from "@shared/docs-types";
import { MOCK_PAGES } from "@shared/docs-mock-data";
// PAGE ENTITY: one DO instance per documentation page
export class PageEntity extends IndexedEntity<Page> {
  static readonly entityName = "page";
  static readonly indexName = "pages";
  static readonly initialState: Page = {
    id: "",
    title: "New Page",
    slug: "new-page",
    parentId: null,
    order: 0,
    content: {
      time: Date.now(),
      blocks: [],
      version: "2.29.0"
    },
    status: 'Draft',
    lastUpdated: new Date().toISOString(),
  };
  static seedData = MOCK_PAGES;
}