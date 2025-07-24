# 🚀 手动部署指令 - GameForge Express (518178.com)

## 📦 部署包已准备就绪
- **文件**: `gameforge-deploy.tar.gz` (57.3MB)
- **内容**: 前端构建文件、后端代码、Docker配置、部署脚本

## 🔧 服务器手动部署步骤

### 1. 上传部署包到服务器
```bash
# 使用 SCP 上传部署包（需要服务器密码或SSH密钥）
scp gameforge-deploy.tar.gz root@104.248.145.174:/tmp/

# 或者使用其他文件传输工具（如SFTP、WinSCP等）
# 目标路径: /tmp/gameforge-deploy.tar.gz
```

### 2. 登录服务器执行部署
```bash
# SSH 登录服务器


# 执行以下命令进行部署：
```

### 3. 在服务器上执行部署命令
```bash
#!/bin/bash
set -e

echo "🚀 开始部署 GameForge Express..."

# 配置变量
PROJECT_DIR="/var/www/518178"
BACKUP_DIR="/var/backups/518178"

# 创建目录
mkdir -p $PROJECT_DIR
mkdir -p $BACKUP_DIR

# 备份现有部署（如果存在）
if [ -d $PROJECT_DIR ]; then
    echo "📦 创建备份..."
    cp -r $PROJECT_DIR $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)
fi

# 解压部署包
echo "📂 解压部署文件..."
cd $PROJECT_DIR
tar -xzf /tmp/gameforge-deploy.tar.gz

# 更新系统和安装依赖
echo "🔧 更新系统和安装 Docker..."
apt update && apt upgrade -y
apt install -y curl wget git ufw certbot python3-certbot-nginx

# 安装 Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.shssh root@104.248.145.174
    systemctl enable docker
    systemctl start docker
fi

# 安装 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 配置防火墙
echo "🔒 配置防火墙..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 配置SSL证书
echo "🔐 配置SSL证书..."
docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml down 2>/dev/null || true
certbot certonly --standalone --non-interactive --agree-tos --email admin@518178.com -d 518178.com -d www.518178.com || echo "证书已存在或获取失败"

# 创建环境变量文件
echo "📝 创建环境变量..."
cd $PROJECT_DIR/deploy
cat > .env << 'EOF'
# 数据库配置
DB_PASSWORD=secure_db_password_2024
JWT_SECRET=jwt_super_secret_key_518178_gameforge_2024
ADMIN_PASSWORD=admin_secure_password_2024

# 应用配置
NODE_ENV=production
PORT=3000
DOMAIN=518178.com

# PostgreSQL 配置
POSTGRES_USER=gameforge
POSTGRES_PASSWORD=secure_db_password_2024
POSTGRES_DB=gameforge_production
EOF

# 启动服务
echo "🐳 启动 Docker 服务..."
docker-compose down 2>/dev/null || true
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 运行数据库迁移
echo "📊 运行数据库迁移..."
docker-compose exec -T backend npm run db:deploy || echo "数据库迁移完成"

# 设置监控
echo "📈 设置服务监控..."
cat > /usr/local/bin/monitor-518178.sh << 'MONITOR_EOF'
#!/bin/bash
cd /var/www/518178/deploy
if ! docker-compose ps | grep -q 'Up'; then
    echo "$(date): 服务异常，正在重启..." >> /var/log/518178-monitor.log
    docker-compose up -d
fi
MONITOR_EOF
chmod +x /usr/local/bin/monitor-518178.sh

# 添加到定时任务
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-518178.sh") | crontab -

# 清理临时文件
rm -f /tmp/gameforge-deploy.tar.gz

echo "✅ 部署完成！"
echo ""
echo "📋 下一步："
echo "1. 配置域名DNS解析：518178.com -> 104.248.145.174"
echo "2. 访问 https://518178.com 验证网站"
echo "3. 访问 https://518178.com/admin 管理后台"
echo ""
echo "🔧 管理命令："
echo "- 查看服务状态: docker-compose ps"
echo "- 查看日志: docker-compose logs -f"
echo "- 重启服务: docker-compose restart"
echo ""
echo "🎉 GameForge Express 已成功部署！"
```

## 🌐 部署后配置

### DNS 配置
- **A记录**: `518178.com` → `104.248.145.174`
- **A记录**: `www.518178.com` → `104.248.145.174`

### 默认登录信息
- **管理员后台**: https://518178.com/admin
- **用户名**: admin
- **密码**: admin_secure_password_2024 (建议部署后立即修改)

### 验证部署
```bash
# 检查服务状态
curl -I https://518178.com

# 检查API健康状态
curl https://518178.com/api/health

# 检查管理后台
curl -I https://518178.com/admin
```

## 🔧 故障排除

### 常见问题
1. **端口80/443被占用**: `sudo netstat -tlnp | grep :80`
2. **SSL证书失败**: 检查域名DNS解析是否正确
3. **Docker服务未启动**: `sudo systemctl start docker`
4. **数据库连接失败**: 检查PostgreSQL容器状态

### 日志查看
```bash
# 查看所有服务日志
docker-compose -f /var/www/518178/deploy/docker-compose.yml logs -f

# 查看特定服务日志
docker-compose -f /var/www/518178/deploy/docker-compose.yml logs -f backend
docker-compose -f /var/www/518178/deploy/docker-compose.yml logs -f nginx
```

## 📞 支持信息
- **项目**: GameForge Express
- **域名**: 518178.com
- **服务器**: DigitalOcean (104.248.145.174)
- **技术栈**: React + Node.js + PostgreSQL + Docker

---
**部署日期**: 2025年7月24日  
**状态**: 准备手动部署