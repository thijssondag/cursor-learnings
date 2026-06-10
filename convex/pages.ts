import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { comparePagesForDisplay, getOrCreateMainPage } from './systemPages'

export const bootstrap = mutation({
  args: {},
  handler: async (ctx) => getOrCreateMainPage(ctx),
})

export const list = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const pages = await ctx.db.query('pages').collect()
    return pages
      .sort(comparePagesForDisplay)
      .map((page) => ({
        ...page,
        pageKind: page.pageKind ?? 'tip',
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
      pageKind: 'tip',
      createdAt: Date.now(),
    })
  },
})

export const rename = mutation({
  args: { pageId: v.id('pages'), sessionId: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.pageId)
    if (!page) throw new Error('Page not found')
    if (page.isLocked) throw new Error('This page cannot be renamed')
    if (page.authorSessionId !== args.sessionId) {
      throw new Error('You can only rename pages you created')
    }
    const name = args.name.trim()
    if (!name) throw new Error('Page name is required')
    if (name.length > 48) throw new Error('Page name too long')
    await ctx.db.patch(args.pageId, { name })
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
