import avatars from '@/assets/combat_avatar.json';

let cachedAliasToNameMap = null;

function buildAliasToNameMap() {
  if (cachedAliasToNameMap) return cachedAliasToNameMap;
  const map = new Map();
  try {
    if (Array.isArray(avatars)) {
      for (const entry of avatars) {
        const name = String(entry?.name || '').trim();
        if (!name) continue;
        map.set(name.toLowerCase(), name);
        const aliasList = Array.isArray(entry?.alias) ? entry.alias : [];
        for (const al of aliasList) {
          const key = String(al || '').trim();
          if (!key) continue;
          map.set(key.toLowerCase(), name);
        }
      }
    }
  } catch (e) {
    // noop
  }
  cachedAliasToNameMap = map;
  return cachedAliasToNameMap;
}

export function toCanonicalRoleName(tag) {
  if (!tag || typeof tag !== 'string') return '';
  const map = buildAliasToNameMap();
  const hit = map.get(tag.toLowerCase());
  return hit || tag;
}

export function mapTagsToCanonical(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map(t => toCanonicalRoleName(String(t)));
}


