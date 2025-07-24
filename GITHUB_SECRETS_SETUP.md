# GitHub Secrets 配置指南

## 🔐 需要配置的 Secrets

在 GitHub 仓库的 Settings → Secrets and variables → Actions 中添加：

### 服务器连接信息
1. **SERVER_IP**
   ```
   104.248.145.174
   ```

2. **SERVER_USER**
   ```
   root
   ```

3. **SERVER_SSH_KEY**
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   [你的SSH私钥内容]
   -----END OPENSSH PRIVATE KEY-----
   ```
   
   > 💡 如何获取SSH私钥：
   > - 如果已有：`cat ~/.ssh/id_rsa`
   > - 如果没有：`ssh-keygen -t rsa -b 4096`

### 应用配置信息
4. **DB_PASSWORD**
   ```
   [设置一个强密码，至少12位]
   例如：MySecureDB2024!@#
   ```

5. **JWT_SECRET**
   ```
   [设置一个强密钥，至少32位]
   例如：MySecureJWTSecret2024!@#$%^&*()1234567890
   ```

6. **ADMIN_PASSWORD**
   ```
   [设置管理员密码，至少8位]
   例如：Admin2024!@#
   ```

### 可选配置
7. **DOMAIN** (可选)
   ```
   518178.com
   ```

## 📋 配置步骤

1. 在GitHub仓库页面点击 `Settings`
2. 左侧菜单选择 `Secrets and variables` → `Actions`
3. 点击 `New repository secret`
4. 输入 Secret 名称和值
5. 点击 `Add secret`
6. 重复以上步骤添加所有必需的 secrets

## ⚠️ 重要提醒

- 密码必须足够复杂
- SSH私钥不要包含密码保护
- 确保服务器SSH端口开放
- 建议定期更换密码

## 🔍 验证配置

配置完成后，secrets列表应该包含：
- ✅ SERVER_IP
- ✅ SERVER_USER  
- ✅ SERVER_SSH_KEY
- ✅ DB_PASSWORD
- ✅ JWT_SECRET
- ✅ ADMIN_PASSWORD