import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

export const MAIN_PAGE_NAME = 'Cursor Learnings'
export const BUILD_PLANS_PAGE_NAME = 'Cursor Nijmegen Build Plans'

export type PageKind = 'tip' | 'buildPlan'

const SYSTEM_PAGES: Array<{ name: string; pageKind: PageKind }> = [
  { name: MAIN_PAGE_NAME, pageKind: 'tip' },
  { name: BUILD_PLANS_PAGE_NAME, pageKind: 'buildPlan' },
]

/** Locked system pages appear in this order; other pages follow by createdAt. */
const PAGE_DISPLAY_ORDER = SYSTEM_PAGES.map((p) => p.name)

export function comparePagesForDisplay(
  a: { name: string; createdAt: number },
  b: { name: string; createdAt: number },
): number {
  const aIdx = PAGE_DISPLAY_ORDER.indexOf(a.name)
  const bIdx = PAGE_DISPLAY_ORDER.indexOf(b.name)
  const aRank = aIdx === -1 ? PAGE_DISPLAY_ORDER.length : aIdx
  const bRank = bIdx === -1 ? PAGE_DISPLAY_ORDER.length : bIdx
  if (aRank !== bRank) return aRank - bRank
  return a.createdAt - b.createdAt
}

async function ensureSystemPage(
  ctx: MutationCtx,
  name: string,
  pageKind: PageKind,
): Promise<Id<'pages'>> {
  const lockedPages = await ctx.db
    .query('pages')
    .withIndex('by_locked', (q) => q.eq('isLocked', true))
    .collect()

  const existing = lockedPages.find((p) => p.name === name)
  if (existing) return existing._id

  return ctx.db.insert('pages', {
    name,
    authorSessionId: 'system',
    authorName: 'System',
    isLocked: true,
    pageKind,
    createdAt: Date.now(),
  })
}

export async function ensureSystemPages(ctx: MutationCtx) {
  for (const page of SYSTEM_PAGES) {
    await ensureSystemPage(ctx, page.name, page.pageKind)
  }
}

export async function getOrCreateMainPage(ctx: MutationCtx): Promise<Id<'pages'>> {
  await ensureSystemPages(ctx)
  const lockedPages = await ctx.db
    .query('pages')
    .withIndex('by_locked', (q) => q.eq('isLocked', true))
    .collect()
  const main = lockedPages.find((p) => p.name === MAIN_PAGE_NAME)
  if (main) return main._id
  return ensureSystemPage(ctx, MAIN_PAGE_NAME, 'tip')
}
