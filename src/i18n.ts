import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  es: {
    translation: {
      nav: {
        home: "Inicio",
        about: "Nosotros",
        classes: "Clases",
        surf: "Surf",
        surfskate: "SurfSkate",
        surftrips: "Surftrips",
        gallery: "Galería",
        contact: "Contacto",
        menu: "Menú",
      },
      hero: {
        title: "Evolushon",
        subtitle:
          "Conexión entre cuerpo, mente y mar. Clases seguras y personalizadas en varios idiomas.",
        cta: "Reserva ahora",
      },
      home: {
        title: "Evolushon Surf Experience",
        description1:
          "Nuestra escuela de surf va más allá de las olas: es un viaje de conexión, libertad y bienestar. Para nosotros, el surf no es solo un deporte, sino un estilo de vida que transforma cuerpo y mente. Más que enseñarte a surfear, queremos que vivas la serenidad del océano y descubras los beneficios únicos que este deporte tiene para ti.",
        description2:
          "En Evolushon Surf Experience ofrecemos un ambiente divertido y seguro, con instructores calificados y llenos de buena energía. Te brindamos la confianza necesaria para que conectes con el mar, sin importar tu nivel o si deseas superar tus temores. Entendemos que cada persona es única y trabajamos para ofrecerte una experiencia inolvidable y llena de emociones.",
        description3:
          "Además, damos clases en español, inglés, francés y alemán. ¡Únete a nosotros y vive la emocionante conexión entre cuerpo, mente y mar!",
        surfClasses: "Clases de Surf",
        grupales: "Grupales",
        grupalesDesc:
          "Aprende a surfear en un ambiente dinámico y motivador. Comparte la experiencia, mejora tus habilidades y diviértete junto a otros apasionados del mar.",
        personalizadas: "Personalizadas",
        personalizadasDesc:
          "Una clase solo para ti, enfocada en tus necesidades y objetivos. Avanza a tu ritmo con atención exclusiva y personalizada.",
        surftrips: "Surftrips",
        precios: {
          grupales: "Clase S/ 120",
          grupalesPack:
            "Paquetes: 4 clases S/ 400; 8 clases S/ 720; 12 clases S/ 1020",
          privadas: "Clase S/ 150.00",
          privadasPack:
            "Paquetes: 4 clases S/ 520; 8 clases S/ 900; 12 clases S/ 1'200.00",
          coaching:
            "Incluye: Clases de surf, Clases de surfskate, Videoanálisis y Programa personalizado.",
          tandem: "Clase S/ 150.00",
          tandemPack:
            "Paquetes: 4 clases S/ 520; 8 clases S/ 900; 12 clases S/ 1'200.00",
        },
        coaching: "Coaching",
        coachingDesc:
          "Lleva tu surf al siguiente nivel con sesiones enfocadas en perfeccionar tu técnica. Trabajamos contigo para alcanzar tus metas dentro y fuera del agua.",
        tandem: "Tandem",
        tandemDesc:
          "Clases diseñadas para los más pequeños, donde se aprende en pareja con un instructor. ¡Una experiencia divertida y segura para iniciarse en el mar!",
        surfskateTitle: "Clases de Surfskate",
        surfskateDesc:
          "El surfskate es ideal para mejorar la técnica de surf porque simula el movimiento de las olas, ayudando a perfeccionar el control, el equilibrio y la coordinación. Es una excelente forma de entrenar fuera del agua, permitiendo practicar giros y maniobras con muchas repeticiones, además de desarrollar fuerza y agilidad. ¡Diversión y entrenamiento en un solo deporte!",
        surftripsTitle: "Surftrips",
        surftripsDesc:
          "Explora nuevas olas y paisajes increíbles — desde escapadas de un día hasta viajes de una semana. Destinos: Chicama, Bermejo, Puerto Viejo. Surftrips personalizados para eventos especiales.",
        destinos: "Destinos Populares",
        chicama: "Chicama - Olas más largas del mundo",
        bermejo: "Bermejo - Tubos perfectos",
        puertoViejo: "Puerto Viejo - Aventura y cultura",
        galeriaTitle: "Galería de Sesiones",
        galeriaDesc:
          "Descubre momentos únicos en el agua y la magia de nuestra comunidad surfera. ¡Cada imagen cuenta una historia junto al mar!",
        verGaleria: "Ver Galería Completa",
        verMasOpciones: "Ver más opciones",
      },
      surf: {
        title: "Clases de Surf",
        subtitle:
          "Nuestras clases se brindan en las playas de la costa verde y el sur chico, dependiendo de las condiciones del mar. Contamos con diferentes categorías para que elijas la que mejor se te acomode.",
        grupales: "Grupales",
        grupalesDesc:
          "Aprende a surfear en un ambiente dinámico y motivador. Comparte la experiencia, mejora tus habilidades y diviértete junto a otros apasionados del mar.",
        privadas: "Privadas",
        privadasDesc:
          "Una clase solo para ti, enfocada en tus necesidades y objetivos. Avanza a tu ritmo con atención exclusiva y personalizada.",
        coaching: "Coaching",
        coachingDesc:
          "Lleva tu surf al siguiente nivel con sesiones enfocadas en perfeccionar tu técnica. Trabajamos contigo para alcanzar tus metas dentro y fuera del agua.",
        coachingFeatures: [
          "Clases de surf",
          "Clases de surfskate",
          "Videoanálisis",
          "Programa personalizado",
        ],
        tandem: "Tandem",
        tandemDesc:
          "Clases de surf diseñadas para los más pequeños, donde se aprende en pareja con un instructor. ¡Una experiencia divertida y segura para que los niños se inicien en el mar!",
        claseIndividual: "Clase individual",
        paquetesDisponibles: "Paquetes disponibles",
        queIncluye: "Qué incluye",
        paquetes: "Paquetes",
        cerrar: "Cerrar",
      },
      surfskate: {
        title: "Surfskate",
        subtitle:
          "Entrena tu surf en tierra. Mejora tu técnica, equilibrio y estilo todo el año.",
        whatIs: "¿Qué es el Surfskate?",
        description1:
          "El surfskate es una modalidad de skate diseñada para replicar la sensación y los movimientos del surf en tierra. Con un sistema de ejes especial que permite giros más amplios y fluidos, el surfskate te ayuda a entrenar las mismas técnicas que usarías en el agua.",
        description2:
          "Es la herramienta perfecta para surfistas que quieren mantener su nivel durante todo el año, mejorar su estilo, ganar confianza y desarrollar músculo memoria para maniobras específicas.",
        benefits: "Beneficios del Surfskate",
        benefit1Title: "Técnica de Surf",
        benefit1Desc:
          "Simula el movimiento de las olas para perfeccionar giros, cutbacks y carving.",
        benefit2Title: "Fuerza y Equilibrio",
        benefit2Desc:
          "Desarrolla los músculos clave para el surf y mejora tu estabilidad sobre la tabla.",
        benefit3Title: "Repeticiones",
        benefit3Desc:
          "Practica maniobras una y otra vez sin depender de las condiciones del mar.",
        benefit4Title: "Músculo Memoria",
        benefit4Desc:
          "Crea patrones de movimiento que se traducen directamente al agua.",
        benefit5Title: "Todo el Año",
        benefit5Desc:
          "Mantén tu conexión con el surf independientemente de la temporada o condiciones.",
        benefit6Title: "Progresión Rápida",
        benefit6Desc:
          "Acelera tu aprendizaje con sesiones frecuentes y feedback inmediato.",
        classes: "Nuestras Clases",
        grupales: "Grupales",
        grupalesDesc:
          "Aprende surfskate en grupo, comparte la experiencia y progresa junto a otros entusiastas. Ideal para principiantes y nivel intermedio.",
        privadas: "Privadas",
        privadasDesc:
          "Clases personalizadas enfocadas en tus objetivos específicos. Perfecto para perfeccionar técnicas avanzadas o comenzar desde cero.",
        coaching: "Coaching",
        coachingDesc:
          "Entrenamiento especializado para surfistas que quieren llevar su nivel al máximo. Incluye videoanálisis y plan personalizado.",
        consultar: "Consultar",
        gallery: "En Acción",
        ctaTitle: "¿Listo para mejorar tu surf?",
        ctaSubtitle:
          "Únete a nuestras clases de surfskate y lleva tu técnica al siguiente nivel",
        ctaButton: "Reserva tu Clase",
      },
      surftrips: {
        title: "Surftrips",
        subtitle:
          "Explora nuevas olas y paisajes increíbles con nuestros surftrips. Desde escapadas de un día hasta aventuras de camping. Nos encargamos de todo para que solo te preocupes por surfear.",
        puntaHermosa: "Punta Hermosa / San Bartolo",
        puertoViejo: "Puerto Viejo",
        bermejo: "Bermejo",
        duration: "Un día",
        durationCamping: "2 Días (camping)",
        fromLima1h: "1h de Lima",
        fromLima1h30: "1h30 de Lima",
        fromLima4h: "4h de Lima",
        schedule: "Horario",
        salidaDeLima: "Salida de Lima",
        llegadaALima: "Llegada a Lima",
        approx: "aprox.",
        diaSiguiente: "Día siguiente",
        minParticipants: "Se requiere un mínimo de",
        participantes: "participantes",
        paraElTrip: "para el trip",
        verDetalles: "Ver detalles completos",
        ocultarDetalles: "Ocultar detalles",
        porPersona: "Por persona",
        includes: "Incluye",
        notIncludes: "No incluye",
        necessary: "Cosas necesarias",
        surfClass: "Surf clase",
        surfboard: "Surfboard",
        wetsuit: "Wetsuit",
        carpa: "Carpa",
        transport: "Transporte",
        food: "Comida",
        water: "Agua",
        camping: "Camping",
        breakfast: "Desayuno",
        lunch: "Almuerzo",
        dinner: "Cena",
        swimwear: "Ropa de baño",
        sunscreen: "Bloqueador",
        hat: "Gorra",
        sunglasses: "Lentes de sol",
        snacks: "Snacks",
        snacksComida: "Snacks/Comida",
        backpack: "Mochila",
        personalItems: "Artículos de aseo personal",
        warmClothes: "Ropa de abrigo",
        flashlight: "Linterna",
        sleepingBag: "Bolsa de dormir",
        libros: "Libros",
      },
      gallery: {
        title: "Galería de Experiencias",
        subtitle:
          "Revive los mejores momentos de nuestras sesiones de surf y aventuras en el mar",
        sessionTab: "Sesiones de Surf",
        generalTab: "Galería General",
        featuredCarousel: "Momentos Destacados",
        allSessions: "Todas las Sesiones",
        surfLifestyle: "Estilo de Vida Surf",
        completeCollection: "Colección Completa",
        ctaTitle: "¿Quieres formar parte de nuestra galería?",
        ctaSubtitle:
          "Únete a nuestras sesiones y crea tus propios momentos inolvidables",
        ctaButton: "Reserva tu Sesión",
      },
      common: {
        notFound: "Página no encontrada",
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: "Home",
        about: "About",
        classes: "Classes",
        surf: "Surf",
        surfskate: "SurfSkate",
        surftrips: "Surftrips",
        gallery: "Gallery",
        contact: "Contact",
        menu: "Menu",
      },
      hero: {
        title: "Evolushon",
        subtitle:
          "Connect body, mind and ocean. Safe, personalized lessons in multiple languages.",
        cta: "Book now",
      },
      home: {
        title: "Evolushon Surf Experience",
        description1:
          "Our surf school goes beyond the waves: it is a journey of connection, freedom and well-being. For us, surfing is not just a sport, but a lifestyle that transforms body and mind. More than teaching you to surf, we want you to experience the serenity of the ocean and discover the unique benefits this sport has for you.",
        description2:
          "At Evolushon Surf Experience we offer a fun and safe environment, with qualified instructors full of good energy. We provide you with the confidence you need to connect with the sea, regardless of your level or if you want to overcome your fears. We understand that each person is unique and we work to offer you an unforgettable experience full of emotions.",
        description3:
          "In addition, we teach classes in Spanish, English, French and German. Join us and experience the exciting connection between body, mind and sea!",
        surfClasses: "Surf Classes",
        grupales: "Group Classes",
        grupalesDesc:
          "Learn to surf in a dynamic and motivating environment. Share the experience, improve your skills and have fun with other surfing enthusiasts.",
        personalizadas: "Private Classes",
        personalizadasDesc:
          "A class just for you, focused on your needs and goals. Advance at your own pace with exclusive and personalized attention.",
        surftrips: "Surftrips",
        precios: {
          grupales: "Class S/ 120",
          grupalesPack:
            "Packages: 4 classes S/ 400; 8 classes S/ 720; 12 classes S/ 1020",
          privadas: "Class S/ 150.00",
          privadasPack:
            "Packages: 4 classes S/ 520; 8 classes S/ 900; 12 classes S/ 1'200.00",
          coaching:
            "Includes: Surf classes, Surfskate classes, Video analysis and Personalized program.",
          tandem: "Class S/ 150.00",
          tandemPack:
            "Packages: 4 classes S/ 520; 8 classes S/ 900; 12 classes S/ 1'200.00",
        },
        coaching: "Coaching",
        coachingDesc:
          "Take your surfing to the next level with sessions focused on perfecting your technique. We work with you to achieve your goals in and out of the water.",
        tandem: "Tandem",
        tandemDesc:
          "Classes designed for the little ones, where you learn in pairs with an instructor. A fun and safe experience to get started in the sea!",
        surfskateTitle: "Surfskate Classes",
        surfskateDesc:
          "Surfskate is ideal for improving surfing technique because it simulates the movement of waves, helping to perfect control, balance and coordination. It is an excellent way to train out of the water, allowing you to practice turns and maneuvers with many repetitions, in addition to developing strength and agility. Fun and training in a single sport!",
        surftripsTitle: "Surftrips",
        surftripsDesc:
          "Explore new waves and incredible landscapes — from day trips to week-long adventures. Destinations: Chicama, Bermejo, Puerto Viejo. Customized surftrips for special events.",
        destinos: "Popular Destinations",
        chicama: "Chicama - Longest waves in the world",
        bermejo: "Bermejo - Perfect tubes",
        puertoViejo: "Puerto Viejo - Adventure and culture",
        galeriaTitle: "Session Gallery",
        galeriaDesc:
          "Discover unique moments in the water and the magic of our surfing community. Every image tells a story by the sea!",
        verGaleria: "View Full Gallery",
        verMasOpciones: "View more options",
      },
      surf: {
        title: "Surf Classes",
        subtitle:
          "Our classes are provided on the beaches of the costa verde and the south, depending on sea conditions. We have different categories so you can choose the one that best suits you.",
        grupales: "Group Classes",
        grupalesDesc:
          "Learn to surf in a dynamic and motivating environment. Share the experience, improve your skills and have fun with other surfing enthusiasts.",
        privadas: "Private Classes",
        privadasDesc:
          "A class just for you, focused on your needs and goals. Advance at your own pace with exclusive and personalized attention.",
        coaching: "Coaching",
        coachingDesc:
          "Take your surfing to the next level with sessions focused on perfecting your technique. We work with you to achieve your goals in and out of the water.",
        coachingFeatures: [
          "Surf classes",
          "Surfskate classes",
          "Video analysis",
          "Personalized program",
        ],
        tandem: "Tandem",
        tandemDesc:
          "Surf classes designed for the little ones, where you learn in pairs with an instructor. A fun and safe experience for kids to get started in the sea!",
        claseIndividual: "Individual class",
        paquetesDisponibles: "Available packages",
        queIncluye: "What's included",
        paquetes: "Packages",
        cerrar: "Close",
      },
      surfskate: {
        title: "Surfskate",
        subtitle:
          "Train your surf on land. Improve your technique, balance and style all year round.",
        whatIs: "What is Surfskate?",
        description1:
          "Surfskate is a skate modality designed to replicate the feeling and movements of surfing on land. With a special axis system that allows wider and more fluid turns, surfskate helps you train the same techniques you would use in the water.",
        description2:
          "It's the perfect tool for surfers who want to maintain their level all year round, improve their style, gain confidence and develop muscle memory for specific maneuvers.",
        benefits: "Surfskate Benefits",
        benefit1Title: "Surf Technique",
        benefit1Desc:
          "Simulates wave movement to perfect turns, cutbacks and carving.",
        benefit2Title: "Strength and Balance",
        benefit2Desc:
          "Develops key muscles for surfing and improves your stability on the board.",
        benefit3Title: "Repetitions",
        benefit3Desc:
          "Practice maneuvers over and over without depending on sea conditions.",
        benefit4Title: "Muscle Memory",
        benefit4Desc:
          "Creates movement patterns that translate directly to the water.",
        benefit5Title: "All Year Round",
        benefit5Desc:
          "Maintain your connection with surfing regardless of season or conditions.",
        benefit6Title: "Fast Progression",
        benefit6Desc:
          "Accelerate your learning with frequent sessions and immediate feedback.",
        classes: "Our Classes",
        grupales: "Group Classes",
        grupalesDesc:
          "Learn surfskate in a group, share the experience and progress with other enthusiasts. Ideal for beginners and intermediate level.",
        privadas: "Private Classes",
        privadasDesc:
          "Personalized classes focused on your specific goals. Perfect for perfecting advanced techniques or starting from scratch.",
        coaching: "Coaching",
        coachingDesc:
          "Specialized training for surfers who want to take their level to the maximum. Includes video analysis and personalized plan.",
        consultar: "Inquire",
        gallery: "In Action",
        ctaTitle: "Ready to improve your surf?",
        ctaSubtitle:
          "Join our surfskate classes and take your technique to the next level",
        ctaButton: "Book your Class",
      },
      surftrips: {
        title: "Surftrips",
        subtitle:
          "Explore new waves and incredible landscapes with our surftrips. From day trips to camping adventures. We take care of everything so you only worry about surfing.",
        puntaHermosa: "Punta Hermosa / San Bartolo",
        puertoViejo: "Puerto Viejo",
        bermejo: "Bermejo",
        duration: "One day",
        durationCamping: "2 Days (camping)",
        fromLima1h: "1h from Lima",
        fromLima1h30: "1h30 from Lima",
        fromLima4h: "4h from Lima",
        schedule: "Schedule",
        salidaDeLima: "Departure from Lima",
        llegadaALima: "Arrival in Lima",
        approx: "approx.",
        diaSiguiente: "Next day",
        minParticipants: "A minimum of",
        participantes: "participants",
        paraElTrip: "required for the trip",
        verDetalles: "View full details",
        ocultarDetalles: "Hide details",
        porPersona: "Per person",
        includes: "Includes",
        notIncludes: "Not included",
        necessary: "Necessary items",
        surfClass: "Surf class",
        surfboard: "Surfboard",
        wetsuit: "Wetsuit",
        carpa: "Tent",
        transport: "Transport",
        food: "Food",
        water: "Water",
        camping: "Camping",
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
        swimwear: "Swimwear",
        sunscreen: "Sunscreen",
        hat: "Hat",
        sunglasses: "Sunglasses",
        snacks: "Snacks",
        snacksComida: "Snacks/Food",
        backpack: "Backpack",
        personalItems: "Personal hygiene items",
        warmClothes: "Warm clothes",
        flashlight: "Flashlight",
        sleepingBag: "Sleeping bag",
        libros: "Books",
      },
      gallery: {
        title: "Experience Gallery",
        subtitle:
          "Relive the best moments of our surf sessions and adventures at sea",
        sessionTab: "Surf Sessions",
        generalTab: "General Gallery",
        featuredCarousel: "Featured Moments",
        allSessions: "All Sessions",
        surfLifestyle: "Surf Lifestyle",
        completeCollection: "Complete Collection",
        ctaTitle: "Want to be part of our gallery?",
        ctaSubtitle:
          "Join our sessions and create your own unforgettable moments",
        ctaButton: "Book your Session",
      },
      common: {
        notFound: "Page not found",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
