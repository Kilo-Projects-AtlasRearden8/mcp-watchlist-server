import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WatchlistItemSchema, AddItemInputSchema } from './schema.js';

const DATA_FILE = process.env.WATCHLIST_DATA_FILE || join(process.cwd(), 'watchlist.json');

let cache = null;

async function readStore() {
  if (cache) return cache;
  try {
    const text = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('watchlist store must be a JSON array');
    cache = parsed.map(item => WatchlistItemSchema.parse(item));
    return cache;
  } catch (err) {
    if (err.code === 'ENOENT') {
      cache = [];
      return cache;
    }
    throw err;
  }
}

async function writeStore(items) {
  cache = items;
  const text = JSON.stringify(items, null, 2) + '\n';
  await writeFile(DATA_FILE, text, 'utf8');
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function now() {
  return new Date().toISOString();
}

export async function listItems(filterType) {
  const items = await readStore();
  if (!filterType) return items;
  return items.filter(item => item.type === filterType);
}

export async function addItem(input) {
  const parsed = AddItemInputSchema.parse(input);
  const items = await readStore();
  const item = {
    id: makeId(),
    type: parsed.type,
    title: parsed.title,
    notes: parsed.notes ?? '',
    rating: parsed.rating,
    created_at: now(),
    updated_at: now()
  };
  items.push(item);
  await writeStore(items);
  return item;
}

export async function getItem(id) {
  const items = await readStore();
  const item = items.find(i => i.id === id);
  if (!item) return null;
  return item;
}

export async function updateItem(input) {
  const items = await readStore();
  const index = items.findIndex(i => i.id === input.id);
  if (index === -1) return null;
  const existing = items[index];
  const merged = {
    ...existing,
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.rating !== undefined ? { rating: input.rating } : {}),
    updated_at: now()
  };
  const validated = WatchlistItemSchema.parse(merged);
  items[index] = validated;
  await writeStore(items);
  return validated;
}

export async function deleteItem(id) {
  const items = await readStore();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  await writeStore(items);
  return true;
}

export { DATA_FILE };
