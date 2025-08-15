# Use Python 3.11 slim image for better performance and security
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=summarizer.py
ENV FLASK_ENV=production
# Add logging environment variable for easier debugging
ENV LOG_LEVEL=INFO
# Choreo-specific optimizations
ENV GUNICORN_WORKERS=2
ENV GUNICORN_TIMEOUT=60

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies with numpy compatibility fixes
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir numpy==1.24.3 && \
    pip install --no-cache-dir --no-build-isolation -r requirements.txt

# Copy application code
COPY . .

# Create a non-root user for security (Choreo requires UID between 10000-20000)
RUN adduser --disabled-password --gecos '' --uid 10001 appuser && \
    chown -R appuser:appuser /app && \
    # Ensure /tmp is writable (it usually is, but let's be explicit)
    chmod 755 /tmp

USER 10001

# Expose the port (Choreo typically uses 8080)
EXPOSE 8080

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; r=requests.get('http://localhost:8080/health', timeout=10); exit(0 if r.status_code==200 else 1)" || exit 1

# Run the application with Choreo-optimized Gunicorn settings
CMD ["python", "-m", "gunicorn", \
    "--bind", "0.0.0.0:8080", \
    "--workers", "${GUNICORN_WORKERS:-2}", \
    "--timeout", "${GUNICORN_TIMEOUT:-60}", \
    "--max-requests", "1000", \
    "--max-requests-jitter", "100", \
    "--preload-app", \
    "--access-logfile", "-", \
    "--error-logfile", "-", \
    "--log-level", "info", \
    "--access-logformat", "%(h)s - - [%(t)s] \"%(r)s\" %(s)s %(b)s \"%(f)s\" \"%(a)s\" %(L)s", \
    "summarizer:app"]