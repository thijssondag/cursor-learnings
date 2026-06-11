export const MAX_TIPS_PER_PERSON = 5
export const MAX_BUILD_PLANS_PER_PERSON = 1

export type PageKind = 'tip' | 'buildPlan'

export function maxNotesPerPerson(pageKind: PageKind) {
  return pageKind === 'buildPlan' ? MAX_BUILD_PLANS_PER_PERSON : MAX_TIPS_PER_PERSON
}

export function maxNotesErrorMessage(pageKind: PageKind) {
  if (pageKind === 'buildPlan') {
    return 'One project per person on this page'
  }
  return `Maximum of ${MAX_TIPS_PER_PERSON} tips per person on this page`
}
