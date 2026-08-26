/**
 * Every word and price below is the client's own, lifted from bigbrainfurniture.com
 * (Wix) by _scrape/. Nothing here is invented copy, and no price appears against
 * a piece the client never priced publicly — furniture is quoted, which is how
 * the showrooms actually sell it.
 *
 * Image values are keys into the library (src/library.js), so a section asks for
 * `category/sofa`, never for a Wix hash. See scripts/organize.mjs.
 */

export const brand = {
  name: 'BIG BRAIN',
  tagline: 'creative home editor',
  legal: 'TGS Furnishings Sdn Bhd',
  domain: 'bigbrainfurniture.com',
  year: 2026,
  currency: 'MYR',
};

export const social = {
  instagram: 'https://www.instagram.com/my_bigbrain',
  facebook: 'https://www.facebook.com/bigbraindangautama',
  whatsapp: 'https://wa.me/60127794321',
  whatsappNumber: '+6012-779 4321',
};

/* mapHref is a Google Maps URLs API *text query* rather than a lat/lng: the
   client gave street addresses, and free geocoders resolve Malaysian addresses
   of this shape badly. Both were opened in a real browser and land on Big
   Brain's own Business Profile listings. */
export const showrooms = [
  {
    slug: 'johor-bahru',
    region: 'Southern',
    city: 'Johor Bahru',
    address: 'G-02-03-05-06, Blok A, Persiaran Pertama Off, Jalan Persiaran Pertama, Pusat Perdagangan Danga Utama, 81300 Johor Bahru, Johor',
    hours: '11am – 8pm',
    tel: '+607-595 2345',
    telHref: '+6075952345',
    email: 'dus@bigbrainfurniture.com',
    img: 'showroom/johor-bahru',
    mapHref: 'https://www.google.com/maps/search/?api=1&query=Big%20Brain%20Furniture%2C%20Pusat%20Perdagangan%20Danga%20Utama%2C%20Jalan%20Persiaran%20Pertama%2C%2081300%20Johor%20Bahru%2C%20Johor',
  },
  {
    slug: 'petaling-jaya',
    region: 'Central',
    city: 'Petaling Jaya',
    address: '10, Jalan Profesor Diraja Ungku Aziz, PJS 11, 46200 Petaling Jaya, Selangor',
    hours: '10.30am – 7pm',
    tel: '+6016-866 7376',
    telHref: '+60168667376',
    email: 'pjs@bigbrainfurniture.com',
    img: 'showroom/petaling-jaya',
    mapHref: 'https://www.google.com/maps/search/?api=1&query=Big%20Brain%20Furniture%2C%2010%20Jalan%20Profesor%20Diraja%20Ungku%20Aziz%2C%20PJS%2011%2C%2046200%20Petaling%20Jaya%2C%20Selangor',
  },
];

// ── The rotating bar above the header (the reference runs four) ─────────────
export const usps = [
  { text: 'Two showrooms — Johor Bahru and Petaling Jaya', href: '/contact.html' },
  { text: 'Reclaimed teak, rebuilt by hand', href: '/materials.html' },
  { text: 'Made to order, sized to your room', href: '/collections/sofa.html' },
  { text: 'WhatsApp us for a quote', href: social.whatsapp },
];

// ── Furniture categories (the client's own product menu) ────────────────────
export const categories = [
  { slug: 'sofa', name: 'Sofa', img: 'category/sofa', lede: 'Comfort and Design', blurb: 'A sofa is more than just a piece of furniture—it is the foundation of a living space, a place of relaxation, and a reflection of personal style. At Big Brain our sofa collection embodies contemporary elegance, exceptional craftsmanship, and unparalleled comfort.' },
  { slug: 'dining-table', name: 'Dining Table', img: 'category/dining-table', lede: 'Where Design Meets Conversation', blurb: 'A dining table is more than just a place to gather—it is the heart of the home, where moments are shared, and stories unfold. At Big Brain, our dining tables embody the perfect fusion of contemporary elegance, masterful craftsmanship, and timeless sophistication.' },
  { slug: 'arm-chair', name: 'Arm Chair', img: 'category/arm-chair', lede: 'Elegant Forms, Thoughtful Proportions', blurb: 'Every chair in our collection is a harmonious balance of form and function. From sculptural silhouettes to graceful curves, each piece is meticulously designed to provide both visual appeal and superior ergonomic support.' },
  { slug: 'coffee-table', name: 'Coffee Table', img: 'category/coffee-table', lede: 'The Art of Gathering', blurb: 'A coffee table is more than just a surface; it is a statement, a focal point, and a reflection of personal taste. At Big Brain, our collection redefines the modern living space, blending sculptural elegance with impeccable craftsmanship.' },
  { slug: 'bookcase', name: 'Bookcase', img: 'category/bookcase', lede: 'Open Shelves, Quiet Order', blurb: 'Shelving built from reclaimed teak, sized to the wall it stands against. Open backs keep a room feeling light; solid uprights keep it standing for decades.' },
  { slug: 'sideboard-console', name: 'Sideboard & Console', img: 'category/sideboard-console', lede: 'Storage That Earns Its Wall', blurb: 'Low storage in reclaimed teak — sideboards for the dining room, consoles for the hallway, both made to the length you need rather than the length a catalogue offers.' },
  { slug: 'accessories', name: 'Accessories', img: 'category/accessories', lede: 'Small Pieces, Same Wood', blurb: 'Boards, bowls, trays and plates turned and carved from the offcuts of the furniture. The only part of the collection you can buy without a conversation.' },
];

// ── Rooms (the reference's "Rooms" menu; Big Brain's own specialisms) ───────
export const rooms = [
  { slug: 'living-room', name: 'The Living Room', img: 'home/living-room-01', links: ['sofa', 'coffee-table', 'arm-chair', 'bookcase'] },
  { slug: 'dining-room', name: 'The Dining Room', img: 'home/dining-room-01', links: ['dining-table', 'arm-chair', 'sideboard-console', 'accessories'] },
  { slug: 'bedroom', name: 'The Bedroom', img: 'home/bedroom-01', links: ['sideboard-console', 'arm-chair', 'bookcase'] },
  { slug: 'workspace', name: 'The Workspace', img: 'home/living-room-04', links: ['bookcase', 'sideboard-console', 'arm-chair'] },
];

// ── Shop: the sixteen priced pieces from the client's own Wix store ─────────
// `price` is in MYR. A null price is the client's own "Out of stock".
export const products = [
  { name: 'LAUREN Reclaimed Teakwood Plate', slug: 'lauren-reclaimed-teakwood-plate', price: 519, img: 'product/lauren-reclaimed-teakwood-plate', tag: 'New', blurb: 'Turned from a single piece of reclaimed teak, the Lauren plate keeps the grain, knots and colour shifts the timber earned before we got to it. Every one is different, and none of them is a mistake.' },
  { name: 'TEODORA Serving Plate w/ Knife Capit', slug: 'teodora-serving-plate-w-knife-capit', price: 319, img: 'product/teodora-serving-plate-w-knife-capit', tag: 'New', blurb: 'A serving board with its own knife, cut from reclaimed teak and finished by hand. The live edge is left exactly as it was found.' },
  { name: 'HUDSON Bowl Krawang', slug: 'hudson-bowl-krawang', price: 189, img: 'product/hudson-bowl-krawang', blurb: 'Krawang — pierced carving — worked into a shallow teak bowl. Light passes through the pattern and lays it back down on the table underneath.' },
  { name: 'GRETA Tapas Shape Handle', slug: 'greta-tapas-shape-handle', price: 159, img: 'product/greta-tapas-shape-handle', blurb: 'A tapas board with a cut handle, sized for one course or a small cheese plate. Reclaimed teak, oiled.' },
  { name: 'BARDOT Coaster Unyu Rivest', slug: 'bardot-coaster-unyu-rivest', price: 157, img: 'product/bardot-coaster-unyu-rivest', blurb: 'River stone and teak together. The Unyu series pairs what the river shaped with what we did.' },
  { name: 'GISELLE Tray', slug: 'giselle-tray', price: 119, img: 'product/giselle-tray', blurb: 'A shallow tray for the coffee table or the bathroom counter. One piece of teak, no joins.' },
  { name: 'JOVE Tapas PingPong Square Garit', slug: 'jove-tapas-pingpong-square-garit', price: 119, img: 'product/jove-tapas-pingpong-square-garit', blurb: 'Square tapas board with a grooved (garit) face, so oil stays where you put it.' },
  { name: 'JOVE Tapas PingPong Square', slug: 'jove-tapas-pingpong-square', price: 119, img: 'product/jove-tapas-pingpong-square', blurb: 'The plain-faced version of the Jove square. Reclaimed teak, hand-finished.' },
  { name: 'JOSEF Plate Tika Square', slug: 'josef-plate-tika-square', price: 109, img: 'product/josef-plate-tika-square', blurb: 'Square plate in the Tika cut. Reclaimed teak with a food-safe oil finish.' },
  { name: 'EXEDRA Placemat Unyu', slug: 'exedra-placemat-unyu', price: 109, img: 'product/exedra-placemat-unyu', blurb: 'A teak placemat with an organic Unyu edge — no two outlines the same.' },
  { name: 'BONHEUR Bowl Cana', slug: 'bonheur-bowl-cana', price: 99, img: 'product/bonheur-bowl-cana', blurb: 'A small bowl for salt, nuts, or keys by the door. Turned from offcuts, so nothing is wasted.' },
  { name: 'NEOZ Plate Tika Bubu Round', slug: 'neoz-plate-tika-bubu-round', price: 79, img: 'product/neoz-plate-tika-bubu-round', blurb: 'Round plate with the Bubu weave pattern worked into the face.' },
  { name: 'CHRISTMAS Pinecone', slug: 'christmas-pinecone', price: 66, img: 'product/christmas-pinecone', blurb: 'A carved teak pinecone. Seasonal in theory; in most houses it never goes back in the box.' },
  { name: 'SVOYA Teak Wood Serving Spoon', slug: 'svoya-teak-wood-serving-spoon', price: 59, img: 'product/svoya-teak-wood-serving-spoon', blurb: 'A long serving spoon, carved and sanded by hand. Warm in the hand and kind to a good pan.' },
  { name: 'SVOYA Teak Wood Serving Fork', slug: 'svoya-teak-wood-serving-fork', price: 29, img: 'product/svoya-teak-wood-serving-fork', blurb: 'The fork to the Svoya spoon. Sold singly, so you can replace one without replacing both.' },
  { name: '001', slug: '001', price: null, img: 'product/001', soldOut: true, blurb: 'A one-off piece from the workshop floor. When it is gone, it is gone.' },
];

// Every product is worked from reclaimed teak, which is the client's own claim
// and the thing the RECLAIMED badge marks — the reference's CERTIFIED tag.
products.forEach((p) => { p.reclaimed = true; });

// ── The sofa series, exactly as the client lists it ─────────────────────────
export const sofaSeries = [
  'Livano Sofa', 'Alfred Sofa', 'Kenzie Sofa', 'Avila Sofa', 'Buino Sofa',
  'Marquez Curved Sofa', 'Lenox Sofa', 'Alexia Sofa', 'Castello Curve Sofa',
];

// ── Textures: eleven named carvings, each paired to its own swatch ──────────
export const textures = [
  { name: 'Rhapsody', slug: 'rhapsody' },
  { name: 'Way', slug: 'way' },
  { name: 'Picturesque', slug: 'picturesque' },
  { name: 'Rouen Cathedral', slug: 'rouen-cathedral' },
  { name: 'Sisyphus', slug: 'sisyphus' },
  { name: 'Song of Wind', slug: 'song-of-wind' },
  { name: 'Irregolare', slug: 'irregolare' },
  { name: 'The Natural', slug: 'the-natural' },
  { name: 'Daffodil', slug: 'daffodil' },
  { name: 'Línea', slug: 'linea' },
  { name: 'Regola', slug: 'regola' },
].map((t) => ({ ...t, img: `texture/${t.slug}` }));

export const textureIntro =
  'Once the type of wood has been determined, it’s time for the next step: choosing the right texture. There are sixteen exceptional textures to pick from, ranging from hand-sculpted by our master carpenters to machine-carved. They can be applied to our reclaimed teak wood furnitures!';

// ── Long-form copy, all the client's ───────────────────────────────────────
export const copy = {
  homeLede: 'We make sofas. Not just any kind of sofas but well-designed, handcrafted, tailor-made to order, never-want-to-get-up, customizable, luxurious, minimalist sofas. We also know that size matter, that materials and colours make the difference and that comfort is just as important as style so we give you a million variations to choose from.',
  collection: 'Where elegance meets uniqueness. Each piece is thoughtfully crafted to embody sophisticated design and exceptional quality. With a focus on unique aesthetics and timeless style, our furniture transforms any space into a statement of refined taste. Elevate your home with designs that are as distinctive as you are.',
  quote: {
    text: 'We are craftsmen with a strong appreciation for nature. For us, nature is not just beautiful, it’s everything. It is the source of all creation and the origin of our inspiration. While creating furniture, we continuously look for the best possible harmony between culture and nature, using the art of craftsmanship as a tool to honor both.',
    cite: 'dBodhi',
  },
  about: [
    'We work to get the best solution for each client with completely individual and personalized manner, in order to satisfy the tastes and needs by creating unique and elegant spaces, and its outcome a success. We are in continuous expansion and growth.',
    'We are specialized in living room, dining area furniture, and bedrooms. Our team of professionals highly qualified in loose furniture and decoration aims to offer the best solution to your project and coordinate the best after-sales service itself. Our partners are the most renowned designers and quality manufacturers.',
    'In BIG BRAIN we have our own line of furniture as living room, dining area furniture, and bedrooms with excellent value. We offer numerous models of the latest trends and the most innovative technologies.',
    'We will be happy to assist you to carry out your project in our store furniture. We collaborate with the best architecture studios, promoters, interior designers, and decorators.',
  ],
  materials: [
    'Reclaimed teak has exposed over the years, created mature seeds, beautiful and rich colors. It is a very hard weight, strong wood, common oily that makes it very robust. We use recycled teak wood as our main material. We believe will give another chance for the future generation.',
    'Different from freshly cut teak wood, reclaimed teak wood has its own uniqueness, especially in its color. It is because this type of teak wood has gone through a lot over time, making it ages charmingly with gorgeous little imperfections which rather adds up to its beauty.',
    'At first glance, you may notice the knots, cracks, uneven tones and imperfections that are present in our reclaimed teak furniture. But these imperfections are what make our pieces truly special. They are a testament to the natural beauty and durability of teak wood, and to the history and character of the materials we use. We LOVE imperfection.',
    'We feel perfection does not fuel connection; it is neither warm nor welcoming. Purity and purpose are what bring real value. When wood washed ashore becomes a set of chairs accommodating a company of friends who share dinner and joyous moments, that’s when material gets meaning. What once was wreckage, has become a tool of togetherness, generating precious memories for years to come.',
  ],
};

// ── Home page: the reference's rhythm, with Big Brain's own material ────────
export const hero = [
  {
    img: 'home/living-room-01',
    heading: 'Crafted for Moments',
    cta: { label: 'Shop Now', href: '/collections/sofa.html' },
  },
  {
    img: 'home/dining-room-01',
    heading: 'Made for Gathering',
    cta: { label: 'Discover the Dining Room', href: '/rooms/dining-room.html' },
  },
];

export const homeBanners = [
  {
    heading: 'Old Wood, New Life',
    body: 'Reclaimed teak, rebuilt into pieces that will outlast the room they were bought for.',
    cta: { label: 'Discover Materials', href: '/materials.html' },
    img: 'material/titan-dining-table',
    side: 'right',
  },
  {
    heading: 'Storage That Earns Its Wall',
    body: '',
    cta: { label: 'Shop Now', href: '/collections/sideboard-console.html' },
    img: 'showroom/interior-01',
    side: 'left',
  },
  {
    heading: 'Guided by Imperfection',
    body: 'Knots, cracks and uneven tones are not defects to be sanded out. They are the record of the wood’s first life, and the reason the second one is worth having.',
    cta: { label: 'Read the Story', href: '/materials.html' },
    img: 'material/grain-macro',
    side: 'right',
  },
];

// The reference interleaves banner → product rail → banner. Big Brain has one
// priced range, so the rails draw from it and the banners carry the furniture.
export const homeRails = [
  { title: 'On the Table', slugs: ['lauren-reclaimed-teakwood-plate', 'teodora-serving-plate-w-knife-capit', 'hudson-bowl-krawang', 'greta-tapas-shape-handle'] },
  { title: 'Small Pieces', slugs: ['giselle-tray', 'bardot-coaster-unyu-rivest', 'bonheur-bowl-cana', 'svoya-teak-wood-serving-spoon'] },
];

export const instagramTag = '#bigbrainfurniture';
export const instagramBlurb =
  'We love seeing how our pieces settle into a room. Tag us and we will share the ones that stop us.';
