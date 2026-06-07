import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: { pageId: v.id('pages') },
  handler: async (ctx, { pageId }) => {
    return ctx.db
      .query('drawings')
      .withIndex('by_page', (q) => q.eq('pageId', pageId))
      .collect()
  },
})

export const upsert = mutation({
  args: {
    pageId: v.id('pages'),
    shapeId: v.string(),
    shapeType: v.string(),
    x: v.number(),
    y: v.number(),
    rotation: v.number(),
    data: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('drawings')
      .withIndex('by_page_shape', (q) =>
        q.eq('pageId', args.pageId).eq('shapeId', args.shapeId),
      )
      .unique()

    const doc = {
      pageId: args.pageId,
      shapeId: args.shapeId,
      shapeType: args.shapeType,
      x: args.x,
      y: args.y,
      rotation: args.rotation,
      data: args.data,
      updatedAt: Date.now(),
    }

    if (existing) {
      await ctx.db.patch(existing._id, doc)
      return existing._id
    }

    return ctx.db.insert('drawings', doc)
  },
})

export const remove = mutation({
  args: { pageId: v.id('pages'), shapeId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('drawings')
      .withIndex('by_page_shape', (q) =>
        q.eq('pageId', args.pageId).eq('shapeId', args.shapeId),
      )
      .unique()
    if (existing) await ctx.db.delete(existing._id)
  },
})

export const clearPage = mutation({
  args: { pageId: v.id('pages') },
  handler: async (ctx, { pageId }) => {
    const shapes = await ctx.db
      .query('drawings')
      .withIndex('by_page', (q) => q.eq('pageId', pageId))
      .collect()
    await Promise.all(shapes.map((d) => ctx.db.delete(d._id)))
  },
})
