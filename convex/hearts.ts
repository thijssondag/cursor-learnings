import { v } from 'convex/values'
import { mutation } from './_generated/server'

// Toggle a heart for (note, session). Anyone can heart any note (incl. their own).
export const toggle = mutation({
  args: { noteId: v.id('notes'), sessionId: v.string() },
  handler: async (ctx, { noteId, sessionId }) => {
    const existing = await ctx.db
      .query('hearts')
      .withIndex('by_note_session', (q) =>
        q.eq('noteId', noteId).eq('sessionId', sessionId),
      )
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
      return { liked: false }
    }

    await ctx.db.insert('hearts', { noteId, sessionId })
    return { liked: true }
  },
})
