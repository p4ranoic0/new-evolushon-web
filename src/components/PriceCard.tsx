interface PriceCardProps {
  title: string
  description: string
  prices: string[]
}

export default function PriceCard({ title, description, prices }: PriceCardProps) {
  return (
    <div className="bg-gradient-to-br from-brand to-wave-dark dark:from-ocean-700 dark:to-ocean-900 rounded-3xl p-6 shadow-wave hover:shadow-neon transition-all duration-300">
      <h3 className="text-xl md:text-2xl font-surf text-white dark:text-foam mb-4">
        {title}
      </h3>
      <p className="text-brand-light dark:text-ocean-200 font-heading mb-6 leading-relaxed">
        {description}
      </p>
      <div className="space-y-2">
        {prices.map((price, index) => (
          <div 
            key={index}
            className="bg-white/10 dark:bg-ocean-800/50 rounded-xl p-3 backdrop-blur-sm"
          >
            <span className="text-white dark:text-foam font-heading font-semibold">
              {price}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}