# GameForge Express - 云端部署指南

## 🌟 方案一：Railway + Vercel (推荐)

### 步骤1：部署后端到Railway

1. **注册Railway账号**
   - 访问 [railway.app](https://railway.app)
   - 使用GitHub账号登录

2. **创建新项目**
   ```bash
   # 安装Railway CLI
   npm install -g @railway/cli
   
   # 登录Railway
   railway login
   
   # 在backend目录下初始化
   cd backend
   railway init
   ```

3. **添加PostgreSQL数据库**
   ```bash
   # 添加PostgreSQL服务
   railway add postgresql
   ```

4. **配置环境变量**
   ```env
   # Railway会自动提供DATABASE_URL
   NODE_ENV=production
   JWT_SECRET=your-super-secure-jwt-secret-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-app.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ADMIN_EMAIL=admin@gameforge.com
   ADMIN_PASSWORD=your-secure-admin-password
   ```

5. **部署后端**
   ```bash
   railway deploy
   ```

### 步骤2：部署前端到Vercel

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **配置vercel.json**
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

3. **配置环境变量**
   ```env
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

4. **部署前端**
   ```bash
   vercel --prod
   ```

## 🌟 方案二：Render 全栈部署

### 后端部署 (Render Web Service)

1. **创建render.yaml**
   ```yaml
   services:
     - type: web
       name: gameforge-backend
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: DATABASE_URL
           fromDatabase:
             name: gameforge-db
             property: connectionString
   
   databases:
     - name: gameforge-db
       databaseName: gameforge
       user: gameforge_user
   ```

2. **推送到GitHub并连接Render**

### 前端部署 (Render Static Site)

1. **配置构建设置**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

## 🌟 方案三：Supabase + Netlify

### 数据库设置 (Supabase)

1. **创建Supabase项目**
   - 访问 [supabase.com](https://supabase.com)
   - 创建新项目

2. **运行SQL脚本**
   - 在SQL编辑器中运行Prisma生成的SQL

### 后端部署 (Netlify Functions)

1. **创建netlify.toml**
   ```toml
   [build]
     functions = "netlify/functions"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

## 📋 部署检查清单

### 后端部署前检查
- [ ] 环境变量配置完整
- [ ] 数据库连接字符串正确
- [ ] JWT密钥安全性足够
- [ ] CORS设置包含前端域名
- [ ] 构建脚本无错误

### 前端部署前检查
- [ ] API基础URL指向后端
- [ ] 构建输出目录正确
- [ ] 路由配置支持SPA
- [ ] 环境变量配置完整

### 数据库迁移
- [ ] 运行Prisma迁移
- [ ] 执行种子数据脚本
- [ ] 验证数据完整性

## 🚀 自动化部署

### GitHub Actions配置
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm run build
      # 部署到Railway/Render

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      # 部署到Vercel/Netlify
```

## 🔧 生产环境优化

### 安全设置
- [ ] HTTPS强制启用
- [ ] 安全头部配置
- [ ] API限流设置
- [ ] 输入验证和清理
- [ ] SQL注入防护

### 性能优化
- [ ] 静态资源CDN
- [ ] 数据库索引优化
- [ ] API响应缓存
- [ ] 图片压缩和优化
- [ ] 代码分割和懒加载

### 监控和日志
- [ ] 错误追踪 (Sentry)
- [ ] 性能监控
- [ ] 用户分析
- [ ] 服务器监控
- [ ] 数据库性能监控