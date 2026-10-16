/**
 * Every word, price and address below is placeholder copy for FF Dev Studio's
 * demo furniture store. None of it describes a real business: swap it for a
 * client's own content when this layout is used for a real build.
 *
 * Image values are keys into the image library (assets/library/, see
 * scripts/build-images.mjs), so a section asks for `category/sofa`, never for
 * a file path.
 */

export const brand = {
  name: 'FF Furniture',
  tagline: 'A demo store by FF Dev Studio',
  studio: 'FF Dev Studio',
  studioUrl: 'https://ffdev.studio',
  year: 2026,
  currency: 'MYR',
};

// The cart and every "talk to us" button open a WhatsApp chat with the studio.
export const social = {
  whatsapp: 'https://wa.me/60139078719',
  whatsappText: 'Demo order — FF Furniture',
};

export const showrooms = [
  {
    slug: 'one',
    name: 'Showroom One',
    address: '1 Jalan Contoh, 50000 Kuala Lumpur',
    tel: '+60 3-0000 0000',
    telHref: '+60300000000',
    email: 'showroom@example.com',
    img: 'showroom/one',
  },
  {
    slug: 'two',
    name: 'Showroom Two',
    address: '2 Jalan Contoh, 10000 George Town, Penang',
    tel: '+60 4-000 0000',
    telHref: '+6040000000',
    email: 'showroom@example.com',
    img: 'showroom/two',
  },
];

// ── The rotating bar above the header ───────────────────────────────────────
export const usps = [
  { text: 'A demo store by FF Dev Studio', href: 'https://ffdev.studio' },
  { text: 'Two placeholder showrooms — Kuala Lumpur and Penang', href: '/contact.html' },
  { text: 'Teak furniture and tableware', href: '/collections/accessories.html' },
  { text: 'Message us on WhatsApp', href: social.whatsapp },
];

// ── Furniture categories ────────────────────────────────────────────────────
export const categories = [
  { slug: 'sofa', name: 'Sofa', img: 'category/sofa', lede: 'Soft Seating', blurb: 'Low, deep sofas in neutral upholstery on solid timber frames. Placeholder copy for the demo store.' },
  { slug: 'dining-table', name: 'Dining Table', img: 'category/dining-table', lede: 'Around the Table', blurb: 'Dining tables in solid wood and stone, from round tables for four to long tables for ten.' },
  { slug: 'arm-chair', name: 'Arm Chair', img: 'category/arm-chair', lede: 'Easy Chairs', blurb: 'Upholstered arm chairs with timber legs, for a reading corner or beside a window.' },
  { slug: 'coffee-table', name: 'Coffee Table', img: 'category/coffee-table', lede: 'Low Tables', blurb: 'Round and organic coffee tables in solid wood, sized to sit in front of a sofa.' },
  { slug: 'bookcase', name: 'Bookcase', img: 'category/bookcase', lede: 'Open Shelves', blurb: 'Open shelving in solid timber for books, plants and the things you like to look at.' },
  { slug: 'sideboard-console', name: 'Sideboard & Console', img: 'category/sideboard-console', lede: 'Low Storage', blurb: 'Sideboards for the dining room and consoles for the hallway, with slatted doors and open shelves.' },
  { slug: 'accessories', name: 'Accessories', img: 'category/accessories', lede: 'Small Pieces', blurb: 'Boards, bowls, trays and plates in teak. Add them to the cart and try the checkout.' },
];

// ── Rooms ───────────────────────────────────────────────────────────────────
export const rooms = [
  { slug: 'living-room', name: 'The Living Room', img: 'home/living-room-01', links: ['sofa', 'coffee-table', 'arm-chair', 'bookcase'] },
  { slug: 'dining-room', name: 'The Dining Room', img: 'home/dining-room-01', links: ['dining-table', 'arm-chair', 'sideboard-console', 'accessories'] },
  { slug: 'bedroom', name: 'The Bedroom', img: 'home/bedroom-01', links: ['sideboard-console', 'arm-chair', 'bookcase'] },
  { slug: 'workspace', name: 'The Workspace', img: 'home/living-room-04', links: ['bookcase', 'sideboard-console', 'arm-chair'] },
];

// ── Shop: sixteen placeholder products ──────────────────────────────────────
// `price` is in MYR. A null price with `soldOut` shows the sold-out state.
export const products = [
  { name: 'Live-Edge Teak Bowl', slug: 'live-edge-teak-bowl', price: 520, img: 'product/01', tag: 'New', blurb: 'A large bowl turned from one piece of teak, with the natural edge left as it grew.' },
  { name: 'Teak Serving Board with Knife', slug: 'teak-serving-board-with-knife', price: 320, img: 'product/02', tag: 'New', blurb: 'A live-edge serving board that comes with a forged knife.' },
  { name: 'Pierced Teak Bowl', slug: 'pierced-teak-bowl', price: 190, img: 'product/03', blurb: 'A shallow bowl with a pierced pattern. Light passes through and lands on the table beneath.' },
  { name: 'Teak Serving Board', slug: 'teak-serving-board', price: 160, img: 'product/04', blurb: 'A serving board with a cut handle, sized for one course or a small cheese plate.' },
  { name: 'River Stone Coaster Set', slug: 'river-stone-coaster-set', price: 150, img: 'product/05', blurb: 'Flat stone coasters in a hollowed river stone holder.' },
  { name: 'Teak Tray', slug: 'teak-tray', price: 120, img: 'product/06', blurb: 'A shallow tray for the coffee table or the bathroom counter.' },
  { name: 'Grooved Paddle Board', slug: 'grooved-paddle-board', price: 120, img: 'product/07', blurb: 'A paddle-shaped board with a grooved face.' },
  { name: 'Teak Paddle Board', slug: 'teak-paddle-board', price: 120, img: 'product/08', blurb: 'The plain-faced paddle board, with a hole in the handle for hanging.' },
  { name: 'Square Teak Plate', slug: 'square-teak-plate', price: 110, img: 'product/09', blurb: 'A square plate with a softly rounded rim.' },
  { name: 'Teak Coaster Set', slug: 'teak-coaster-set', price: 110, img: 'product/10', blurb: 'Round teak coasters stacked on a carved holder.' },
  { name: 'Small Teak Bowl', slug: 'small-teak-bowl', price: 100, img: 'product/11', blurb: 'A small bowl for salt, nuts, or keys by the door.' },
  { name: 'Round Teak Plate', slug: 'round-teak-plate', price: 80, img: 'product/12', blurb: 'A plain round plate that shows off the grain.' },
  { name: 'Teak Root Sculpture', slug: 'teak-root-sculpture', price: 70, img: 'product/13', blurb: 'A decorative piece carved from teak root.' },
  { name: 'Teak Spoon and Fork Set', slug: 'teak-spoon-and-fork-set', price: 50, img: 'product/14', blurb: 'Two serving spoons and two forks, carved from teak.' },
  { name: 'Slotted Serving Spoon', slug: 'slotted-serving-spoon', price: 40, img: 'product/15', blurb: 'A long serving spoon with a slot for draining.' },
  { name: 'Animal Head Sculpture', slug: 'animal-head-sculpture', price: null, img: 'product/16', soldOut: true, blurb: 'A carved teak head on a steel stand. Shown as sold out to demonstrate the state.' },
];

// ── Sofa types ──────────────────────────────────────────────────────────────
export const sofaSeries = [
  'Two-Seater Sofa', 'Three-Seater Sofa', 'Corner Sofa', 'Curved Sofa',
  'Modular Sofa', 'Tufted Sofa', 'Daybed',
];

// ── Textures: eleven surface swatches ───────────────────────────────────────
export const textures = [
  'Pebble', 'Fracture', 'Linear', 'Ribbed Block', 'Stacked', 'Diagonal Carve',
  'Weathered', 'Dimple', 'Ripple', 'Natural Grain', 'Fluted',
].map((name, i) => ({ name, slug: String(i + 1).padStart(2, '0'), img: `texture/${String(i + 1).padStart(2, '0')}` }));

export const textureIntro =
  'Eleven placeholder swatches. A real store would let shoppers choose a surface texture for their piece here.';

// ── Long-form copy ──────────────────────────────────────────────────────────
export const copy = {
  collection: 'Furniture and tableware in teak, stone and linen. Every piece on this site is a placeholder, shown to demonstrate how a collection can be laid out.',
  quote: {
    text: 'Good furniture is quiet. It holds a room together and asks for very little in return.',
    cite: 'FF Furniture',
  },
  about: [
    'FF Furniture is a demo store built by FF Dev Studio. It shows how a furniture shop can look and work: collections, product pages, a cart, a wishlist and a project gallery.',
    'Everything here is placeholder content. The products, prices, addresses and photographs fill the layout; they do not describe a real business.',
    'If you would like a store like this for your own range, get in touch with FF Dev Studio.',
  ],
  materials: [
    'Teak is a dense, oily hardwood that holds up well indoors and out. Its grain runs from pale gold to deep brown, and it darkens gently with age.',
    'Knots, cracks and shifts in colour are part of the material, so no two pieces look exactly alike.',
    'This page is placeholder copy, written to show how a materials story sits beside photography.',
  ],
};

// ── Home page ───────────────────────────────────────────────────────────────
export const hero = [
  {
    img: 'home/living-room-01',
    heading: 'Warm Wood, Quiet Rooms',
    cta: { label: 'Shop Now', href: '/collections/sofa.html' },
  },
  {
    img: 'home/dining-room-01',
    heading: 'A Table for Everyone',
    cta: { label: 'Discover the Dining Room', href: '/rooms/dining-room.html' },
  },
];

export const homeBanners = [
  {
    heading: 'Made from Teak',
    body: 'Warm, dense and honest grain. A placeholder story about the material.',
    cta: { label: 'Discover Materials', href: '/materials.html' },
    img: 'material/teak-table-top',
    side: 'right',
  },
  {
    heading: 'Storage for Every Wall',
    body: '',
    cta: { label: 'Shop Now', href: '/collections/sideboard-console.html' },
    img: 'home/dining-room-02',
    side: 'left',
  },
  {
    heading: 'Imperfect by Design',
    body: 'Knots, cracks and uneven tones are part of the wood. Placeholder copy for the demo store.',
    cta: { label: 'Read More', href: '/materials.html' },
    img: 'material/grain-macro',
    side: 'right',
  },
];

// The reference interleaves banner → product rail → banner.
export const homeRails = [
  { title: 'On the Table', slugs: ['live-edge-teak-bowl', 'teak-serving-board-with-knife', 'pierced-teak-bowl', 'teak-serving-board'] },
  { title: 'Small Pieces', slugs: ['teak-tray', 'river-stone-coaster-set', 'small-teak-bowl', 'slotted-serving-spoon'] },
];

export const detailsTitle = 'Close Up';
export const detailsBlurb = 'Details from the demo catalogue, shown on a plain ground.';
