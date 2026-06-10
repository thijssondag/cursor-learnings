/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { Identity } from '../lib/identity'
import {
  findPageIdBySlug,
  getPageSlug,
  getPageSlugFromSearch,
  syncPageSlugInUrl,
} from '../lib/pageSlugs'

export type PageKind = 'tip' | 'buildPlan'

export interface BoardPage {
  _id: Id<'pages'>
  name: string
  authorSessionId: string
  authorName: string
  isLocked: boolean
  pageKind: PageKind
  createdAt: number
  isOwner: boolean
  canDelete: boolean
}

interface PageContextValue {
  pages: BoardPage[] | undefined
  currentPageId: Id<'pages'> | null
  currentPage: BoardPage | undefined
  setCurrentPageId: (id: Id<'pages'>) => void
  createPage: (name?: string) => Promise<Id<'pages'>>
  renamePage: (pageId: Id<'pages'>, name: string) => Promise<void>
  deletePage: (pageId: Id<'pages'>) => Promise<Id<'pages'>>
}

const PageContext = createContext<PageContextValue | null>(null)

export function PageProvider({
  identity,
  children,
}: {
  identity: Identity
  children: React.ReactNode
}) {
  const pages = useQuery(api.pages.list, { sessionId: identity.sessionId })
  const bootstrap = useMutation(api.pages.bootstrap)
  const createPageMutation = useMutation(api.pages.create)
  const renamePageMutation = useMutation(api.pages.rename)
  const removePageMutation = useMutation(api.pages.remove)
  const [selectedPageId, setSelectedPageId] = useState<Id<'pages'> | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    void bootstrap().then(() => setBootstrapped(true))
  }, [bootstrap])

  const defaultPageId = useMemo(() => {
    if (!bootstrapped || !pages?.length) return null
    const learnings = pages.find((p) => p.name === 'Cursor Learnings')
    if (learnings) return learnings._id
    const locked = pages.find((p) => p.isLocked)
    if (locked) return locked._id
    return pages[0]._id
  }, [bootstrapped, pages])

  const deepLinkedPageId = useMemo(() => {
    if (!bootstrapped || !pages?.length) return null
    const slug = getPageSlugFromSearch(window.location.search)
    if (!slug) return null
    return findPageIdBySlug(pages, slug)
  }, [bootstrapped, pages])

  const currentPageId = selectedPageId ?? deepLinkedPageId ?? defaultPageId
  const currentPage = pages?.find((p) => p._id === currentPageId)

  const setCurrentPageId = (id: Id<'pages'>) => {
    setSelectedPageId(id)
    const page = pages?.find((p) => p._id === id)
    syncPageSlugInUrl(page ? getPageSlug(page) : null)
  }

  const createPage = async (name?: string) => {
    const id = await createPageMutation({
      sessionId: identity.sessionId,
      authorName: identity.name,
      name,
    })
    setSelectedPageId(id)
    return id
  }

  const renamePage = async (pageId: Id<'pages'>, name: string) => {
    await renamePageMutation({
      pageId,
      sessionId: identity.sessionId,
      name,
    })
  }

  const deletePage = async (pageId: Id<'pages'>) => {
    const mainPageId = await removePageMutation({
      pageId,
      sessionId: identity.sessionId,
    })
    setSelectedPageId(mainPageId)
    return mainPageId
  }

  return (
    <PageContext.Provider
      value={{
        pages,
        currentPageId,
        currentPage,
        setCurrentPageId,
        createPage,
        renamePage,
        deletePage,
      }}
    >
      {children}
    </PageContext.Provider>
  )
}

export function useOptionalPageContext(): PageContextValue | null {
  return useContext(PageContext)
}

export function usePageContext(): PageContextValue {
  const ctx = useOptionalPageContext()
  if (!ctx) throw new Error('usePageContext must be used within PageProvider')
  return ctx
}
