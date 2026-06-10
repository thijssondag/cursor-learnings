import type { Id } from '../../convex/_generated/dataModel'
import { PARTICIPATION_BASE_URL } from './constants'

export const MAIN_PAGE_SLUG = 'learnings'
export const BUILD_PLANS_PAGE_SLUG = 'build-plans'

const PAGE_NAME_TO_SLUG: Record<string, string> = {
  'Cursor Learnings': MAIN_PAGE_SLUG,
  'Cursor Nijmegen Build Plans': BUILD_PLANS_PAGE_SLUG,
}

const SLUG_TO_PAGE_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_NAME_TO_SLUG).map(([name, slug]) => [slug, name]),
)

export function getPageSlug(page: { name: string }): string | null {
  return PAGE_NAME_TO_SLUG[page.name] ?? null
}

export function findPageIdBySlug(
  pages: Array<{ _id: Id<'pages'>; name: string }>,
  slug: string,
): Id<'pages'> | null {
  const pageName = SLUG_TO_PAGE_NAME[slug]
  if (!pageName) return null
  return pages.find((p) => p.name === pageName)?._id ?? null
}

export function buildParticipationUrl(slug: string | null): string {
  const base = PARTICIPATION_BASE_URL.replace(/\/$/, '')
  const resolvedSlug = slug ?? MAIN_PAGE_SLUG
  return `${base}/?page=${resolvedSlug}`
}

export function formatParticipationDisplayUrl(slug: string | null): string {
  const url = new URL(buildParticipationUrl(slug))
  return `${url.host}${url.pathname}${url.search}`
}

export function getPageSlugFromSearch(search: string): string | null {
  const slug = new URLSearchParams(search).get('page')
  if (!slug || !(slug in SLUG_TO_PAGE_NAME)) return null
  return slug
}

export function syncPageSlugInUrl(slug: string | null): void {
  const url = new URL(window.location.href)
  if (slug) {
    url.searchParams.set('page', slug)
  } else {
    url.searchParams.delete('page')
  }
  window.history.replaceState(null, '', url)
}
