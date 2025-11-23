import { useState } from 'react'
import type { FormEvent } from 'react'

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
      <h2 className="text-2xl font-semibold mb-6">Reserva</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nombre</label>
          <input className="w-full rounded-md border px-3 py-2" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full rounded-md border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Teléfono</label>
            <input className="w-full rounded-md border px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Fecha preferida</label>
            <input type="date" className="w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Nivel</label>
            <select className="w-full rounded-md border px-3 py-2">
              <option>Principiante</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Mensaje</label>
          <textarea className="w-full rounded-md border px-3 py-2" rows={4} />
        </div>
        <button type="submit" className="rounded-md bg-brand px-4 py-2 text-white disabled:opacity-70" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  )
}

