import { useCallback, useState } from 'react'

const KEY = 'dogear.theme'

function readTheme() {
  const t = document.documentElement.dataset.theme
  return t === 'dark' ? 'dark' : 'light'
}

/** Light/dark theme, persisted under `dogear.theme`. index.html applies it before first paint. */
export function useTheme() {
  const [theme, setThemeState] = useState(readTheme)

  const setTheme = useCallback((next) => {
    const root = document.documentElement
    root.classList.add('theme-switching')
    root.dataset.theme = next
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Storage unavailable: keep the choice in memory only.
    }
    setThemeState(next)
    requestAnimationFrame(() => root.classList.remove('theme-switching'))
  }, [])

  const toggleTheme = useCallback(
    () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    [theme, setTheme],
  )

  return { theme, setTheme, toggleTheme }
}
