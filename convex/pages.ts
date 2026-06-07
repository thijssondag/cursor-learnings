import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

const MAIN_PAGE_NAME = 'Cursor Learnings'

async function getOrCreateMainPage(ctx: MutationCtx) {
  const lockedPages = await ctx.db
    .query('pages')
    .withIndex('by_locked', (q) => q.eq('isLocked', true))
    .collect()

  if (lockedPages.length > 0) return lockedPages[0]._id

  return ctx.db.insert('pages', {
    name: MAIN_PAGE_NAME,
    authorSessionId: 'system',
    authorName: 'System',
    isLocked: true,
    createdAt: Date.now(),
  })
}

async function backfillNotePageIds(ctx: MutationCtx, mainPageId: Id<'pages'>) {
  const notes = await ctx.db.query('notes').collect()
  await Promise.all(
    notes
      .filter((n) => !n.pageId)
      .map((n) => ctx.db.patch(n._id, { pageId: mainPageId })),
  )
}

export const bootstrap = mutation({
  args: {},
  handler: async (ctx) => {
    const mainPageId = await getOrCreateMainPage(ctx)
    await backfillNotePageIds(ctx, mainPageId)
    return mainPageId
  },
})

export const list = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const pages = await ctx.db.query('pages').collect()
    return pages
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((page) => ({
        ...page,
        isOwner: page.authorSessionId === sessionId,
        canDelete: !page.isLocked && page.authorSessionId === sessionId,
      }))
  },
})

export const create = mutation({
  args: {
    sessionId: v.string(),
    authorName: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authorName = args.authorName.trim()
    if (!authorName) throw new Error('Name is required to create a page')
    const name = args.name?.trim() || 'Untitled page'
    return ctx.db.insert('pages', {
      name,
      authorSessionId: args.sessionId,
      authorName,
      isLocked: false,
      createdAt: Date.now(),
    })
  },
})

export const remove = mutation({
  args: { pageId: v.id('pages'), sessionId: v.string() },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId)
    if (!page) throw new Error('Page not found')
    if (page.isLocked) throw new Error('This page cannot be deleted')
    if (page.authorSessionId !== args.sessionId) {
      throw new Error('You can only delete pages you created')
    }

    const mainPageId = await getOrCreateMainPage(ctx)

    const notes = await ctx.db
      .query('notes')
      .withIndex('by_page', (q) => q.eq('pageId', args.pageId))
      .collect()

    for (const note of notes) {
      const hearts = await ctx.db
        .query('hearts')
        .withIndex('by_note', (q) => q.eq('noteId', note._id))
        .collect()
      await Promise.all(hearts.map((h) => ctx.db.delete(h._id)))
      await ctx.db.delete(note._id)
    }

    const drawings = await ctx.db
      .query('drawings')
      .withIndex('by_page', (q) => q.eq('pageId', args.pageId))
      .collect()
    await Promise.all(drawings.map((d) => ctx.db.delete(d._id)))

    await ctx.db.delete(args.pageId)
    return mainPageId
  },
})
