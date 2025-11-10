import { IndexedEntity, Env } from "./core-utils";
import type { Page, User, ChangelogEntry } from "@shared/docs-types";
import { MOCK_PAGES } from "@shared/docs-mock-data";
import bcrypt from 'bcryptjs';
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
      blocks: [
        {
          type: "header",
          data: { text: "Untitled Page", level: 1 }
        },
        {
          type: "paragraph",
          data: { text: "Start writing your amazing documentation here." }
        }
      ],
      version: "2.29.0"
    },
    status: 'Draft',
    lastUpdated: new Date().toISOString()
  };
  static seedData = MOCK_PAGES;
}
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    name: "",
    passwordHash: ""
  };
  // Override the base ensureSeed to implement custom seeding logic,
  // as this entity does not use a static seedData array.
  static override async ensureSeed(env: Env): Promise<void> {
    const users = await this.list(env);
    if (users.items.length === 0) {
      const passwordHash = await bcrypt.hash('password', 10);
      const adminUser: User = {
        id: 'admin',
        name: 'Admin User',
        passwordHash
      };
      await this.create(env, adminUser);
      console.log('Seeded admin user with default password.');
    }
  }
}
export class ChangelogEntity extends IndexedEntity<ChangelogEntry> {
  static readonly entityName = "changelog";
  static readonly indexName = "changelogs";
  static readonly initialState: ChangelogEntry = {
    id: "",
    version: "1.0.0",
    date: new Date().toISOString(),
    content: {
      time: Date.now(),
      blocks: [],
      version: "2.29.0"
    }
  };
  static override async ensureSeed(env: Env): Promise<void> {
    const changelogs = await this.list(env);
    if (changelogs.items.length === 0) {
      const initialEntry: ChangelogEntry = {
        id: crypto.randomUUID(),
        version: "1.0.0",
        date: "2025-11-10T10:00:00Z",
        content: {
          time: 1731148800000,
          version: "2.29.0",
          blocks: [
            { type: 'header', data: { text: 'Version 1.0.0', level: 2 } },
            { type: 'paragraph', data: { text: 'Initial release of the Cockpit Design System documentation platform.' } }
          ]
        }
      };
      await this.create(env, initialEntry);
      console.log('Seeded initial changelog entry.');
    }
  }
}