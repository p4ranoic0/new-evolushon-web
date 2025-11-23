import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { X, Users, User, Target, Baby, Info } from 'lucide-react';
import grupales from '../assets/grupales.jpg'
import personalizada from '../assets/personalizada-scaled.jpg'
import coaching from '../assets/coaching-card.jpeg'
import ImageCarousel from '../components/ImageCarousel';

const surfActionImages = [
  '/src/assets/IMG_0260-scaled.jpg',
  '/src/assets/IMG_1863-scaled.jpg',
  '/src/assets/IMG_1868-scaled.jpg',
  '/src/assets/IMG_1869-1-scaled.jpg'
];

export default function Surf() {
  const { t } = useTranslation();
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-surf text-ocean-800 dark:text-brand-light mb-6">
          {t('surf.title')}
        </h1>
        <p className="text-lg text-ocean-700 dark:text-ocean-200 max-w-3xl mx-auto mb-8 font-heading leading-relaxed">
          {t('surf.subtitle')}
        </p>
        
        {/* Action Carousel */}
        <div className="max-w-4xl mx-auto">
          <ImageCarousel 
            images={surfActionImages} 
            className="mb-8"
            autoPlay={true}
            interval={4000}
          />
        </div>
      </motion.div>

      {/* Main Classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-3xl font-surf text-center text-ocean-800 dark:text-brand-light mb-12">
          {t('surf.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ClassCard 
            icon={<Users className="w-8 h-8" />}
            title={t('surf.grupales')} 
            image={grupales} 
            price="S/ 120" 
            packages={[
              { classes: "4 Clases", price: "S/ 400" },
              { classes: "8 Clases", price: "S/ 720" },
              { classes: "12 Clases", price: "S/ 1,020" }
            ]} 
            description={t('surf.grupalesDesc')} 
          />
          <ClassCard 
            icon={<User className="w-8 h-8" />}
            title={t('surf.privadas')} 
            image={personalizada} 
            price="S/ 150" 
            packages={[
              { classes: "4 Clases", price: "S/ 520" },
              { classes: "8 Clases", price: "S/ 900" },
              { classes: "12 Clases", price: "S/ 1,200" }
            ]} 
            description={t('surf.privadasDesc')} 
          />
        </div>
      </motion.div>

      {/* Specialized Programs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <SpecialCard
          icon={<Target className="w-8 h-8" />}
          title={t('surf.coaching')}
          image={coaching}
          description={t('surf.coachingDesc')}
          features={t('surf.coachingFeatures', { returnObjects: true }) as string[]}
        />
        
        <SpecialCard
          icon={<Baby className="w-8 h-8" />}
          title={t('surf.tandem')}
          image="/src/assets/minigroms-e1732732357425.jpeg"
          description={t('surf.tandemDesc')}
          price="S/ 150"
          packages={[
            { classes: "4 Clases", price: "S/ 520" },
            { classes: "8 Clases", price: "S/ 900" },
            { classes: "12 Clases", price: "S/ 1,200" }
          ]}
        />
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-ocean-50 dark:bg-ocean-800 rounded-2xl p-8 border-2 border-ocean-200 dark:border-ocean-700"
      >
        <h3 className="text-2xl font-surf text-center text-ocean-800 dark:text-brand-light mb-8">
          {t('home.surfClasses')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand/10 dark:bg-brand-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏄‍♂️</span>
            </div>
            <h4 className="font-surf text-ocean-800 dark:text-brand-light mb-2">Instructores Certificados</h4>
            <p className="text-sm text-ocean-700 dark:text-ocean-200 font-heading">Profesionales con años de experiencia</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-brand/10 dark:bg-brand-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌊</span>
            </div>
            <h4 className="font-surf text-ocean-800 dark:text-brand-light mb-2">Mejores Playas</h4>
            <p className="text-sm text-ocean-700 dark:text-ocean-200 font-heading">Spots ideales para aprender</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-brand/10 dark:bg-brand-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📸</span>
            </div>
            <h4 className="font-surf text-ocean-800 dark:text-brand-light mb-2">Fotografía Incluida</h4>
            <p className="text-sm text-ocean-700 dark:text-ocean-200 font-heading">Capturamos tus mejores momentos</p>
          </div>
        </div>
      </motion.div>
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
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

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

      {/* Modal */}
      {showModal && (
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
                <p className="text-xs uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading mb-1">{t('surf.claseIndividual')}</p>
                <p className="text-4xl font-surf text-sunset dark:text-sunset-light">{price}</p>
              </div>
              
              {/* Paquetes */}
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">{t('surf.paquetesDisponibles')}</p>
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
        </div>
      )}
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
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

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

      {/* Modal */}
      {showModal && (
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
                  <p className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">{t('surf.queIncluye')}</p>
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
                      <p className="text-xs uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading mb-1">{t('surf.claseIndividual')}</p>
                      <p className="text-4xl font-surf text-sunset dark:text-sunset-light">{price}</p>
                    </div>
                  )}
                  {packages && (
                    <div className="space-y-3">
                      <p className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">{t('surf.paquetes')}</p>
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
        </div>
      )}
    </>
  );
}