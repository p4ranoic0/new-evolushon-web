import Hero from '../components/Hero'
import AnimatedSection from '../components/AnimatedSection'
import SEO from '../components/SEO'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Users, User, Target, Baby, Info } from 'lucide-react'
import banner1 from '../assets/banner1.jpg'
import banner3 from '../assets/banner3.jpg'
import grupales from '../assets/grupales.jpg'
import personalizada from '../assets/personalizada-scaled.jpg'
import coaching from '../assets/coaching-card.jpeg'
import PhotoGrid from '../components/PhotoGrid'
import ImageCarousel from '../components/ImageCarousel'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import galeria16 from '../assets/galeria-sesion-16.jpg'
import galeria17 from '../assets/galeria-sesion-17.jpg'
import galeria18 from '../assets/galeria-sesion-18.jpg'
import galeria20 from '../assets/galeria-sesion-20.jpg'
import galeria21 from '../assets/galeria-sesion-21.jpeg'
import galeria22 from '../assets/galeria-sesion-22.jpg'
import minigroms from '../assets/minigroms-e1732732357425.jpeg'
import surfskate1 from '../assets/class-surfskate-1.jpg'
import surfskate2 from '../assets/class-surfskate-2.jpg'
import surfskate3 from '../assets/class-surfskate-3.jpg'
import surfskate4 from '../assets/class-surfskate-4.jpeg'
import surftripChicama from '../assets/surftrip-chicama.jpg'
import surftripBermejo from '../assets/surftrip-bermejo.jpg'
import surftripPuertoViejo from '../assets/surftrip-puerto-viejo.jpg'

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
      <SEO 
        title="Inicio"
        description="Clases de surf profesionales en Lima, Perú. Aprende surf, surfskate y únete a nuestros surf trips. Instructores certificados, equipos de calidad y experiencia garantizada."
        keywords="surf lima, clases de surf, surfskate lima, surf trips peru, escuela de surf lima, surf lessons, aprender surf"
      />
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
        

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <ClassCard 
            icon={<Users className="w-8 h-8" />}
            title="Grupales" 
            image={grupales} 
            price="S/ 120" 
            packages={[
              { classes: "4 Clases", price: "S/ 400" },
              { classes: "8 Clases", price: "S/ 720" },
              { classes: "12 Clases", price: "S/ 1,020" }
            ]} 
            description="Aprende a surfear en un ambiente dinámico y motivador. Comparte la experiencia, mejora tus habilidades y diviértete junto a otros apasionados del mar." 
          />
          <ClassCard 
            icon={<User className="w-8 h-8" />}
            title="Privadas" 
            image={personalizada} 
            price="S/ 150" 
            packages={[
              { classes: "4 Clases", price: "S/ 520" },
              { classes: "8 Clases", price: "S/ 900" },
              { classes: "12 Clases", price: "S/ 1,200" }
            ]} 
            description="Una clase solo para ti, enfocada en tus necesidades y objetivos. Avanza a tu ritmo con atención exclusiva y personalizada." 
          />
          <SpecialCard
            icon={<Target className="w-8 h-8" />}
            title="Coaching"
            image={coaching}
            description="Lleva tu surf al siguiente nivel con sesiones enfocadas en perfeccionar tu técnica. Trabajamos contigo para alcanzar tus metas dentro y fuera del agua."
            features={[
              "Clases de surf",
              "Clases de surfskate",
              "Videoanálisis",
              "Programa personalizado"
            ]}
          />
          <SpecialCard
            icon={<Baby className="w-8 h-8" />}
            title="Tandem"
            image={minigroms}
            description="Clases de surf diseñadas para los más pequeños, donde se aprende en pareja con un instructor. ¡Una experiencia divertida y segura para que los niños se inicien en el mar!"
            price="S/ 150"
            packages={[
              { classes: "4 Clases", price: "S/ 520" },
              { classes: "8 Clases", price: "S/ 900" },
              { classes: "12 Clases", price: "S/ 1,200" }
            ]}
          />
        </div>

        <div className="mt-10 text-center">
          <Link 
            to="/clases/surf" 
            className="inline-flex items-center px-8 py-4 bg-brand hover:bg-brand-dark text-white font-surf text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('home.verMasOpciones')}
          </Link>
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
            <img src={surfskate1} alt="Surfskate 1" className="rounded-2xl shadow-wave hover:shadow-xl transition-all duration-300 transform hover:scale-105" />
            <img src={surfskate2} alt="Surfskate 2" className="rounded-2xl shadow-wave hover:shadow-xl transition-all duration-300 transform hover:scale-105" />
            <img src={surfskate3} alt="Surfskate 3" className="rounded-2xl shadow-wave hover:shadow-xl transition-all duration-300 transform hover:scale-105" />
            <img src={surfskate4} alt="Surfskate 4" className="rounded-2xl shadow-wave hover:shadow-xl transition-all duration-300 transform hover:scale-105" />
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
                <img src={surftripChicama} alt="Chicama" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
                  <img src={surftripBermejo} alt="Bermejo" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
                  <img src={surftripPuertoViejo} alt="Puerto Viejo" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
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

// Componente para cards de clases principales con modal de precios
function ClassCard({ icon, title, image, price, packages, description }: Readonly<{ 
  icon: React.ReactNode;
  title: string; 
  image: string; 
  price: string; 
  packages: Array<{ classes: string; price: string }>; 
  description: string;
}>) {
  const [showModal, setShowModal] = useState(false);

  const modalContent = showModal && createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-ocean-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-ocean-200 dark:border-ocean-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-white dark:bg-ocean-900 border-b border-ocean-200 dark:border-ocean-700 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 dark:bg-brand-light/10 rounded-lg text-brand dark:text-brand-light">
                  {icon}
                </div>
                <h3 className="text-2xl font-surf text-ocean-800 dark:text-brand-light">{title}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-ocean-100 dark:hover:bg-ocean-800 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-ocean-600 dark:text-ocean-300" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              <p className="text-ocean-700 dark:text-ocean-200 font-heading leading-relaxed">
                {description}
              </p>

              {/* Precio individual */}
              <div className="bg-sunset/10 dark:bg-sunset/20 border-l-4 border-sunset rounded-lg p-4">
                <p className="text-xs uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading mb-1">Clase individual</p>
                <p className="text-4xl font-surf text-sunset dark:text-sunset-light">{price}</p>
              </div>
              
              {/* Paquetes */}
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">Paquetes disponibles</p>
                <div className="space-y-3">
                  {packages.map((pkg, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-ocean-50 dark:bg-ocean-800/50 rounded-xl border border-ocean-200 dark:border-ocean-700 hover:border-brand dark:hover:border-brand-light transition-colors">
                      <span className="text-base font-heading font-semibold text-ocean-800 dark:text-ocean-100">{pkg.classes}</span>
                      <span className="text-2xl font-surf text-brand dark:text-brand-light">{pkg.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>,
    document.body
  );

  return (
    <>
      <div className="group rounded-2xl border border-ocean-200 dark:border-ocean-700 bg-white dark:bg-ocean-900 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Imagen más grande */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white">
              {icon}
            </div>
          </div>
        </div>
        
        {/* Contenido con título y botón en la misma línea */}
        <div className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl md:text-3xl font-surf text-ocean-800 dark:text-brand-light">{title}</h3>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 p-2.5 rounded-full bg-brand/10 dark:bg-brand-light/10 hover:bg-brand hover:dark:bg-brand-light text-brand dark:text-brand-light hover:text-white transition-all duration-300 transform hover:scale-110"
              aria-label="Ver información y precios"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-ocean-700 dark:text-ocean-200 font-heading text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {modalContent}
    </>
  );
}

// Componente para programas especiales con modal
function SpecialCard({ icon, title, image, description, features, price, packages }: Readonly<{
  icon: React.ReactNode;
  title: string;
  image: string;
  description: string;
  features?: string[];
  price?: string;
  packages?: Array<{ classes: string; price: string }>;
}>) {
  const [showModal, setShowModal] = useState(false);

  const modalContent = showModal && createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-ocean-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-ocean-200 dark:border-ocean-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="sticky top-0 bg-white dark:bg-ocean-900 border-b border-ocean-200 dark:border-ocean-700 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 dark:bg-brand-light/10 rounded-lg text-brand dark:text-brand-light">
                  {icon}
                </div>
                <h3 className="text-2xl font-surf text-ocean-800 dark:text-brand-light">{title}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-ocean-100 dark:hover:bg-ocean-800 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-ocean-600 dark:text-ocean-300" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              <p className="text-ocean-700 dark:text-ocean-200 font-heading leading-relaxed">
                {description}
              </p>

              {features ? (
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">Qué incluye</p>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-ocean-50 dark:bg-ocean-800/50 rounded-lg">
                        <div className="w-2 h-2 bg-sunset rounded-full flex-shrink-0" />
                        <span className="text-sm font-heading text-ocean-800 dark:text-ocean-100">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {price && (
                    <div className="bg-sunset/10 dark:bg-sunset/20 border-l-4 border-sunset rounded-lg p-4">
                      <p className="text-xs uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading mb-1">Clase individual</p>
                      <p className="text-4xl font-surf text-sunset dark:text-sunset-light">{price}</p>
                    </div>
                  )}
                  {packages && (
                    <div className="space-y-3">
                      <p className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">Paquetes</p>
                      <div className="space-y-3">
                        {packages.map((pkg, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-ocean-50 dark:bg-ocean-800/50 rounded-xl border border-ocean-200 dark:border-ocean-700 hover:border-brand dark:hover:border-brand-light transition-colors">
                            <span className="text-base font-heading font-semibold text-ocean-800 dark:text-ocean-100">{pkg.classes}</span>
                            <span className="text-2xl font-surf text-brand dark:text-brand-light">{pkg.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>,
    document.body
  );

  return (
    <>
      <div className="rounded-2xl border border-ocean-200 dark:border-ocean-700 bg-white dark:bg-ocean-900 overflow-hidden shadow-lg hover:shadow-xl transition-all">
        {/* Imagen más grande */}
        <div className="relative h-56 md:h-64 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white">
              {icon}
            </div>
          </div>
        </div>
        
        {/* Contenido con título y botón en la misma línea */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl md:text-2xl font-surf text-ocean-800 dark:text-brand-light">{title}</h3>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 p-2.5 rounded-full bg-brand/10 dark:bg-brand-light/10 hover:bg-brand hover:dark:bg-brand-light text-brand dark:text-brand-light hover:text-white transition-all duration-300 transform hover:scale-110"
              aria-label="Ver información"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-ocean-700 dark:text-ocean-200 font-heading text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {modalContent}
    </>
  );
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

