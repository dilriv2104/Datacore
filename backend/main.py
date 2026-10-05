from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, catalogo, compras, clientes, proveedores, reportes, ubicacion, usuarios, ventas

app = FastAPI(
    title="DataCore API",
    version="1.0.0",
    description="API del sistema de gestion de inventario y ventas DataCore",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"status": "ok", "service": "DataCore API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

app.include_router(auth.router, prefix="/auth", tags=["Autenticacion"])
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(clientes.router, prefix="/clientes", tags=["Clientes"])
app.include_router(proveedores.router, prefix="/proveedores", tags=["Proveedores"])
app.include_router(catalogo.router, tags=["Catalogo"])
app.include_router(compras.router, prefix="/ordenes-compra", tags=["Compras"])
app.include_router(ventas.router, prefix="/ventas", tags=["Ventas"])
app.include_router(ubicacion.router, prefix="/ubicacion", tags=["Ubicacion"])
app.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])
