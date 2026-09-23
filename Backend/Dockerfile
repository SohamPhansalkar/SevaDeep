# Use a lightweight Python base image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy just the requirements first (this helps Docker cache dependencies to save time on future builds)
COPY requirements.txt .

# Install the Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Expose port 8000
EXPOSE 8000

# Start FastAPI and bind it to 0.0.0.0 so it can accept external network connections
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]