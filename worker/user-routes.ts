import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Env } from './core-utils';
import { PageEntity, UserEntity, ChangelogEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { Page, PageNode, ChangelogEntry } from "@shared/docs-types";
import bcrypt from 'bcryptjs';
// --- Helper to build the page tree ---
function buildPageTree(pages: Page[], parentId: string | null = null, parentPath: string = ''): PageNode[] {
  return pages
    .filter(page => page.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map(page => {
      const path = parentId === null ? page.slug : (parentPath ? `${parentPath}/${page.slug}` : page.slug);
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
  // --- AUTH MIDDLEWARE ---
  app.use('/api/docs/*', async (c, next) => {
    if (['GET'].includes(c.req.method)) {
      return next();
    }
    const session = getCookie(c, 'auth_session');
    if (!session) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    // In a real app, you'd validate the session token here
    await next();
  });
  // --- AUTH ROUTES ---
  app.post('/api/auth/login', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const { password } = await c.req.json<{ password?: string }>();
    if (!password) return bad(c, 'Password is required');
    const admin = new UserEntity(c.env, 'admin');
    if (!(await admin.exists())) {
      return bad(c, 'Admin user not found. Please seed data.');
    }
    const user = await admin.getState();
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (passwordMatch) {
      const sessionToken = `session_${crypto.randomUUID()}`;
      setCookie(c, 'auth_session', sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
      return ok(c, { id: user.id, name: user.name });
    }
    return bad(c, 'Invalid credentials');
  });
  app.post('/api/auth/logout', (c) => {
    deleteCookie(c, 'auth_session', { path: '/' });
    return ok(c, { message: 'Logged out' });
  });
  app.get('/api/auth/me', async (c) => {
    const session = getCookie(c, 'auth_session');
    if (session) {
      const admin = new UserEntity(c.env, 'admin');
      if (await admin.exists()) {
        const user = await admin.getState();
        return ok(c, { id: user.id, name: user.name });
      }
    }
    return notFound(c, 'No active session');
  });
  app.post('/api/auth/change-password', async (c) => {
    const session = getCookie(c, 'auth_session');
    if (!session) return notFound(c, 'No active session');
    const { currentPassword, newPassword } = await c.req.json<{ currentPassword?: string; newPassword?: string }>();
    if (!currentPassword || !newPassword) return bad(c, 'All fields are required');
    if (newPassword.length < 8) return bad(c, 'New password must be at least 8 characters');
    const admin = new UserEntity(c.env, 'admin');
    if (!(await admin.exists())) return bad(c, 'Admin user not found');
    const user = await admin.getState();
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) return bad(c, 'Invalid current password');
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await admin.patch({ passwordHash: newPasswordHash });
    return ok(c, { message: 'Password changed successfully' });
  });
  // --- DOCS & CHANGELOG ROUTES ---
  app.use('/api/docs/*', async (c, next) => {
    await PageEntity.ensureSeed(c.env);
    await ChangelogEntity.ensureSeed(c.env);
    await next();
  });
  // --- CHANGELOG CRUD ---
  app.get('/api/docs/changelog', async (c) => {
    const { items: allEntries } = await ChangelogEntity.list(c.env, null, 1000);
    allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return ok(c, allEntries);
  });
  app.post('/api/docs/changelog', async (c) => {
    const entryData = await c.req.json<Omit<ChangelogEntry, 'id'>>();
    const newEntry: ChangelogEntry = {
      ...ChangelogEntity.initialState,
      ...entryData,
      id: crypto.randomUUID(),
    };
    const created = await ChangelogEntity.create(c.env, newEntry);
    return ok(c, created);
  });
  app.put('/api/docs/changelog/:id', async (c) => {
    const { id } = c.req.param();
    const entryData = await c.req.json<Partial<ChangelogEntry>>();
    const entity = new ChangelogEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Changelog entry not found');
    await entity.patch(entryData);
    return ok(c, await entity.getState());
  });
  app.delete('/api/docs/changelog/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await ChangelogEntity.delete(c.env, id);
    if (deleted) return ok(c, { id, deleted: true });
    return notFound(c, 'Changelog entry not found');
  });
  // --- PAGES CRUD ---
  app.get('/api/docs/tree', async (c) => {
    const { items: allPages } = await PageEntity.list(c.env, null, 1000);
    const tree = buildPageTree(allPages);
    return ok(c, tree);
  });
  app.get('/api/docs/pages', async (c) => {
    const { items: allPages } = await PageEntity.list(c.env, null, 1000);
    return ok(c, allPages);
  });
  app.get('/api/docs/page/*', async (c) => {
    const path = decodeURIComponent(c.req.path.replace('/api/docs/page/', ''));
    const { items: allPages } = await PageEntity.list(c.env, null, 1000);
    const tree = buildPageTree(allPages);
    const page = findPageByPath(tree, path);
    if (page) return ok(c, page);
    return notFound(c, 'Page not found');
  });
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
  app.put('/api/docs/pages/:id', async (c) => {
    const { id } = c.req.param();
    const pageData = await c.req.json<Partial<Page>>();
    const pageEntity = new PageEntity(c.env, id);
    if (!(await pageEntity.exists())) return notFound(c, 'Page not found');
    await pageEntity.patch({ ...pageData, lastUpdated: new Date().toISOString() });
    return ok(c, await pageEntity.getState());
  });
  app.delete('/api/docs/pages/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await PageEntity.delete(c.env, id);
    if (deleted) return ok(c, { id, deleted: true });
    return notFound(c, 'Page not found');
  });
  app.post('/api/docs/pages/reorder', async (c) => {
    const updates = await c.req.json<{ id: string; parentId: string | null; order: number }[]>();
    if (!Array.isArray(updates)) return bad(c, 'Invalid payload');
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