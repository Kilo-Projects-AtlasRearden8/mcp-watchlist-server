# mcp-watchlist-server

A friendly, local-first MCP server for tracking a personal watchlist of shows, movies, and games — each with optional notes and a 1–5 rating. It runs over stdio and stores everything in a plain JSON file on your computer. No cloud, no API keys, no accounts, nothing leaves your machine.

Built by [Asdale Dynamics, LLC](https://dylanasdale.github.io) — beginner-friendly AI education, books, guides, and practical local-first tools. This is part of the LLC's open-source apps and templates line (prompt tools, local-LLM utilities, MCP servers, agent skills).

Dylan Asdale is a registered nurse turned AI author and founder of Asdale Dynamics, LLC (Indiana, formed October 2026). His book *The Massive AI Manual* and hub site [dylanasdale.github.io](https://dylanasdale.github.io) explain AI "like a friend would": plain English, step by step, never condescending.

## What it does

This Model Context Protocol (MCP) server exposes five tools over stdio:

| Tool | What it does |
|------|--------------|
| `watchlist_add` | Add a show, movie, or game with optional notes and a 1–5 rating |
| `watchlist_list` | List everything, optionally filtered by type |
| `watchlist_get` | Get one item by its id |
| `watchlist_update` | Change any field of an existing item |
| `watchlist_delete` | Remove an item by its id |

Your watchlist lives in a local `watchlist.json` file next to the server. You can point it elsewhere with the `WATCHLIST_DATA_FILE` environment variable. Nothing is sent over the network.

## Who this is for

Anyone who wants a simple, private place to keep track of the shows, movies, and games they want to watch or play — without signing up for anything. It's also a small, readable example of an MCP server if you're learning how agents/MCP tools work (Dylan writes beginner-friendly guides on exactly that kind of thing at dylanasdale.github.io).

## Requirements

- Node.js 18+

## Install

```bash
git clone https://github.com/dylanasdale/mcp-watchlist-server.git
cd mcp-watchlist-server
npm install
```

(Or just copy this folder onto your machine — there's nothing else you need.)

## Run

The server speaks stdio, so it's meant to be started by an MCP client such as Claude Desktop, Cursor, or VS Code:

```bash
npm start
```

Example MCP client configuration (for example, Claude Desktop's `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "watchlist": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-watchlist-server/index.js"]
    }
  }
}
```

Use an absolute path to `index.js` so the client can find it no matter where you run it from.

## Develop

```bash
npm test    # run the vitest suite (schema validation + storage + stdio end-to-end)
npm run lint # check code style with eslint
npm start   # run the stdio server by hand
```

The test suite includes an end-to-end test that starts the real server over stdio and walks through add, get, list, update, and delete.

## License

MIT. Copyright (c) 2026 Asdale Dynamics, LLC.

## Credit

Created and maintained by Asdale Dynamics, LLC — Dylan Asdale, registered nurse turned AI author and founder. Beginner-friendly AI education, books and guides, and practical tools the LLC can publish or sell. Learn more at [dylanasdale.github.io](https://dylanasdale.github.io).
