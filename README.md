# 🚀 Portfolio Showcase Generator (Studio Edition)

> Fully automated website portfolio mockup generator featuring official **[bezel.fit](https://bezel.fit) iPhone 17 Pro Max (Deep Blue)**, **iPad Tablet**, and **Desktop** viewpoints with multi-layered 3D drop shadows. Exports to **WebP**, **PNG**, **JPG**, and bundled **ZIP**.

---

## 🌟 Key Features

1. **One-Link Full Automation**: Just supply a website URL. The system handles all viewport scaling, font rendering, lazy-loaded image triggers, and cookie pop-up dismissal automatically.
2. **Exact bezel.fit Device Frame**:
   - Uses the official **iPhone 17 Pro Max Deep Blue** titanium frame with realistic Dynamic Island overlay and screen cutout geometry ($1472 \times 3002$ frame, $1320 \times 2868$ screen @3x).
3. **iPad Tablet Mockup**:
   - Framed with modern Space Black / Silver iPad bezel ($1728 \times 2268$ frame, $1620 \times 2160$ screen @2x).
4. **Retina Desktop Mockup**:
   - High-DPI browser capture ($1440 \times 1100$ @2x $\to$ $2880 \times 2200$) cropped to hero fold with $24\text{px}$ rounded corners and subtle hairline outline.
5. **Signature Agency 3D Composition**:
   - Desktop placed in the background.
   - iPhone on the bottom-left overhanging the left edge.
   - Tablet on the bottom-right overhanging the right edge.
   - Bottom-aligned baseline with realistic ambient & contact drop shadows.
   - Open center column showcasing the desktop website core content.
6. **Multi-Format Export**:
   - **WebP** (Optimized modern web standard, $95\%$ quality)
   - **PNG** (Lossless high-res with alpha transparency)
   - **JPG** (Clean universal RGB, $95\%$ quality)
   - Individual device shots + Complete **ZIP** package.

---

## 🛠️ Quick Start

### 1. Launch Web Dashboard (Recommended)

Simply double-click **`run.bat`** or run:

```bash
cd C:\Users\EJAJ\.gemini\antigravity\scratch\portfolio-mockup-generator
python server.py
```

Then open your browser at **`http://localhost:8000`**.

Paste your website link and click **"Generate Portfolio Showcase"**.

---

### 2. Command Line (CLI) Usage

For batch processing or instant terminal use:

```bash
# Basic usage
python cli.py https://myclient.com

# Custom project name and output folder
python cli.py https://capace.io --name "Capace" --out ./output

# Custom background (transparent, pure white, or hex)
python cli.py https://dalwa7.com --name "Dalwa7" --bg transparent --out ./output

# Different iPhone frame finish (deep-blue, silver, cosmic-orange)
python cli.py https://stripe.com --finish cosmic-orange --tablet silver
```

---

## 📁 Directory Structure

```
portfolio-mockup-generator/
│
├── assets/
│   └── frames/
│       ├── iphone-17-pro-max-deep-blue.png     # Official bezel.fit frame
│       ├── iphone-17-pro-max-silver.png
│       ├── iphone-17-pro-max-cosmic-orange.png
│       ├── ipad-space-black.png                # Modern tablet frame
│       └── ipad-silver.png
│
├── core/
│   ├── capture.py        # Playwright headless browser automation
│   ├── framer.py         # bezel.fit masking & Dynamic Island overlay
│   ├── compositor.py     # 3D layered elevation & dual-tier drop shadows
│   ├── exporter.py       # WebP, PNG, JPG, and ZIP archiving
│   └── pipeline.py       # End-to-end workflow runner
│
├── static/
│   ├── css/style.css     # Sleek dark studio interface
│   └── js/app.js         # Interactive live preview & download manager
│
├── templates/
│   └── index.html        # Web dashboard UI
│
├── server.py             # FastAPI backend server
├── cli.py                # Command-line tool
└── run.bat               # 1-click Windows launcher
```
