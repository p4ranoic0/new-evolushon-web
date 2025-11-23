import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import logoUrl from '../assets/logo.jpg'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-ocean-200 dark:bg-ocean-800/95 dark:border-ocean-600 shadow-sm transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logoUrl} alt="Evolushon logo" className="h-10 w-10 rounded-full shadow-md transition-transform group-hover:scale-110 group-hover:rotate-6" />
          <span className="font-surf text-2xl text-brand dark:text-brand-light">Evolushon</span>
        </Link>
        
        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-brand dark:text-brand-light font-bold' : 'text-ocean-800 dark:text-ocean-100 hover:text-brand dark:hover:text-brand-light transition-colors'}>{t('nav.home')}</NavLink>
          <Menu>
            <MenuButton className="text-ocean-800 dark:text-ocean-100 hover:text-brand dark:hover:text-brand-light transition-colors font-heading">{t('nav.classes')}</MenuButton>
            <MenuItems className="absolute mt-2 min-w-40 rounded-xl border border-ocean-200 dark:border-ocean-600 bg-white/95 backdrop-blur-xl p-2 shadow-lg dark:bg-ocean-800/95">
              <MenuItem>
                <NavLink to="/clases/surf" className={({ isActive }) => isActive ? 'block rounded-lg px-3 py-2 bg-brand/10 dark:bg-brand-light/10 text-brand dark:text-brand-light font-bold' : 'block rounded-lg px-3 py-2 text-ocean-800 dark:text-ocean-100 hover:bg-ocean-50 dark:hover:bg-ocean-700 transition-colors'}>{t('nav.surf')}</NavLink>
              </MenuItem>
              <MenuItem>
                <NavLink to="/clases/surfskate" className={({ isActive }) => isActive ? 'block rounded-lg px-3 py-2 bg-brand/10 dark:bg-brand-light/10 text-brand dark:text-brand-light font-bold' : 'block rounded-lg px-3 py-2 text-ocean-800 dark:text-ocean-100 hover:bg-ocean-50 dark:hover:bg-ocean-700 transition-colors'}>{t('nav.surfskate')}</NavLink>
              </MenuItem>
            </MenuItems>
          </Menu>
          <NavLink to="/surftrips" className={({ isActive }) => isActive ? 'text-brand dark:text-brand-light font-bold' : 'text-ocean-800 dark:text-ocean-100 hover:text-brand dark:hover:text-brand-light transition-colors'}>{t('nav.surftrips')}</NavLink>
          <NavLink to="/galeria" className={({ isActive }) => isActive ? 'text-brand dark:text-brand-light font-bold' : 'text-ocean-800 dark:text-ocean-100 hover:text-brand dark:hover:text-brand-light transition-colors'}>{t('nav.gallery')}</NavLink>
        </nav>
        
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <Link to="/contacto" className="hidden md:inline-flex items-center rounded-full bg-sunset hover:bg-sunset/80 px-5 py-2.5 text-shadow-sky-900 font-heading font-bold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">{t('hero.cta')}</Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
