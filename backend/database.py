"""
Conexion a la base de datos.

No usa Docker: se conecta directo a un PostgreSQL que ya
esta corriendo en tu computador (o en un servidor), leyendo
la URL desde el archivo .env.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "Falta DATABASE_URL en backend/.env. Copia .env.example a .env y configura PostgreSQL."
    )

# SQLAlchemy usa psycopg 3 para comunicarse con PostgreSQL.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependencia de FastAPI: abre una sesion de base de datos
    por cada request y la cierra automaticamente al terminar.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
