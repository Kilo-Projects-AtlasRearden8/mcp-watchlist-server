import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  WatchlistItemSchema,
  AddItemInputSchema,
  ListItemsInputSchema,
  GetItemInputSchema,
  UpdateItemInputSchema,
  DeleteItemInputSchema,
  TOOLS
} from './schema.js';
import { listItems, addItem, getItem, updateItem, deleteItem, DATA_FILE } from './storage.js';

const origEnv = process.env.WATCHLIST_DATA_FILE;
let tmpFile;

beforeEach(() => {
  tmpFile = `/tmp/mcp-watchlist-test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
  process.env.WATCHLIST_DATA_FILE = tmpFile;
});

afterEach(() => {
  process.env.WATCHLIST_DATA_FILE = origEnv;
});

describe('WatchlistItemSchema', () => {
  it('accepts a complete item', () => {
    const item = {
      id: 'abc-123',
      type: 'show',
      title: 'The Expanse',
      notes: 'Great sci-fi series',
      rating: 5,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-02T00:00:00.000Z'
    };
    expect(() => WatchlistItemSchema.parse(item)).not.toThrow();
  });

  it('accepts an item without notes or rating', () => {
    const item = {
      id: 'abc-123',
      type: 'movie',
      title: 'Dune',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z'
    };
    const parsed = WatchlistItemSchema.parse(item);
    expect(parsed.notes).toBe('');
    expect(parsed.rating).toBeUndefined();
  });

  it('rejects an invalid type', () => {
    expect(() =>
      WatchlistItemSchema.parse({ ...baseItem(), type: 'book' })
    ).toThrow();
  });

  it('rejects an empty title', () => {
    expect(() => WatchlistItemSchema.parse({ ...baseItem(), title: '' })).toThrow();
  });

  it('rejects a rating below 1', () => {
    expect(() => WatchlistItemSchema.parse({ ...baseItem(), rating: 0 })).toThrow();
  });

  it('rejects a rating above 5', () => {
    expect(() => WatchlistItemSchema.parse({ ...baseItem(), rating: 6 })).toThrow();
  });

  it('accepts all three types', () => {
    for (const type of ['show', 'movie', 'game']) {
      expect(() => WatchlistItemSchema.parse({ ...baseItem(), type })).not.toThrow();
    }
  });
});

describe('AddItemInputSchema', () => {
  it('accepts minimal input', () => {
    expect(() => AddItemInputSchema.parse({ type: 'game', title: 'FFXIV' })).not.toThrow();
  });

  it('accepts notes and rating', () => {
    expect(() =>
      AddItemInputSchema.parse({ type: 'movie', title: 'Dune', notes: 'epic', rating: 4 })
    ).not.toThrow();
  });

  it('rejects missing type', () => {
    expect(() => AddItemInputSchema.parse({ title: 'x' })).toThrow();
  });

  it('rejects missing title', () => {
    expect(() => AddItemInputSchema.parse({ type: 'show' })).toThrow();
  });

  it('rejects non-integer rating', () => {
    expect(() => AddItemInputSchema.parse({ type: 'show', title: 'x', rating: 3.5 })).toThrow();
  });
});

describe('ListItemsInputSchema', () => {
  it('accepts no input', () => {
    expect(() => ListItemsInputSchema.parse({})).not.toThrow();
  });

  it('accepts a type filter', () => {
    expect(() => ListItemsInputSchema.parse({ type: 'game' })).not.toThrow();
  });

  it('rejects invalid type', () => {
    expect(() => ListItemsInputSchema.parse({ type: 'novel' })).toThrow();
  });
});

describe('GetItemInputSchema', () => {
  it('requires id', () => {
    expect(() => GetItemInputSchema.parse({})).toThrow();
    expect(() => GetItemInputSchema.parse({ id: '1' })).not.toThrow();
  });
});

describe('UpdateItemInputSchema', () => {
  it('requires id', () => {
    expect(() => UpdateItemInputSchema.parse({})).toThrow();
  });

  it('accepts partial updates', () => {
    expect(() => UpdateItemInputSchema.parse({ id: '1', rating: 5 })).not.toThrow();
    expect(() => UpdateItemInputSchema.parse({ id: '1', notes: 'updated' })).not.toThrow();
  });

  it('rejects invalid type on update', () => {
    expect(() => UpdateItemInputSchema.parse({ id: '1', type: 'anime' })).toThrow();
  });
});

describe('DeleteItemInputSchema', () => {
  it('requires id', () => {
    expect(() => DeleteItemInputSchema.parse({})).toThrow();
    expect(() => DeleteItemInputSchema.parse({ id: '1' })).not.toThrow();
  });
});

describe('TOOLS definitions', () => {
  const names = TOOLS.map(t => t.name);
  it('defines five tools', () => {
    expect(names).toEqual([
      'watchlist_add',
      'watchlist_list',
      'watchlist_get',
      'watchlist_update',
      'watchlist_delete'
    ]);
  });

  it('every tool has name, description, and inputSchema', () => {
    for (const tool of TOOLS) {
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(tool.inputSchema).toMatchObject({ type: 'object', properties: expect.any(Object) });
    }
  });

  it('watchlist_add requires type and title', () => {
    const add = TOOLS.find(t => t.name === 'watchlist_add');
    expect(add.inputSchema.required).toContain('type');
    expect(add.inputSchema.required).toContain('title');
  });
});

describe('storage round-trip', () => {
  it('adds, lists, gets, updates, and deletes items', async () => {
    const added = await addItem({ type: 'show', title: 'The Expanse', notes: 'sci-fi', rating: 5 });
    expect(added.id).toBeDefined();
    expect(added.created_at).toBeDefined();
    expect(added.updated_at).toBeDefined();

    const all = await listItems();
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('The Expanse');

    const shows = await listItems('show');
    expect(shows.length).toBe(1);

    const movies = await listItems('movie');
    expect(movies.length).toBe(0);

    const got = await getItem(added.id);
    expect(got.title).toBe('The Expanse');
    expect(got.rating).toBe(5);

    const updated = await updateItem({ id: added.id, rating: 4, notes: 'still good' });
    expect(updated.rating).toBe(4);
    expect(updated.notes).toBe('still good');
    expect(updated.updated_at).not.toBe(updated.created_at);

    const missing = await getItem('does-not-exist');
    expect(missing).toBeNull();

    const notUpdated = await updateItem({ id: 'does-not-exist', title: 'x' });
    expect(notUpdated).toBeNull();

    const deleted = await deleteItem(added.id);
    expect(deleted).toBe(true);

    const gone = await getItem(added.id);
    expect(gone).toBeNull();

    const notDeleted = await deleteItem('does-not-exist');
    expect(notDeleted).toBe(false);
  });

  it('persists to the JSON data file', async () => {
    await addItem({ type: 'game', title: 'Final Fantasy XIV' });
    const fs = await import('node:fs/promises');
    const text = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].title).toBe('Final Fantasy XIV');
  });
});

function baseItem() {
  return {
    id: 'abc-123',
    type: 'show',
    title: 'The Expanse',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  };
}
