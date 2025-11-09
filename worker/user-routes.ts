import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { MOCK_PAGES } from "@shared/docs-mock-data";
import { Page, PageNode } from "@shared/docs-types";
// --- Helper to build the page tree ---
function buildPageTree(pages: Page[], parentId: string | null = null): PageNode[] {
  const children = pages
    .filter(page => page.parentId === parentId)
    .sort((a, b) => a.order - b.order);
  return children.map(child => {
    const grandChildren = buildPageTree(pages, child.id);
    const parent = pages.find(p => p.id === child.parentId);
    const parentPath = parent ? findPagePath(pages, parent.id) : '';
    return {
      ...child,
      path: `${parentPath}/${child.slug}`.replace(/^\//, ''),
      children: grandChildren,
    };
  });
}
function findPagePath(pages: Page[], pageId: string): string {
    const page = pages.find(p => p.id === pageId);
    if (!page) return '';
    if (!page.parentId) return `/${page.slug}`;
    return `${findPagePath(pages, page.parentId)}/${page.slug}`;
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
  const pageTree = buildPageTree(MOCK_PAGES);
  app.get('/api/docs/tree', (c) => {
    return ok(c, pageTree);
  });
  app.get('/api/docs/page/*', async (c) => {
    const path = c.req.path.replace('/api/docs/page/', '');
    const page = findPageByPath(pageTree, path);
    if (page) {
      return ok(c, page);
    }
    return notFound(c, 'Page not found');
  });
  // --- ORIGINAL DEMO ROUTES ---
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // DELETE: Users
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/users/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await UserEntity.deleteMany(c.env, list), ids: list });
  });
  // DELETE: Chats
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  app.post('/api/chats/deleteMany', async (c) => {
    const { ids } = (await c.req.json()) as { ids?: string[] };
    const list = ids?.filter(isStr) ?? [];
    if (list.length === 0) return bad(c, 'ids required');
    return ok(c, { deletedCount: await ChatBoardEntity.deleteMany(c.env, list), ids: list });
  });
}