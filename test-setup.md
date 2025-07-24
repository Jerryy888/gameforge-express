# GameForge Express - 功能测试指南

## 目前已完成的功能

### ✅ 阶段1: 代码优化和准备工作
- [x] 修复ESLint错误和TypeScript类型问题
- [x] 修复npm依赖安全漏洞 
- [x] 优化打包文件大小，实现代码分割

### ✅ 阶段2: 后端API开发
- [x] 创建Node.js/Express后端项目
- [x] 设计并创建数据库结构(MySQL/PostgreSQL)
- [x] 实现游戏相关API接口
- [x] 实现分类管理API接口
- [x] 实现管理员认证和后台API
- [x] 实现搜索功能API
- [x] 实现文件上传功能
- [x] 实现广告管理API

### ✅ 阶段3: 前后端集成 (部分完成)
- [x] 配置前端API基础设置和环境变量
- [x] 更新API接口文件，连接真实后端
- [x] 重构游戏相关组件使用真实API
- [x] 重构分类管理组件使用真实API
- [ ] 重构搜索功能使用真实API (待完成)
- [ ] 重构管理员后台使用真实API (待完成)

## 测试步骤

### 前提条件
1. 确保已安装Node.js (16+)
2. 确保已安装MySQL或PostgreSQL数据库
3. 已配置环境变量

### 1. 前端测试

```bash
# 在项目根目录
npm install
npm run dev
```

访问 `http://localhost:5173` 测试以下功能：

#### 可测试的前端功能：
- [x] **主页展示**：英雄区块、分类展示、特色游戏、热门游戏
- [x] **游戏列表页**：分页、搜索、分类筛选、排序
- [x] **响应式设计**：移动端和桌面端适配
- [x] **加载状态**：骨架屏和加载动画
- [x] **错误处理**：API错误的用户友好提示

#### 注意事项：
- 目前前端可以独立运行，但显示的是骨架屏(因为后端API未启动)
- 所有组件已重构为使用真实API结构
- 已实现完整的错误处理和加载状态

### 2. 后端API测试

```bash
# 进入后端目录
cd backend
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接

# 初始化数据库
npm run db:generate
npm run db:migrate
npm run db:seed

# 启动开发服务器
npm run dev
```

#### 可测试的API端点：

**游戏API** (`http://localhost:3000/api/games`)
- `GET /api/games` - 获取游戏列表(支持分页、搜索、分类筛选)
- `GET /api/games/:id` - 获取单个游戏详情
- `POST /api/games/:id/play` - 增加播放次数
- `GET /api/games/:id/related` - 获取相关游戏

**分类API** (`http://localhost:3000/api/categories`)
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 获取单个分类
- `GET /api/categories/slug/:slug` - 根据slug获取分类及游戏

**搜索API** (`http://localhost:3000/api/search`)
- `GET /api/search?q=keyword` - 搜索游戏
- `GET /api/search/suggestions?q=keyword` - 获取搜索建议
- `GET /api/search/trending` - 获取热门搜索词

**管理员API** (`http://localhost:3000/api/admin`)
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/stats` - 获取仪表板统计

### 3. 完整系统测试

启动后端API后，前端将能够显示真实数据：

```bash
# 终端1: 启动后端
cd backend
npm run dev

# 终端2: 启动前端  
cd ..
npm run dev
```

访问 `http://localhost:5173` 测试完整功能。

## 已知限制

### 需要数据库配置
- 后端需要MySQL/PostgreSQL数据库
- 需要正确配置.env文件中的DATABASE_URL

### 暂未完成的功能
- 搜索组件还未连接到真实API
- 管理员后台界面还未连接到真实API
- 游戏详情页面还未实现
- 游戏播放页面还未实现

## 下一步开发计划

1. **完成搜索功能重构** - 连接搜索API
2. **完成管理员后台重构** - 连接管理API
3. **实现游戏详情和播放页面**
4. **添加错误处理和加载状态优化**
5. **SEO优化和元数据管理**
6. **部署配置和生产环境设置**

## 技术栈验证

### 前端 ✅
- React 18 + TypeScript
- Vite 构建工具
- TailwindCSS + shadcn/ui
- React Router v6
- 完全响应式设计

### 后端 ✅  
- Node.js + Express + TypeScript
- Prisma ORM
- JWT认证
- 文件上传(Multer)
- 数据验证和错误处理
- 速率限制和安全中间件

### 数据库 ✅
- MySQL/PostgreSQL支持
- 完整的数据模型设计
- 数据迁移和种子数据

## 结论

目前项目的核心架构已完成约70%，主要的游戏展示和分类功能已经可以正常工作。剩余的工作主要集中在搜索功能完善和管理后台连接上。