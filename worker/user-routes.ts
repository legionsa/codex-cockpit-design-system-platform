import { Hono } from "hono";
import type { Env } from './core-utils';
import { PageEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { Page, PageNode } from "@shared/docs-types";
// --- Helper to build the page tree ---
function buildPageTree(pages: Page[], parentId: string | null = null, parentPath: string = ''): PageNode[] {
  return pages
    .filter(page => page.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map(page => {
      const path = `${parentPath}/${page.slug}`.replace(/^\//, '');
      return {
        ...page,
        path,
        children: buildPageTree(pages, page.id, path),
      };
    });
}
function findPageByPath(tree: PageNode[], path: string): PageNode | null {
    for (const node of tree) {
        if (node.path === path) {
            return node;
        }
        const foundInChildren = findPageByPath(node.children, path);
        if (foundInChildren) {
            return foundInChildren;
        }
    }
    return null;
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- DOCS ROUTES ---
  // Ensure seed data on first load
  app.use('/api/docs/*', async (c, next) => {
    await PageEntity.ensureSeed(c.env);
    await next();
  });
  // Get the entire page hierarchy
  app.get('/api/docs/tree', async (c) => {
    const { items: allPages } = await PageEntity.list(c.env, null, 1000); // Assuming max 1000 pages
    const tree = buildPageTree(allPages);
    return ok(c, tree);
  });
  // Get a single page by its full slug path (for public site)
  app.get('/api/docs/page/*', async (c) => {
    const path = c.req.path.replace('/api/docs/page/', '');
    const { items: allPages } = await PageEntity.list(c.env, null, 1000);
    const tree = buildPageTree(allPages);
    const page = findPageByPath(tree, path);
    if (page) {
      return ok(c, page);
    }
    return notFound(c, 'Page not found');
  });
  // Create a new page
  app.post('/api/docs/pages', async (c) => {
    const { parentId, order } = await c.req.json<{ parentId: string | null; order: number }>();
    const newPageData: Page = {
      ...PageEntity.initialState,
      id: crypto.randomUUID(),
      slug: `new-page-${Date.now()}`,
      parentId,
      order,
      lastUpdated: new Date().toISOString(),
    };
    const page = await PageEntity.create(c.env, newPageData);
    return ok(c, page);
  });
  // Update a page
  app.put('/api/docs/pages/:id', async (c) => {
    const { id } = c.req.param();
    const pageData = await c.req.json<Partial<Page>>();
    const pageEntity = new PageEntity(c.env, id);
    if (!(await pageEntity.exists())) {
      return notFound(c, 'Page not found');
    }
    await pageEntity.patch({ ...pageData, lastUpdated: new Date().toISOString() });
    const updatedPage = await pageEntity.getState();
    return ok(c, updatedPage);
  });
  // Reorder pages
  app.post('/api/docs/pages/reorder', async (c) => {
    const updates = await c.req.json<{ id: string; parentId: string | null; order: number }[]>();
    if (!Array.isArray(updates)) {
      return bad(c, 'Invalid payload');
    }
    const updatedPages = await Promise.all(
      updates.map(async ({ id, parentId, order }) => {
        const pageEntity = new PageEntity(c.env, id);
        if (await pageEntity.exists()) {
          await pageEntity.patch({ parentId, order });
          return pageEntity.getState();
        }
        return null;
      })
    );
    return ok(c, updatedPages.filter(Boolean));
  });
}