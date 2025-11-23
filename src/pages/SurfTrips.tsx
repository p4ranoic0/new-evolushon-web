import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, MapPin, Clock, Check, X, Backpack } from 'lucide-react';
import puntaHermosa from '../assets/surftrip-puerto-viejo.jpg';
import puertoViejo from '../assets/surftrip-puerto-viejo.jpg';
import bermejo from '../assets/surftrip-bermejo.jpg';

export default function SurfTrips() {
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
  const [showDetails, setShowDetails] = useState(false);

  return (
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

        {/* Botón minimalista para expandir detalles */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-ocean-50 dark:hover:bg-ocean-800/50 transition-all duration-300 group/btn"
          aria-label={showDetails ? t('surftrips.ocultarDetalles') : t('surftrips.verDetalles')}
        >
          <ChevronDown className={`w-6 h-6 text-ocean-400 dark:text-ocean-500 group-hover/btn:text-brand dark:group-hover/btn:text-brand-light transition-all duration-300 ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        {/* Detalles expandibles */}
        <div className={`overflow-hidden transition-all duration-300 ${showDetails ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-6 pt-4">
            {/* Incluye */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">{t('surftrips.includes')}</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {includes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full flex-shrink-0" />
                    <span className="text-sm font-heading text-ocean-800 dark:text-ocean-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* No incluye */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">{t('surftrips.notIncludes')}</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {notIncludes.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-red-600 dark:bg-red-400 rounded-full flex-shrink-0" />
                    <span className="text-sm font-heading text-ocean-800 dark:text-ocean-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cosas necesarias */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Backpack className="w-5 h-5 text-brand dark:text-brand-light" />
                <h4 className="text-sm uppercase tracking-wider text-ocean-600 dark:text-ocean-300 font-heading font-semibold">{t('surftrips.necessary')}</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {necessary.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-ocean-50 dark:bg-ocean-800/50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-brand dark:bg-brand-light rounded-full flex-shrink-0" />
                    <span className="text-sm font-heading text-ocean-800 dark:text-ocean-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

