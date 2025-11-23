import chicama from '../assets/surftrip-chicama.jpg'
import bermejo from '../assets/surftrip-bermejo.jpg'
import puertoViejo from '../assets/surftrip-puerto-viejo.jpg'

export default function SurfTrips() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Surftrips</h2>
      <p>Explora nuevas olas y paisajes increíbles con viajes desde un día hasta experiencias de una semana. Nos encargamos de todo para tu comodidad.</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <TripCard title="Chicama" image={chicama} />
        <TripCard title="Bermejo" image={bermejo} />
        <TripCard title="Puerto Viejo" image={puertoViejo} />
      </div>
    </div>
  )
}

function TripCard({ title, image }: Readonly<{ title: string; image: string }>) {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-ocean-200 dark:border-ocean-700 bg-white/90 dark:bg-ocean-900/90 backdrop-blur-sm shadow-wave hover:shadow-xl transition-all duration-300">
      <div className="h-44 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    </div>
  )
}

