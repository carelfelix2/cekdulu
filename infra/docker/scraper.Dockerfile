FROM mcr.microsoft.com/playwright/python:v1.49.1-jammy
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY apps/scraper/pyproject.toml ./apps/scraper/pyproject.toml
COPY apps/scraper/src ./apps/scraper/src
RUN pip install --no-cache-dir -e ./apps/scraper
CMD ["python", "-m", "cekdulu_scraper.main"]
