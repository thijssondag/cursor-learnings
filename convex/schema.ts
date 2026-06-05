import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// Single source of truth for the board. Identity is a per-browser sessionId
// (no real auth) — ownership is enforced by matching authorSessionId.
export default defineSchema({
  notes: defineTable({
    authorSessionId: v.string(),
    authorName: v.string(),
    text: v.string(),
    x: v.number(),
    y: v.number(),
    rotation: v.number(),
    color: v.string(),
    createdAt: v.number(),
  }).index('by_author', ['authorSessionId']),

  // One row per person-per-note => toggle semantics. Count = number of rows.
  hearts: defineTable({
    noteId: v.id('notes'),
    sessionId: v.string(),
  })
    .index('by_note', ['noteId'])
    .index('by_note_session', ['noteId', 'sessionId']),

  // Live cursors. Stale rows (lastSeen older than a few seconds) are filtered out.
  presence: defineTable({
    sessionId: v.string(),
    name: v.string(),
    color: v.string(),
    x: v.number(),
    y: v.number(),
    lastSeen: v.number(),
  }).index('by_session', ['sessionId']),
})
