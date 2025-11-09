import { IndexedEntity } from "./core-utils";
import type { Page, User } from "@shared/docs-types";
import { MOCK_PAGES } from "@shared/docs-mock-data";
import bcrypt from 'bcryptjs';
interface Env {
  id?: string | number;
  [key: string]: unknown;
}
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
  // This is a function, not an array, so we override ensureSeed
  static async seedData(env: Env) {
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
  // Override the base ensureSeed to call our custom seedData function
  static override async ensureSeed(env: Env): Promise<void> {
    await this.seedData(env);
  }
}