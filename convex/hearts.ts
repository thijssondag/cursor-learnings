import { v } from 'convex/values'
import { mutation } from './_generated/server'

// Toggle a heart for (note, session). Updates denormalized heartCount on the note.
export const toggle = mutation({
  args: { noteId: v.id('notes'), sessionId: v.string() },
  handler: async (ctx, { noteId, sessionId }) => {
    const note = await ctx.db.get(noteId)
    if (!note) throw new Error('Note not found')

    const existing = await ctx.db
      .query('hearts')
      .withIndex('by_note_session', (q) =>
        q.eq('noteId', noteId).eq('sessionId', sessionId),
      )
      .unique()

    const currentCount = note.heartCount ?? 0

    if (existing) {
      await ctx.db.delete(existing._id)
      await ctx.db.patch(noteId, { heartCount: Math.max(0, currentCount - 1) })
      return { liked: false }
    }

    await ctx.db.insert('hearts', { noteId, sessionId })
    await ctx.db.patch(noteId, { heartCount: currentCount + 1 })
    return { liked: true }
  },
})
