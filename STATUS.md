STATUS
======

What was built
--------------
mcp-watchlist-server: a Model Context Protocol (MCP) server that runs over stdio and
tracks a personal watchlist of shows, movies, and games, each with optional notes and
a 1-5 rating.

- Five tools: watchlist_add, watchlist_list, watchlist_get, watchlist_update,
  watchlist_delete
- Local JSON storage (watchlist.json next to the server; override with
  WATCHLIST_DATA_FILE). No cloud, no API keys, no network access, no secrets.
- Input validation with zod schemas; tool schemas exposed via MCP tools/list.
- MIT licensed. Copyright (c) 2026 Asdale Dynamics, LLC.
- Built and credited to Asdale Dynamics, LLC (Dylan Asdale, Indiana, formed Oct 2026).

Files
-----
- index.js       MCP stdio server (tool handlers)
- storage.js     Local JSON read/write store
- schema.js      zod schemas + MCP tool definitions
- schema.test.js vitest tests (25 tests)
- package.json   Node project, type: module
- LICENSE        MIT, Copyright (c) 2026 Asdale Dynamics, LLC
- README.md      Usage and credits for Asdale Dynamics, LLC
- .gitignore     node_modules, runtime watchlist.json

How to run
----------
Prerequisites: Node.js 18+

1. npm install
2. npm start            # starts the stdio server (for MCP clients)
3. npm test             # runs the vitest suite

Connect an MCP client (Claude Desktop, Cursor, VS Code, etc.), e.g.:

{
  "mcpServers": {
    "watchlist": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-watchlist-server/index.js"]
    }
  }
}

Verification results
--------------------
- npm install: success (136 packages)
- npm test: 25/25 tests passed (schema validation + storage round-trip)
- stdio smoke test: initialize, tools/list (5 tools), add, get, update,
  list, delete, get-after-delete (not found error), invalid input (JSON-RPC
  error -32603) all behave correctly

Known gaps
----------
- Requires an MCP client to use; no bundled UI or client.
- Rating scale is fixed at 1-5 integers.
- Single JSON file with in-process cache; concurrent server processes sharing one
  watchlist.json can lose updates (no file locking).
- Filtering by type only; no text search, tags, or archiving.
- No .github/workflows CI (intentionally omitted per project rules).
