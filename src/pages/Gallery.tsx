import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ImageCarousel from '../components/ImageCarousel';
import PhotoGrid from '../components/PhotoGrid';

const sessionImages = [
  '/src/assets/galeria-sesion-0.jpeg',
  '/src/assets/galeria-sesion-1.jpg',
  '/src/assets/galeria-sesion-2.jpg',
  '/src/assets/galeria-sesion-3.jpg',
  '/src/assets/galeria-sesion-4.jpg',
  '/src/assets/galeria-sesion-5.jpg',
  '/src/assets/galeria-sesion-6.jpg',
  '/src/assets/galeria-sesion-7.jpg',
  '/src/assets/galeria-sesion-8.jpg',
  '/src/assets/galeria-sesion-9.jpg',
  '/src/assets/galeria-sesion-10.jpg',
  '/src/assets/galeria-sesion-11.jpg'
];

const generalGalleryImages = [
  '/src/assets/galeria1.jpg',
  '/src/assets/galeria2.jpg',
  '/src/assets/galeria3.jpg',
  '/src/assets/galeria4.jpg',
  '/src/assets/galeria5.jpg',
  '/src/assets/galeria6.jpg',
  '/src/assets/galeria7.jpg',
  '/src/assets/galeria8.jpg',
  '/src/assets/galeria9.jpg',
  '/src/assets/galeria10.jpg',
  '/src/assets/galeria11.jpg',
  '/src/assets/galeria12.jpg',
  '/src/assets/galeria13.jpg',
  '/src/assets/galeria14.jpg',
  '/src/assets/galeria15.jpg',
  '/src/assets/galeria16.jpg'
];

export default function Gallery() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'sessions' | 'general'>('sessions');

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-surf text-ocean-800 dark:text-wave-light mb-4">
          {t('gallery.title')}
        </h1>
        <p className="text-lg text-ocean-700 dark:text-ocean-200 max-w-2xl mx-auto font-heading">
          {t('gallery.subtitle')}
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex rounded-lg border border-ocean-200 dark:border-ocean-700 p-1">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-2 rounded-md text-sm font-heading transition-all ${
              activeTab === 'sessions'
                ? 'bg-brand text-white shadow-sm'
                : 'text-ocean-700 dark:text-ocean-200 hover:text-brand dark:hover:text-wave-light'
            }`}
          >
            {t('gallery.sessionTab')}
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-brand text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('gallery.generalTab')}
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === 'sessions' && (
          <div className="space-y-12">
            {/* Featured Carousel */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('gallery.featuredCarousel')}
              </h2>
              <ImageCarousel 
                images={sessionImages.slice(0, 6)} 
                className="mb-8"
                autoPlay={true}
                interval={5000}
              />
            </div>

            {/* Photo Grid */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('gallery.allSessions')}
              </h3>
              <PhotoGrid 
                images={sessionImages} 
                columns={3}
                gap="gap-4"
              />
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-12">
            {/* Surf Lifestyle Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('gallery.surfLifestyle')}
              </h2>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <img
                    src="/src/assets/IMG_5920-scaled.jpeg"
                    alt="Surf lifestyle"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <img
                    src="/src/assets/IMG_6465-scaled.jpg"
                    alt="Beach life"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
                <div className="space-y-4">
                  <img
                    src="/src/assets/IMG_7189-scaled.jpg"
                    alt="Ocean view"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <img
                    src="/src/assets/IMG_5371-scaled.jpg"
                    alt="Surf equipment"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Complete Gallery Grid */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('gallery.completeCollection')}
              </h3>
              <PhotoGrid 
                images={generalGalleryImages} 
                columns={4}
                gap="gap-3"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mt-16 p-8 bg-brand dark:bg-ocean-700 rounded-2xl text-white shadow-wave"
      >
        <h3 className="text-2xl font-surf mb-4">{t('gallery.ctaTitle')}</h3>
        <p className="text-lg mb-6 opacity-90 font-heading">
          {t('gallery.ctaSubtitle')}
        </p>
        <a
          href="/contacto"
          className="inline-flex items-center px-6 py-3 bg-white text-brand font-surf rounded-lg hover:bg-ocean-50 transition-colors"
        >
          {t('gallery.ctaButton')}
        </a>
      </motion.div>
    </div>
  );
}

