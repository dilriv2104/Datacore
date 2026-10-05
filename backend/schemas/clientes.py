from pydantic import BaseModel, ConfigDict, Field


class ClienteBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    correo: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    id_localidad: int | None = None
    estado: bool = True


class ClienteCrear(ClienteBase):
    pass


class ClienteRespuesta(ClienteBase):
    model_config = ConfigDict(from_attributes=True)
    id_cliente: int
