# 518178.com DigitalOcean 部署指南

## 🔧 服务器信息
- **服务器IP**: 104.248.145.174
- **域名**: 518178.com
- **用户**: root
- **密码**: Gfcxm_009

## 🚀 一键部署

### 方法1: 自动部署脚本（推荐）

```bash
# 在本地项目目录执行
cd /mnt/d/github/gameforge-express
./deploy/deploy.sh
```

这个脚本将自动完成：
- ✅ 构建前端项目
- ✅ 上传文件到服务器
- ✅ 安装Docker和Docker Compose
- ✅ 配置防火墙
- ✅ 设置SSL证书
- ✅ 启动所有服务
- ✅ 运行数据库迁移

### 方法2: 手动部署

#### 1. 连接服务器
```bash
ssh root@104.248.145.174
# 密码: Gfcxm_009
```

#### 2. 安装必要软件
```bash
# 更新系统
apt update && apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 安装其他工具
apt install -y nginx certbot python3-certbot-nginx ufw
```

#### 3. 配置防火墙
```bash
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

#### 4. 上传项目文件
```bash
# 在本地终端执行
scp -r gameforge-express/ root@104.248.145.174:/var/www/518178/
```

#### 5. 配置SSL证书
```bash
# 在服务器上执行
certbot certonly --standalone -d 518178.com -d www.518178.com
```

#### 6. 启动服务
```bash
cd /var/www/518178/deploy
docker-compose up -d
```

#### 7. 运行数据库迁移
```bash
docker-compose exec backend npm run db:deploy
```

## 🔧 重要配置

### 1. 更新环境变量
编辑 `/var/www/518178/deploy/.env`:
```env
DB_PASSWORD=your_secure_database_password
JWT_SECRET=your_super_secure_jwt_secret
ADMIN_PASSWORD=your_secure_admin_password
```

### 2. DNS配置
将以下记录添加到您的DNS提供商：
```
A    518178.com        104.248.145.174
A    www.518178.com    104.248.145.174
```

## 📊 监控和维护

### 查看服务状态
```bash
cd /var/www/518178/deploy
docker-compose ps
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f postgres
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 更新应用
```bash
# 拉取最新代码
git pull

# 重新构建并部署
docker-compose up --build -d
```

## 🎯 测试部署

### 1. 检查服务健康状态
```bash
curl http://104.248.145.174:3000/health
```

### 2. 测试API端点
```bash
curl https://518178.com/api/games
curl https://518178.com/api/categories
```

### 3. 访问网站
- 前端: https://518178.com
- API: https://518178.com/api
- 管理后台: https://518178.com/admin

## 🔒 安全建议

1. **更改默认密码**: 立即更改所有默认密码
2. **定期更新**: 定期更新系统和Docker镜像
3. **备份数据**: 设置自动数据库备份
4. **监控日志**: 定期检查访问和错误日志
5. **SSL续期**: 设置自动SSL证书续期

## 🚨 故障排除

### 服务无法启动
```bash
# 检查Docker状态
systemctl status docker

# 检查容器日志
docker-compose logs

# 重新构建
docker-compose down
docker-compose up --build -d
```

### 数据库连接问题
```bash
# 检查PostgreSQL容器
docker-compose logs postgres

# 重启数据库
docker-compose restart postgres
```

### SSL证书问题
```bash
# 续期证书
certbot renew

# 重新获取证书
certbot certonly --standalone -d 518178.com -d www.518178.com
```

## 📞 支持

如果遇到问题，请检查：
1. 服务器日志: `/var/log/`
2. Docker容器日志: `docker-compose logs`
3. Nginx配置: `/var/www/518178/deploy/nginx.conf`
4. 环境变量: `/var/www/518178/deploy/.env`

---

**🎉 部署完成后，518178.com 将提供完整的游戏平台服务！**