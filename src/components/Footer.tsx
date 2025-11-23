import { Mail, Phone, Instagram, MessageCircle } from 'lucide-react'
import logoUrl from '../assets/logo.jpg'

export default function Footer() {
  return (
    <footer className="border-t border-ocean-200 dark:border-ocean-600 bg-white dark:bg-ocean-800">
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Evolushon logo" className="h-12 w-12 rounded-full shadow-md" />
            <div>
              <div className="font-surf text-lg text-brand dark:text-brand-light">Evolushon</div>
              <div className="font-heading text-ocean-700 dark:text-ocean-200">Conexión entre cuerpo, mente y mar</div>
            </div>
          </div>
          <div>
            <div className="font-surf text-lg mb-3 text-brand dark:text-brand-light">Contacto</div>
            <ul className="space-y-3 text-ocean-800 dark:text-ocean-100 font-heading">
              <li>
                <a 
                  href="https://wa.link/xrf1r8" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-brand dark:hover:text-brand-light transition-colors"
                >
                  <Phone size={18} className="text-sunset" /> 
                  <span>WhatsApp disponible</span>
                </a>
              </li>
              <li className="flex items-center gap-2 hover:text-brand dark:hover:text-brand-light transition-colors cursor-pointer">
                <Mail size={18} className="text-sunset" /> 
                <span>Escríbenos para más información</span>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-surf text-lg mb-3 text-brand dark:text-brand-light">Síguenos</div>
            <div className="flex flex-col gap-3">
              <a 
                href="https://wa.link/xrf1r8" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 rounded-full border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-500 px-4 py-2 font-heading font-semibold hover:bg-green-600 hover:text-white hover:border-green-600 dark:hover:bg-green-600 dark:hover:border-green-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
              <a 
                href="https://www.instagram.com/evolushonsurf" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 rounded-full border-2 border-pink-600 dark:border-pink-500 text-pink-600 dark:text-pink-500 px-4 py-2 font-heading font-semibold hover:bg-pink-600 hover:text-white hover:border-pink-600 dark:hover:bg-pink-600 dark:hover:border-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <Instagram size={18} />
                Instagram
              </a>
              <a 
                href="https://www.tiktok.com/@evolushonsurfexperience" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 rounded-full border-2 border-ocean-800 dark:border-ocean-300 text-ocean-800 dark:text-ocean-300 px-4 py-2 font-heading font-semibold hover:bg-ocean-800 hover:text-white hover:border-ocean-800 dark:hover:bg-ocean-300 dark:hover:text-ocean-900 dark:hover:border-ocean-300 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ocean-200 dark:border-ocean-700 text-ocean-600 dark:text-ocean-400 font-heading text-center">
          © {new Date().getFullYear()} EvolushonSurf - Hecho con 🌊 y ❤️
        </div>
      </div>
    </footer>
  )
}
