# 🎮 BGI-BSW 脚本仓库

> **BetterGI Script Web** - BetterGI脚本仓库Web界面

[![Vue](https://img.shields.io/badge/Vue-3.4.0-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.2.6-1890FF?style=flat-square&logo=ant-design)](https://antdv.com/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0.0-FFD859?style=flat-square&logo=pinia)](https://pinia.vuejs.org/)

## 📋 目录

- [🚀 快速开始](#-快速开始)
- [📦 构建部署](#-构建部署)
- [🏗️ 项目架构](#-项目架构)
- [🎨 核心功能](#-核心功能)
- [🌍 多语言支持](#-多语言支持)
- [💬 评论系统](#-评论系统)
- [🎯 技术栈](#-技术栈)
- [🤝 贡献指南](#-贡献指南)

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装与运行
```bash
# 克隆项目
git clone https://github.com/zaodonganqi/bettergi-script-web.git
cd bettergi-script-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:5173` 查看项目

---

## 📦 构建部署

### 开发环境
```bash
npm run dev
```

### 预处理任务
```bash
npm run predev              # 开发前预处理（主题生成、Markdown处理）
npm run gen:theme           # 生成主题变量
npm run md:prepare          # 处理Markdown图片资源
```

### 生产构建

#### 🌐 在线仓库版本
适用于部署到 GitHub Pages 或其他 Web 服务器
```bash
npm run build
```

#### 📱 本地单文件版本
生成单个 HTML 文件，支持离线使用
```bash
npm run build:single
```

### 预览构建结果
```bash
npm run serve
```

### 部署到GitHub Pages
```bash
npm run deploy
```

### 构建模式说明

**在线模式**
- 远程数据加载（从 GitHub 仓库）
- 支持实时数据更新
- 需要网络连接
- 适合公开部署

**单文件模式**
- 所有资源内嵌到单个 HTML
- 支持离线使用
- 数据本地缓存
- 适合本地分发

---

## 🏗️ 项目架构

### 📁 目录结构
```
src/
├── 🎨 components/           # 组件目录
│   ├── 📋 lists/           # 列表组件
│   │   ├── MapTreeList.vue      # 地图追踪树状列表
│   │   ├── ScriptList.vue       # JavaScript脚本列表
│   │   ├── CombatStrategyList.vue # 战斗策略列表
│   │   └── CardStrategyList.vue   # 七圣召唤策略列表
│   ├── 📄 details/         # 详情组件
│   │   ├── MapDetail.vue        # 地图详情展示
│   │   ├── ScriptDetail.vue     # 脚本详情展示
│   │   └── StrategyDetail.vue   # 策略详情展示
│   ├── 📦 items/           # 通用组件
│   │   ├── Announcement.vue    # 公告组件
│   │   ├── Comment.vue         # 评论组件
│   │   ├── Help.vue            # 帮助组件
│   │   ├── Plan.vue            # 计划组件
│   │   └── ReadmeViewer.vue    # README渲染组件
│   └──🎛️ LayoutMain.vue   # 主布局组件
│
├── 📋 config/              # 配置文件
│   └── theme-mapping.js        # antd自动样式映射配置
├── 🏪 stores/              # 状态管理
│   ├── mainStore.js            # 主状态管理
│   ├── settingsStore.js        # 设置状态管理
│   └── listStore.js            # 列表状态管理
├── 🌍 locales/             # 多语言文件
│   ├── zh-CN.json              # 简体中文
│   ├── zh-TW.json              # 繁体中文
│   ├── en-US.json              # 英文
│   ├── ja-JP.json              # 日文
│   └── fr-FR.json              # 法文
├── 🛠️ utils/              # 工具函数
│   ├── actions.js              # 通用操作
│   ├── basePaths.js            # 路径处理
│   ├── i18n.js                 # 国际化配置
│   ├── roleAlias.js            # 角色别名映射
│   └── subscription.js         # 订阅管理
├── 🎨 styles/              # 样式文件
│   ├── theme.js                # 主题配置
│   └── egg.js                  # 彩蛋样式
├── 🖼️ assets/              # 静态资源
├── 🚀 main.js              # 应用入口
└── 📱 App.vue              # 根组件
```
---

## 🎨 核心功能

### 📋 脚本管理
- **地图追踪**: 树状结构展示地图资源
- **JavaScript脚本**: 功能脚本列表
- **战斗策略**: 战斗相关策略
- **七圣召唤策略**: 卡牌游戏策略

### 🔍 搜索与过滤
- 关键词搜索（支持脚本名、作者、描述）
- 订阅状态过滤
- 角色标签过滤
- 多种排序方式（相关性、时间、随机、名称）
- 升序/降序切换
- 单列/双列视图切换

### 🎨 主题系统
- 浅色/深色/透明三种主题模式
- 实时主题切换
- 持久化存储用户偏好
- 自定义背景图片支持
- 动态主题变量生成

### 🔧 订阅功能
- 一键订阅多个脚本
- 订阅更新追踪
- 订阅状态管理
- 防刷机制（1小时冷却）
- BetterGI 深度集成（自定义协议）

### 🎯 用户体验
- 三栏布局（侧边栏、列表、详情）
- 可调整宽度的列表面板
- 响应式设计适配多端
- 实时更新通知
- 引导教程系统（Driver.js 集成）
- 平滑动画效果（GSAP 驱动）

---

## 🌍 多语言支持

支持 **5种语言**：
- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- 英文 (en-US)
- 日文 (ja-JP)
- 法文 (fr-FR)

### 语言切换
通过设置面板可以实时切换语言，所有界面元素都会立即更新。

---

## 💬 评论系统

集成 **Giscus** 评论系统，基于 GitHub Discussions：

### 功能特性
- 实时评论同步
- 主题自适应
- 多语言支持
- 本地模式提示

### 配置说明
评论系统配置在 `Comment.vue` 组件中，需要配置：
- GitHub 仓库信息
- Discussions 分类
- 主题映射

---

## 🎯 技术栈

### 前端框架
- **Vue 3.4.0** - 渐进式JavaScript框架
- **Vite 5.0.0** - 下一代前端构建工具
- **Pinia 3.0.0** - Vue状态管理库

### UI组件库
- **Ant Design Vue 4.2.6** - 企业级UI组件库

### 工具库
- **Vue I18n 11.1.11** - 国际化解决方案
- **VueUse 13.4.0** - Vue组合式API工具集
- **GSAP 3.14.2** - 高性能动画库
- **Driver.js** - 用户引导教程
- **Pako 2.1.0** - 数据压缩库（gzip解压）
- **Highlight.js 11.11.1** - 代码高亮
- **Markdown-it 14.1.0** - Markdown解析器
- **Mermaid 11.12.2** - 图表渲染
- **Pinyin-pro 3.27.0** - 中文拼音转换

---


## 🤝 贡献指南

### 贡献方式
1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 **Pull Request**

### 开发规范
- 遵循 Vue 3 Composition API 规范
- 组件单一职责原则
- 必要的注释和文档
- 语义化的命名规范
- 响应式设计优先

### 问题反馈
欢迎提交 [Issue](https://github.com/zaodonganqi/bettergi-script-web-new/issues) 来反馈问题或建议。

---

## 🙏 致谢

感谢以下项目和个人：
- [BetterGI](https://github.com/babalae/better-genshin-impact/) - 原神辅助工具
- [huiyadanli](https://github.com/huiyadanli) - 旧版仓库参考
- [Ant Design Vue](https://antdv.com/) - UI组件库
- [Giscus](https://giscus.app/) - 评论系统

---

## 🌟 相关链接

- [BetterGI官网](https://bettergi.com/)
- [BetterGI 主仓库](https://github.com/babalae/better-genshin-impact/)
- [BetterGI 脚本仓库](https://github.com/babalae/bettergi-scripts-list/)
- [在线演示](https://zaodonganqi.github.io/bettergi-script-web/)

---

## 📄 许可证

本项目采用 **Apache License 2.0** 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！**

---

## 📊 项目统计

![GitHub stars](https://img.shields.io/github/stars/zaodonganqi/bettergi-script-web?style=social)
![GitHub forks](https://img.shields.io/github/forks/zaodonganqi/bettergi-script-web?style=social)
![GitHub issues](https://img.shields.io/github/issues/zaodonganqi/bettergi-script-web)
![GitHub last commit](https://img.shields.io/github/last-commit/zaodonganqi/bettergi-script-web)