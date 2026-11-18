// Username generator and validator for Dogear

const ADJECTIVES = [
  'Quiet', 'Mellow', 'Copper', 'Open', 'Amber', 'Velvet', 'Golden', 'Silver',
  'Gentle', 'Breezy', 'Cozy', 'Calm', 'Bright', 'Swift', 'Curious', 'Patient',
  'Rustic', 'Sunny', 'Dappled', 'Warm', 'Lupin', 'Hazel', 'Mossy', 'Little'
]

const NOUNS = [
  'Cloud', 'River', 'Window', 'Sky', 'Cove', 'Planet', 'Steps', 'Forest',
  'Meadow', 'Valley', 'Brook', 'Branch', 'Haven', 'Hearth', 'Breeze', 'Lantern',
  'Cedar', 'Willow', 'Fox', 'Robin', 'Otter', 'Badger', 'Pebble', 'Spire'
]

const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'moderator',
  'support',
  'dogear',
])

/**
 * Generate a random AdjectiveNoun1234 username.
 * @param {string} [current] - Currently displayed username to avoid duplicates
 * @returns {string}
 */
export function generateUsername(current = '') {
  let candidate
  do {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    const num = Math.floor(1000 + Math.random() * 9000)
    candidate = `${adj}${noun}${num}`
  } while (candidate === current)
  return candidate
}

/**
 * Validates a username against length, character, and reservation rules.
 * @param {string} username
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateUsername(username) {
  const trimmed = (username || '').trim()

  if (!trimmed) {
    return { valid: false, error: 'Username is required.' }
  }

  if (trimmed.length < 3 || trimmed.length > 24) {
    return { valid: false, error: 'Username must be between 3 and 24 characters.' }
  }

  if (!/^[A-Za-z]/.test(trimmed)) {
    return { valid: false, error: 'Username must start with a letter.' }
  }

  if (!/^[A-Za-z][A-Za-z0-9_]{2,23}$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username may only contain letters, numbers, and underscores.',
    }
  }

  if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) {
    return {
      valid: false,
      error: `"${trimmed}" is a reserved username. Please choose another.`,
    }
  }

  return { valid: true, error: null }
}
