const WELCOME_SEEN_KEY = 'clb.welcomeSeen'

export function hasSeenWelcome(): boolean {
  return localStorage.getItem(WELCOME_SEEN_KEY) === 'true'
}

export function markWelcomeSeen(): void {
  localStorage.setItem(WELCOME_SEEN_KEY, 'true')
}
