import { antdThemes } from '../src/styles/theme.js';
import { tokenToCssVar } from "../src/config/themeMapping.js";
import fs from 'fs';

/**
 * 生成主题 CSS 变量
 * 在 Vite 配置中调用，返回空对象以兼容插件系统
 */
export function generateThemeVars() {
  console.log('开始生成css变量注入...');
  const lightToken = antdThemes.light?.token || {};
  const lightOther = antdThemes.light?.other || {};

  let css = `/* AUTO GENERATED - DO NOT EDIT */\n:root {\n`;

  Object.entries(tokenToCssVar).forEach(([tokenKey, cssVar]) => {
    const value = lightToken[tokenKey];
    css += `  ${cssVar}: ${value ?? 'initial'};\n`;
  });

  Object.entries(lightOther).forEach(([key, value]) => {
    css += `  --${key}: ${value ?? 'initial'};\n`;
  });

  css += `}\n`;

  fs.writeFileSync(
    'src/styles/gen-theme-vars.css',
    css,
    'utf8'
  );

  console.log('已自动生成css变量注入\n');

  // 返回空对象以兼容 Vite 插件
  return {};
}
