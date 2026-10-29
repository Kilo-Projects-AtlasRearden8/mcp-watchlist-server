import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let proc;
let stdin;
const pending = new Map();
let nextId = 0;

const dataFile = join(tmpdir(), `mcp-watchlist-integration-${Date.now()}.json`);

beforeAll(() => {
  proc = spawn('node', [join(process.cwd(), 'index.js')], {
    env: { ...process.env, WATCHLIST_DATA_FILE: dataFile },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  stdin = proc.stdin;

  const rl = createInterface({ input: proc.stdout, crlfDelay: Infinity });
  rl.on('line', (line) => {
    const msg = JSON.parse(line);
    const resolver = pending.get(msg.id);
    if (resolver) resolver(msg);
  });
});

afterAll(() => {
  try { stdin.end(); } catch {}
  proc.kill();
});

function send(method, params) {
  const id = ++nextId;
  stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    setTimeout(() => {
      pending.delete(id);
      reject(new Error(`timeout waiting for ${method}`));
    }, 8000);
  });
}

function toolText(msg) {
  const text = msg.result?.content?.[0]?.text;
  if (text === undefined) return msg;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function callTool(name, args) {
  return toolText(await send('tools/call', { name, arguments: args }));
}

describe('mcp-watchlist-server end-to-end (stdio)', () => {
  it('initializes and lists the five tools', async () => {
    const init = await send('initialize', {
      protocolVersion: '2025-06-12',
      capabilities: {},
      clientInfo: { name: 'integration-test', version: '1.0.0' },
    });
    expect(init.result.serverInfo.name).toBe('mcp-watchlist-server');

    const listed = await send('tools/list', {});
    const names = listed.result.tools.map((t) => t.name);
    expect(names).toEqual([
      'watchlist_add',
      'watchlist_list',
      'watchlist_get',
      'watchlist_update',
      'watchlist_delete',
    ]);
  });

  it('adds a show, then gets, lists, updates, and deletes it', async () => {
    const added = await callTool('watchlist_add', {
      type: 'show',
      title: 'The Expanse',
      notes: 'great sci-fi',
      rating: 5,
    });
    expect(added.ok).toBe(true);
    expect(added.item.id).toBeDefined();
    expect(added.item.title).toBe('The Expanse');
    expect(added.item.rating).toBe(5);
    expect(added.item.created_at).toBeDefined();
    const itemId = added.item.id;

    const got = await callTool('watchlist_get', { id: itemId });
    expect(got.item.title).toBe('The Expanse');
    expect(got.item.rating).toBe(5);

    const all = await callTool('watchlist_list', {});
    expect(all.count).toBeGreaterThanOrEqual(1);

    const shows = await callTool('watchlist_list', { type: 'show' });
    expect(shows.items.some((i) => i.id === itemId)).toBe(true);
    const games = await callTool('watchlist_list', { type: 'game' });
    expect(games.items.some((i) => i.id === itemId)).toBe(false);

    const updated = await callTool('watchlist_update', {
      id: itemId,
      rating: 4,
      notes: 'still good',
    });
    expect(updated.item.rating).toBe(4);
    expect(updated.item.notes).toBe('still good');

    const deleted = await callTool('watchlist_delete', { id: itemId });
    expect(deleted.ok).toBe(true);

    const gone = await callTool('watchlist_get', { id: itemId });
    expect(gone.ok).toBe(false);
    expect(gone.error).toBe('not found');
  });

  it('adds a movie with notes and rating', async () => {
    const added = await callTool('watchlist_add', {
      type: 'movie',
      title: 'Dune',
      notes: 'epic adaptation',
      rating: 4,
    });
    expect(added.ok).toBe(true);
    expect(added.item.type).toBe('movie');
    expect(added.item.rating).toBe(4);
  });

  it('rejects an invalid item type with a JSON-RPC error', async () => {
    const result = await send('tools/call', {
      name: 'watchlist_add',
      arguments: { type: 'book', title: 'nope' },
    });
    expect(result.error).toBeDefined();
    expect(result.error.message).toContain('Invalid enum value');
  });

  it('returns not found for get/update/delete of a missing id', async () => {
    const getMissing = await callTool('watchlist_get', { id: 'does-not-exist' });
    expect(getMissing.ok).toBe(false);

    const updMissing = await callTool('watchlist_update', {
      id: 'does-not-exist',
      title: 'x',
    });
    expect(updMissing.ok).toBe(false);

    const delMissing = await callTool('watchlist_delete', { id: 'does-not-exist' });
    expect(delMissing.ok).toBe(false);
  });
});
