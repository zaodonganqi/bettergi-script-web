# 🎮 BGI-BSW 脚本仓库

> **BetterGI ScriptsList Web** - BetterGI脚本仓库Web界面

[![Vue](https://img.shields.io/badge/Vue-3.4.0-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.2.6-1890FF?style=flat-square&logo=ant-design)](https://antdv.com/)

## 📋 目录

- [🚀 构建方式](#-构建方式)
- [🏗️ 项目结构](#️-项目结构)
- [🌍 多语言支持](#-多语言支持)
- [💬 评论功能](#-评论功能)
```
目前readme更新较慢，实际项目内容可能与readme不符，请谅解
```
---

## 🚀 构建方式

### 开发环境
```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

### 生产构建

#### 1️⃣ 在线仓库页面
```bash
npm run build
```
#### 2️⃣ 本地仓库页面
```bash
npm run build:single
```

---

## 🏗️ 项目结构

```
bgi-bsw/
├── 📁 src/
│   ├── 🎨 components/
│   │   ├── 📋 lists/           # 列表组件
│   │   │   ├── MapTreeList.vue      # 地图追踪树状列表
│   │   │   ├── ScriptList.vue       # JavaScript脚本列表
│   │   │   ├── CombatStrategyList.vue # 战斗策略列表
│   │   │   └── CardStrategyList.vue   # 七圣召唤策略列表
│   │   ├── 📄 details/         # 详情组件
│   │   │   ├── MapDetail.vue        # 地图详情展示
│   │   │   ├── ScriptDetail.vue     # 脚本详情展示
│   │   │   └── StrategyDetail.vue   # 策略详情展示
│   │   ├── 🎛️ LayoutMain.vue   # 主布局组件
│   │   ├── 📖 Help.vue         # 帮助组件
│   │   └── 📄 ReadmeViewer.vue # README渲染组件
│   ├── 🌍 locales/             # 多语言文件
│   ├── 🛠️ utils/              # 工具函数
│   ├── 🎯 App.vue              # 根组件
│   └── 🚀 mainStore.js              # 应用入口
├── ⚙️ vite.config.js           # 普通构建配置
├── 📦 vite.config.single.js    # 单例构建配置
└── 📋 package.json             # 项目配置
```

### 核心组件说明

#### 🎛️ LayoutMain.vue
主布局组件，包含左侧菜单、中间列表、右侧详情

#### 📋 列表组件 (lists/)
- **MapTreeList.vue**: 地图追踪树状列表
- **ScriptList.vue**: JavaScript脚本列表
- **CombatStrategyList.vue**: 战斗策略列表
- **CardStrategyList.vue**: 七圣召唤策略列表

#### 📄 详情组件 (details/)
- **MapDetail.vue**: 地图资源详情
- **ScriptDetail.vue**: 脚本详情
- **StrategyDetail.vue**: 策略详情

---

## 🌍 多语言支持

支持简体中文、繁体中文、英文、日文、法文五种语言。

## 💬 评论功能

集成 **Giscus** 评论系统，基于 GitHub Discussions。

配置信息需要修改，详情参考 https://giscus.app/zh-CN

## 🤝 贡献
欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

感谢 [huiyadanli](https://github.com/huiyadanli) 的旧版仓库参考，为本项目提供了宝贵的开发思路和架构参考。

---

## 🌟 相关链接

[BetterGI官网](https://bettergi.com/)

[BetterGI 主仓库](https://github.com/babalae/better-genshin-impact/)

[BetterGI 脚本仓库](https://github.com/babalae/bettergi-scripts-list/)

[在线演示](https://zaodonganqi.github.io/bettergi-script-web-new/)

---

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！**

---
## 📄 许可证

本项目采用 Apache License 2.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
