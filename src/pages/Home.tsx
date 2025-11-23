import Hero from '../components/Hero'
import AnimatedSection from '../components/AnimatedSection'
import { useTranslation } from 'react-i18next'
import banner1 from '../assets/banner1.jpg'
import banner3 from '../assets/banner3.jpg'
import grupales from '../assets/grupales.jpg'
import personalizada from '../assets/personalizada-scaled.jpg'
import surftripBermejo from '../assets/surftrip-bermejo.jpg'
import PhotoGrid from '../components/PhotoGrid'
import ImageCarousel from '../components/ImageCarousel'
import { Link } from 'react-router-dom'
import galeria16 from '../assets/galeria-sesion-16.jpg'
import galeria17 from '../assets/galeria-sesion-17.jpg'
import galeria18 from '../assets/galeria-sesion-18.jpg'
import galeria20 from '../assets/galeria-sesion-20.jpg'
import galeria21 from '../assets/galeria-sesion-21.jpeg'
import galeria22 from '../assets/galeria-sesion-22.jpg'

const homeGalleryImages = [
  galeria16,
  galeria17,
  galeria18,
  galeria20,
  galeria21,
  galeria22
]

export default function Home() {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-20">
      <Hero />

      <AnimatedSection animation="fade-up" className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-5xl font-surf mb-8 text-center text-ocean-800 dark:text-wave-light">
          {t('home.title')}
        </h2>
        <div className="prose prose-lg dark:prose-invert max-w-none font-heading text-ocean-800 dark:text-ocean-100">
          <p className="text-lg md:text-xl leading-relaxed">{t('home.description1')}</p>
          <p className="text-lg md:text-xl leading-relaxed">{t('home.description2')}</p>
          <p className="text-lg md:text-xl leading-relaxed">{t('home.description3')}</p>
        </div>
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={200} className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-5xl font-surf mb-10 text-center text-ocean-800 dark:text-wave-light">
          {t('home.surfClasses')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SurfCard 
            title={t('home.grupales')} 
            image={grupales} 
            description={t('home.grupalesDesc')} 
            delay={0}
          />
          <SurfCard 
            title={t('home.personalizadas')} 
            image={personalizada} 
            description={t('home.personalizadasDesc')} 
            delay={100}
          />
          <SurfCard 
            title={t('home.surftrips')} 
            image={surftripBermejo} 
            description={t('home.surftripsDesc')} 
            delay={200}
          />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <PriceCard 
            title={t('home.grupales')}
            description={t('home.grupalesDesc')}
            prices={[t('home.precios.grupales'), t('home.precios.grupalesPack')]}
          />
          <PriceCard 
            title={`${t('nav.classes')} ${t('home.personalizadas')}`}
            description={t('home.personalizadasDesc')}
            prices={[t('home.precios.privadas'), t('home.precios.privadasPack')]}
          />
          <PriceCard 
            title={t('home.coaching')}
            description={t('home.coachingDesc')}
            prices={[t('home.precios.coaching')]}
          />
          <PriceCard 
            title={t('home.tandem')}
            description={t('home.tandemDesc')}
            prices={[t('home.precios.tandem'), t('home.precios.tandemPack')]}
          />
        </div>
      </AnimatedSection>

      <AnimatedSection animation="slide-left" delay={100} className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-5xl font-surf mb-10 text-center text-ocean-800 dark:text-wave-light">
          {t('home.surfskateTitle')}
        </h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="prose prose-lg dark:prose-invert font-heading text-ocean-800 dark:text-ocean-100">
            <p className="text-lg md:text-xl leading-relaxed">{t('home.surfskateDesc')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="/src/assets/class-surfskate-1.jpg" alt="Surfskate 1" className="rounded-2xl shadow-wave hover:shadow-xl transition-all duration-300 transform hover:scale-105" />
            <img src="/src/assets/class-surfskate-2.jpg" alt="Surfskate 2" className="rounded-2xl shadow-wave hover:shadow-xl transition-all duration-300 transform hover:scale-105" />
            <img src="/src/assets/class-surfskate-3.jpg" alt="Surfskate 3" className="rounded-2xl shadow-wave hover:shadow-xl transition-all duration-300 transform hover:scale-105" />
            <img src="/src/assets/class-surfskate-4.jpeg" alt="Surfskate 4" className="rounded-2xl shadow-wave hover:shadow-xl transition-all duration-300 transform hover:scale-105" />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection animation="slide-right" delay={100} className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-5xl font-surf mb-10 text-center text-ocean-800 dark:text-wave-light">
          {t('home.surftripsTitle')}
        </h2>
        <div className="grid md:grid-cols-2 gap-10 items-start mb-10">
          <div className="order-2 md:order-1">
            <p className="text-lg md:text-xl mb-8 font-heading leading-relaxed text-ocean-800 dark:text-ocean-100">{t('home.surftripsDesc')}</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
                <img src="/src/assets/surftrip-chicama.jpg" alt="Chicama" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
                  <img src="/src/assets/surftrip-bermejo.jpg" alt="Bermejo" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
                  <img src="/src/assets/surftrip-puerto-viejo.jpg" alt="Puerto Viejo" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 bg-gradient-to-br from-brand to-ocean-600 dark:from-ocean-700 dark:to-ocean-900 rounded-3xl p-8 md:p-10 shadow-xl border-2 border-brand-light/30 dark:border-ocean-600">
            <h3 className="text-2xl md:text-3xl font-surf text-white mb-6 drop-shadow-lg">Destinos Populares</h3>
            <div className="space-y-4">
              <DestinationItem text={t('home.chicama')} />
              <DestinationItem text={t('home.bermejo')} />
              <DestinationItem text={t('home.puertoViejo')} />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection animation="zoom-in" delay={100} className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-3xl md:text-5xl font-surf mb-10 text-center text-ocean-800 dark:text-wave-light">
          {t('home.galeriaTitle')}
        </h2>
        <p className="text-lg md:text-xl mb-10 text-center max-w-3xl mx-auto font-heading text-ocean-800 dark:text-ocean-100">
          {t('home.galeriaDesc')}
        </p>
        
        <div className="mb-10">
          <ImageCarousel 
            images={[banner1, banner3]} 
            className="mb-10"
            autoPlay={true}
            interval={5000}
          />
        </div>

        <PhotoGrid 
          images={homeGalleryImages} 
          columns={3}
          gap="gap-6"
          className="mb-10"
        />

        <div className="text-center">
          <Link 
            to="/galeria" 
            className="inline-flex items-center px-8 py-4 bg-sunset hover:bg-sunset-dark text-white font-surf text-lg rounded-full shadow-sunset hover:shadow-[0_0_30px_rgba(255,107,53,0.6)] transition-all duration-300 transform hover:scale-110"
          >
            {t('home.verGaleria')}
          </Link>
        </div>
      </AnimatedSection>
    </div>
  )
}

function SurfCard({ title, image, description, delay }: Readonly<{ title: string; image: string; description: string; delay: number }>) {
  return (
    <div 
      className="surf-card group rounded-2xl overflow-hidden border-2 border-ocean-200 dark:border-ocean-600 bg-white dark:bg-ocean-800 shadow-wave"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-52 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl md:text-2xl font-surf mb-2 text-ocean-800 dark:text-wave-light">{title}</h3>
        <p className="text-base font-heading text-ocean-700 dark:text-ocean-200">{description}</p>
      </div>
    </div>
  )
}

function PriceCard({ title, description, prices }: Readonly<{ title: string; description: string; prices: string[] }>) {
  return (
    <div className="bg-gradient-to-br from-brand to-ocean-600 dark:from-ocean-700 dark:to-ocean-900 rounded-3xl p-6 shadow-wave hover:shadow-neon transition-all duration-300">
      <h3 className="text-xl md:text-2xl font-surf text-white mb-4">
        {title}
      </h3>
      <p className="text-white/90 font-heading mb-6 leading-relaxed">
        {description}
      </p>
      <div className="space-y-2">
        {prices.map((price, index) => (
          <div 
            key={index}
            className="bg-white/20 dark:bg-ocean-800/60 rounded-xl p-3 backdrop-blur-sm"
          >
            <span className="text-white font-heading font-semibold">
              {price}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DestinationItem({ text }: Readonly<{ text: string }>) {
  return (
    <div className="bg-white/20 dark:bg-ocean-800/60 rounded-xl p-4 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-ocean-700/70 transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between">
        <span className="text-white font-heading font-medium group-hover:text-white transition-colors">
          {text}
        </span>
        <svg 
          className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" 
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

