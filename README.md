# 项目名称

这是一个基于 Vue.js 和 Vite 构建的前端项目，主要用于展示和管理策略、地图和脚本相关内容。项目结构清晰，适合用于策略类应用的开发和扩展。

## 项目简介

该项目主要用于展示以下功能模块：
- **策略卡片列表**：展示各种策略卡片。
- **战斗策略列表**：展示战斗策略。
- **地图树列表**：展示地图树结构。
- **脚本列表与详情**：展示脚本内容及其详细信息。
- **地图详情**：展示地图相关信息。

项目使用了 Vue 3 的组合式 API，并通过 Vite 进行快速构建。

## 技术栈

- Vue 3
- Vite
- JavaScript
- HTML/CSS

## 项目结构

```
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── components/          # 组件目录
│   │   ├── LayoutMain.vue   # 主布局组件
│   │   ├── details/         # 详情页组件（地图、脚本）
│   │   └── lists/           # 列表组件（策略、地图、脚本等）
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── index.html               # HTML 模板
├── package.json             # 项目依赖和脚本
├── vite.config.js           # Vite 配置文件
└── .env                     # 环境变量配置
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

这将在本地启动开发服务器，默认访问地址为 `http://localhost:3000`。

### 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist/` 目录。

## 使用说明

- **策略展示**：在首页可以查看策略卡片和战斗策略列表。
- **地图与脚本**：通过导航可以查看地图树、脚本列表以及地图和脚本的详细信息。
- **自定义开发**：可以根据需要扩展组件和功能模块。

## 贡献指南

欢迎贡献代码和改进项目！请遵循以下步骤：

1. Fork 项目仓库。
2. 创建新分支 (`git checkout -b feature/new-feature`)。
3. 提交更改 (`git commit -m 'Add new feature'`)。
4. 推送分支 (`git push origin feature/new-feature`)。
5. 提交 Pull Request。

## 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](LICENSE) 文件。