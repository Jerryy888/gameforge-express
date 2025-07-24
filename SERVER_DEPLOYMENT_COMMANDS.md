# 🚀 服务器部署命令

在SSH连接到服务器后，请依次执行以下命令：

## 1. 创建项目目录和备份
```bash
PROJECT_DIR="/var/www/518178"
BACKUP_DIR="/var/backups/518178"
mkdir -p $PROJECT_DIR $BACKUP_DIR

# 备份现有部署 (如果存在)
if [ -d $PROJECT_DIR ]; then
    BACKUP_NAME=$(date +%Y%m%d-%H%M%S)
    cp -r $PROJECT_DIR $BACKUP_DIR/$BACKUP_NAME
    echo "备份创建: $BACKUP_DIR/$BACKUP_NAME"
fi
```

## 2. 解压部署包
```bash
cd $PROJECT_DIR
tar -xzf /tmp/gameforge-deploy.tar.gz
```

## 3. 安装Docker和Docker Compose
```bash
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
```

## 4. 配置防火墙
```bash
echo "配置防火墙..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

## 5. 启动Docker服务
```bash
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
```

## 6. 检查服务状态
```bash
echo "检查服务状态:"
docker-compose ps
```

## 7. 运行数据库迁移
```bash
echo "运行数据库迁移..."
docker-compose exec -T backend npm run db:deploy || echo "迁移完成或已是最新状态"
```

## 8. 设置SSL证书 (可选)
```bash
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
```

## 9. 清理和完成
```bash
# 清理临时文件
rm -f /tmp/gameforge-deploy.tar.gz

echo "✅ 部署完成!"
echo "🌐 访问: https://518178.com"
echo "🔧 管理: https://518178.com/admin"
```

## 📋 常用管理命令

```bash
# 查看服务日志
docker-compose -f /var/www/518178/deploy/docker-compose.yml logs -f

# 重启服务
docker-compose -f /var/www/518178/deploy/docker-compose.yml restart

# 检查服务状态
docker-compose -f /var/www/518178/deploy/docker-compose.yml ps

# 查看容器资源使用
docker stats
```

## 🔐 管理员登录信息

- **管理员邮箱**: admin@518178.com
- **管理员密码**: Admin2024!@#GameForge
- **管理面板**: https://518178.com/admin

---

**📝 注意**: 
- 所有命令都需要root权限
- 部署过程大约需要5-10分钟
- 如有问题，请检查Docker日志