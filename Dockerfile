# Gunakan image Python ringan
FROM python:3.12-slim

# Mencegah Python membuat file .pyc
ENV PYTHONDONTWRITEBYTECODE=1

# Menampilkan log langsung ke terminal Docker
ENV PYTHONUNBUFFERED=1

# Direktori kerja di dalam container
WORKDIR /app

# Copy file dependency terlebih dahulu
COPY requirements.txt .

# Install dependency
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh project
COPY . .

# Port Flask
EXPOSE 5000

# Jalankan aplikasi
CMD ["python", "app.py"]