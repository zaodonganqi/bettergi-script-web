const STORAGE_KEYS = {
    THEME: 'app-theme',
    THEME_LIST: 'app-theme-list'
};

// AntD 主题配置
export const antdThemes = {
    light: {
        token: {
            // 括号前为主题编辑器内颜色，括号内为项目中使用颜色，无括号则表示项目中未绑定但需要此值
            colorPrimary: '#1677ff', // 主色（主体组件颜色）
            colorInfo: '#1677ff', // 信息色 部分文本会用到
            colorInfoBg: '#e6f0ff', // 信息色的浅色背景颜色（阴影色，tag背景色，详情中简介块边框色）
            colorBgLayout: '#f7f8fa', // 布局背景色（菜单、列表背景色，除纯色外的主要背景色）
            colorBgContainer: '#ffffff', // 组件容器背景色（小组件背景色，详情区域背景色，与上面那条做色差的背景色之一）
            controlItemBgActive: '#f3f8ff', // 不知道怎么描述，借用了日历的选中背景色（详情中简介背景色，列表悬浮态背景色）
            colorPrimaryBgHover: '#1677ff14', // 主色浅色背景悬浮态（加载readme小弹窗边框色）
            colorItemBgSelected: '#e6f4ff', // 菜单选中色（列表选中色）
            colorBorder: '#dfe2e5', // 一级边框色（几乎各类浅色线框的边框色，包括表格）
            colorText: '#141414FF', // 一级文本色
            colorTextSecondary: '#666', // 二级文本色
            colorTextTertiary: '#999', // 三级文本色
            colorTextQuaternary: '#bbb', // 四级文本色
            colorTextLightSolid: '#ffffff', // 主题色按钮中的文本色（有色按钮中的文本色，只在地图追踪详情的切换滑块中定义了亮色文本，如主题色较黑建议将.ant-menu-item-selected的color改为此映射）
            colorSuccessText: '#52c41a', // 成功色（有更新提示色）

            // 以下颜色不建议更改
            colorErrorText: '#ff4d4f' // 不用说了，错误色
        }
    },
    dark: {
        token: {
            // 括号前为主题编辑器内颜色，括号内为项目中使用颜色，无括号则表示项目中未绑定但需要此值
            colorPrimary: '#1677ff', // 主色（主体组件颜色）
            colorInfo: '#1677ff', // 信息色 部分文本会用到
            colorInfoBg: '#e6f0ff', // 信息色的浅色背景颜色（阴影色，tag背景色，详情中简介块边框色）
            colorBgLayout: '#f7f8fa', // 布局背景色（菜单、列表背景色，除纯色外的主要背景色）
            colorBgContainer: '#ffffff', // 组件容器背景色（小组件背景色，详情区域背景色，与上面那条做色差的背景色之一）
            controlItemBgActive: '#f3f8ff', // 不知道怎么描述，借用了日历的选中背景色（详情中简介背景色，列表悬浮态背景色）
            colorPrimaryBgHover: '#1677ff14', // 主色浅色背景悬浮态（加载readme小弹窗边框色）
            colorItemBgSelected: '#e6f4ff', // 菜单选中色（列表选中色）
            colorBorder: '#dfe2e5', // 一级边框色（几乎各类浅色线框的边框色，包括表格）
            colorText: '#141414FF', // 一级文本色
            colorTextSecondary: '#666', // 二级文本色
            colorTextTertiary: '#999', // 三级文本色
            colorTextQuaternary: '#bbb', // 四级文本色
            colorTextLightSolid: '#ffffff', // 主题色按钮中的文本色（有色按钮中的文本色，只在地图追踪详情的切换滑块中定义了亮色文本，如主题色较黑建议将.ant-menu-item-selected的color改为此映射）
            colorSuccessText: '#52c41a', // 成功色（有更新提示色）

            // 以下颜色不建议更改
            colorErrorText: '#ff4d4f' // 不用说了，错误色
        }
    }
};

// Token 到 CSS 变量的映射
const tokenToCssVar = {
    colorPrimary: '--color-primary',
    colorBorder: '--border-base',
    colorInfoBg: '--color-shadow',
    colorBgLayout: '--bg-menu',
    colorBgContainer: '--bg-container',
    colorPrimaryBgHover: '--bg-shadow-light',
    colorItemBgSelected: '--bg-item-selected',
    controlItemBgActive: '--bg-desc',
    colorTextSecondary: '--text-base2',
    colorTextTertiary: '--text-base3',
    colorTextQuaternary: '--text-base4',
    colorTextLightSolid: '--text-light',
    colorSuccessText: '--color-update',

    // 以下颜色不建议更改
    colorErrorText: '--text-error',
};

const DEFAULT_THEME = 'light';
const DEFAULT_THEMES = ['light', 'dark'];

// 存储操作
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (_) {}
}

function loadFromStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (_) {
        return null;
    }
}

// 主题列表管理
let themeList = loadFromStorage(STORAGE_KEYS.THEME_LIST) || DEFAULT_THEMES;

export function getThemeNames() {
    return [...new Set(themeList)];
}

export function registerTheme(name) {
    if (!name || themeList.includes(name)) return;
    themeList.push(name);
    saveToStorage(STORAGE_KEYS.THEME_LIST, themeList);
}

// 当前主题管理
export function getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_THEME;
}

export function setTheme(name) {
    const themeName = name || DEFAULT_THEME;
    localStorage.setItem(STORAGE_KEYS.THEME, themeName);
    registerTheme(themeName);
}

// 应用主题到 CSS 变量
export function applyThemeToCSS(themeName) {
    const theme = getThemeByName(themeName).token;

    Object.keys(tokenToCssVar).forEach(tokenKey => {
        const cssVar = tokenToCssVar[tokenKey];
        const value = theme[tokenKey];
        if (value) {
            document.documentElement.style.setProperty(cssVar, value);
        }
    });
}

export function getThemeByName(themeName) {
    return antdThemes[themeName] || antdThemes.light;
}