import { Mail, Phone } from 'lucide-react'
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
              <li className="flex items-center gap-2 hover:text-brand dark:hover:text-brand-light transition-colors cursor-pointer">
                <Phone size={18} className="text-sunset" /> 
                <span>WhatsApp disponible</span>
              </li>
              <li className="flex items-center gap-2 hover:text-brand dark:hover:text-brand-light transition-colors cursor-pointer">
                <Mail size={18} className="text-sunset" /> 
                <span>Escríbenos para más información</span>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-surf text-lg mb-3 text-brand dark:text-brand-light">Síguenos</div>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.instagram.com/evolushonsurf/" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand dark:border-brand-light text-brand dark:text-brand-light px-4 py-2 font-heading font-semibold hover:bg-sunset hover:text-white hover:border-sunset dark:hover:bg-sunset dark:hover:border-sunset transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-sunset"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Instagram
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
