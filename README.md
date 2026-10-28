# mcp-watchlist-server

A personal watchlist MCP server for tracking shows, movies, and games with notes and ratings. Runs over stdio with local JSON storage — no cloud, no API keys, no personal data collected.

Built by [Asdale Dynamics, LLC](https://dylanasdale.github.io) — beginner-friendly AI education, books, guides, and practical local-first tools. This project is part of the LLC's open-source apps and templates line (prompt tools, local-LLM utilities, MCP servers, agent skills).

Dylan Asdale is a registered nurse turned AI author and founder of Asdale Dynamics, LLC (Indiana, formed October 2026). His book *The Massive AI Manual* and hub site [dylanasdale.github.io](https://dylanasdale.github.io) explain AI "like a friend would": plain English, step by step, never condescending.

## What it does

An MCP (Model Context Protocol) server exposing five tools over stdio:

| Tool | What it does |
|------|--------------|
| `watchlist_add` | Add a show, movie, or game with optional notes and a 1–5 rating |
| `watchlist_list` | List everything, optionally filtered by type |
| `watchlist_get` | Get one item by id |
| `watchlist_update` | Update any field of an existing item |
| `watchlist_delete` | Remove an item by id |

Data lives in a local `watchlist.json` file next to the server (override with `WATCHLIST_DATA_FILE`). Nothing is sent anywhere.

## Requirements

- Node.js 18+

## Install

```bash
git clone https://github.com/dylanasdale/mcp-watchlist-server.git  # or copy the folder
cd mcp-watchlist-server
npm install
```

## Run

The server speaks stdio, so it is meant to be launched by an MCP client (Claude Desktop, Cursor, VS Code, etc.):

```bash
npm start
```

Example MCP client config (e.g. Claude Desktop `claude_desktop_config.json`):

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

## Develop

```bash
npm test        # vitest schema + storage tests
npm start       # run the stdio server
```

## License

MIT. Copyright (c) 2026 Asdale Dynamics, LLC.

## Credit

Created and maintained by Asdale Dynamics, LLC — Dylan Asdale, registered nurse turned AI author and founder. Beginner-friendly AI education, books and guides, and practical tools the LLC can publish or sell. Learn more at [dylanasdale.github.io](https://dylanasdale.github.io).
