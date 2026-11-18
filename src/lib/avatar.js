export const AVATAR_OPTIONS = [
  { id: 'dog', label: 'Dog', desc: 'The Dogear mascot' },
  { id: 'girl', label: 'Girl', desc: 'Avid book reader' },
  { id: 'boy', label: 'Boy', desc: 'Curious bookworm' },
  { id: 'flower', label: 'Flower', desc: 'Sunny literary spirit' },
  { id: 'books', label: 'Books', desc: 'Cozy book stack' },
  { id: 'coffee', label: 'Coffee', desc: 'Fresh brew & chapters' },
  { id: 'cat', label: 'Cat', desc: 'Quiet reading companion' },
]

const DEFAULT_AVATAR_ID = 'dog'

export function getUserAvatar(userId) {
  if (!userId) return AVATAR_OPTIONS.find((a) => a.id === DEFAULT_AVATAR_ID)
  try {
    const saved = localStorage.getItem(`dogear_avatar_${userId}`)
    if (saved) {
      const match = AVATAR_OPTIONS.find((a) => a.id === saved)
      if (match) return match
    }
  } catch {
    // Ignore storage errors
  }
  return AVATAR_OPTIONS.find((a) => a.id === DEFAULT_AVATAR_ID)
}

export function setUserAvatar(userId, avatarId) {
  if (!userId || !avatarId) return
  try {
    localStorage.setItem(`dogear_avatar_${userId}`, avatarId)
  } catch (err) {
    console.error('Error saving avatar:', err)
  }
}
