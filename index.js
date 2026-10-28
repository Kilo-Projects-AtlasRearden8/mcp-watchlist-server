import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import {
  TOOLS,
  AddItemInputSchema,
  ListItemsInputSchema,
  GetItemInputSchema,
  UpdateItemInputSchema,
  DeleteItemInputSchema
} from './schema.js';
import {
  listItems,
  addItem,
  getItem,
  updateItem,
  deleteItem
} from './storage.js';

const server = new Server(
  { name: 'mcp-watchlist-server', version: '1.0.0' },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'watchlist_add': {
      const input = AddItemInputSchema.parse(args);
      const item = await addItem(input);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { ok: true, item },
              null,
              2
            )
          }
        ]
      };
    }
    case 'watchlist_list': {
      const input = ListItemsInputSchema.parse(args ?? {});
      const items = await listItems(input.type);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              { ok: true, count: items.length, items },
              null,
              2
            )
          }
        ]
      };
    }
    case 'watchlist_get': {
      const input = GetItemInputSchema.parse(args);
      const item = await getItem(input.id);
      if (!item) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'not found' }) }],
          isError: true
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: true, item }, null, 2) }]
      };
    }
    case 'watchlist_update': {
      const input = UpdateItemInputSchema.parse(args);
      const item = await updateItem(input);
      if (!item) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'not found' }) }],
          isError: true
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: true, item }, null, 2) }]
      };
    }
    case 'watchlist_delete': {
      const input = DeleteItemInputSchema.parse(args);
      const removed = await deleteItem(input.id);
      if (!removed) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'not found' }) }],
          isError: true
        };
      }
      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: true, id: input.id }) }]
      };
    }
    default: {
      throw new Error(`Unknown tool: ${name}`);
    }
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // eslint-disable-next-line no-console
  console.error('mcp-watchlist-server ready on stdio');
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('mcp-watchlist-server fatal:', err);
  process.exit(1);
});
