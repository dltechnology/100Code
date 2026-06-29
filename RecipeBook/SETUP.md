# Recipe Book — Server Setup

## Quick Start

### 1. Install Node.js (if not already installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install dependencies
```bash
cd RecipeBook
npm install
```

### 3. Set your API key
```bash
cp .env.example .env
nano .env
# Add: ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Run the app
```bash
npm start
# Runs on http://localhost:3000
```

---

## Production: Run with systemd (stays running after reboot)

### Create the service file
```bash
sudo nano /etc/systemd/system/recipebook.service
```

Paste this (adjust paths if needed):
```ini
[Unit]
Description=Recipe Book
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/100Code/RecipeBook
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=/home/YOUR_USERNAME/100Code/RecipeBook/.env

[Install]
WantedBy=multi-user.target
```

### Enable and start
```bash
sudo systemctl daemon-reload
sudo systemctl enable recipebook
sudo systemctl start recipebook
sudo systemctl status recipebook
```

---

## Production: Nginx reverse proxy (recommended)

Install nginx: `sudo apt install nginx`

Create config: `sudo nano /etc/nginx/sites-available/recipebook`

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your server IP

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/recipebook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

For HTTPS (free SSL): `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx`
