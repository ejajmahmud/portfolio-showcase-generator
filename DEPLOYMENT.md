# 🌐 Public Web App Deployment Guide

The Portfolio Showcase Generator is fully containerized, cross-platform, and ready to deploy publicly on Linux, Docker, or any cloud platform.

---

## ⚡ Method 1: Instant Cloud Hosting (Easiest & Free/Low Cost)

Deploy in 2 minutes without managing a Linux server:

### Option A: Railway ([railway.app](https://railway.app))
1. Push this folder to a GitHub repository.
2. In Railway, click **"New Project" $\to$ "Deploy from GitHub repo"**.
3. Railway automatically detects the `Dockerfile` and builds it.
4. Go to **Settings $\to$ Networking $\to$ Generate Domain** to get your public link:
   👉 `https://portfolio-showcase.up.railway.app`

### Option B: Render ([render.com](https://render.com))
1. Push this folder to GitHub.
2. On Render Dashboard, click **"New +" $\to$ "Web Service"**.
3. Select your repository.
4. Set **Environment** to `Docker` (Render automatically uses the `Dockerfile`).
5. Click **"Create Web Service"**. Render will deploy it with a free public URL:
   👉 `https://portfolio-showcase.onrender.com`

### Option C: Fly.io ([fly.io](https://fly.io))
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run in project directory:
   ```bash
   fly launch
   fly deploy
   ```
3. Your app is live at `https://your-app-name.fly.dev`.

---

## 🖥️ Method 2: Host on Your Own Linux VPS (Ubuntu / Debian / DigitalOcean)

If you have a Linux server (Ubuntu 22.04 / 24.04, Debian, DigitalOcean Droplet, Hetzner, AWS EC2, etc.):

### Step 1: Copy files to your VPS
```bash
git clone <your-repo-url> /opt/showcase-studio
cd /opt/showcase-studio
```

### Step 2: Run 1-Click Deploy Script
```bash
chmod +x deploy.sh
./deploy.sh
```

The script automatically:
- Installs Docker and Docker Compose (if not already installed).
- Builds the Linux image with Chromium, system libraries, and international fonts.
- Starts the container in background on port `8000`.

### Step 3: Connect Your Custom Domain (Nginx + SSL)

Copy the provided `nginx.conf`:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/showcase
sudo ln -s /etc/nginx/sites-available/showcase /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Get a free SSL certificate via Let's Encrypt:
```bash
sudo certbot --nginx -d showcase.yourdomain.com
```

Your public web app is now live at:
👉 **`https://showcase.yourdomain.com`**!

---

## ⚙️ Configuration & Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `8000` | Port for the HTTP server to bind to (automatically set by Railway/Render/Fly.io) |
| `HOST` | `0.0.0.0` | Host interface (`0.0.0.0` for all network adapters / public internet) |

---

## 📁 Persistent Storage
Generated showcase files are stored in `/app/exports`. In `docker-compose.yml`, this is mapped to `./exports` on the host machine so your history and images persist indefinitely across deployments.
