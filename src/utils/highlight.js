/**
 * 按空格分词，将文本中匹配任一 token 的部分用 <mark> 包裹
 * @param {string} text 原始文本
 * @param {string} keyword 搜索关键词（可含空格分词）
 * @returns {string} 带 <mark> 标签的 HTML，无匹配时返回原始文本
 */
export function highlightText(text, keyword) {
  if (!keyword || !text) return text;
  const tokens = keyword.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return text;
  const escaped = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return text.replace(new RegExp(`(${escaped.join('|')})`, 'gi'), '<mark>$1</mark>');
}

/**
 * 检查文本是否按顺序包含所有 token
 * 例如 tokens=["慕","蘑菇"]，text="慕风蘑菇" → true
 * @param {string} text 待检测文本（应预先 normalize）
 * @param {string[]} tokens 分词后的关键词数组（应预先 normalize）
 * @returns {boolean}
 */
export function matchesOrdered(text, tokens) {
  if (!tokens || tokens.length === 0) return true;
  let pos = 0;
  for (const token of tokens) {
    const idx = text.indexOf(token, pos);
    if (idx === -1) return false;
    pos = idx + token.length;
  }
  return true;
}

/**
 * 将搜索关键词按空格分词并 normalize
 * @param {string} keyword 原始搜索词
 * @param {(s: string) => string} normalize 标准化函数
 * @returns {string[]} 分词后的数组（已 normalize，已过滤空串）
 */
export function tokenize(keyword, normalize) {
  if (!keyword) return [];
  return keyword.trim().split(/\s+/).map(normalize).filter(Boolean);
}
