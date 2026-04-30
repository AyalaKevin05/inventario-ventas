-- SEED – contraseñas generadas con bcrypt (admin123 / vendedor123)
INSERT INTO roles (nombre) VALUES ('Administrador'),('Vendedor');

-- Ejecutar node -e "const b=require('bcryptjs');console.log(b.hashSync('admin123',10))" para regenerar
INSERT INTO usuarios (nombre, correo, contrasena, id_rol) VALUES
    ('Admin Sistema','admin@tienda.com','$2b$10$PLACEHOLDER_ADMIN','1'),
    ('Juan Pérez','juan@tienda.com','$2b$10$PLACEHOLDER_VENDEDOR','2'),
    ('María López','maria@tienda.com','$2b$10$PLACEHOLDER_VENDEDOR','2');

INSERT INTO categorias (nombre, descripcion) VALUES
    ('Electrónica','Dispositivos y accesorios tecnológicos'),
    ('Ropa','Prendas de vestir'),
    ('Alimentos','Productos alimenticios'),
    ('Hogar','Artículos para el hogar'),
    ('Deportes','Equipos deportivos');

INSERT INTO proveedores (nombre, telefono, email) VALUES
    ('TechSupply S.A.','555-0101','ventas@techsupply.com'),
    ('ModaExpress Ltda.','555-0202','pedidos@modaexpress.com'),
    ('AlimentosFresh','555-0303','info@alimentosfresh.com'),
    ('HogarPlus','555-0404','contacto@hogarplus.com'),
    ('DeportesPro','555-0505','ventas@deportespro.com');

INSERT INTO clientes (nombre, documento, telefono, email, direccion) VALUES
    ('Cliente General','000000000','000-0000','general@tienda.com','Sin dirección'),
    ('Carlos Rodríguez','1234567890','311-1111','carlos@email.com','Calle 10 #5-20'),
    ('Ana Gómez','0987654321','322-2222','ana@email.com','Carrera 8 #12-45');

INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, id_proveedor) VALUES
    ('Smartphone Samsung A14','Teléfono Android 6.6" 64GB',299.99,50,1,1),
    ('Auriculares Bluetooth','Inalámbricos con cancelación de ruido',49.99,100,1,1),
    ('Laptop Lenovo IdeaPad','15.6" Intel i5 8GB 256GB SSD',699.99,20,1,1),
    ('Camiseta Algodón','Unisex 100% algodón talla M',15.99,200,2,2),
    ('Jeans Clásico','Corte recto talla 32',39.99,80,2,2),
    ('Arroz 5kg','Grano largo 5 kilogramos',8.99,500,3,3),
    ('Aceite de Oliva 1L','Extra virgen',12.99,150,3,3),
    ('Cafetera Eléctrica','Goteo 12 tazas 1000W',35.99,40,4,4),
    ('Set Sábanas Queen','100% algodón Queen size',45.99,60,4,4),
    ('Balón de Fútbol','Oficial tamaño 5',24.99,75,5,5),
    ('Zapatillas Running','Deportivas talla 42',89.99,35,5,5),
    ('Cable USB-C','Carga rápida 2m',9.99,300,1,1);
