FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev bluez && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    sqlalchemy \
    psycopg2-binary \
    pydantic \
    passlib \
    PyJWT \
    asyncio \
    pymagicstrip

COPY ./Backend .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]