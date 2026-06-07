import { mutation } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

async function getOrCreateMainPage(ctx: MutationCtx): Promise<Id<'pages'>> {
  const lockedPages = await ctx.db
    .query('pages')
    .withIndex('by_locked', (q) => q.eq('isLocked', true))
    .collect()

  if (lockedPages.length > 0) return lockedPages[0]._id

  return ctx.db.insert('pages', {
    name: 'Cursor Learnings',
    authorSessionId: 'system',
    authorName: 'System',
    isLocked: true,
    createdAt: Date.now(),
  })
}

/** One-time / rare admin backfill — not called from hot paths like bootstrap. */
export const backfillDenormalized = mutation({
  args: {},
  handler: async (ctx) => {
    const mainPageId = await getOrCreateMainPage(ctx)

    const notes = await ctx.db.query('notes').collect()
    for (const note of notes) {
      const patch: Record<string, unknown> = {}

      if (!note.pageId) patch.pageId = mainPageId

      if (note.heartCount === undefined) {
        const hearts = await ctx.db
          .query('hearts')
          .withIndex('by_note', (q) => q.eq('noteId', note._id))
          .collect()
        patch.heartCount = hearts.length
      }

      if (note.authorXHandle === undefined || note.authorLinkedInUrl === undefined) {
        const profile = await ctx.db
          .query('profiles')
          .withIndex('by_session', (q) => q.eq('sessionId', note.authorSessionId))
          .unique()
        if (note.authorXHandle === undefined) {
          patch.authorXHandle = profile?.xHandle ?? ''
        }
        if (note.authorLinkedInUrl === undefined) {
          patch.authorLinkedInUrl = profile?.linkedInUrl ?? ''
        }
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(note._id, patch)
      }
    }

    const drawings = await ctx.db.query('drawings').collect()
    for (const drawing of drawings) {
      if (!drawing.shapeType) {
        await ctx.db.patch(drawing._id, { shapeType: 'draw' })
      }
    }

    return { notesPatched: notes.length, drawingsPatched: drawings.length }
  },
})
