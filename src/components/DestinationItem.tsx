interface DestinationItemProps {
  text: string
}

export default function DestinationItem({ text }: DestinationItemProps) {
  return (
    <div className="bg-white/10 dark:bg-ocean-800/50 rounded-xl p-4 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-ocean-700/70 transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between">
        <span className="text-white dark:text-foam font-heading font-medium group-hover:text-brand-light dark:group-hover:text-wave-light transition-colors">
          {text}
        </span>
        <svg 
          className="w-5 h-5 text-brand-light dark:text-wave-light group-hover:translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}