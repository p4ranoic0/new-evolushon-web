import skate1 from '../assets/class-surfskate-1.jpg'
import skate3 from '../assets/class-surfskate-3.jpg'

export default function SurfSkate() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Clases de Surfskate</h2>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          El surfskate es ideal para mejorar la técnica de surf porque simula el movimiento de las olas, ayudando a perfeccionar el control, el equilibrio y la coordinación.
          Es una excelente forma de entrenar fuera del agua, permitiendo practicar giros, maniobras y la sensación de velocidad con muchas repeticiones.
          También desarrolla fuerza en las piernas y agilidad, y mantiene la conexión con el surf durante todo el año.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <img src={skate1} alt="Surfskate 1" className="rounded-lg shadow-soft" />
        <img src={skate3} alt="Surfskate 3" className="rounded-lg shadow-soft" />
      </div>
    </div>
  )
}

