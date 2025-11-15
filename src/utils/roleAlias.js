import avatars from '@/assets/combat_avatar.json';
import { pinyin } from 'pinyin-pro';

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

// 多音字映射表
const customPinyinMap = {
  '茜特菈莉': 'xitelali',
};

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

// 将中文字符串转换为拼音，全部小写拼接
export function toPinyin(str) {
  if (!str || typeof str !== 'string') return '';

  if (customPinyinMap[str]) {
    return customPinyinMap[str];
  }

  return pinyin(str, { toneType: 'none', type: 'string' })
      .replace(/\s+/g, '')  // 去掉空格
      .toLowerCase();
}

