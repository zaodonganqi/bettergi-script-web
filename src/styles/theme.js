import egg from "@/styles/egg.js";

const STORAGE_KEYS = {
    THEME: 'app-theme',
    THEME_LIST: 'app-theme-list'
};

// AntD 主题配置（如需制作深色主题的配色请使用dark为基准修改，避免一些情况发生）
export const antdThemes = {
    light: {
        name: {
            'zh-CN': '浅色',
            'zh-TW': '淺色',
            'en-US': 'Light',
            'ja-JP': 'ライト',
            'fr-FR': 'Clair'
        },
        token: {
            // 括号前为主题编辑器内颜色，括号内为项目中使用颜色，无括号则表示项目中未绑定但需要此值
            colorPrimary: '#1677ff', // 主色（主体组件颜色）
            colorInfo: '#1677ff', // 信息色 部分文本会用到
            colorInfoBg: '#e6f0ff', // 信息色的浅色背景颜色（阴影色，tag背景色，详情中简介块边框色）
            colorBgLayout: '#f7f8fa', // 布局背景色（菜单、列表背景色，除纯色外的主要背景色）
            colorBgContainer: '#ffffff', // 组件容器背景色（小组件背景色，详情区域背景色，与上面那条做色差的背景色之一）
            colorPrimaryBg: '#e6f4ff', // 主色浅色背景色 深色模式有用 按钮阴影色
            controlItemBgActive: '#f3f8ff', // 不知道怎么描述，借用了日历的选中背景色（详情中简介背景色，列表悬浮态背景色）
            colorPrimaryBgHover: '#1677ff14', // 主色浅色背景悬浮态（加载readme小弹窗阴影色）
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
        name: {
            'zh-CN': '深色',
            'zh-TW': '深色',
            'en-US': 'Dark',
            'ja-JP': 'ダーク',
            'fr-FR': 'Sombre'
        },
        token: {
            // 括号前为主题编辑器内颜色，括号内为项目中使用颜色，无括号则表示项目中未绑定但需要此值
            colorPrimary: '#1677ff', // 主色（主体组件颜色）
            colorInfo: '#383838', // 信息色 部分文本会用到
            colorInfoBg: '#787878', // 信息色的浅色背景颜色（阴影色，tag背景色，详情中简介块边框色）
            colorBgLayout: '#1b1b1c', // 布局背景色（菜单、列表背景色，除纯色外的主要背景色）
            colorBgContainer: '#151517', // 组件容器背景色（小组件背景色，详情区域背景色，与上面那条做色差的背景色之一）
            colorBgElevated: '#1b1b1c', // 弹窗背景色
            controlItemBgActive: '#43454a', // 不知道怎么描述，借用了日历的选中背景色（详情中简介背景色，列表悬浮态背景色）
            colorPrimaryBg: '#1b1b1c', // 主色浅色背景色
            colorPrimaryBgHover: '#1677ff14', // 主色浅色背景悬浮态（加载readme小弹窗阴影色）
            colorItemBgSelected: '#353638', // 菜单选中色（列表选中色）
            colorBorder: '#303030', // 一级边框色（几乎各类浅色线框的边框色，包括表格）
            colorBorderSecondary: '#404040', // 二级边框色
            colorText: '#ffffff', // 一级文本色
            colorTextSecondary: 'rgba(255, 255, 255, 0.65)', // 二级文本色
            colorTextTertiary: 'rgba(255, 255, 255, 0.45)', // 三级文本色
            colorTextQuaternary: 'rgba(255, 255, 255, 0.25)', // 四级文本色
            colorTextLightSolid: '#ffffff', // 主题色按钮中的文本色（有色按钮中的文本色，只在地图追踪详情的切换滑块中定义了亮色文本，如主题色较黑建议将.ant-menu-item-selected的color改为此映射）
            colorSuccessText: '#52c41a', // 成功色（有更新提示色）

            // 以下颜色不建议更改
            colorErrorText: '#ff4d4f' // 不用说了，错误色
        }
    },
    egg: {
        name: {
            'zh-CN': '千万别点！',
            'zh-TW': '千萬別點！',
            'en-US': 'Don\'t click this!',
            'ja-JP': '絶対にクリックしないで！',
            'fr-FR': 'Ne cliquez surtout pas !'
        },
        token: {
            // 菌子中毒级RGB炫彩！（这里只是基底，真操作请去egg.js）
            colorPrimary: '#FF00FF', // 死亡芭比粉
            colorInfo: '#39FF14', // 霓虹绿
            colorInfoBg: '#FF073A20', // 血腥红透明
            colorBgLayout: '#CC00FF20', // 电光紫透明
            colorBgContainer: '#00FFCC20', // 赛博青透明
            colorPrimaryBg: '#FF00FF20', // 死亡芭比粉透明
            controlItemBgActive: '#FF000020', // 纯红透明选中
            colorPrimaryBgHover: '#00FF0020', // 荧光绿透明悬浮
            colorItemBgSelected: '#0000FF20', // 纯蓝透明菜单选中
            colorBorder: '#6eff75', // 荧光绿
            colorText: '#FF0000', // 纯红文本
            colorTextSecondary: '#00FF00', // 纯绿二级文本
            colorTextTertiary: '#0000FF', // 纯蓝三级文本
            colorTextQuaternary: '#FFFF00', // 纯黄四级文本
            colorTextLightSolid: '#FFFFFF', // 白色按钮文本
            colorSuccessText: '#FF00FF', // 死亡芭比粉成功色
            colorErrorText: '#00FFFF' // 荧光青错误色
        }
    },
    transparent: {
        name: {
            'zh-CN': '个性化背景',
            'zh-TW': '個性化背景',
            'en-US': 'Custom Background',
            'ja-JP': 'カスタム背景',
            'fr-FR': 'Arrière-plan personnalisé'
        },
        token: {
            // 括号前为主题编辑器内颜色，括号内为项目中使用颜色，无括号则表示项目中未绑定但需要此值
            colorPrimary: '#1677ff', // 主色（主体组件颜色）
            colorInfo: '#1677ff', // 信息色 部分文本会用到
            colorInfoBg: 'rgba(22, 119, 255, 0.1)', // 信息色的浅色背景颜色（阴影色，tag背景色，详情中简介块边框色）
            colorBgLayout: 'rgba(255, 255, 255, 0.4)', // 布局背景色（菜单、列表背景色，除纯色外的主要背景色）
            colorBgContainer: 'rgba(255, 255, 255, 0.4)', // 组件容器背景色（小组件背景色，详情区域背景色，与上面那条做色差的背景色之一）
            colorPrimaryBg: 'rgba(22, 119, 255, 0.15)', // 主色浅色背景色 深色模式有用 按钮阴影色
            controlItemBgActive: 'rgba(243, 248, 255, 0.6)', // 不知道怎么描述，借用了日历的选中背景色（详情中简介背景色，列表悬浮态背景色）
            colorPrimaryBgHover: 'rgba(22, 119, 255, 0.08)', // 主色浅色背景悬浮态（加载readme小弹窗阴影色）
            colorItemBgSelected: 'rgba(169,203,250,0.5)', // 菜单选中色（列表选中色）
            colorBorder: 'rgba(223, 226, 229, 0.6)', // 一级边框色（几乎各类浅色线框的边框色，包括表格）
            colorText: '#1a1a1a', // 一级文本色
            colorTextSecondary: '#555', // 二级文本色
            colorTextTertiary: '#888', // 三级文本色
            colorTextQuaternary: '#aaa', // 四级文本色
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
    colorText: '--text-base',
    colorTextSecondary: '--text-base2',
    colorTextTertiary: '--text-base3',
    colorTextQuaternary: '--text-base4',
    colorTextLightSolid: '--text-light',
    colorSuccessText: '--color-update',

    // 以下颜色不建议更改
    colorErrorText: '--text-error',
};

export const DEFAULT_THEME = 'light';

// 自动从antdThemes获取主题列表
export const DEFAULT_THEMES = Object.keys(antdThemes);

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
export function getThemeName() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_THEME;
}

export function setTheme(name) {
    // const themeName = name || DEFAULT_THEME;
    // localStorage.setItem(STORAGE_KEYS.THEME, themeName);
    // registerTheme(themeName);
    if (DEFAULT_THEMES.includes(name))  {
        applyThemeToCSS(name);
        // 彩蛋配色千万不能存缓存
        if (!'egg'.includes(name)) {
            localStorage.setItem(STORAGE_KEYS.THEME, name);
        } else {
            egg.start();
            setTimeout(() => {
                egg.stop();
            }, 10000);
        }
    }
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