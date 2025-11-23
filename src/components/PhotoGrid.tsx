import { useState } from 'react';
import { motion } from 'framer-motion';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  };

  return (
    <>
      <div className={`grid ${gridClasses[columns as keyof typeof gridClasses] || 'grid-cols-3'} ${gap} ${className}`}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-xl cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </div>

      {/* Lightbox modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 z-10 rounded-full bg-white text-gray-900 p-2 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
          </motion.div>
        </div>
      )}
    </>
  );
}