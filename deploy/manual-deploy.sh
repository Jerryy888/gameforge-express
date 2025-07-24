#!/bin/bash

# 518178.com Manual Deployment Script
# Usage: ./manual-deploy.sh

set -e

echo "🚀 Preparing deployment package for 518178.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="104.248.145.174"
DOMAIN="518178.com"

echo -e "${BLUE}📦 Step 1: Creating deployment package...${NC}"

# Go to project root
cd ..

# Verify build exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build not found. Please run: npm run build${NC}"
    exit 1
fi

# Create deployment package
echo "Creating deployment archive..."
tar -czf gameforge-deploy.tar.gz \
    dist/ \
    backend/ \
    deploy/ \
    package.json \
    package-lock.json

echo -e "${GREEN}✅ Deployment package created: gameforge-deploy.tar.gz${NC}"

echo ""
echo -e "${YELLOW}📋 Next Steps - Execute on your server:${NC}"
echo ""
echo "1. 上传部署包到服务器:"
echo "   scp gameforge-deploy.tar.gz root@$SERVER_IP:/tmp/"
echo ""
echo "2. SSH连接到服务器:"
echo "   ssh root@$SERVER_IP"
echo ""
echo "3. 在服务器上执行以下命令:"
echo ""
cat << 'EOF'
# 创建项目目录
PROJECT_DIR="/var/www/518178"
BACKUP_DIR="/var/backups/518178"
mkdir -p $PROJECT_DIR $BACKUP_DIR

# 备份现有部署
if [ -d $PROJECT_DIR ]; then
    BACKUP_NAME=$(date +%Y%m%d-%H%M%S)
    cp -r $PROJECT_DIR $BACKUP_DIR/$BACKUP_NAME
    echo "备份创建: $BACKUP_DIR/$BACKUP_NAME"
fi

# 解压新部署
cd $PROJECT_DIR
tar -xzf /tmp/gameforge-deploy.tar.gz

# 安装Docker (如果未安装)
if ! command -v docker &> /dev/null; then
    echo "安装Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
fi

# 安装Docker Compose (如果未安装)
if ! command -v docker-compose &> /dev/null; then
    echo "安装Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 配置防火墙
echo "配置防火墙..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 部署服务
echo "启动Docker服务..."
cd $PROJECT_DIR/deploy

# 停止现有服务
docker-compose down --timeout 30 || true

# 清理旧镜像
docker system prune -f || true

# 启动服务
docker-compose up --build -d

# 等待服务启动
echo "等待服务启动..."
sleep 45

# 检查服务状态
echo "检查服务状态:"
docker-compose ps

# 运行数据库迁移
echo "运行数据库迁移..."
docker-compose exec -T backend npm run db:deploy || echo "迁移完成或已是最新状态"

# 设置SSL证书 (可选)
echo "设置SSL证书..."
if ! [ -f /etc/letsencrypt/live/518178.com/fullchain.pem ]; then
    # 安装certbot
    apt update && apt install -y certbot python3-certbot-nginx
    
    # 临时停止nginx获取证书
    docker-compose stop nginx || true
    certbot certonly --standalone --non-interactive --agree-tos --email admin@518178.com -d 518178.com -d www.518178.com || echo "证书设置失败或已存在"
    docker-compose start nginx || true
fi

# 设置证书自动更新
(crontab -l 2>/dev/null; echo '0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "docker-compose -f /var/www/518178/deploy/docker-compose.yml restart nginx"') | crontab -

# 清理
rm -f /tmp/gameforge-deploy.tar.gz

echo "✅ 部署完成!"
echo "🌐 访问: https://518178.com"
echo "🔧 管理: https://518178.com/admin"
echo ""
echo "📋 管理命令:"
echo "  查看日志: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml logs -f"
echo "  重启服务: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml restart"
echo "  检查状态: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml ps"
EOF

echo ""
echo -e "${GREEN}🎉 部署包准备完成！${NC}"
echo -e "${YELLOW}请按照上述步骤在服务器上执行部署。${NC}"