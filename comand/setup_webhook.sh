#!/bin/bash

# Set UTF-8 encoding
export LANG=en_US.UTF-8

echo "🔧 Setting up Webhook Server for Auto Deploy..."

# Install webhook if not exists
if ! command -v webhook &> /dev/null; then
    echo "📦 Installing webhook server..."
    
    # Download webhook binary
    wget https://github.com/adnanh/webhook/releases/download/2.8.1/webhook-linux-amd64.tar.gz
    
    # Extract
    tar -xzf webhook-linux-amd64.tar.gz
    
    # Move to /usr/local/bin
    sudo mv webhook-linux-amd64/webhook /usr/local/bin/
    
    # Make executable
    sudo chmod +x /usr/local/bin/webhook
    
    # Clean up
    rm -rf webhook-linux-amd64*
    
    echo "✅ Webhook installed successfully!"
else
    echo "✅ Webhook already installed!"
fi

# Make auto_deploy.sh executable
chmod +x auto_deploy.sh

# Create systemd service for webhook
echo "📝 Creating systemd service..."
sudo tee /etc/systemd/system/webhook.service > /dev/null << EOF
[Unit]
Description=Webhook Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/checkafe/comand
ExecStart=/usr/local/bin/webhook -hooks hooks.json -port 9000 -verbose
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable webhook
sudo systemctl start webhook

# Check status
echo "🔍 Checking webhook service status..."
sudo systemctl status webhook --no-pager

echo ""
echo "✅ Webhook setup completed!"
echo ""
echo "📋 Configuration:"
echo "   Webhook URL: http://160.30.21.17:9000/hooks/deploy-checkcafe"
echo "   Port: 9000"
echo "   Config file: /root/checkafe/comand/hooks.json"
echo ""
echo "🔧 To manage webhook service:"
echo "   sudo systemctl start webhook"
echo "   sudo systemctl stop webhook"
echo "   sudo systemctl restart webhook"
echo "   sudo systemctl status webhook"
echo ""
echo "📝 Next steps:"
echo "   1. Update webhook secret in hooks.json"
echo "   2. Configure GitHub webhook URL in repository settings"
echo "   3. Test with: curl -X POST http://160.30.21.17:9000/hooks/deploy-checkcafe" 