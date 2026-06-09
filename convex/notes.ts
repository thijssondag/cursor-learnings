import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

async function profileFieldsForAuthor(ctx: QueryCtx | MutationCtx, sessionId: string) {
  const profile = await ctx.db
    .query('profiles')
    .withIndex('by_session', (q) => q.eq('sessionId', sessionId))
    .unique()
  return {
    authorXHandle: profile?.xHandle ?? '',
    authorLinkedInUrl: profile?.linkedInUrl ?? '',
  }
}

// Returns notes on a page — 2 indexed reads (notes by page + hearts by session).
export const list = query({
  args: { sessionId: v.string(), pageId: v.id('pages') },
  handler: async (ctx, { sessionId, pageId }) => {
    const notes = await ctx.db
      .query('notes')
      .withIndex('by_page', (q) => q.eq('pageId', pageId))
      .collect()

    const myHearts = await ctx.db
      .query('hearts')
      .withIndex('by_session', (q) => q.eq('sessionId', sessionId))
      .collect()

    const likedNoteIds = new Set(myHearts.map((h) => h.noteId))

    return notes.map((note) => ({
      ...note,
      heartCount: note.heartCount ?? 0,
      likedByMe: likedNoteIds.has(note._id),
      isOwner: note.authorSessionId === sessionId,
      authorXHandle: note.authorXHandle ?? '',
      authorLinkedInUrl: note.authorLinkedInUrl ?? '',
    }))
  },
})

export const create = mutation({
  args: {
    pageId: v.id('pages'),
    sessionId: v.string(),
    authorName: v.string(),
    text: v.string(),
    x: v.number(),
    y: v.number(),
    rotation: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const authorName = args.authorName.trim()
    if (!authorName) throw new Error('Name is required to create a note')

    const pageNotes = await ctx.db
      .query('notes')
      .withIndex('by_page', (q) => q.eq('pageId', args.pageId))
      .collect()
    if (pageNotes.some((note) => note.authorSessionId === args.sessionId)) {
      throw new Error('One tip per person on each page')
    }

    if (!(NOTE_COLORS as readonly string[]).includes(args.color)) {
      throw new Error('Invalid note color')
    }

    const profileFields = await profileFieldsForAuthor(ctx, args.sessionId)
    return ctx.db.insert('notes', {
      pageId: args.pageId,
      authorSessionId: args.sessionId,
      authorName,
      ...profileFields,
      text: args.text,
      x: args.x,
      y: args.y,
      rotation: args.rotation,
      color: args.color,
      heartCount: 0,
      createdAt: Date.now(),
    })
  },
})

const NOTE_COLORS = [
  '#34d399',
  '#f472b6',
  '#60a5fa',
  '#a78bfa',
  '#fbbf24',
  '#22d3ee',
] as const

export const update = mutation({
  args: {
    noteId: v.id('notes'),
    sessionId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const note = await requireOwnedNote(ctx, args.noteId, args.sessionId)
    await ctx.db.patch(note._id, { text: args.text })
  },
})

export const updateColor = mutation({
  args: {
    noteId: v.id('notes'),
    sessionId: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    if (!(NOTE_COLORS as readonly string[]).includes(args.color)) {
      throw new Error('Invalid note color')
    }
    const note = await requireOwnedNote(ctx, args.noteId, args.sessionId)
    await ctx.db.patch(note._id, { color: args.color })
  },
})

export const move = mutation({
  args: {
    noteId: v.id('notes'),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (!note) throw new Error('Note not found')
    await ctx.db.patch(args.noteId, { x: args.x, y: args.y })
  },
})

export const remove = mutation({
  args: { noteId: v.id('notes'), sessionId: v.string() },
  handler: async (ctx, args) => {
    const note = await requireOwnedNote(ctx, args.noteId, args.sessionId)
    const hearts = await ctx.db
      .query('hearts')
      .withIndex('by_note', (q) => q.eq('noteId', note._id))
      .collect()
    await Promise.all(hearts.map((h) => ctx.db.delete(h._id)))
    await ctx.db.delete(note._id)
  },
})

async function requireOwnedNote(
  ctx: MutationCtx,
  noteId: Id<'notes'>,
  sessionId: string,
) {
  const note = await ctx.db.get(noteId)
  if (!note) throw new Error('Note not found')
  if (note.authorSessionId !== sessionId) {
    throw new Error('You can only edit your own notes')
  }
  return note
}
