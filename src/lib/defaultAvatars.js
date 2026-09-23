/**
 * Default Avatar System — SKRTLIFE Digital Society
 * Central registry for all default platform characters.
 *
 * These are the ready-made identities users can pick if they don't want to
 * build a custom avatar. Each entry has a distinct Ready Player Me .glb so
 * they look different in the 3D viewport, plus a portrait/role/vibe for the
 * picker card. Always available — no admin seeding or DB dependency.
 */

export const DEFAULT_AVATARS = [
  {
    id: "avatar_01",
    name: "Nova",
    handle: "@nova.skrt",
    role: "Style Architect",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop",
    portrait: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop",
    glb_url: "https://models.readyplayer.me/6460d95f9ae10f45bffb2864.glb",
    gender: "feminine",
    vibe: "Editorial · Futurist",
    badge_color: "#E8D5C4",
    accent: "rgba(232,213,196,0.15)",
    status_options: ["Browsing drops", "In the studio", "Online"],
  },
  {
    id: "avatar_02",
    name: "Cipher",
    handle: "@cipher.skrt",
    role: "Digital Nomad",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
    portrait: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    glb_url: "https://models.readyplayer.me/65e24e8c1f91b9bf7af7e882.glb",
    gender: "masculine",
    vibe: "Streetwear · Cypherpunk",
    badge_color: "#C4D4E8",
    accent: "rgba(196,212,232,0.15)",
    status_options: ["In the metaverse", "Minting now", "Active"],
  },
  {
    id: "avatar_03",
    name: "Zara",
    handle: "@zara.skrt",
    role: "Cultural Curator",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=800&auto=format&fit=crop",
    portrait: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=400&auto=format&fit=crop",
    glb_url: "https://models.readyplayer.me/64b1c6f33571bf9e1a4f8e1d.glb",
    gender: "feminine",
    vibe: "Minimal · Avant-garde",
    badge_color: "#E8C4D4",
    accent: "rgba(232,196,212,0.15)",
    status_options: ["Exploring realms", "Shopping", "Online"],
  },
  {
    id: "avatar_04",
    name: "Kade",
    handle: "@kade.skrt",
    role: "Genesis Member",
    image: "https://images.unsplash.com/photo-1542327897-d73f4005b533?q=80&w=800&auto=format&fit=crop",
    portrait: "https://images.unsplash.com/photo-1542327897-d73f4005b533?q=80&w=400&auto=format&fit=crop",
    glb_url: "https://models.readyplayer.me/64bfa7d1e0f1d14f93b1e5e2.glb",
    gender: "masculine",
    vibe: "Utility · Hypebeast",
    badge_color: "#D4E8C4",
    accent: "rgba(212,232,196,0.15)",
    status_options: ["Just copped", "In DripSync", "Active"],
  },
];

export function getAvatarById(id) {
  return DEFAULT_AVATARS.find(a => a.id === id) || DEFAULT_AVATARS[0];
}

export function getRandomAvatar() {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
}

export function buildUserAvatar(avatarId) {
  return { type: "default", id: avatarId };
}