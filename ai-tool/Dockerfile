# Use official Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create app directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements (generate this file if you don't have one)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Switch to non-root user
USER appuser

# Expose port (optional for Choreo but useful for local runs)
EXPOSE $PORT

# Run the app
CMD ["sh", "-c", "python app.py --host=0.0.0.0 --port=$PORT"]
