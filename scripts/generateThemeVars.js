import { antdThemes } from '../src/styles/theme.js';
import { tokenToCssVar } from "../src/config/theme-mapping.js";
import fs from 'fs';

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

console.log('🎉 已自动生成css变量注入');
