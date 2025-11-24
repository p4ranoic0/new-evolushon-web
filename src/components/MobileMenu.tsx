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
            {/* Backdrop oscuro con blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel deslizante del menú */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-white/95 dark:bg-ocean-900/95 backdrop-blur-xl shadow-2xl z-50 border-l border-ocean-200/50 dark:border-ocean-700/50"
            >
              {/* Header moderno con gradiente sutil */}
              <div className="relative bg-gradient-to-br from-brand/5 to-sunset/5 dark:from-brand-light/5 dark:to-sunset/5 p-6 border-b border-ocean-200/30 dark:border-ocean-700/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-surf text-ocean-800 dark:text-brand-light">
                      {t('nav.menu', 'Menú')}
                    </h2>
                    <p className="text-xs text-ocean-600 dark:text-ocean-400 mt-0.5">
                      {t('nav.navigation', 'Navegación')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl bg-ocean-100/80 hover:bg-ocean-200 dark:bg-ocean-800/80 dark:hover:bg-ocean-700 text-ocean-700 dark:text-ocean-200 transition-all duration-200 hover:rotate-90"
                    aria-label="Cerrar menú"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Navegación con scroll suave */}
              <nav className="p-5 space-y-1.5 overflow-y-auto h-[calc(100vh-120px)]">
                <NavLink
                  to="/"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 rounded-xl text-sm font-heading transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand to-brand-dark dark:from-brand-light dark:to-brand text-white shadow-lg shadow-brand/20 font-semibold'
                        : 'text-ocean-700 dark:text-ocean-200 hover:bg-ocean-100/60 dark:hover:bg-ocean-800/60 hover:pl-5'
                    }`
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${
                    ({ isActive }: { isActive: boolean }) => isActive 
                      ? 'bg-white' 
                      : 'bg-brand dark:bg-brand-light opacity-0 group-hover:opacity-100'
                  }`} />
                  {t('nav.home')}
                </NavLink>
                
                {/* Sección de clases con diseño jerárquico */}
                <div className="space-y-1 pt-2">
                  <p className="px-4 py-2 text-xs font-surf text-ocean-500 dark:text-ocean-400 uppercase tracking-widest">
                    {t('nav.classes')}
                  </p>
                  <NavLink
                    to="/clases/surf"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 rounded-xl text-sm font-heading ml-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-brand to-brand-dark dark:from-brand-light dark:to-brand text-white shadow-lg shadow-brand/20 font-semibold'
                          : 'text-ocean-700 dark:text-ocean-200 hover:bg-ocean-100/60 dark:hover:bg-ocean-800/60 hover:pl-5'
                      }`
                    }
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${
                      ({ isActive }: { isActive: boolean }) => isActive 
                        ? 'bg-white' 
                        : 'bg-brand dark:bg-brand-light opacity-0 group-hover:opacity-100'
                    }`} />
                    {t('nav.surf')}
                  </NavLink>
                  <NavLink
                    to="/clases/surfskate"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 rounded-xl text-sm font-heading ml-2 transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-brand to-brand-dark dark:from-brand-light dark:to-brand text-white shadow-lg shadow-brand/20 font-semibold'
                          : 'text-ocean-700 dark:text-ocean-200 hover:bg-ocean-100/60 dark:hover:bg-ocean-800/60 hover:pl-5'
                      }`
                    }
                  >
                    <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${
                      ({ isActive }: { isActive: boolean }) => isActive 
                        ? 'bg-white' 
                        : 'bg-brand dark:bg-brand-light opacity-0 group-hover:opacity-100'
                    }`} />
                    {t('nav.surfskate')}
                  </NavLink>
                </div>
                
                <NavLink
                  to="/surftrips"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 rounded-xl text-sm font-heading transition-all duration-200 mt-1 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand to-brand-dark dark:from-brand-light dark:to-brand text-white shadow-lg shadow-brand/20 font-semibold'
                        : 'text-ocean-700 dark:text-ocean-200 hover:bg-ocean-100/60 dark:hover:bg-ocean-800/60 hover:pl-5'
                    }`
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${
                    ({ isActive }: { isActive: boolean }) => isActive 
                      ? 'bg-white' 
                      : 'bg-brand dark:bg-brand-light opacity-0 group-hover:opacity-100'
                  }`} />
                  {t('nav.surftrips')}
                </NavLink>
                
                <NavLink
                  to="/galeria"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 rounded-xl text-sm font-heading transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand to-brand-dark dark:from-brand-light dark:to-brand text-white shadow-lg shadow-brand/20 font-semibold'
                        : 'text-ocean-700 dark:text-ocean-200 hover:bg-ocean-100/60 dark:hover:bg-ocean-800/60 hover:pl-5'
                    }`
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-3 transition-all ${
                    ({ isActive }: { isActive: boolean }) => isActive 
                      ? 'bg-white' 
                      : 'bg-brand dark:bg-brand-light opacity-0 group-hover:opacity-100'
                  }`} />
                  {t('nav.gallery')}
                </NavLink>
                
                {/* CTA de contacto destacado al final */}
                <div className="pt-6 mt-6 border-t border-ocean-200/40 dark:border-ocean-700/40">
                  <Link
                    to="/contacto"
                    onClick={handleLinkClick}
                    className="flex items-center justify-center w-full px-5 py-3.5 bg-gradient-to-r from-sunset to-sunset-dark hover:from-sunset-dark hover:to-sunset text-white rounded-2xl font-surf text-base shadow-lg shadow-sunset/30 hover:shadow-xl hover:shadow-sunset/40 transition-all duration-300 hover:scale-105"
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