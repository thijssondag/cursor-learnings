import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Cursors older than this are considered offline.
const STALE_MS = 10_000

export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    color: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('presence')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .unique()

    const data = { ...args, lastSeen: Date.now() }
    if (existing) {
      await ctx.db.patch(existing._id, data)
    } else {
      await ctx.db.insert('presence', data)
    }
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - STALE_MS
    const all = await ctx.db.query('presence').collect()
    return all.filter((p) => p.lastSeen >= cutoff)
  },
})

export const leave = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const existing = await ctx.db
      .query('presence')
      .withIndex('by_session', (q) => q.eq('sessionId', sessionId))
      .unique()
    if (existing) await ctx.db.delete(existing._id)
  },
})
