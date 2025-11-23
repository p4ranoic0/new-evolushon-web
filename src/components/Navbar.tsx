import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
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
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `font-heading transition-all duration-200 ${
                isActive 
                  ? 'text-brand dark:text-brand-light font-bold' 
                  : 'text-ocean-800 dark:text-ocean-100 hover:text-brand dark:hover:text-brand-light hover:scale-105'
              }`
            }
          >
            {t('nav.home')}
          </NavLink>
          
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <MenuButton className="flex items-center gap-1 text-ocean-800 dark:text-ocean-100 hover:text-brand dark:hover:text-brand-light transition-all duration-200 font-heading hover:scale-105 group">
                  {t('nav.classes')}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                </MenuButton>
                
                <Transition
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1 scale-95"
                  enterTo="opacity-100 translate-y-0 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0 scale-100"
                  leaveTo="opacity-0 translate-y-1 scale-95"
                >
                  <MenuItems className="absolute left-1/2 -translate-x-1/2 mt-3 min-w-48 rounded-xl border border-ocean-200 dark:border-ocean-600 bg-white/95 backdrop-blur-xl p-2 shadow-xl dark:bg-ocean-800/95 origin-top">
                    <MenuItem>
                      {({ active }) => (
                        <NavLink 
                          to="/clases/surf" 
                          className={({ isActive }) => 
                            `block rounded-lg px-4 py-2.5 font-heading transition-all duration-200 ${
                              isActive 
                                ? 'bg-brand/10 dark:bg-brand-light/10 text-brand dark:text-brand-light font-bold' 
                                : active
                                  ? 'bg-ocean-50 dark:bg-ocean-700 text-brand dark:text-brand-light transform scale-105'
                                  : 'text-ocean-800 dark:text-ocean-100'
                            }`
                          }
                        >
                          {t('nav.surf')}
                        </NavLink>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <NavLink 
                          to="/clases/surfskate" 
                          className={({ isActive }) => 
                            `block rounded-lg px-4 py-2.5 font-heading transition-all duration-200 ${
                              isActive 
                                ? 'bg-brand/10 dark:bg-brand-light/10 text-brand dark:text-brand-light font-bold' 
                                : active
                                  ? 'bg-ocean-50 dark:bg-ocean-700 text-brand dark:text-brand-light transform scale-105'
                                  : 'text-ocean-800 dark:text-ocean-100'
                            }`
                          }
                        >
                          {t('nav.surfskate')}
                        </NavLink>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Transition>
              </>
            )}
          </Menu>
          
          <NavLink 
            to="/surftrips" 
            className={({ isActive }) => 
              `font-heading transition-all duration-200 ${
                isActive 
                  ? 'text-brand dark:text-brand-light font-bold' 
                  : 'text-ocean-800 dark:text-ocean-100 hover:text-brand dark:hover:text-brand-light hover:scale-105'
              }`
            }
          >
            {t('nav.surftrips')}
          </NavLink>
          
          <NavLink 
            to="/galeria" 
            className={({ isActive }) => 
              `font-heading transition-all duration-200 ${
                isActive 
                  ? 'text-brand dark:text-brand-light font-bold' 
                  : 'text-ocean-800 dark:text-ocean-100 hover:text-brand dark:hover:text-brand-light hover:scale-105'
              }`
            }
          >
            {t('nav.gallery')}
          </NavLink>
        </nav>
        
        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <Link to="/contacto" className="hidden md:inline-flex items-center rounded-full bg-sunset hover:bg-sunset-dark text-white dark:text-white px-5 py-2.5 font-heading font-bold shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">{t('hero.cta')}</Link>
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
