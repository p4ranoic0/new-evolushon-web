import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface MobileMenuProps {
  onLinkClick?: () => void
}

export default function MobileMenu({ onLinkClick }: Readonly<MobileMenuProps>) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLinkClick = () => {
    setIsOpen(false)
    onLinkClick?.()
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-ocean-800 dark:text-ocean-100 hover:bg-ocean-100 dark:hover:bg-ocean-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-ocean-800 shadow-xl z-50"
            >
              <div className="p-4 border-b border-ocean-200 dark:border-ocean-600">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand dark:text-brand-light">{t('nav.menu', 'Menú')}</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-md text-ocean-600 hover:text-ocean-800 dark:text-ocean-300 dark:hover:text-ocean-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <nav className="p-4 space-y-2">
                <NavLink
                  to="/"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-brand/10 text-brand dark:bg-brand-light/10 dark:text-brand-light font-bold'
                        : 'text-ocean-800 dark:text-ocean-100 hover:bg-ocean-50 dark:hover:bg-ocean-700'
                    }`
                  }
                >
                  {t('nav.home')}
                </NavLink>
                
                <div className="space-y-1">
                  <p className="px-3 py-2 text-xs font-surf text-ocean-600 dark:text-ocean-400 uppercase tracking-wider">
                    {t('nav.classes')}
                  </p>
                  <NavLink
                    to="/clases/surf"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm ml-3 transition-colors ${
                        isActive
                          ? 'bg-brand/10 text-brand dark:bg-brand-light/10 dark:text-brand-light font-bold'
                          : 'text-ocean-800 dark:text-ocean-100 hover:bg-ocean-50 dark:hover:bg-ocean-700'
                      }`
                    }
                  >
                    {t('nav.surf')}
                  </NavLink>
                  <NavLink
                    to="/clases/surfskate"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-md text-sm ml-3 transition-colors ${
                        isActive
                          ? 'bg-brand/10 text-brand dark:bg-brand-light/10 dark:text-brand-light font-bold'
                          : 'text-ocean-800 dark:text-ocean-100 hover:bg-ocean-50 dark:hover:bg-ocean-700'
                      }`
                    }
                  >
                    {t('nav.surfskate')}
                  </NavLink>
                </div>
                
                <NavLink
                  to="/surftrips"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-brand/10 text-brand dark:bg-brand-light/10 dark:text-brand-light font-bold'
                        : 'text-ocean-800 dark:text-ocean-100 hover:bg-ocean-50 dark:hover:bg-ocean-700'
                    }`
                  }
                >
                  {t('nav.surftrips')}
                </NavLink>
                
                <NavLink
                  to="/galeria"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-brand/10 text-brand dark:bg-brand-light/10 dark:text-brand-light font-bold'
                        : 'text-ocean-800 dark:text-ocean-100 hover:bg-ocean-50 dark:hover:bg-ocean-700'
                    }`
                  }
                >
                  {t('nav.gallery')}
                </NavLink>
                
                <div className="pt-4 border-t border-ocean-200 dark:border-ocean-700">
                  <Link
                    to="/contacto"
                    onClick={handleLinkClick}
                    className="block w-full text-center px-4 py-2 bg-sunset hover:bg-sunset-dark text-white rounded-full font-surf hover:shadow-wave transition-all duration-300"
                  >
                    {t('nav.contact')}
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}