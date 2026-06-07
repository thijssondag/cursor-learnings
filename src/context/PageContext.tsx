/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { Identity } from '../lib/identity'

export interface BoardPage {
  _id: Id<'pages'>
  name: string
  authorSessionId: string
  authorName: string
  isLocked: boolean
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
  const [currentPageId, setCurrentPageId] = useState<Id<'pages'> | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    void bootstrap().then(() => setBootstrapped(true))
  }, [bootstrap])

  useEffect(() => {
    if (!bootstrapped || !pages || currentPageId) return
    const main = pages.find((p) => p.isLocked) ?? pages[0]
    if (main) setCurrentPageId(main._id)
  }, [bootstrapped, pages, currentPageId])

  const currentPage = pages?.find((p) => p._id === currentPageId)

  const createPage = async (name?: string) => {
    const id = await createPageMutation({
      sessionId: identity.sessionId,
      authorName: identity.name,
      name,
    })
    setCurrentPageId(id)
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
    setCurrentPageId(mainPageId)
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

export function usePageContext(): PageContextValue {
  const ctx = useContext(PageContext)
  if (!ctx) throw new Error('usePageContext must be used within PageProvider')
  return ctx
}
