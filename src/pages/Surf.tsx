import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
          Clases de Surf
        </h1>
        <p className="text-lg text-ocean-800 dark:text-ocean-100 max-w-3xl mx-auto mb-8 font-heading">
          Descubre el surf con instructores certificados en las mejores playas de Lima. Clases para todos los niveles.
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
          Tipos de Clases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Grupales" image={grupales} price="Clase S/ 120" packages={["4 Clases S/ 400", "8 Clases S/ 720", "12 Clases S/ 1020"]} description="Aprende a surfear en un ambiente dinámico y motivador." />
          <Card title="Privadas" image={personalizada} price="Clase S/ 150.00" packages={["4 Clases S/ 520", "8 Clases S/ 900", "12 Clases S/ 1'200.00"]} description="Atención exclusiva y personalizada para avanzar a tu ritmo." />
        </div>
      </motion.div>

      {/* Specialized Programs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="rounded-xl border-2 border-ocean-200 dark:border-ocean-700 bg-white dark:bg-ocean-900 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start gap-4">
            <img 
              src={coaching} 
              alt="Coaching" 
              className="w-20 h-20 object-cover rounded-lg shrink-0"
            />
            <div>
              <h3 className="text-xl font-surf text-ocean-800 dark:text-brand-light mb-2">Coaching</h3>
              <p className="text-ocean-800 dark:text-ocean-100 mb-4 font-heading">
                Perfecciona tu técnica con análisis personalizado
              </p>
              <ul className="text-sm text-ocean-700 dark:text-ocean-200 space-y-1 font-heading">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                  Análisis técnico personalizado
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                  Mejora de maniobras específicas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                  Videos y fotos de tu sesión
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-ocean-200 dark:border-ocean-700 bg-white dark:bg-ocean-900 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start gap-4">
            <img 
              src="/src/assets/minigroms-e1732732357425.jpeg" 
              alt="Tandem" 
              className="w-20 h-20 object-cover rounded-lg shrink-0"
            />
            <div>
              <h3 className="text-xl font-surf text-ocean-800 dark:text-brand-light mb-2">Tandem</h3>
              <p className="text-ocean-800 dark:text-ocean-100 mb-4 font-heading">
                Experiencia única compartida en la misma tabla
              </p>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-brand dark:text-brand-light">Clase S/ 150.00</div>
                <div className="text-sm text-ocean-700 dark:text-ocean-200 font-heading">
                  <p className="font-medium mb-1">Paquetes disponibles:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                      4 clases S/ 520
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                      8 clases S/ 900
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
                      12 clases S/ 1'200.00
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-ocean-50 dark:bg-ocean-800 rounded-2xl p-8 border-2 border-ocean-200 dark:border-ocean-700"
      >
        <h3 className="text-2xl font-surf text-center text-ocean-800 dark:text-brand-light mb-8">
          ¿Por qué elegir Evolushon?
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

function Card({ title, image, price, packages, description }: Readonly<{ title: string; image: string; price: string; packages: string[]; description: string }>) {
  return (
    <div className="group rounded-2xl overflow-hidden border-2 border-ocean-200 dark:border-ocean-700 bg-white dark:bg-ocean-900 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      <div className="h-56 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-surf text-ocean-800 dark:text-brand-light mb-3">{title}</h3>
        <p className="text-ocean-800 dark:text-ocean-100 mb-4 font-heading">{description}</p>
        <div className="space-y-3">
          <div className="text-xl font-bold text-brand dark:text-brand-light">{price}</div>
          <div className="text-sm text-ocean-700 dark:text-ocean-200 font-heading">
            <p className="font-semibold mb-2 text-ocean-800 dark:text-ocean-100">Paquetes disponibles:</p>
            <ul className="space-y-2">
              {packages.map((pkg) => (
                <li key={pkg} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand dark:bg-brand-light rounded-full"></span>
                  {pkg}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}