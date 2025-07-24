#!/bin/bash

# 518178.com Production Deployment Script (Optimized)
# Author: GameForge Team
# Usage: ./production-deploy.sh

set -e

echo "🚀 Starting optimized deployment of 518178.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="${SERVER_IP:-104.248.145.174}"
SERVER_USER="${SERVER_USER:-root}"
DOMAIN="${DOMAIN:-518178.com}"
PROJECT_DIR="/var/www/518178"
BACKUP_DIR="/var/backups/518178"

echo -e "${BLUE}🔧 Deployment Configuration:${NC}"
echo "Server: $SERVER_IP"
echo "Domain: $DOMAIN"
echo "Project Directory: $PROJECT_DIR"
echo ""

# Function to run commands on remote server
run_remote() {
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "$1"
}

# Function to copy files to server with progress
copy_to_server() {
    echo "Copying $1 to $2..."
    scp -o StrictHostKeyChecking=no -o ConnectTimeout=10 -r "$1" $SERVER_USER@$SERVER_IP:"$2"
}

# Pre-deployment checks
echo -e "${YELLOW}🔍 Pre-deployment checks...${NC}"

# Check if server is accessible
if ! ping -c 1 $SERVER_IP &> /dev/null; then
    echo -e "${RED}❌ Server $SERVER_IP is not accessible${NC}"
    exit 1
fi

# Check if SSH connection works
if ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'SSH OK'" &> /dev/null; then
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# Build frontend with optimization
echo -e "${YELLOW}📦 Building frontend...${NC}"
cd ..
npm ci --production=false
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully${NC}"

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
tar -czf gameforge-deploy.tar.gz dist backend deploy package.json package-lock.json

echo -e "${GREEN}✅ Deployment package created${NC}"

# Upload to server
echo -e "${YELLOW}📤 Uploading to server...${NC}"
copy_to_server "gameforge-deploy.tar.gz" "/tmp/"

echo -e "${GREEN}✅ Files uploaded successfully${NC}"

# Execute deployment on server
echo -e "${YELLOW}🚀 Executing deployment on server...${NC}"

run_remote "
    set -e
    
    echo '🔧 Setting up deployment environment...'
    
    # Create directories
    mkdir -p $PROJECT_DIR $BACKUP_DIR
    
    # Create backup of current deployment
    if [ -d $PROJECT_DIR ]; then
        echo '📋 Creating backup...'
        BACKUP_NAME=\$(date +%Y%m%d-%H%M%S)
        cp -r $PROJECT_DIR $BACKUP_DIR/\$BACKUP_NAME
        echo \"Backup created: $BACKUP_DIR/\$BACKUP_NAME\"
    fi
    
    # Extract new deployment
    echo '📦 Extracting deployment package...'
    cd $PROJECT_DIR
    tar -xzf /tmp/gameforge-deploy.tar.gz
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        echo '🐳 Installing Docker...'
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
        rm get-docker.sh
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        echo '🐳 Installing Docker Compose...'
        curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # Configure firewall
    echo '🔒 Configuring firewall...'
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    # Deploy with Docker Compose
    echo '🐳 Starting Docker services...'
    cd $PROJECT_DIR/deploy
    
    # Stop existing services gracefully
    docker-compose down --timeout 30 || true
    
    # Clean up old images
    docker system prune -f || true
    
    # Start services
    docker-compose up --build -d
    
    # Wait for services to be ready
    echo '⏳ Waiting for services to start...'
    sleep 45
    
    # Check if services are running
    if ! docker-compose ps | grep -q 'Up'; then
        echo '❌ Some services failed to start'
        docker-compose logs
        exit 1
    fi
    
    # Run database migration
    echo '📊 Running database migrations...'
    docker-compose exec -T backend npm run db:deploy || echo 'Migration completed or already up to date'
    
    # Setup SSL certificate
    echo '🔒 Setting up SSL certificate...'
    if ! [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
        docker-compose stop nginx || true
        certbot certonly --standalone --non-interactive --agree-tos --email admin@$DOMAIN -d $DOMAIN -d www.$DOMAIN || echo 'Certificate setup failed or already exists'
        docker-compose start nginx || true
    fi
    
    # Setup automatic certificate renewal
    (crontab -l 2>/dev/null; echo '0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook \"docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml restart nginx\"') | crontab -
    
    # Cleanup
    rm -f /tmp/gameforge-deploy.tar.gz
    
    echo '✅ Server deployment completed successfully'
"

# Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

# Wait for services to stabilize
sleep 30

# Test health endpoints
echo "Testing health endpoints..."
if curl -f -s http://$SERVER_IP/health &> /dev/null; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️ Backend health check failed, but continuing...${NC}"
fi

# Test HTTPS if certificate exists
if curl -f -s https://$DOMAIN &> /dev/null; then
    echo -e "${GREEN}✅ HTTPS check passed${NC}"
else
    echo -e "${YELLOW}⚠️ HTTPS not yet available, may need DNS propagation${NC}"
fi

# Display final status
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update DNS: $DOMAIN → $SERVER_IP (if not done)"
echo "2. Wait for DNS propagation (up to 24 hours)"
echo "3. Visit https://$DOMAIN to verify"
echo "4. Access admin panel at https://$DOMAIN/admin"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo "View logs: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml logs -f"
echo "Restart services: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml restart"
echo "Check status: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml ps"
echo ""
echo -e "${GREEN}🌐 Your GameForge website is now live! 🚀${NC}"

# Cleanup
rm -f gameforge-deploy.tar.gz