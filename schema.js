import { z } from 'zod';

const ItemType = z.enum(['show', 'movie', 'game']);

export const WatchlistItemSchema = z.object({
  id: z.string(),
  type: ItemType,
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional().default(''),
  rating: z.number().int().min(1).max(5).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export const AddItemInputSchema = z.object({
  type: ItemType,
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional().default(''),
  rating: z.number().int().min(1).max(5).optional()
});

export const ListItemsInputSchema = z.object({
  type: ItemType.optional()
});

export const GetItemInputSchema = z.object({
  id: z.string()
});

export const UpdateItemInputSchema = z.object({
  id: z.string(),
  type: ItemType.optional(),
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional()
});

export const DeleteItemInputSchema = z.object({
  id: z.string()
});

export const TOOLS = [
  {
    name: 'watchlist_add',
    description: 'Add a show, movie, or game to the personal watchlist with optional notes and a 1-5 rating.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['show', 'movie', 'game'], description: 'Item type: show, movie, or game' },
        title: { type: 'string', description: 'Title of the show, movie, or game' },
        notes: { type: 'string', description: 'Personal notes about the item' },
        rating: { type: 'number', description: 'Rating from 1 to 5' }
      },
      required: ['type', 'title'],
      additionalProperties: false
    }
  },
  {
    name: 'watchlist_list',
    description: 'List watchlist items. Optionally filter by type (show, movie, game).',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['show', 'movie', 'game'], description: 'Filter by item type' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'watchlist_get',
    description: 'Get a single watchlist item by its id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Id of the item' }
      },
      required: ['id'],
      additionalProperties: false
    }
  },
  {
    name: 'watchlist_update',
    description: 'Update a watchlist item by id. Any provided field is changed.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Id of the item' },
        type: { type: 'string', enum: ['show', 'movie', 'game'] },
        title: { type: 'string' },
        notes: { type: 'string' },
        rating: { type: 'number', description: 'Rating from 1 to 5' }
      },
      required: ['id'],
      additionalProperties: false
    }
  },
  {
    name: 'watchlist_delete',
    description: 'Delete a watchlist item by id.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Id of the item' }
      },
      required: ['id'],
      additionalProperties: false
    }
  }
];
