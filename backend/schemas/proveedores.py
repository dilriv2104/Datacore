from pydantic import BaseModel, ConfigDict, Field


class ProveedorBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    correo: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    id_localidad: int | None = None
    estado: bool = True


class ProveedorCrear(ProveedorBase):
    pass


class ProveedorRespuesta(ProveedorBase):
    model_config = ConfigDict(from_attributes=True)
    id_proveedor: int
