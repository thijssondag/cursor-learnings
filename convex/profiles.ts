import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

function normalizeXHandle(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim().replace(/^@/, '')
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeLinkedInUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error('LinkedIn URL must start with http:// or https://')
  }
  if (!/linkedin\.com/i.test(trimmed)) {
    throw new Error('Please enter a valid LinkedIn profile URL')
  }
  return trimmed
}

export const upsert = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    xHandle: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim()
    if (!name) throw new Error('Name is required')

    const xHandle = normalizeXHandle(args.xHandle)
    const linkedInUrl = normalizeLinkedInUrl(args.linkedInUrl)

    const existing = await ctx.db
      .query('profiles')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .unique()

    const data = {
      sessionId: args.sessionId,
      name,
      xHandle,
      linkedInUrl,
      updatedAt: Date.now(),
    }

    let profileId = existing?._id
    if (existing) {
      await ctx.db.patch(existing._id, data)
    } else {
      profileId = await ctx.db.insert('profiles', data)
    }

    const notes = await ctx.db
      .query('notes')
      .withIndex('by_author', (q) => q.eq('authorSessionId', args.sessionId))
      .collect()

    await Promise.all(
      notes.map((note) =>
        ctx.db.patch(note._id, {
          authorXHandle: xHandle ?? '',
          authorLinkedInUrl: linkedInUrl ?? '',
        }),
      ),
    )

    return profileId
  },
})

export const getBySession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    return ctx.db
      .query('profiles')
      .withIndex('by_session', (q) => q.eq('sessionId', sessionId))
      .unique()
  },
})
