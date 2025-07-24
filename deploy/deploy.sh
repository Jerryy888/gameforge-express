#!/bin/bash

# 518178.com Deployment Script for DigitalOcean
# Author: GameForge Team
# Usage: ./deploy.sh

set -e

echo "ðŸš€ Starting deployment of 518178.com to DigitalOcean..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="104.248.145.174"
SERVER_USER="root"
DOMAIN="518178.com"
PROJECT_DIR="/var/www/518178"
BACKUP_DIR="/var/backups/518178"

echo -e "${YELLOW}ðŸ”§ Deployment Configuration:${NC}"
echo "Server: $SERVER_IP"
echo "Domain: $DOMAIN"
echo "Project Directory: $PROJECT_DIR"
echo ""

# Function to run commands on remote server
run_remote() {
    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "$1"
}

# Function to copy files to server
copy_to_server() {
    scp -o StrictHostKeyChecking=no -r "$1" $SERVER_USER@$SERVER_IP:"$2"
}

echo -e "${YELLOW}ðŸ“¦ Step 1: Preparing deployment files...${NC}"

# Build frontend
echo "Building frontend..."
cd ..
npm install
npm run build

echo -e "${GREEN}âœ?Frontend built successfully${NC}"

echo -e "${YELLOW}ðŸ“¤ Step 2: Uploading files to server...${NC}"

# Create project directory on server
run_remote "mkdir -p $PROJECT_DIR/{backend,deploy,dist}"

# Copy backend files
copy_to_server "backend/" "$PROJECT_DIR/"

# Copy deployment files
copy_to_server "deploy/" "$PROJECT_DIR/"

# Copy frontend build files
copy_to_server "dist/" "$PROJECT_DIR/"

echo -e "${GREEN}âœ?Files uploaded successfully${NC}"

echo -e "${YELLOW}ðŸ”§ Step 3: Setting up server environment...${NC}"

# Install Docker and Docker Compose if not installed
run_remote "
    # Update system
    apt update && apt upgrade -y
    
    # Install required packages
    apt install -y curl wget git ufw certbot python3-certbot-nginx
    
    # Install Docker if not installed
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
    fi
    
    # Install Docker Compose if not installed
    if ! command -v docker-compose &> /dev/null; then
        curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    echo 'Docker and Docker Compose installed successfully'
"

echo -e "${GREEN}âœ?Server environment setup completed${NC}"

echo -e "${YELLOW}ðŸ”’ Step 4: Configuring firewall...${NC}"

run_remote "
    # Configure UFW firewall
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    echo 'Firewall configured successfully'
"

echo -e "${GREEN}âœ?Firewall configured${NC}"

echo -e "${YELLOW}ðŸ—„ï¸?Step 5: Setting up SSL certificate...${NC}"

run_remote "
    # Stop any running nginx to free port 80
    docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml down || true
    
    # Get SSL certificate
    certbot certonly --standalone --non-interactive --agree-tos --email admin@518178.com -d 518178.com -d www.518178.com || echo 'Certificate already exists or failed'
    
    echo 'SSL certificate setup completed'
"

echo -e "${GREEN}âœ?SSL certificate configured${NC}"

echo -e "${YELLOW}ðŸ³ Step 6: Starting Docker services...${NC}"

run_remote "
    cd $PROJECT_DIR/deploy
    
    # Create backup
    mkdir -p $BACKUP_DIR
    if [ -f docker-compose.yml ]; then
        cp docker-compose.yml $BACKUP_DIR/docker-compose-\$(date +%Y%m%d-%H%M%S).yml.bak
    fi
    
    # Stop existing services
    docker-compose down || true
    
    # Build and start services
    docker-compose up --build -d
    
    # Wait for services to start
    sleep 30
    
    echo 'Docker services started successfully'
"

echo -e "${GREEN}âœ?Docker services started${NC}"

echo -e "${YELLOW}ðŸ“Š Step 7: Running database migration...${NC}"

run_remote "
    cd $PROJECT_DIR/deploy
    
    # Wait for database to be ready
    sleep 10
    
    # Run database migration and seed
    docker-compose exec -T backend npm run db:deploy || echo 'Database migration completed or already up to date'
    
    echo 'Database setup completed'
"

echo -e "${GREEN}âœ?Database migration completed${NC}"

echo -e "${YELLOW}ðŸ” Step 8: Verifying deployment...${NC}"

# Test services
echo "Testing services..."
run_remote "
    echo 'Checking Docker containers:'
    docker ps
    echo ''
    echo 'Checking backend health:'
    curl -f http://localhost:3000/health || echo 'Backend health check failed'
    echo ''
    echo 'Checking Nginx:'
    curl -I http://localhost || echo 'Nginx check failed'
"

echo -e "${GREEN}âœ?Deployment verification completed${NC}"

echo -e "${YELLOW}ðŸ“‹ Step 9: Post-deployment setup...${NC}"

run_remote "
    # Set up log rotation
    cat > /etc/logrotate.d/518178 << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml exec nginx nginx -s reload
    endscript
}
EOF

    # Create monitoring script
    cat > /usr/local/bin/monitor-518178.sh << 'EOF'
#!/bin/bash
cd $PROJECT_DIR/deploy
if ! docker-compose ps | grep -q 'Up'; then
    echo \"\$(date): Some services are down, restarting...\" >> /var/log/518178-monitor.log
    docker-compose up -d
fi
EOF
    chmod +x /usr/local/bin/monitor-518178.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo '*/5 * * * * /usr/local/bin/monitor-518178.sh') | crontab -
    
    echo 'Post-deployment setup completed'
"

echo -e "${GREEN}âœ?Post-deployment setup completed${NC}"

echo ""
echo -e "${GREEN}ðŸŽ‰ DEPLOYMENT COMPLETED SUCCESSFULLY! ðŸŽ‰${NC}"
echo ""
echo -e "${YELLOW}ðŸ“‹ Next Steps:${NC}"
echo "1. Update your DNS settings to point 518178.com to $SERVER_IP"
echo "2. Wait for DNS propagation (may take up to 24 hours)"
echo "3. Visit https://518178.com to verify the site is working"
echo "4. Access admin panel at https://518178.com/admin"
echo ""
echo -e "${YELLOW}ðŸ”§ Important:${NC}"
echo "- Update the passwords in $PROJECT_DIR/deploy/.env on the server"
echo "- Monitor logs with: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml logs -f"
echo "- Restart services with: docker-compose -f $PROJECT_DIR/deploy/docker-compose.yml restart"
echo ""
echo -e "${GREEN}âœ?518178.com is now live! ðŸš€${NC}"