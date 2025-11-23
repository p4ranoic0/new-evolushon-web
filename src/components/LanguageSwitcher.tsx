import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const toggle = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
  }
  return (
    <button 
      onClick={toggle} 
      className="p-2 rounded-full hover:bg-ocean-100 dark:hover:bg-ocean-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 dark:focus:ring-offset-ocean-900"
      title={`Cambiar idioma (${i18n.language === 'es' ? 'Español' : 'English'})`}
    >
      <Globe className="h-5 w-5 text-ocean-800 dark:text-ocean-100" />
    </button>
  )
}

