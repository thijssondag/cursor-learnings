import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// Single source of truth for the board. Identity is a per-browser sessionId
// (no real auth) — ownership is enforced by matching authorSessionId.
export default defineSchema({
  pages: defineTable({
    name: v.string(),
    authorSessionId: v.string(),
    authorName: v.string(),
    isLocked: v.boolean(),
    createdAt: v.number(),
  }).index('by_locked', ['isLocked']),

  notes: defineTable({
    pageId: v.optional(v.id('pages')),
    authorSessionId: v.string(),
    authorName: v.string(),
    text: v.string(),
    x: v.number(),
    y: v.number(),
    rotation: v.number(),
    color: v.string(),
    createdAt: v.number(),
  })
    .index('by_author', ['authorSessionId'])
    .index('by_page', ['pageId']),

  drawings: defineTable({
    pageId: v.id('pages'),
    shapeId: v.string(),
    x: v.number(),
    y: v.number(),
    rotation: v.number(),
    data: v.string(),
    updatedAt: v.number(),
  })
    .index('by_page', ['pageId'])
    .index('by_page_shape', ['pageId', 'shapeId']),

  hearts: defineTable({
    noteId: v.id('notes'),
    sessionId: v.string(),
  })
    .index('by_note', ['noteId'])
    .index('by_note_session', ['noteId', 'sessionId']),

  presence: defineTable({
    sessionId: v.string(),
    name: v.string(),
    color: v.string(),
    x: v.number(),
    y: v.number(),
    lastSeen: v.number(),
  }).index('by_session', ['sessionId']),

  profiles: defineTable({
    sessionId: v.string(),
    name: v.string(),
    xHandle: v.optional(v.string()),
    linkedInUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('by_session', ['sessionId']),
})
