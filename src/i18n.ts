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
