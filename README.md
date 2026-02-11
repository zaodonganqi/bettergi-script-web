# BGI-BSW 脚本仓库

BetterGI 脚本仓库 Web 界面

[Vue](https://img.shields.io/badge/Vue-3.4.0-4FC08D?style=flat-square&logo=vue.js)
[Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat-square&logo=vite)
[Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.2-1890FF?style=flat-square&logo=ant-design)

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装与运行
```bash
git clone https://github.com/zaodonganqi/bettergi-script-web.git
cd bettergi-script-web
npm install
npm run dev
```

访问 `http://localhost:5173` 查看项目

## 构建部署

### 在线模式
适用于 Web 部署，数据从远程加载
```bash
npm run build
```

### 本地模式
生成单文件版本，支持离线使用，提供给 BGI 本体使用
```bash
npm run build:single
```

### 构建插件

项目运行时自动加载以下 Vite 插件：

- **generateThemeVars** - 动态生成主题 CSS 变量
- **markdownInlineImages** - Markdown 图片内联处理
- **viteSingleFile** - 单文件构建支持
- **inlineFavicon** - 图标内联
- **vue** - Vue 3 支持

## 目录结构

```
src/
├── components/
│   ├── LayoutMain.vue    # 主布局
│   ├── lists/           # 列表组件
│   │   ├── MapTreeList.vue
│   │   ├── ScriptList.vue
│   │   ├── CombatStrategyList.vue
│   │   └── CardStrategyList.vue
│   ├── details/         # 详情组件
│   │   ├── MapDetail.vue
│   │   ├── ScriptDetail.vue
│   │   └── StrategyDetail.vue
│   └── items/          # 弹窗与通用组件
│       ├── Announcement.vue
│       ├── Comment.vue
│       ├── Help.vue
│       ├── Plan.vue
│       └── ReadmeViewer.vue
├── stores/            # 状态管理
│   ├── mainStore.js
│   ├── settingsStore.js
│   └── listStore.js
├── locales/           # 多语言
├── utils/            # 工具函数
├── styles/           # 样式
│   ├── animations.css
│   └── theme.js
├── config/           # 配置
├── assets/           # 静态资源
├── App.vue
└── main.js
```

## 核心功能

### 脚本管理
- 地图追踪：树状结构展示地图资源
- JavaScript 脚本：功能脚本列表
- 战斗策略
- 七圣召唤策略

### 搜索与过滤
- 关键词搜索
- 订阅状态过滤
- 角色标签过滤
- 多种排序方式

### 主题系统
- 浅色/深色/透明三种主题
- 自定义背景图片

### 订阅功能
- 一键订阅多个脚本
- 订阅更新追踪
- BetterGI 深度集成

## 技术栈

- Vue 3.4.0 + Vite 5.0.0 + Pinia 3.0.0
- Ant Design Vue 4.2.6
- Vue I18n 11.1.11、GSAP 3.14.2、Driver.js

## 多语言支持

简体中文、繁体中文、英文、日文、法文

## 贡献

欢迎提交 Issue 反馈问题或建议。

## 相关链接

- [BetterGI 官网](https://bettergi.com/)
- [BetterGI 主仓库](https://github.com/babalae/better-genshin-impact/)
- [BetterGI 脚本仓库](https://github.com/babalae/bettergi-scripts-list/)

## 许可证

Apache License 2.0
