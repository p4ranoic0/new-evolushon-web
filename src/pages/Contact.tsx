import { useState } from 'react'
import type { FormEvent } from 'react'
import SEO from '../components/SEO'

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    alert('¡Solicitud enviada! Te contactaremos pronto.')
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <SEO 
        title="Contacto y Reservas"
        description="Reserva tus clases de surf con Evolushon. Contáctanos para más información sobre nuestros servicios, horarios y precios."
        keywords="reservar surf, contacto surf lima, reservas clases surf, agendar surf"
      />
      <h2 className="text-3xl md:text-4xl font-surf text-ocean-800 dark:text-brand-light mb-8">Reserva</h2>
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block text-sm font-heading font-semibold text-ocean-700 dark:text-ocean-200 mb-2">Nombre</label>
          <input className="w-full rounded-xl border-2 border-ocean-200 dark:border-ocean-600 bg-white dark:bg-ocean-800 text-ocean-800 dark:text-ocean-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light focus:border-transparent transition-all" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-ocean-700 dark:text-ocean-200 mb-2">Email</label>
            <input type="email" className="w-full rounded-xl border-2 border-ocean-200 dark:border-ocean-600 bg-white dark:bg-ocean-800 text-ocean-800 dark:text-ocean-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light focus:border-transparent transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-ocean-700 dark:text-ocean-200 mb-2">Teléfono</label>
            <input className="w-full rounded-xl border-2 border-ocean-200 dark:border-ocean-600 bg-white dark:bg-ocean-800 text-ocean-800 dark:text-ocean-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light focus:border-transparent transition-all" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-ocean-700 dark:text-ocean-200 mb-2">Fecha preferida</label>
            <input type="date" className="w-full rounded-xl border-2 border-ocean-200 dark:border-ocean-600 bg-white dark:bg-ocean-800 text-ocean-800 dark:text-ocean-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-ocean-700 dark:text-ocean-200 mb-2">Nivel</label>
            <select className="w-full rounded-xl border-2 border-ocean-200 dark:border-ocean-600 bg-white dark:bg-ocean-800 text-ocean-800 dark:text-ocean-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light focus:border-transparent transition-all">
              <option>Principiante</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-heading font-semibold text-ocean-700 dark:text-ocean-200 mb-2">Mensaje</label>
          <textarea className="w-full rounded-xl border-2 border-ocean-200 dark:border-ocean-600 bg-white dark:bg-ocean-800 text-ocean-800 dark:text-ocean-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light focus:border-transparent transition-all resize-none" rows={5} />
        </div>
        <button type="submit" className="w-full md:w-auto rounded-full bg-sunset hover:bg-sunset-dark text-white font-heading font-bold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  )
}

