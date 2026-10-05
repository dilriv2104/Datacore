-- =========================================================
-- BASE DE DATOS: datacore
-- SISTEMA DE GESTION LOGISTICA Y DE VENTAS
-- MOTOR: PostgreSQL
-- =========================================================

CREATE TABLE ciudad (
    id_ciudad INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE localidad (
    id_localidad INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_ciudad INTEGER NOT NULL,
    CONSTRAINT fk_localidad_ciudad
        FOREIGN KEY (id_ciudad) REFERENCES ciudad(id_ciudad)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_localidad_nombre_ciudad UNIQUE (nombre, id_ciudad)
);

-- Los usuarios internos son solamente administrador y vendedor.
CREATE TABLE usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    rol VARCHAR(20) NOT NULL,
    id_localidad INTEGER,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_usuario_rol
        CHECK (rol IN ('administrador', 'vendedor')),

    CONSTRAINT fk_usuario_localidad
        FOREIGN KEY (id_localidad) REFERENCES localidad(id_localidad)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- Cliente es una persona a la que se le vende.
-- No necesita iniciar sesion en el sistema.
CREATE TABLE cliente (
    id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    id_localidad INTEGER,

    CONSTRAINT fk_cliente_localidad
        FOREIGN KEY (id_localidad) REFERENCES localidad(id_localidad)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- Proveedor es quien suministra la mercancia.
-- Tampoco es un usuario que entre al sistema.
CREATE TABLE proveedor (
    id_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100),
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    id_localidad INTEGER,

    CONSTRAINT fk_proveedor_localidad
        FOREIGN KEY (id_localidad) REFERENCES localidad(id_localidad)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE categoria (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE producto (
    id_producto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    stock INTEGER NOT NULL DEFAULT 0,
    precio_unitario NUMERIC(10,2) NOT NULL,
    unidad_medida VARCHAR(30) NOT NULL,
    fecha_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_caducidad DATE,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    id_categoria INTEGER NOT NULL,

    CONSTRAINT chk_producto_stock CHECK (stock >= 0),
    CONSTRAINT chk_producto_precio CHECK (precio_unitario > 0),
    CONSTRAINT chk_producto_fecha_caducidad
        CHECK (fecha_caducidad IS NULL OR fecha_caducidad > fecha_entrada),
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE orden_compra (
    id_orden_compra INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_proveedor INTEGER NOT NULL,
    id_usuario_administrador INTEGER NOT NULL,

    CONSTRAINT chk_orden_compra_estado
        CHECK (estado IN ('pendiente', 'confirmada', 'recibida', 'cancelada')),

    CONSTRAINT fk_orden_compra_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_orden_compra_administrador
        FOREIGN KEY (id_usuario_administrador) REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE detalle_compra (
    id_detalle_compra INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_compra NUMERIC(10,2) NOT NULL,
    id_orden_compra INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,

    CONSTRAINT chk_detalle_compra_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_compra_precio CHECK (precio_compra > 0),
    CONSTRAINT fk_detalle_compra_orden
        FOREIGN KEY (id_orden_compra) REFERENCES orden_compra(id_orden_compra)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_compra_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE venta (
    id_venta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario_vendedor INTEGER NOT NULL,
    id_cliente INTEGER NOT NULL,

    CONSTRAINT fk_venta_vendedor
        FOREIGN KEY (id_usuario_vendedor) REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE detalle_venta (
    id_detalle_venta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    id_producto INTEGER NOT NULL,
    id_venta INTEGER NOT NULL,

    CONSTRAINT chk_detalle_venta_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_venta_precio CHECK (precio_unitario > 0),
    CONSTRAINT fk_detalle_venta_producto
        FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_detalle_venta_venta
        FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- =========================================================
-- VALIDAR ROLES
-- =========================================================

CREATE OR REPLACE FUNCTION validar_roles_orden_compra()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM proveedor
        WHERE id_proveedor = NEW.id_proveedor AND estado = TRUE
    ) THEN
        RAISE EXCEPTION 'El proveedor no existe o esta inactivo';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM usuario
        WHERE id_usuario = NEW.id_usuario_administrador
          AND rol = 'administrador'
          AND estado = TRUE
    ) THEN
        RAISE EXCEPTION 'El usuario administrador no existe o esta inactivo';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_roles_orden_compra
BEFORE INSERT OR UPDATE ON orden_compra
FOR EACH ROW EXECUTE FUNCTION validar_roles_orden_compra();

CREATE OR REPLACE FUNCTION validar_roles_venta()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM usuario
        WHERE id_usuario = NEW.id_usuario_vendedor
          AND rol IN ('vendedor', 'administrador')
          AND estado = TRUE
    ) THEN
        RAISE EXCEPTION 'El usuario que registra la venta no existe o esta inactivo';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM cliente
        WHERE id_cliente = NEW.id_cliente AND estado = TRUE
    ) THEN
        RAISE EXCEPTION 'El cliente no existe o esta inactivo';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_roles_venta
BEFORE INSERT OR UPDATE ON venta
FOR EACH ROW EXECUTE FUNCTION validar_roles_venta();

-- =========================================================
-- ACTUALIZAR STOCK
-- =========================================================

CREATE OR REPLACE FUNCTION aumentar_stock_por_compra()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE producto
    SET stock = stock + NEW.cantidad
    WHERE id_producto = NEW.id_producto;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_aumentar_stock_por_compra
AFTER INSERT ON detalle_compra
FOR EACH ROW EXECUTE FUNCTION aumentar_stock_por_compra();

CREATE OR REPLACE FUNCTION descontar_stock_por_venta()
RETURNS TRIGGER AS $$
DECLARE
    stock_actual INTEGER;
BEGIN
    SELECT stock INTO stock_actual
    FROM producto
    WHERE id_producto = NEW.id_producto
    FOR UPDATE;

    IF stock_actual IS NULL THEN
        RAISE EXCEPTION 'Producto no encontrado';
    END IF;

    IF stock_actual < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente. Disponible: %, solicitado: %',
            stock_actual, NEW.cantidad;
    END IF;

    UPDATE producto
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_descontar_stock_por_venta
BEFORE INSERT ON detalle_venta
FOR EACH ROW EXECUTE FUNCTION descontar_stock_por_venta();
