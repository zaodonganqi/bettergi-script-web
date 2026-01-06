import { antdThemes } from '../src/styles/theme.js';
import fs from 'fs';

const lightToken = antdThemes.light?.token || {};
const lightOther = antdThemes.light?.other || {};

let css = `/* AUTO GENERATED - DO NOT EDIT */\n:root {\n`;

Object.entries(lightToken).forEach(([key, value]) => {
    css += `  --${key}: ${value ?? 'initial'};\n`;
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
