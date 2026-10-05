"""
Endpoints de solo lectura para llenar selects del frontend
(ciudades y localidades).

    GET /ubicacion/ciudades
    GET /ubicacion/localidades
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import usuario_actual
from database import get_db
from models.ubicacion import Ciudad, Localidad
from models.usuario import Usuario
from schemas.ubicacion import CiudadRespuesta, LocalidadRespuesta

router = APIRouter()


@router.get("/ciudades", response_model=list[CiudadRespuesta])
def listar_ciudades(db: Session = Depends(get_db), _usuario: Usuario = Depends(usuario_actual)):
    return db.query(Ciudad).order_by(Ciudad.nombre).all()


@router.get("/localidades", response_model=list[LocalidadRespuesta])
def listar_localidades(db: Session = Depends(get_db), _usuario: Usuario = Depends(usuario_actual)):
    return db.query(Localidad).order_by(Localidad.nombre).all()
