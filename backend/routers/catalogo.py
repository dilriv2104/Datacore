"""
Endpoints del catalogo: categorias y productos.

    GET    /categorias              -> listar categorias
    POST   /categorias              -> crear categoria (admin)
    PUT    /categorias/{id}         -> editar categoria (admin)
    DELETE /categorias/{id}         -> inactivar categoria (admin)

    GET    /productos               -> listar productos
    GET    /productos/inventario    -> productos activos, ordenados por stock
    POST   /productos               -> crear producto (admin)
    PUT    /productos/{id}          -> editar producto (admin)
    DELETE /productos/{id}          -> inactivar producto (admin)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import requiere_rol, usuario_actual
from database import get_db
from models.categoria import Categoria
from models.producto import Producto
from models.usuario import Usuario
from schemas.catalogo import (
    CategoriaBase,
    CategoriaRespuesta,
    ProductoActualizar,
    ProductoCrear,
    ProductoRespuesta,
)

router = APIRouter()


# ---------------------------------------------------------
# Categorias
# ---------------------------------------------------------

@router.get("/categorias", response_model=list[CategoriaRespuesta])
def listar_categorias(db: Session = Depends(get_db), _usuario: Usuario = Depends(usuario_actual)):
    return db.query(Categoria).order_by(Categoria.nombre_categoria).all()


@router.post("/categorias", response_model=CategoriaRespuesta, status_code=201)
def crear_categoria(
    datos: CategoriaBase,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    ya_existe = db.query(Categoria).filter(
        Categoria.nombre_categoria.ilike(datos.nombre_categoria)
    ).first()
    if ya_existe:
        raise HTTPException(status_code=400, detail="La categoría ya existe")

    categoria = Categoria(**datos.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.put("/categorias/{id_categoria}", response_model=CategoriaRespuesta)
def editar_categoria(
    id_categoria: int,
    datos: CategoriaBase,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    categoria = db.get(Categoria, id_categoria)
    if categoria is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    duplicada = db.query(Categoria).filter(
        Categoria.nombre_categoria.ilike(datos.nombre_categoria),
        Categoria.id_categoria != id_categoria,
    ).first()
    if duplicada:
        raise HTTPException(status_code=400, detail="La categoría ya existe")

    for campo, valor in datos.model_dump().items():
        setattr(categoria, campo, valor)

    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/categorias/{id_categoria}")
def inactivar_categoria(
    id_categoria: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    categoria = db.get(Categoria, id_categoria)
    if categoria is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    categoria.estado = False
    db.commit()
    return {"mensaje": "Categoría inactivada"}


# ---------------------------------------------------------
# Productos
# ---------------------------------------------------------

@router.get("/productos", response_model=list[ProductoRespuesta])
def listar_productos(db: Session = Depends(get_db), _usuario: Usuario = Depends(usuario_actual)):
    return db.query(Producto).order_by(Producto.id_producto.desc()).all()


@router.get("/productos/inventario", response_model=list[ProductoRespuesta])
def listar_inventario(db: Session = Depends(get_db), _usuario: Usuario = Depends(usuario_actual)):
    return (
        db.query(Producto)
        .filter(Producto.estado == True)  # noqa: E712
        .order_by(Producto.stock.asc())
        .all()
    )


@router.post("/productos", response_model=ProductoRespuesta, status_code=201)
def crear_producto(
    datos: ProductoCrear,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    categoria = db.get(Categoria, datos.id_categoria)
    if categoria is None or not categoria.estado:
        raise HTTPException(status_code=400, detail="La categoría no existe o está inactiva")

    producto = Producto(**datos.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


@router.put("/productos/{id_producto}", response_model=ProductoRespuesta)
def editar_producto(
    id_producto: int,
    datos: ProductoActualizar,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    producto = db.get(Producto, id_producto)
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    categoria = db.get(Categoria, datos.id_categoria)
    if categoria is None or not categoria.estado:
        raise HTTPException(status_code=400, detail="La categoría no existe o está inactiva")

    for campo, valor in datos.model_dump().items():
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/productos/{id_producto}")
def inactivar_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(requiere_rol("administrador")),
):
    producto = db.get(Producto, id_producto)
    if producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    producto.estado = False
    db.commit()
    return {"mensaje": "Producto eliminado correctamente"}
