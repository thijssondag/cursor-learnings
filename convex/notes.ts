import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import type { Id } from './_generated/dataModel'

// Returns every note plus heart count and whether the requesting session liked it.
export const list = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const notes = await ctx.db.query('notes').collect()

    return Promise.all(
      notes.map(async (note) => {
        const hearts = await ctx.db
          .query('hearts')
          .withIndex('by_note', (q) => q.eq('noteId', note._id))
          .collect()

        return {
          ...note,
          heartCount: hearts.length,
          likedByMe: hearts.some((h) => h.sessionId === sessionId),
          isOwner: note.authorSessionId === sessionId,
        }
      }),
    )
  },
})

export const create = mutation({
  args: {
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
    return ctx.db.insert('notes', {
      authorSessionId: args.sessionId,
      authorName,
      text: args.text,
      x: args.x,
      y: args.y,
      rotation: args.rotation,
      color: args.color,
      createdAt: Date.now(),
    })
  },
})

// Owner-only text edits.
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

// Anyone can reposition a note on the board.
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
  ctx: { db: { get: (id: Id<'notes'>) => Promise<unknown> } },
  noteId: Id<'notes'>,
  sessionId: string,
) {
  const note = (await ctx.db.get(noteId)) as
    | { _id: Id<'notes'>; authorSessionId: string }
    | null
  if (!note) throw new Error('Note not found')
  if (note.authorSessionId !== sessionId) {
    throw new Error('You can only edit your own notes')
  }
  return note
}
