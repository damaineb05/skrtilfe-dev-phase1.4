// ─────────────────────────────────────────────────────────────────────────
// XUMO Play channel catalog
//
// Real network IDs / slugs harvested from play.xumo.com/networks.
// Logos come from XUMO's public image CDN; watch URLs are the canonical
// play.xumo.com network deep-links. This is the single source of truth for
// the Streaming Hub — add rows here and they automatically appear across the
// browse grid, sidebar, home rail, and player.
// ─────────────────────────────────────────────────────────────────────────

const IMG = (id) => `https://image.xumo.com/v1/channels/channel/${id}/800x450.webp?type=channelTile`;
const WATCH = (slug, id) => `https://play.xumo.com/networks/${slug}/${id}`;

// [id, name, category, slug]
const RAW = [
  // ── News ──
  ['99951517', 'ABC News Live', 'News', 'abc-news-live'],
  ['99991245', 'TODAY All Day', 'News', 'today-all-day'],
  ['99991148', 'Scripps News', 'News', 'scripps-news'],
  ['99991694', 'Fox Weather', 'News', 'fox-weather'],
  ['99991276', 'CBC News', 'News', 'cbc-news'],
  ['99991220', 'Cheddar News', 'News', 'cheddar-news'],
  ['99991147', 'TYT', 'News', 'tyt'],
  ['99991649', 'AccuWeather NOW', 'News', 'accuweather-now'],
  ['99991635', 'LiveNOW from FOX', 'News', 'livenow-from-fox'],
  ['99951570', 'Business Insider', 'News', 'business-insider'],
  ['99951533', 'Bloomberg TV+', 'News', 'bloomberg-tv-plus'],
  ['99951404', 'OAN Plus', 'News', 'oan-plus'],
  ['99951386', 'CNN Headlines', 'News', 'cnn-headlines'],
  ['99991282', 'Local Now', 'News', 'local-now'],
  ['99951337', 'Spectrum News+', 'News', 'spectrum-news-plus'],
  ['99951298', 'BBC News', 'News', 'bbc-news'],
  ['99991247', 'NBC News NOW', 'News', 'nbc-news-now'],
  ['99951283', 'Salem News Channel', 'News', 'salem-news-channel'],
  ['99991194', 'Newsmax2', 'News', 'newsmax2'],
  ['99951223', 'Sky News', 'News', 'sky-news'],
  ['99991158', 'CBS News 24/7', 'News', 'cbs-news-24-7'],
  ['99951197', 'Reuters 60', 'News', 'reuters-60'],

  // ── Movies ──
  ['99991337', 'FilmRise', 'Movies', 'filmrise'],
  ['99991363', 'Xumo Free Black Cinema', 'Movies', 'xumo-free-black-cinema'],
  ['99991392', 'Xumo Free Documentaries', 'Movies', 'xumo-free-documentaries'],
  ['99991125', 'Xumo Her Free Movies', 'Movies', 'xumo-her-free-movies'],
  ['99991299', 'Xumo Free Movies', 'Movies', 'xumo-free-movies'],
  ['9995106', 'Shades of Black', 'Movies', 'shades-of-black'],
  ['99951288', 'OUTflix Movies', 'Movies', 'outflix-movies'],
  ['99991638', 'DOCUMENTARY+', 'Movies', 'documentary-plus'],
  ['99991399', 'Magnolia Selects', 'Movies', 'magnolia-selects'],
  ['99991386', 'NEW Korean Movies & Series', 'Movies', 'new-korean-movies-and-series'],
  ['99991300', 'Stash TV', 'Movies', 'stash-tv'],
  ['99951411', 'Shout! Movies', 'Movies', 'shout-movies'],
  ['99991709', 'Hallmark Movies & More', 'Movies', 'hallmark-movies-and-more'],
  ['99951335', 'CINEVAULT', 'Movies', 'cinevault'],
  ['99991312', 'Gravitas Movies', 'Movies', 'gravitas-movies'],
  ['99991336', 'Maverick Black Cinema', 'Movies', 'maverick-black-cinema'],
  ['99991302', 'Hi-Yah!', 'Movies', 'hi-yah'],
  ['99991621', 'Universal Movies', 'Movies', 'universal-movies'],
  ['99951596', 'Great American RomComs', 'Movies', 'great-american-romcoms'],
  ['99951593', "ITN's CreatureVerse", 'Movies', 'itn-s-creatureverse'],
  ['99951573', 'MGM Presents', 'Movies', 'mgm-presents'],
  ['99951572', 'MGM Presents: Action', 'Movies', 'mgm-presents-action'],
  ['99951251', 'MovieSphere by Lionsgate', 'Movies', 'moviesphere-by-lionsgate'],

  // ── Sports ──
  ['99951462', 'GOLFPASS', 'Sports', 'golfpass'],
  ['99991281', 'PGA TOUR', 'Sports', 'pga-tour'],
  ['99991374', 'Field & Stream TV', 'Sports', 'field-and-stream-tv'],
  ['99991358', 'Waypoint TV', 'Sports', 'waypoint-tv'],
  ['99991627', 'Billiard TV', 'Sports', 'billiard-tv'],
  ['99991633', 'PokerGO', 'Sports', 'pokergo'],
  ['99991317', 'World Poker Tour', 'Sports', 'world-poker-tour'],

  // ── Classic TV ──
  ['99951576', 'In the Heat of the Night', 'Classic TV', 'in-the-heat-of-the-night'],
  ['99951578', 'The Addams Family', 'Classic TV', 'the-addams-family'],

  // ── Westerns & Country ──
  ['99951575', 'MGM Presents: Westerns', 'Westerns & Country', 'mgm-presents-westerns'],
];

export const XUMO_CHANNELS = RAW.map(([id, name, category, slug]) => ({
  id,
  name,
  category,
  slug,
  logo: IMG(id),
  watchUrl: WATCH(slug, id),
  // kept for backward-compat with any consumer that still reads `embed`
  embed: WATCH(slug, id),
}));

// Distinct categories in catalog order, with counts — used to build the
// sidebar dynamically so it never shows empty groups.
export const XUMO_CATEGORY_COUNTS = XUMO_CHANNELS.reduce((acc, ch) => {
  const key = ch.category.toLowerCase();
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});