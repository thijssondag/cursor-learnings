import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'

const STALE_MS = 30_000

async function upsertPresence(
  ctx: MutationCtx,
  args: { sessionId: string; name: string; color: string; x: number; y: number },
  patch: Record<string, unknown>,
) {
  const existing = await ctx.db
    .query('presence')
    .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
    .unique()

  if (existing) {
    await ctx.db.patch(existing._id, patch)
    return
  }

  await ctx.db.insert('presence', {
    ...args,
    lastSeen: Date.now(),
    ...patch,
  })
}

// Cursor position only — does not bump lastSeen (reduces subscription churn).
export const updateCursor = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    color: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    await upsertPresence(ctx, args, {
      name: args.name,
      color: args.color,
      x: args.x,
      y: args.y,
    })
  },
})

// Liveness ping — bumps lastSeen so the user stays "online".
export const touch = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    color: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    await upsertPresence(ctx, args, {
      name: args.name,
      color: args.color,
      x: args.x,
      y: args.y,
      lastSeen: Date.now(),
    })
  },
})

/** @deprecated Use updateCursor + touch instead. */
export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    color: v.string(),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    await upsertPresence(ctx, args, {
      ...args,
      lastSeen: Date.now(),
    })
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - STALE_MS
    return ctx.db
      .query('presence')
      .withIndex('by_lastSeen', (q) => q.gte('lastSeen', cutoff))
      .collect()
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
