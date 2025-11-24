import { motion } from 'framer-motion';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X as CloseIcon, MapPin, Clock, Check, X, Backpack, Info } from 'lucide-react';
import SEO from '../components/SEO';
import puntaHermosa from '../assets/surftrip-puerto-viejo.jpg';
import puertoViejo from '../assets/surftrip-puerto-viejo.jpg';
import bermejo from '../assets/surftrip-bermejo.jpg';

export default function SurfTrips() {
  const { t } = useTranslation();
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 space-y-12">
      <SEO 
        title="Surf Trips"
        description="Únete a nuestros surf trips a Punta Hermosa, Puerto Viejo y Bermejo. Aventuras de surf inolvidables con transporte, equipo y guías profesionales."
        keywords="surf trips peru, surf camps, viajes de surf, punta hermosa, puerto viejo, bermejo surf, surf adventure"
      />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-surf text-ocean-800 dark:text-brand-light mb-6">
          {t('surftrips.title')}
        </h1>
        <p className="text-lg text-ocean-700 dark:text-ocean-200 max-w-3xl mx-auto font-heading leading-relaxed">
          {t('surftrips.subtitle')}
        </p>
      </motion.div>

      {/* Trip Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 gap-8"
      >
        <TripCard
          title={t('surftrips.puntaHermosa')}
          subtitle={t('surftrips.fromLima1h')}
          duration={t('surftrips.duration')}
          schedule={{
            salida: "7:00 AM",
            llegada: `1:00 PM ${t('surftrips.approx')}`
          }}
          image={puntaHermosa}
          price="$60"
          minParticipants={2}
          includes={[
            t('surftrips.surfClass'),
            t('surftrips.surfboard'),
            t('surftrips.wetsuit'),
            t('surftrips.transport')
          ]}
          notIncludes={[
            t('surftrips.food'),
            t('surftrips.water')
          ]}
          necessary={[
            t('surftrips.swimwear'),
            t('surftrips.sunscreen'),
            t('surftrips.hat'),
            t('surftrips.sunglasses'),
            t('surftrips.water'),
            t('surftrips.snacks')
          ]}
        />

        <TripCard
          title={t('surftrips.puertoViejo')}
          subtitle={t('surftrips.fromLima1h30')}
          duration={t('surftrips.duration')}
          schedule={{
            salida: "6:00 AM",
            llegada: `3:00 PM ${t('surftrips.approx')}`
          }}
          image={puertoViejo}
          price="$70"
          minParticipants={2}
          includes={[
            t('surftrips.surfClass'),
            t('surftrips.surfboard'),
            t('surftrips.wetsuit'),
            t('surftrips.transport')
          ]}
          notIncludes={[
            t('surftrips.food'),
            t('surftrips.water')
          ]}
          necessary={[
            t('surftrips.swimwear'),
            t('surftrips.sunscreen'),
            t('surftrips.hat'),
            t('surftrips.sunglasses'),
            t('surftrips.water'),
            t('surftrips.snacks')
          ]}
        />

        <TripCard
          title={t('surftrips.bermejo')}
          subtitle={t('surftrips.fromLima4h')}
          duration={t('surftrips.durationCamping')}
          schedule={{
            salida: "3:00 AM",
            llegada: `${t('surftrips.diaSiguiente')} 8:00 PM ${t('surftrips.approx')}`
          }}
          image={bermejo}
          price="$160"
          minParticipants={3}
          includes={[
            t('surftrips.surfClass'),
            t('surftrips.surfboard'),
            t('surftrips.wetsuit'),
            t('surftrips.carpa'),
            t('surftrips.transport')
          ]}
          notIncludes={[
            t('surftrips.food'),
            t('surftrips.water'),
            t('surftrips.sleepingBag')
          ]}
          necessary={[
            t('surftrips.swimwear'),
            t('surftrips.sunscreen'),
            t('surftrips.hat'),
            t('surftrips.sunglasses'),
            t('surftrips.water'),
            t('surftrips.snacksComida'),
            t('surftrips.libros'),
            t('surftrips.sleepingBag'),
            t('surftrips.flashlight')
          ]}
        />
      </motion.div>
    </div>
  );
}

function TripCard({ 
  title, 
  subtitle, 
  duration, 
  schedule, 
  image, 
  price, 
  minParticipants,
  includes, 
  notIncludes, 
  necessary 
}: Readonly<{
  title: string;
  subtitle: string;
  duration: string;
  schedule: { salida: string; llegada: string };
  image: string;
  price: string;
  minParticipants: number;
  includes: string[];
  notIncludes: string[];
  necessary: string[];
}>) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  const modalContent = showModal && createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-ocean-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-ocean-200 dark:border-ocean-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal con imagen de fondo */}
        <div className="sticky top-0 z-10">
          <div className="relative h-32 overflow-hidden">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            <div className="absolute inset-0 flex items-center justify-between p-5">
              <div>
                <h3 className="text-2xl font-surf text-white drop-shadow-lg">{title}</h3>
                <p className="text-white/90 text-sm font-heading flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4" />
                  {subtitle}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
                aria-label="Cerrar"
              >
                <CloseIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-6">
          {/* Incluye */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-surf text-ocean-800 dark:text-brand-light">{t('surftrips.includes')}</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {includes.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-colors">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full shrink-0" />
                  <span className="text-sm font-heading text-ocean-800 dark:text-ocean-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* No incluye */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-lg font-surf text-ocean-800 dark:text-brand-light">{t('surftrips.notIncludes')}</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notIncludes.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 transition-colors">
                  <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full shrink-0" />
                  <span className="text-sm font-heading text-ocean-800 dark:text-ocean-100">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cosas necesarias */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-brand/10 dark:bg-brand-light/10 rounded-lg">
                <Backpack className="w-5 h-5 text-brand dark:text-brand-light" />
              </div>
              <h4 className="text-lg font-surf text-ocean-800 dark:text-brand-light">{t('surftrips.necessary')}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {necessary.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-ocean-50 dark:bg-ocean-800/50 rounded-xl border border-ocean-200 dark:border-ocean-700 hover:border-brand dark:hover:border-brand-light transition-colors">
                  <div className="w-2 h-2 bg-brand dark:bg-brand-light rounded-full shrink-0" />
                  <span className="text-sm font-heading text-ocean-800 dark:text-ocean-100">{item}</span>
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
        {/* Header con imagen */}
        <div className="relative h-56 md:h-64 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Info principal sobre la imagen */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-3xl font-surf text-white drop-shadow-lg mb-2">{title}</h3>
                <div className="flex items-center gap-4 text-white/90 text-sm font-heading">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{subtitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{duration}</span>
                  </div>
                </div>
              </div>
              
              {/* Precio destacado */}
              <div className="bg-sunset/95 backdrop-blur-sm px-5 py-3 rounded-xl border-2 border-white/20">
                <p className="text-xs uppercase tracking-wider text-white/80 font-heading font-semibold">{t('surftrips.porPersona')}</p>
                <p className="text-3xl font-surf text-white">{price}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Horarios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ocean-50 dark:bg-ocean-800/50 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading mb-1">{t('surftrips.salidaDeLima')}</p>
              <p className="text-lg font-surf text-ocean-800 dark:text-ocean-100">{schedule.salida}</p>
            </div>
            <div className="bg-ocean-50 dark:bg-ocean-800/50 rounded-lg p-3">
              <p className="text-xs uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading mb-1">{t('surftrips.llegadaALima')}</p>
              <p className="text-lg font-surf text-ocean-800 dark:text-ocean-100">{schedule.llegada}</p>
            </div>
          </div>

          {/* Nota de participantes mínimos */}
          <div className="bg-brand/5 dark:bg-brand-light/5 border-l-4 border-brand dark:border-brand-light rounded-lg p-3">
            <p className="text-sm font-heading text-ocean-700 dark:text-ocean-200">
              {t('surftrips.minParticipants')} <span className="font-bold text-brand dark:text-brand-light">{minParticipants} {t('surftrips.participantes')}</span> {t('surftrips.paraElTrip')}
            </p>
          </div>

          {/* Botón para abrir modal */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark dark:bg-brand-light dark:hover:bg-brand text-white rounded-xl font-heading font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            aria-label={t('surftrips.verDetalles')}
          >
            <Info className="w-5 h-5" />
            <span>{t('surftrips.verDetalles')}</span>
          </button>
        </div>
      </div>

      {modalContent}
    </>
  );
}

