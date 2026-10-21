FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install base Linux dependencies and international fonts for high-fidelity web rendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    ca-certificates \
    fontconfig \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright Chromium with all required Linux OS libraries
RUN playwright install chromium --with-deps

# Copy application source code
COPY . .

# Create exports directory with write permissions
RUN mkdir -p /app/exports && chmod -R 777 /app/exports

# Expose default HTTP port
EXPOSE 8000

# Start production server (supports dynamic cloud PORT on Railway, Render, Fly.io, etc.)
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
