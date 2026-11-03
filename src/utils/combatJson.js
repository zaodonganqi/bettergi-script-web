// JSON 战斗策略（BetterGI 0.62+）的可读化工具：
// 把动作串与条件表达式翻译成中文，供策略详情页渲染。

const KEY_NAMES = {
  LBUTTON: '左键', RBUTTON: '右键', MBUTTON: '中键',
  E: 'E', Q: 'Q', R: 'R', W: 'W', A: 'A', S: 'S', D: 'D',
};

const DIR_NAMES = {
  W: '前进', A: '左移', S: '后退', D: '右移',
  LBUTTON: '左键', RBUTTON: '右键', MBUTTON: '中键',
};

const MOVE_NAMES = {
  w: '前进', s: '后退', a: '左移', d: '右移',
  W: '前进', S: '后退', A: '左移', D: '右移',
};

const CMP_TEXT = {
  '>': (n) => `超过 ${n} 秒`,
  '<': (n) => `少于 ${n} 秒`,
  '>=': (n) => `达到 ${n} 秒`,
  '<=': (n) => `不超过 ${n} 秒`,
  '==': (n) => `正好 ${n} 秒`,
  '!=': (n) => `不是 ${n} 秒`,
};

function keyName(raw) {
  let base = String(raw || '').toUpperCase();
  if (base.startsWith('VK_')) base = base.slice(3);
  return DIR_NAMES[base] || KEY_NAMES[base] || base;
}

function fmtSec(x) {
  const n = Math.round(Number(x) * 100) / 100;
  return `${n}s`;
}

// 按顶层逗号切分，避免拆开函数参数里的逗号
export function splitCmds(action) {
  const out = [];
  let buf = '';
  let depth = 0;
  for (const ch of String(action || '')) {
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      out.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf);
  return out.map((x) => x.trim()).filter(Boolean);
}

function parseSteps(action) {
  const steps = [];
  const parts = splitCmds(action);

  for (const p of parts) {
    let m;

    if ((m = p.match(/^keypress\(([A-Za-z0-9_]+)\)$/))) {
      const base = m[1].replace(/^VK_/i, '').toUpperCase();
      if (base === 'LBUTTON') steps.push(['attack', '普攻']);
      else if (base === 'E') steps.push(['skill', 'E']);
      else if (base === 'Q') steps.push(['skill', 'Q']);
      else steps.push(['hold', `${keyName(base)} 键`]);
      continue;
    }

    if ((m = p.match(/^([eqEQ])(?:\((hold)\))?$/))) {
      const label = m[1].toUpperCase();
      steps.push(['skill', m[2] ? `长按 ${label}` : label]);
      continue;
    }

    if ((m = p.match(/^attack(?:\(([\d.]+)\))?$/))) {
      steps.push(['attack', m[1] ? `普攻 ${fmtSec(m[1])}` : '普攻']);
      continue;
    }

    if ((m = p.match(/^charge(?:\(([\d.]+)\))?$/))) {
      steps.push(['charge', m[1] ? `重击 ${fmtSec(m[1])}` : '重击']);
      continue;
    }

    if ((m = p.match(/^(?:wait|after|等待)\(([\d.]+)\)$/))) {
      steps.push(['wait', Number(m[1])]);
      continue;
    }

    if (MOVE_NAMES[p]) {
      steps.push(['move', MOVE_NAMES[p]]);
      continue;
    }

    if ((m = p.match(/^([wasdWASD])\(([\d.]+)\)$/))) {
      steps.push(['move', `${MOVE_NAMES[m[1]] || m[1]} ${fmtSec(m[2])}`]);
      continue;
    }

    if (p === 'j' || p === 'jump' || p === '跳跃') {
      steps.push(['move', '跳跃']);
      continue;
    }

    if (p === 'dash' || p === '冲刺') {
      steps.push(['move', '冲刺']);
      continue;
    }
    if ((m = p.match(/^dash\(([\d.]+)\)$/))) {
      steps.push(['move', `冲刺 ${fmtSec(m[1])}`]);
      continue;
    }

    if (p === 'check' || p === '检测') {
      steps.push(['text', '战斗结束检查']);
      continue;
    }
    if (p === 'ready' || p === '完成') {
      steps.push(['text', '等角色就绪']);
      continue;
    }
    if (p === 'round') {
      steps.push(['text', '回合标记']);
      continue;
    }

    if ((m = p.match(/^(?:verticalscroll|scroll)\(\s*(-?\d+)\s*\)$/))) {
      const n = Number(m[1]);
      steps.push(['text', n < 0 ? `滚轮向下 ${Math.abs(n)} 格` : `滚轮向上 ${n} 格`]);
      continue;
    }

    if ((m = p.match(/^walk\(\s*([wasdWASD])\s*,\s*([\d.]+)\s*\)$/))) {
      steps.push(['move', `${MOVE_NAMES[m[1]] || m[1]} ${fmtSec(m[2])}`]);
      continue;
    }

    if ((m = p.match(/^moveby\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/))) {
      const dx = Number(m[1]);
      const dy = Number(m[2]);
      if (dy === 0 && dx !== 0) steps.push(['move', `视角向${dx > 0 ? '右' : '左'}转 ${Math.abs(dx)}`]);
      else if (dx === 0 && dy !== 0) steps.push(['move', `视角向${dy > 0 ? '下' : '上'}转 ${Math.abs(dy)}`]);
      else steps.push(['move', `视角转动 (${dx}, ${dy})`]);
      continue;
    }

    steps.push(['other', p]);
  }

  return steps;
}

function mergeSteps(steps) {
  const merged = [];
  for (const [kind, val] of steps) {
    if (kind === 'attack') {
      if (merged.length && merged[merged.length - 1][0] === 'attack') {
        merged[merged.length - 1][1].push(val);
      } else {
        merged.push([kind, [val]]);
      }
      continue;
    }
    if (merged.length && kind === 'wait' && merged[merged.length - 1][0] === 'wait') {
      merged[merged.length - 1][1] += val;
      continue;
    }
    merged.push([kind, val]);
  }
  return merged;
}

function joinSteps(items) {
  const out = [];
  for (const [kind, val] of items) {
    if (kind === 'attack') {
      const uniq = new Set(val);
      if (uniq.size === 1) out.push(val.length > 1 ? `${val[0]} ×${val.length}` : val[0]);
      else out.push(val.join('、'));
    } else if (kind === 'wait') {
      out.push(`等 ${fmtSec(val)}`);
    } else {
      out.push(val);
    }
  }
  return out;
}

function wrapHolds(items) {
  const out = [];
  let i = 0;
  while (i < items.length) {
    const [kind, val] = items[i];

    if (kind === 'other') {
      let m = String(val).match(/^keydown\(([A-Za-z0-9_]+)\)$/);
      if (m) {
        const key = m[1];
        let depth = 1;
        let j = i + 1;
        while (j < items.length) {
          const [k2, v2] = items[j];
          if (k2 === 'other' && new RegExp(`^keydown\\(${key}\\)$`).test(v2)) depth += 1;
          else if (k2 === 'other' && new RegExp(`^keyup\\(${key}\\)$`).test(v2)) {
            depth -= 1;
            if (depth === 0) break;
          }
          j += 1;
        }

        const name = keyName(key);
        const sep = /^[\x00-\x7F]+$/.test(name) ? ' ' : '';

        if (j >= items.length) {
          out.push(['hold', `按下${sep}${name}`]);
          i += 1;
          continue;
        }

        const inner = items.slice(i + 1, j);
        const total = inner.reduce((acc, [k, v]) => (k === 'wait' ? acc + v : acc), 0);

        if (inner.length === 1 && inner[0][0] === 'wait') {
          if (total <= 0.05) out.push(['hold', `点按${sep}${name}`]);
          else out.push(['hold', `按住${sep}${name} ${fmtSec(total)}`]);
        } else {
          const body = compressAll(joinSteps(wrapHolds(inner))).join(' → ');
          const suffix = total ? `（共 ${fmtSec(total)}）` : '';
          out.push(['hold', `按住${sep}${name}：${body}${suffix}`]);
        }
        i = j + 1;
        continue;
      }

      m = String(val).match(/^keyup\(([A-Za-z0-9_]+)\)$/);
      if (m) {
        out.push(['hold', `松开 ${keyName(m[1])}`]);
        i += 1;
        continue;
      }
    }

    out.push(items[i]);
    i += 1;
  }
  return out;
}

function compressAll(list) {
  let out = [...list];
  for (;;) {
    const n = out.length;
    let best = null;
    for (let p = 1; p <= Math.floor(n / 2); p += 1) {
      let s = 0;
      while (s + p <= n) {
        let reps = 0;
        let i = s;
        while (i + p <= n && out.slice(i, i + p).join('|') === out.slice(s, s + p).join('|')) {
          reps += 1;
          i += p;
        }
        if (reps >= 2) {
          const score = p * reps;
          if (!best || score > best.score) best = { score, s, p, reps };
          s = i;
        } else {
          s += 1;
        }
      }
    }
    if (!best || best.score < 6) return out;
    const body = `(${out.slice(best.s, best.s + best.p).join(' → ')}) ×${best.reps}`;
    out = [...out.slice(0, best.s), body, ...out.slice(best.s + best.score)];
  }
}

export function translateAction(action) {
  const steps = wrapHolds(mergeSteps(parseSteps(action)));
  return compressAll(joinSteps(steps));
}

// ---------- 条件表达式 ----------

function splitTop(expr, op) {
  const parts = [];
  let buf = '';
  let depth = 0;
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    if (depth === 0 && expr.startsWith(op, i)) {
      parts.push(buf);
      buf = '';
      i += op.length;
      if (expr[i] === ' ') i += 1;
      continue;
    }
    buf += ch;
    i += 1;
  }
  parts.push(buf);
  return parts.map((x) => x.trim()).filter(Boolean);
}

function splitArgs(raw) {
  const out = [];
  let buf = '';
  let depth = 0;
  for (const ch of raw) {
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      out.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function stripOuterParens(expr) {
  let s = String(expr || '').trim();
  while (s.startsWith('(') && s.endsWith(')')) {
    let depth = 0;
    let wrapped = true;
    for (let i = 0; i < s.length; i += 1) {
      if (s[i] === '(') depth += 1;
      else if (s[i] === ')') depth -= 1;
      if (depth === 0 && i < s.length - 1) {
        wrapped = false;
        break;
      }
    }
    if (!wrapped) break;
    s = s.slice(1, -1).trim();
  }
  return s;
}

const BARE_NAMES = {
  'e-ready': 'E 就绪',
  'q-ready': 'Q 就绪',
  t: '战斗开始后',
  'last-check': '距上次战斗结束检查',
  onfield: '当前角色在场',
  'low-hp': '血量偏低',
  count: '执行次数',
};

function replaceBare(text) {
  let out = text;
  for (const [k, v] of Object.entries(BARE_NAMES)) {
    out = out.replace(new RegExp(`\\b${k.replace(/-/g, '\\-')}\\b`, 'g'), v);
  }
  return out;
}

function transValue(raw, time = false) {
  const src = String(raw ?? '').trim();
  const m = src.match(/^([a-z-]+)\((.*)\)$/s);
  if (!m) {
    if (src === 'since') return time ? '距上次施放的时间' : '距上次施放';
    return replaceBare(src);
  }
  const fn = m[1];
  const args = splitArgs(m[2]);
  const a0 = args[0] || '';

  switch (fn) {
    case 'e-ready':
      return a0 ? `${a0} E 就绪` : 'E 就绪';
    case 'q-ready':
      return a0 ? `${a0} Q 就绪` : 'Q 就绪';
    case 'in-party':
      return a0 ? `队伍中有 ${a0}` : '在队伍中';
    case 'onfield':
      return a0 ? `${a0} 在场` : '当前角色在场';
    case 'since': {
      if (!a0) return time ? '距上次施放的时间' : '距上次施放';
      if (/^-?[\d.]+$/.test(a0)) return time ? `距 Index ${a0} 的动作上次执行的时间` : `距 Index ${a0} 的动作`;
      return time ? `距「${a0}」上次施放的时间` : `距「${a0}」`;
    }
    case 'last-exec': {
      if (!a0) return time ? '距上次施放的时间' : '距上次施放';
      if (/^-?[\d.]+$/.test(a0)) return `距 Index ${a0} 的动作上次施放`;
      return `距上次「${a0}」`;
    }
    case 'count': {
      if (!a0) return time ? '执行次数' : '执行次数';
      if (/^-?[\d.]+$/.test(a0)) return `Index ${a0} 的动作执行次数`;
      return `「${a0}」执行次数`;
    }
    case 'last-check':
      return '距上次战斗结束检查';
    case 'e-cd':
      return a0 ? `${a0} 的 E 冷却` : 'E 冷却';
    case 'q-cd':
      return a0 ? `${a0} 的 Q 冷却` : 'Q 冷却';
    case 'low-hp':
      return a0 ? `${a0} 血量偏低` : '血量偏低';
    case 't':
      return '战斗开始后';
    case 'battle-time':
      return '战斗时长';
    case 'min':
    case 'max': {
      const word = fn === 'min' ? '较近' : '较远';
      const sinceArgs = args.map((a) => {
        const mm = a.match(/^since\((.*)\)$/);
        return mm ? mm[1] : null;
      });
      if (sinceArgs.length === 2 && sinceArgs.every(Boolean)) {
        return `距「${sinceArgs[0]}」与「${sinceArgs[1]}」中${word}的一次`;
      }
      return `${args.map(transValue).join('、')} 中${word}的一次`;
    }
    default:
      return raw;
  }
}

const CMP_WORD = {
  '>': '长于', '<': '短于', '>=': '不短于', '<=': '不长于', '==': '等于', '!=': '不等于',
};

function transCompare(term) {
  if (term.includes('&&') || term.includes('||')) return translateCondition(term);

  for (const op of ['>=', '<=', '==', '!=', '>', '<']) {
    const parts = splitTop(term, op);
    if (parts.length !== 2) continue;
    const [left, right] = parts;
    if (/^-?[\d.]+$/.test(right)) {
      const phrase = CMP_TEXT[op] ? CMP_TEXT[op](right) : `${op} ${right}`;
      return transValue(left) + phrase;
    }
    return `${transValue(left, true)} ${CMP_WORD[op]} ${transValue(right, true)}`;
  }

  return transValue(term);
}

function transTerm(termRaw) {
  let term = stripOuterParens(String(termRaw || '').trim());
  if (term === 'true') return '恒成立';
  if (term === 'false') return '恒不成立';

  let neg = false;
  while (term.startsWith('!')) {
    neg = true;
    term = stripOuterParens(term.slice(1).trim());
  }

  const text = transCompare(term);
  return neg ? `非（${text}）` : text;
}

export function translateCondition(exprRaw) {
  const expr = stripOuterParens(exprRaw);
  if (!expr) return '';

  const ors = splitTop(expr, '||');
  if (ors.length > 1) {
    const parts = ors.map((x) => stripOuterParens(x));
    const names = parts.map((p) => p.match(/^in-party\((.*)\)$/));
    if (names.every(Boolean)) {
      return `队伍中有 ${names.map((n) => n[1]).join('、')} 之一`;
    }
    return parts.map(translateCondition).join(' 或 ');
  }

  const ands = splitTop(expr, '&&');
  if (ands.length > 1) {
    const roles = new Set();
    ands.forEach((t) => {
      const m = t.trim().match(/^(?:e-ready|q-ready)\((.*?)\)$/);
      if (m) roles.add(m[1]);
    });
    const texts = ands.map((t) => {
      const ts = t.trim();
      const m = ts.match(/^since\((.*?)\)\s*(>=|<=|==|!=|>|<)\s*(-?[\d.]+)$/);
      if (m && roles.has(m[1])) {
        const phrase = CMP_TEXT[m[2]] ? CMP_TEXT[m[2]](m[3]) : `${m[2]} ${m[3]}`;
        return `距上次施放${phrase}`;
      }
      return transTerm(ts);
    });
    return texts.join(' 且 ');
  }

  return transTerm(expr);
}

// ---------- 策略结构整理 ----------

export function buildCombatRows(data) {
  const src = data || {};
  const info = src.Info || src.info || {};
  const actions = src.Actions || src.actions || [];

  // 按引擎的方式展开：主条件条目用 Index 作优先级，morePriorities 各用自己的 priority
  const queue = [];
  actions.forEach((a, i) => {
    const index = a.Index ?? a.index ?? i;
    const cond = (a.Condition && (a.Condition.Expression ?? a.Condition.expression))
      || (a.condition && (a.condition.expression ?? a.condition.Expression)) || '';
    queue.push({ action: a, priority: index, isExtra: false, index, condition: cond });
    (a.MorePriorities || a.morePriorities || []).forEach((m) => {
      queue.push({
        action: a,
        priority: (m && (m.Priority ?? m.priority)) ?? 0,
        isExtra: true,
        index,
        condition: (m && (m.Expression ?? m.expression)) || '',
      });
    });
  });

  queue.sort((x, y) => x.priority - y.priority);

  const rows = queue.map((item, i) => {
    const a = item.action;
    const act = a.Action ?? a.action ?? '';
    return {
      key: `${item.priority}-${item.index}-${i}`,
      priority: item.priority,
      isExtra: item.isExtra,
      ownIndex: item.index,
      character: a.Character || a.character || '',
      actionName: a.Name || a.name || '',
      condition: item.condition,
      conditionText: translateCondition(item.condition),
      action: act,
      actionText: translateAction(act).join(' → '),
      ensureCast: !!(a.EnsureCast ?? a.ensureCast),
    };
  });

  const preActions = (info.PreActions || info.preActions || []).map((s) => ({
    raw: s,
    text: translateAction(s).join(' → ') || s,
  }));

  return { preActions, rows };
}
