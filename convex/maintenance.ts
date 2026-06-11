import { mutation } from './_generated/server'
import { ensureSystemPages, getOrCreateMainPage } from './systemPages'

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

/** Wipe all workshop data while keeping locked system pages. Run before an event. */
export const resetForEvent = mutation({
  args: {},
  handler: async (ctx) => {
    const hearts = await ctx.db.query('hearts').collect()
    for (const heart of hearts) await ctx.db.delete(heart._id)

    const notes = await ctx.db.query('notes').collect()
    for (const note of notes) await ctx.db.delete(note._id)

    const drawings = await ctx.db.query('drawings').collect()
    for (const drawing of drawings) await ctx.db.delete(drawing._id)

    const presence = await ctx.db.query('presence').collect()
    for (const row of presence) await ctx.db.delete(row._id)

    const profiles = await ctx.db.query('profiles').collect()
    for (const profile of profiles) await ctx.db.delete(profile._id)

    const pages = await ctx.db.query('pages').collect()
    let pagesDeleted = 0
    for (const page of pages) {
      if (!page.isLocked) {
        await ctx.db.delete(page._id)
        pagesDeleted++
      }
    }

    await ensureSystemPages(ctx)

    return {
      heartsDeleted: hearts.length,
      notesDeleted: notes.length,
      drawingsDeleted: drawings.length,
      presenceDeleted: presence.length,
      profilesDeleted: profiles.length,
      pagesDeleted,
    }
  },
})
