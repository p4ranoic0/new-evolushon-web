interface SurfCardProps {
  title: string
  image: string
  description: string
  delay?: number
}

export default function SurfCard({ title, image, description, delay = 0 }: SurfCardProps) {
  return (
    <div 
      className="bg-white dark:bg-ocean-800 rounded-3xl overflow-hidden shadow-wave hover:shadow-neon transition-all duration-500 transform hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl md:text-2xl font-surf text-ocean-800 dark:text-wave-light mb-4">
          {title}
        </h3>
        <p className="text-ocean-700 dark:text-ocean-200 font-heading leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}