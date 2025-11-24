import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Users, User, Target, Info, X } from 'lucide-react'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import AnimatedSection from '../components/AnimatedSection'
import skate1 from '../assets/class-surfskate-1.jpg'
import skate2 from '../assets/class-surfskate-2.jpg'
import skate3 from '../assets/class-surfskate-3.jpg'
import skate4 from '../assets/class-surfskate-4.jpeg'

export default function SurfSkate() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-20 pb-16">
      <SEO 
        title="Clases de Surfskate"
        description="Aprende surfskate en Lima con instructores profesionales. Clases grupales, privadas y coaching para todos los niveles. Mejora tu técnica de surf en tierra."
        keywords="surfskate lima, clases surfskate, surfskate peru, surfskate lessons, surf training"
      />
      {/* Hero Section */}
      <AnimatedSection animation="fade-up" className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={skate1} 
            alt="Surfskate Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-surf mb-6 drop-shadow-2xl">
            {t('surfskate.title')}
          </h1>
          <p className="text-xl md:text-2xl font-heading leading-relaxed drop-shadow-lg">
            {t('surfskate.subtitle')}
          </p>
        </div>
      </AnimatedSection>

      {/* Qué es el Surfskate */}
      <AnimatedSection animation="fade-up" className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-5xl font-surf mb-8 text-center text-ocean-800 dark:text-wave-light">
          {t('surfskate.whatIs')}
        </h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="text-lg md:text-xl font-heading leading-relaxed text-ocean-800 dark:text-ocean-100">
              {t('surfskate.description1')}
            </p>
            <p className="text-lg md:text-xl font-heading leading-relaxed text-ocean-800 dark:text-ocean-100">
              {t('surfskate.description2')}
            </p>
          </div>
          <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={skate2} 
              alt="Surfskate técnica" 
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Beneficios */}
      <AnimatedSection animation="slide-left" delay={100} className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-5xl font-surf mb-10 text-center text-ocean-800 dark:text-wave-light">
          {t('surfskate.benefits')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <BenefitCard 
            icon="🏄‍♂️"
            title={t('surfskate.benefit1Title')}
            description={t('surfskate.benefit1Desc')}
          />
          <BenefitCard 
            icon="💪"
            title={t('surfskate.benefit2Title')}
            description={t('surfskate.benefit2Desc')}
          />
          <BenefitCard 
            icon="🔁"
            title={t('surfskate.benefit3Title')}
            description={t('surfskate.benefit3Desc')}
          />
          <BenefitCard 
            icon="🧠"
            title={t('surfskate.benefit4Title')}
            description={t('surfskate.benefit4Desc')}
          />
          <BenefitCard 
            icon="🌟"
            title={t('surfskate.benefit5Title')}
            description={t('surfskate.benefit5Desc')}
          />
          <BenefitCard 
            icon="🚀"
            title={t('surfskate.benefit6Title')}
            description={t('surfskate.benefit6Desc')}
          />
        </div>
      </AnimatedSection>

      {/* Clases Disponibles */}
      <AnimatedSection animation="fade-up" delay={100} className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-5xl font-surf mb-10 text-center text-ocean-800 dark:text-wave-light">
          {t('surfskate.classes')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ClassCard 
            icon={<Users className="w-8 h-8" />}
            title={t('surfskate.grupales')} 
            image={skate3} 
            price="S/ 80" 
            packages={[
              { classes: "4 Clases", price: "S/ 280" },
              { classes: "8 Clases", price: "S/ 520" },
              { classes: "12 Clases", price: "S/ 720" }
            ]} 
            description={t('surfskate.grupalesDesc')}
          />
          <ClassCard 
            icon={<User className="w-8 h-8" />}
            title={t('surfskate.privadas')} 
            image={skate2} 
            price="S/ 100" 
            packages={[
              { classes: "4 Clases", price: "S/ 360" },
              { classes: "8 Clases", price: "S/ 680" },
              { classes: "12 Clases", price: "S/ 960" }
            ]} 
            description={t('surfskate.privadasDesc')}
          />
          <ClassCard 
            icon={<Target className="w-8 h-8" />}
            title={t('surfskate.coaching')} 
            image={skate4} 
            price={t('surfskate.consultar')} 
            packages={[]} 
            description={t('surfskate.coachingDesc')}
          />
        </div>
      </AnimatedSection>

      {/* Galería */}
      <AnimatedSection animation="zoom-in" delay={100} className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-5xl font-surf mb-10 text-center text-ocean-800 dark:text-wave-light">
          {t('surfskate.gallery')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
            <img src={skate1} alt="Surfskate 1" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
            <img src={skate2} alt="Surfskate 2" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
            <img src={skate3} alt="Surfskate 3" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="aspect-square overflow-hidden rounded-xl shadow-lg">
            <img src={skate4} alt="Surfskate 4" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Final */}
      <AnimatedSection animation="fade-up" delay={100} className="mx-auto max-w-4xl px-4 text-center">
        <div className="bg-linear-to-br from-brand to-ocean-600 dark:from-ocean-700 dark:to-ocean-900 rounded-3xl p-10 md:p-16 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-surf text-white mb-6">
            {t('surfskate.ctaTitle')}
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-heading">
            {t('surfskate.ctaSubtitle')}
          </p>
          <a 
            href="https://wa.link/xrf1r8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-white text-brand hover:bg-ocean-50 font-surf text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            {t('surfskate.ctaButton')}
          </a>
        </div>
      </AnimatedSection>
    </div>
  )
}

function BenefitCard({ icon, title, description }: Readonly<{ icon: string; title: string; description: string }>) {
  return (
    <div className="group bg-white dark:bg-ocean-900 rounded-2xl p-6 border border-ocean-200 dark:border-ocean-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl md:text-2xl font-surf mb-3 text-ocean-800 dark:text-brand-light">
        {title}
      </h3>
      <p className="text-ocean-700 dark:text-ocean-200 font-heading leading-relaxed">
        {description}
      </p>
    </div>
  )
}

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
            aria-label={t('surf.cerrar')}
          >
            <X className="w-5 h-5 text-ocean-600 dark:text-ocean-300" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-ocean-700 dark:text-ocean-200 font-heading leading-relaxed">
            {description}
          </p>

          <div className="bg-sunset/10 dark:bg-sunset/20 border-l-4 border-sunset rounded-lg p-4">
            <p className="text-xs uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading mb-1">{t('surf.claseIndividual')}</p>
            <p className="text-4xl font-surf text-sunset dark:text-sunset-light">{price}</p>
          </div>
          
          {packages.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">{t('surf.paquetesDisponibles')}</p>
              <div className="space-y-3">
                {packages.map((pkg, index) => (
                  <div key={`${pkg.classes}-${index}`} className="flex items-center justify-between p-4 bg-ocean-50 dark:bg-ocean-800/50 rounded-xl border border-ocean-200 dark:border-ocean-700 hover:border-brand dark:hover:border-brand-light transition-colors">
                    <span className="text-base font-heading font-semibold text-ocean-800 dark:text-ocean-100">{pkg.classes}</span>
                    <span className="text-2xl font-surf text-brand dark:text-brand-light">{pkg.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );

  return (
    <>
      <div className="group rounded-2xl border border-ocean-200 dark:border-ocean-700 bg-white dark:bg-ocean-900 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative h-64 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white">
              {icon}
            </div>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-surf text-ocean-800 dark:text-brand-light">{title}</h3>
            <button
              onClick={() => setShowModal(true)}
              className="shrink-0 p-2.5 rounded-full bg-brand/10 dark:bg-brand-light/10 hover:bg-brand hover:dark:bg-brand-light text-brand dark:text-brand-light hover:text-white transition-all duration-300 transform hover:scale-110"
              aria-label="Ver información y precios"
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

