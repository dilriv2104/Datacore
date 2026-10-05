from pydantic import BaseModel, ConfigDict, Field

class UsuarioCrear(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    correo: str
    contrasena: str = Field(min_length=4)
    telefono: str | None = None
    direccion: str | None = None
    rol: str = "vendedor"
    id_localidad: int | None = None

class RegistroPublico(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    correo: str
    contrasena: str = Field(min_length=4)
    telefono: str | None = None
    direccion: str | None = None

class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_usuario: int
    nombre: str
    correo: str
    telefono: str | None = None
    direccion: str | None = None
    estado: bool
    rol: str
    id_localidad: int | None = None

class Login(BaseModel):
    correo: str
    contrasena: str

class LoginRespuesta(BaseModel):
    token: str
    usuario: UsuarioRespuesta
