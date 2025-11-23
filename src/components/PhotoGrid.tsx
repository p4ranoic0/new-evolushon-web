import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PhotoGridProps {
  images: string[];
  columns?: number;
  gap?: string;
  className?: string;
}

export default function PhotoGrid({ 
  images, 
  columns = 3, 
  gap = 'gap-4', 
  className = '' 
}: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedIndex(null);
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  const lightboxContent = selectedIndex !== null && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/95"
        onClick={() => setSelectedIndex(null)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Header con botón cerrar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-white font-heading">
            <span className="text-lg">{selectedIndex + 1}</span>
            <span className="text-white/60"> / {images.length}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 text-white"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Imagen principal */}
        <div className="flex items-center justify-center h-full p-4 md:p-8">
          <motion.div
            key={selectedIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative max-w-7xl max-h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex]}
              alt={`Imagen ${selectedIndex + 1}`}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 text-white group"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 text-white group"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}

        {/* Thumbnails en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(index);
                }}
                className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === selectedIndex 
                    ? 'ring-2 ring-brand scale-110 opacity-100' 
                    : 'opacity-50 hover:opacity-75'
                }`}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      <div className={`grid ${gridClasses[columns as keyof typeof gridClasses] || 'grid-cols-3'} ${gap} ${className}`}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-xl cursor-pointer group aspect-square"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={image}
              alt={`Imagen de galería ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {lightboxContent}
    </>
  );
}