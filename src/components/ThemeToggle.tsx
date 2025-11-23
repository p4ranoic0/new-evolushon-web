import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (globalThis.window === undefined) return false
    const root = document.documentElement
    const hasClass = root.classList.contains('dark')
    if (hasClass) return true
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme === 'dark'
    return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    console.log('🎨 Theme changed to:', dark ? 'DARK' : 'LIGHT')
    console.log('📋 Current classList:', root.classList.toString())
    
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    
    console.log('✅ Updated classList:', root.classList.toString())
  }, [dark])

  const handleToggle = () => {
    console.log('🔄 Toggle clicked! Current dark:', dark)
    setDark(prev => {
      console.log('🔄 Changing from', prev, 'to', !prev)
      return !prev
    })
  }

  return (
    <button
      onClick={handleToggle}
      aria-label="Cambiar tema"
      className="p-2 rounded-full hover:bg-ocean-100 dark:hover:bg-ocean-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 dark:focus:ring-offset-ocean-900"
    >
      {dark ? (
        <Moon className="h-5 w-5 text-brand-light" />
      ) : (
        <Sun className="h-5 w-5 text-sunset" />
      )}
    </button>
  )
}