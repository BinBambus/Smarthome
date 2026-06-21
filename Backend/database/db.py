from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os

import os
from sqlalchemy import create_engine

# Einzelne Variablen auslesen (mit deinen lokalen Defaults für den Test ohne Docker)
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "localhost")  
DB_NAME = os.getenv("DB_NAME", "smarthome_db")

# Dynamisch die URL zusammenbauen
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"

print(f"Using database URL: {DATABASE_URL}")  # Zum Debuggen, damit du siehst, welche URL verwendet wird
# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,  # Maximum number of connections in the pool
    max_overflow=20,  # Maximum number of connections that can be created beyond pool_size
    echo=False  # Set to True for SQL query logging (useful for debugging)
)

# Create SessionLocal class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to initialize database tables
def init_db():
    Base.metadata.create_all(bind=engine)