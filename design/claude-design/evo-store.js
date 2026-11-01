(function () {
  var KEY = 'evolushon-data-v1';
  var A = 'src/assets/';
  function L(es, en, fr, de) { return { es: es || '', en: en || '', fr: fr || '', de: de || '' }; }
  function LL(es, en) { return { es: es || [], en: en || [], fr: [], de: [] }; }
  var pk = function (a, b, c) { return [{ n: 4, price: a }, { n: 8, price: b }, { n: 12, price: c }]; };

  var tripInc = ['Clase de surf', 'Tabla de surf', 'Wetsuit', 'Transporte'];
  var tripIncEn = ['Surf class', 'Surfboard', 'Wetsuit', 'Transport'];
  var tripBring = ['Ropa de baño', 'Bloqueador', 'Gorra', 'Lentes de sol', 'Agua', 'Snacks'];
  var tripBringEn = ['Swimwear', 'Sunscreen', 'Hat', 'Sunglasses', 'Water', 'Snacks'];

  var DEFAULT = {
    settings: { whatsapp: '', waLink: 'https://wa.link/xrf1r8', instagram: 'https://www.instagram.com/evolushonsurf', tiktok: 'https://www.tiktok.com/@evolushonsurfexperience' },
    services: [
      { id: 's-grupal', cat: 'surf', active: true, cover: A + 'grupales.jpg', currency: 'S/', price: 120, packages: pk(400, 720, 1020),
        name: L('Grupales', 'Group classes'),
        desc: L('Aprende a surfear en un ambiente dinámico y motivador. Comparte la experiencia, mejora tus habilidades y diviértete junto a otros apasionados del mar.', 'Learn to surf in a dynamic and motivating environment. Share the experience, improve your skills and have fun with other surfing enthusiasts.'),
        includes: LL(), excludes: LL(), bring: LL() },
      { id: 's-privada', cat: 'surf', active: true, cover: A + 'personalizada-scaled.jpg', currency: 'S/', price: 150, packages: pk(520, 900, 1200),
        name: L('Privadas', 'Private classes'),
        desc: L('Una clase solo para ti, enfocada en tus necesidades y objetivos. Avanza a tu ritmo con atención exclusiva y personalizada.', 'A class just for you, focused on your needs and goals. Advance at your own pace with exclusive and personalized attention.'),
        includes: LL(), excludes: LL(), bring: LL() },
      { id: 's-coaching', cat: 'surf', active: true, cover: A + 'coaching-card.jpeg', currency: 'S/', price: null, packages: [],
        name: L('Coaching', 'Coaching', 'Coaching', 'Coaching'),
        desc: L('Sesiones enfocadas en perfeccionar tu técnica. Trabajamos contigo para alcanzar tus metas dentro y fuera del agua.', 'Sessions focused on perfecting your technique. We work with you to achieve your goals in and out of the water.'),
        includes: LL(['Clases de surf', 'Clases de surfskate', 'Videoanálisis', 'Programa personalizado'], ['Surf classes', 'Surfskate classes', 'Video analysis', 'Personalized program']), excludes: LL(), bring: LL() },
      { id: 's-tandem', cat: 'surf', active: true, cover: A + 'minigroms-e1732732357425.jpeg', currency: 'S/', price: 150, packages: pk(520, 900, 1200),
        name: L('Tándem niños', 'Kids tandem'),
        desc: L('Clases para los más pequeños, que aprenden en pareja con un instructor. Una forma divertida y segura de iniciarse en el mar.', 'Classes for little ones, who learn in pairs with an instructor. A fun and safe way to get started in the sea.'),
        includes: LL(), excludes: LL(), bring: LL() },
      { id: 'k-grupal', cat: 'surfskate', active: true, cover: A + 'class-surfskate-3.jpg', currency: 'S/', price: 80, packages: pk(280, 520, 720),
        name: L('Surfskate grupal', 'Group surfskate'),
        desc: L('Aprende surfskate en grupo y progresa junto a otros entusiastas. Ideal para principiantes y nivel intermedio.', 'Learn surfskate in a group and progress with other enthusiasts. Ideal for beginners and intermediate level.'),
        includes: LL(), excludes: LL(), bring: LL() },
      { id: 'k-privada', cat: 'surfskate', active: true, cover: A + 'class-surfskate-2.jpg', currency: 'S/', price: 100, packages: pk(360, 680, 960),
        name: L('Surfskate privada', 'Private surfskate'),
        desc: L('Clases enfocadas en tus objetivos: perfecciona técnicas avanzadas o empieza desde cero.', 'Classes focused on your goals: perfect advanced techniques or start from scratch.'),
        includes: LL(), excludes: LL(), bring: LL() },
      { id: 'k-coaching', cat: 'surfskate', active: true, cover: A + 'class-surfskate-4.jpeg', currency: 'S/', price: null, packages: [],
        name: L('Surfskate coaching', 'Surfskate coaching'),
        desc: L('Entrenamiento especializado para llevar tu nivel al máximo, con videoanálisis y plan personalizado.', 'Specialized training to take your level to the max, with video analysis and a personalized plan.'),
        includes: LL(), excludes: LL(), bring: LL() },
      { id: 't-punta', cat: 'trip', active: true, cover: A + 'banner3.jpg', currency: '$', price: 60, packages: [], depart: '7:00 AM', ret: '1:00 PM', minPeople: 2,
        name: L('Punta Hermosa / San Bartolo', 'Punta Hermosa / San Bartolo', 'Punta Hermosa / San Bartolo', 'Punta Hermosa / San Bartolo'),
        desc: L('Escapada de un día a las playas del sur chico. Nos encargamos de todo para que solo te preocupes por surfear.', 'A day trip to the southern beaches. We take care of everything so you only worry about surfing.'),
        duration: L('Un día', 'One day', 'Une journée', 'Ein Tag'), distance: L('1 h de Lima', '1 h from Lima', '1 h de Lima', '1 Std. von Lima'),
        includes: LL(tripInc, tripIncEn), excludes: LL(['Comida', 'Agua'], ['Food', 'Water']), bring: LL(tripBring, tripBringEn) },
      { id: 't-puerto', cat: 'trip', active: true, cover: A + 'surftrip-puerto-viejo.jpg', currency: '$', price: 70, packages: [], depart: '6:00 AM', ret: '3:00 PM', minPeople: 2,
        name: L('Puerto Viejo', 'Puerto Viejo', 'Puerto Viejo', 'Puerto Viejo'),
        desc: L('Un día completo de olas largas y paisaje abierto, a hora y media de la ciudad.', 'A full day of long waves and open landscape, an hour and a half from the city.'),
        duration: L('Un día', 'One day', 'Une journée', 'Ein Tag'), distance: L('1 h 30 de Lima', '1 h 30 from Lima', '1 h 30 de Lima', '1,5 Std. von Lima'),
        includes: LL(tripInc, tripIncEn), excludes: LL(['Comida', 'Agua'], ['Food', 'Water']), bring: LL(tripBring, tripBringEn) },
      { id: 't-bermejo', cat: 'trip', active: true, cover: A + 'surftrip-bermejo.jpg', currency: '$', price: 160, packages: [], depart: '3:00 AM', ret: '8:00 PM (día siguiente)', minPeople: 3,
        name: L('Bermejo', 'Bermejo', 'Bermejo', 'Bermejo'),
        desc: L('Dos días de camping frente al mar, con tubos perfectos y cielo abierto.', 'Two days camping by the sea, with perfect tubes and open skies.'),
        duration: L('2 días (camping)', '2 days (camping)', '2 jours (camping)', '2 Tage (Camping)'), distance: L('4 h de Lima', '4 h from Lima', '4 h de Lima', '4 Std. von Lima'),
        includes: LL(tripInc.concat(['Carpa']), tripIncEn.concat(['Tent'])), excludes: LL(['Comida', 'Agua', 'Bolsa de dormir'], ['Food', 'Water', 'Sleeping bag']),
        bring: LL(['Ropa de baño', 'Bloqueador', 'Gorra', 'Lentes de sol', 'Agua', 'Snacks / comida', 'Libros', 'Bolsa de dormir', 'Linterna'], ['Swimwear', 'Sunscreen', 'Hat', 'Sunglasses', 'Water', 'Snacks / food', 'Books', 'Sleeping bag', 'Flashlight']) }
    ],
    gallery: []
  };
  var g = function (file, album, featured, es, en) { DEFAULT.gallery.push({ id: 'g-' + file.replace(/\W/g, ''), src: A + file, album: album, featured: !!featured, hidden: false, alt: L(es, en) }); };
  ['galeria-sesion-16.jpg', 'galeria-sesion-17.jpg', 'galeria-sesion-18.jpg', 'galeria-sesion-20.jpg', 'galeria-sesion-22.jpg'].forEach(function (f) { g(f, 'sesiones', true, 'Sesión de surf', 'Surf session'); });
  ['galeria-sesion-1.jpg', 'galeria-sesion-2.jpg', 'galeria-sesion-3.jpg', 'galeria-sesion-4.jpg', 'galeria-sesion-5.jpg', 'galeria-sesion-6.jpg'].forEach(function (f) { g(f, 'sesiones', false, 'Sesión de surf', 'Surf session'); });
  ['IMG_5920-scaled.jpeg', 'IMG_6465-scaled.jpg', 'IMG_7189-scaled.jpg', 'IMG_5371-scaled.jpg', 'galeria1.jpg', 'galeria2.jpg', 'galeria3.jpg', 'galeria4.jpg'].forEach(function (f) { g(f, 'lifestyle', false, 'Vida de playa', 'Beach life'); });
  ['class-surfskate-1.jpg', 'class-surfskate-2.jpg', 'class-surfskate-3.jpg', 'class-surfskate-4.jpeg'].forEach(function (f) { g(f, 'surfskate', false, 'Clase de surfskate', 'Surfskate class'); });
  g('banner1.jpg', 'trips', true, 'Surftrip', 'Surftrip');
  ['surftrip-chicama.jpg', 'surftrip-bermejo.jpg', 'surftrip-puerto-viejo.jpg'].forEach(function (f) { g(f, 'trips', false, 'Surftrip', 'Surftrip'); });

  var UI = {
    es: { home: 'Inicio', services: 'Servicios', gallery: 'Galería', contact: 'Contacto', book: 'Reservar', kicker: 'Escuela de surf · Lima, Perú', heroTitle: 'Conexión entre cuerpo, mente y mar.', heroSub: 'Clases seguras y personalizadas de surf y surfskate, y surftrips por la costa peruana.', introTitle: 'Más que aprender a surfear', intro: 'Para nosotros el surf no es solo un deporte: es un estilo de vida que transforma cuerpo y mente. Ofrecemos un ambiente divertido y seguro, con instructores calificados, para que conectes con el mar sin importar tu nivel.', all: 'Todos', surf: 'Surf', surfskate: 'Surfskate', trip: 'Surftrips', from: 'desde', perClass: 'por clase', perPerson: 'por persona', packages: 'Paquetes', classes: 'clases', consult: 'Consultar', details: 'Ver detalle', hide: 'Ocultar detalle', includes: 'Incluye', excludes: 'No incluye', bring: 'Qué llevar', depart: 'Salida de Lima', ret: 'Llegada a Lima', minPeople: 'Mínimo de participantes', servicesTitle: 'Servicios y tarifas', servicesSub: 'Clases en la Costa Verde y el Sur Chico, según las condiciones del mar.', seeServices: 'Ver servicios', seeGallery: 'Ver galería', galleryTitle: 'Galería', gallerySub: 'Momentos de nuestras sesiones, clases y viajes.', sesiones: 'Sesiones', lifestyle: 'Lifestyle', trips: 'Trips', contactTitle: 'Reserva por WhatsApp', contactSub: 'Escríbenos con el servicio que te interesa y coordinamos fecha, playa y nivel.', where: 'Dónde', whereBody: 'Costa Verde y Sur Chico, según las condiciones del mar.', langs: 'Idiomas', langsBody: 'Español, inglés, francés y alemán.', follow: 'Síguenos', waMsg: 'Hola Evolushon, quiero reservar: ', waGeneric: 'Hola Evolushon, quiero información sobre sus clases.', bookThis: 'Reservar', featured: 'Destacadas', tag: 'Conexión entre cuerpo, mente y mar', whatsappCta: 'Abrir WhatsApp', offer: 'Lo que ofrecemos', close: 'Cerrar' },
    en: { home: 'Home', services: 'Services', gallery: 'Gallery', contact: 'Contact', book: 'Book', kicker: 'Surf school · Lima, Peru', heroTitle: 'Connecting body, mind and ocean.', heroSub: 'Safe, personalized surf and surfskate lessons, and surftrips along the Peruvian coast.', introTitle: 'More than learning to surf', intro: 'For us surfing is not just a sport: it is a lifestyle that transforms body and mind. We offer a fun, safe environment with qualified instructors so you can connect with the sea, whatever your level.', all: 'All', surf: 'Surf', surfskate: 'Surfskate', trip: 'Surftrips', from: 'from', perClass: 'per class', perPerson: 'per person', packages: 'Packages', classes: 'classes', consult: 'On request', details: 'View details', hide: 'Hide details', includes: 'Includes', excludes: 'Not included', bring: 'What to bring', depart: 'Departure from Lima', ret: 'Return to Lima', minPeople: 'Minimum participants', servicesTitle: 'Services and rates', servicesSub: 'Lessons on the Costa Verde and Sur Chico, depending on sea conditions.', seeServices: 'See services', seeGallery: 'See gallery', galleryTitle: 'Gallery', gallerySub: 'Moments from our sessions, lessons and trips.', sesiones: 'Sessions', lifestyle: 'Lifestyle', trips: 'Trips', contactTitle: 'Book on WhatsApp', contactSub: 'Message us with the service you want and we will arrange date, beach and level.', where: 'Where', whereBody: 'Costa Verde and Sur Chico, depending on sea conditions.', langs: 'Languages', langsBody: 'Spanish, English, French and German.', follow: 'Follow us', waMsg: 'Hi Evolushon, I would like to book: ', waGeneric: 'Hi Evolushon, I would like information about your lessons.', bookThis: 'Book', featured: 'Featured', tag: 'Connecting body, mind and ocean', whatsappCta: 'Open WhatsApp', offer: 'What we offer', close: 'Close' },
    fr: { home: 'Accueil', services: 'Services', gallery: 'Galerie', contact: 'Contact', book: 'Réserver', kicker: 'École de surf · Lima, Pérou', heroTitle: 'Relier le corps, l’esprit et l’océan.', heroSub: 'Cours de surf et de surfskate sûrs et personnalisés, et surftrips sur la côte péruvienne.', introTitle: 'Bien plus qu’apprendre à surfer', intro: 'Pour nous, le surf n’est pas qu’un sport : c’est un mode de vie qui transforme le corps et l’esprit. Nous offrons un cadre sûr et convivial, avec des moniteurs qualifiés, pour que vous vous connectiez à la mer, quel que soit votre niveau.', all: 'Tous', surf: 'Surf', surfskate: 'Surfskate', trip: 'Surftrips', from: 'dès', perClass: 'par cours', perPerson: 'par personne', packages: 'Forfaits', classes: 'cours', consult: 'Sur demande', details: 'Voir le détail', hide: 'Masquer', includes: 'Inclus', excludes: 'Non inclus', bring: 'À apporter', depart: 'Départ de Lima', ret: 'Retour à Lima', minPeople: 'Participants minimum', servicesTitle: 'Services et tarifs', servicesSub: 'Cours sur la Costa Verde et le Sur Chico, selon l’état de la mer.', seeServices: 'Voir les services', seeGallery: 'Voir la galerie', galleryTitle: 'Galerie', gallerySub: 'Moments de nos sessions, cours et voyages.', sesiones: 'Sessions', lifestyle: 'Lifestyle', trips: 'Trips', contactTitle: 'Réserver sur WhatsApp', contactSub: 'Écrivez-nous avec le service souhaité et nous organiserons date, plage et niveau.', where: 'Où', whereBody: 'Costa Verde et Sur Chico, selon l’état de la mer.', langs: 'Langues', langsBody: 'Espagnol, anglais, français et allemand.', follow: 'Suivez-nous', waMsg: 'Bonjour Evolushon, je souhaite réserver : ', waGeneric: 'Bonjour Evolushon, je souhaite des informations sur vos cours.', bookThis: 'Réserver', featured: 'À la une', tag: 'Relier le corps, l’esprit et l’océan', whatsappCta: 'Ouvrir WhatsApp', offer: 'Ce que nous proposons', close: 'Fermer' },
    de: { home: 'Start', services: 'Angebote', gallery: 'Galerie', contact: 'Kontakt', book: 'Buchen', kicker: 'Surfschule · Lima, Peru', heroTitle: 'Körper, Geist und Meer verbinden.', heroSub: 'Sichere, persönliche Surf- und Surfskate-Kurse sowie Surftrips entlang der peruanischen Küste.', introTitle: 'Mehr als Surfen lernen', intro: 'Für uns ist Surfen nicht nur ein Sport, sondern ein Lebensstil, der Körper und Geist verändert. Wir bieten eine sichere, entspannte Umgebung mit qualifizierten Lehrern, damit du dich mit dem Meer verbindest – egal auf welchem Niveau.', all: 'Alle', surf: 'Surf', surfskate: 'Surfskate', trip: 'Surftrips', from: 'ab', perClass: 'pro Kurs', perPerson: 'pro Person', packages: 'Pakete', classes: 'Kurse', consult: 'Auf Anfrage', details: 'Details ansehen', hide: 'Details ausblenden', includes: 'Inklusive', excludes: 'Nicht inklusive', bring: 'Mitbringen', depart: 'Abfahrt in Lima', ret: 'Rückkehr nach Lima', minPeople: 'Mindestteilnehmer', servicesTitle: 'Angebote und Preise', servicesSub: 'Kurse an der Costa Verde und im Sur Chico, je nach Meeresbedingungen.', seeServices: 'Angebote ansehen', seeGallery: 'Galerie ansehen', galleryTitle: 'Galerie', gallerySub: 'Momente aus unseren Sessions, Kursen und Reisen.', sesiones: 'Sessions', lifestyle: 'Lifestyle', trips: 'Trips', contactTitle: 'Per WhatsApp buchen', contactSub: 'Schreib uns, welches Angebot dich interessiert, und wir planen Datum, Strand und Niveau.', where: 'Wo', whereBody: 'Costa Verde und Sur Chico, je nach Meeresbedingungen.', langs: 'Sprachen', langsBody: 'Spanisch, Englisch, Französisch und Deutsch.', follow: 'Folge uns', waMsg: 'Hallo Evolushon, ich möchte buchen: ', waGeneric: 'Hallo Evolushon, ich hätte gern Infos zu euren Kursen.', bookThis: 'Buchen', featured: 'Highlights', tag: 'Körper, Geist und Meer verbinden', whatsappCta: 'WhatsApp öffnen', offer: 'Unser Angebot', close: 'Schließen' }
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var subs = [];
  var Store = {
    KEY: KEY, DEFAULT: DEFAULT, UI: UI, LANGS: ['es', 'en', 'fr', 'de'],
    ALBUMS: ['sesiones', 'lifestyle', 'surfskate', 'trips'], CATS: ['surf', 'surfskate', 'trip'],
    load: function () { try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) {} return clone(DEFAULT); },
    save: function (d) { localStorage.setItem(KEY, JSON.stringify(d)); subs.forEach(function (f) { f(d); }); },
    reset: function () { localStorage.removeItem(KEY); var d = clone(DEFAULT); subs.forEach(function (f) { f(d); }); return d; },
    subscribe: function (f) { subs.push(f); return function () { subs = subs.filter(function (x) { return x !== f; }); }; },
    tr: function (field, lang) { if (!field) return ''; var v = field[lang]; if (Array.isArray(v)) return v.length ? v : (field.es || []); return v || field.es || ''; },
    money: function (cur, n) { if (n === null || n === undefined || n === '') return null; return cur + ' ' + Number(n).toLocaleString('es-PE'); },
    waUrl: function (settings, text) { var num = (settings.whatsapp || '').replace(/\D/g, ''); return 'https://wa.me/' + num + '?text=' + encodeURIComponent(text); }
  };
  window.addEventListener('storage', function (e) { if (e.key === KEY) { var d = Store.load(); subs.forEach(function (f) { f(d); }); } });
  window.EvoStore = Store;
})();
