"""Esquemas Pydantic para ciudad y localidad."""

from pydantic import BaseModel, ConfigDict


class CiudadRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_ciudad: int
    nombre: str


class LocalidadRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_localidad: int
    nombre: str
    id_ciudad: int
