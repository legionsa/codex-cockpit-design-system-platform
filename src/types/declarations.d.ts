declare module '@editorjs/header' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Header implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module '@editorjs/list' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class List implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module '@editorjs/code' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class CodeTool implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module '@editorjs/embed' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Embed implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module '@editorjs/table' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Table implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module '@editorjs/checklist' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Checklist implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module '@editorjs/quote' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Quote implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module '@editorjs/warning' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Warning implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module '@editorjs/delimiter' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Delimiter implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(block: HTMLElement): any;
  }
}
declare module 'fuse.js' {
  export default class Fuse<T> {
    constructor(list: ReadonlyArray<T>, options?: Fuse.IFuseOptions<T>);
    search<R = T>(pattern: string | object, options?: Fuse.FuseSearchOptions): Fuse.FuseResult<R>[];
    setCollection(docs: ReadonlyArray<T>): void;
  }
  export namespace Fuse {
    export interface IFuseOptions<T> {
      isCaseSensitive?: boolean;
      distance?: number;
      findAllMatches?: boolean;
      includeMatches?: boolean;
      includeScore?: boolean;
      location?: number;
      minMatchCharLength?: number;
      shouldSort?: boolean;
      sortFn?: (a: { score: number }, b: { score: number }) => number;
      threshold?: number;
      useExtendedSearch?: boolean;
      keys?: (keyof T | { name: keyof T; weight: number })[];
    }
    export interface FuseSearchOptions {
      limit?: number;
    }
    export interface FuseResult<T> {
      item: T;
      refIndex: number;
      score?: number;
    }
  }
}