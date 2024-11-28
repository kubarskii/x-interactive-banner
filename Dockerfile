# Use slim version for smaller image
FROM node:22.2-slim

# Install only necessary packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

WORKDIR /app

# Copy and install Node dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Add healthcheck
HEALTHCHECK --interval=300s --timeout=3s \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
