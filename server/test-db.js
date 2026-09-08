import pg from 'pg';
import bcrypt from 'bcryptjs';
const { Client, Pool } = pg;

async function testConnection() {
  // 1. Conectar al servidor postgres por defecto
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '12345',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Conexión exitosa a PostgreSQL con el usuario postgres.');

    // 2. Verificar si existe la base de datos stylehub_db
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'stylehub_db'");
    if (res.rowCount === 0) {
      console.log('Creando base de datos stylehub_db...');
      await client.query('CREATE DATABASE stylehub_db');
      console.log('Base de datos stylehub_db creada exitosamente.');
    } else {
      console.log('La base de datos stylehub_db ya existe.');
    }
    await client.end();

    // 3. Conectar a stylehub_db y crear las tablas
    const dbPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'stylehub_db',
      password: '12345',
      port: 5432,
    });

    const initSchema = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        nombre_completo VARCHAR(200),
        correo VARCHAR(150) UNIQUE NOT NULL,
        telefono VARCHAR(50),
        ciudad VARCHAR(100),
        direccion VARCHAR(200),
        documento VARCHAR(50),
        clave VARCHAR(100) NOT NULL,
        rol VARCHAR(20) DEFAULT 'user',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        precio NUMERIC(10, 2) NOT NULL,
        talla VARCHAR(50),
        imagen VARCHAR(255),
        descripcion TEXT
      );

      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        codigo_pedido VARCHAR(50) UNIQUE NOT NULL,
        nombre_comprador VARCHAR(200) NOT NULL,
        correo_comprador VARCHAR(150) NOT NULL,
        documento VARCHAR(50),
        telefono VARCHAR(50),
        direccion VARCHAR(200),
        ciudad VARCHAR(100),
        metodo_pago VARCHAR(50) NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        envio NUMERIC(10, 2) NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        detalles_productos JSONB,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resenas (
        id SERIAL PRIMARY KEY,
        producto_id INT,
        autor VARCHAR(100) NOT NULL,
        texto TEXT NOT NULL,
        calificacion INT DEFAULT 5,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await dbPool.query(initSchema);
    console.log('Tablas (usuarios, productos, pedidos, resenas) creadas o verificadas.');

    // 4. Sembrar usuario de prueba y admin con contraseñas Bcrypt hasheadas
    const testPasswordHash = bcrypt.hashSync('1234', 10);
    const checkUser = await dbPool.query("SELECT * FROM usuarios WHERE correo = 'usuario@stylehub.com'");
    if (checkUser.rowCount === 0) {
      await dbPool.query(`
        INSERT INTO usuarios (nombres, apellidos, nombre_completo, correo, telefono, ciudad, direccion, documento, clave, rol)
        VALUES ('Harry Sly', 'Rodríguez Sandoval', 'Harry Sly Rodríguez Sandoval', 'usuario@stylehub.com', '987654321', 'Lima', 'Av. Universitaria 1801, San Miguel', '72345678', $1, 'user')
      `, [testPasswordHash]);
      console.log('Usuario de prueba (Bcrypt) insertado en PostgreSQL.');
    }

    const checkAdmin = await dbPool.query("SELECT * FROM usuarios WHERE correo = 'admin@stylehub.com'");
    if (checkAdmin.rowCount === 0) {
      await dbPool.query(`
        INSERT INTO usuarios (nombres, apellidos, nombre_completo, correo, telefono, ciudad, direccion, documento, clave, rol)
        VALUES ('Administrador', 'Corporativo', 'Administrador Corporativo', 'admin@stylehub.com', '999111222', 'Lima', 'Av. Javier Prado 500', '10998877', $1, 'admin')
      `, [testPasswordHash]);
      console.log('Usuario Administrador (Bcrypt + Rol Admin) insertado en PostgreSQL.');
    }

    // 5. Sembrar productos si la tabla está vacía
    const checkProd = await dbPool.query('SELECT COUNT(*) FROM productos');
    if (parseInt(checkProd.rows[0].count, 10) === 0) {
      const seedProducts = `
        INSERT INTO productos (nombre, categoria, precio, talla, imagen, descripcion) VALUES
        ('Camisa Casual Azul', 'hombres', 79.90, 'M', '/img/camisa-azul.jpg', 'Camisa de algodón, ideal para uso diario. Disponible en varias tallas.'),
        ('Pantalón Jean Slim', 'hombres', 99.90, '32', '/img/pantalon-jean.jpg', 'Jean corte slim, resistente, moderno y muy cómodo.'),
        ('Blusa Floral', 'mujeres', 69.90, 'M', '/img/blusa-floral.jpg', 'Blusa ligera con estampado floral, fresca y perfecta para el verano.'),
        ('Conjunto Casual Celeste', 'mujeres', 119.90, 'S', '/img/conjunto-casual.jpg', 'Conjunto casual elegante y cómodo, ideal para el día a día.'),
        ('Polo Infantil Estampado', 'ninos', 39.90, '6 años', '/img/polo-infantil.jpg', 'Polo infantil de algodón con estampado divertido, suave y cómodo.'),
        ('Short Deportivo Infantil', 'ninos', 34.90, '6 años', '/img/short-deportivo.jpg', 'Short ligero y transpirable, perfecto para juegos y deportes.');
      `;
      await dbPool.query(seedProducts);
      console.log('Productos iniciales insertados en PostgreSQL.');
    }

    // 6. Sembrar reseñas de productos si la tabla está vacía
    const checkResenas = await dbPool.query('SELECT COUNT(*) FROM resenas');
    if (parseInt(checkResenas.rows[0].count, 10) === 0) {
      const seedReviews = `
        INSERT INTO resenas (producto_id, autor, texto, calificacion) VALUES
        (1, 'Ana Morales', 'Excelente camisa, muy <b>recomendada</b>. La tela es fresca y de calidad.', 5),
        (2, 'Carlos Mendoza', 'El envío fue rápido y el jean queda <i>perfecto</i>. Muy cómodo.', 4);
      `;
      await dbPool.query(seedReviews);
      console.log('Reseñas iniciales insertadas en PostgreSQL.');
    }

    await dbPool.end();
    console.log('¡Base de datos PostgreSQL configurada al 100%!');
  } catch (err) {
    console.error('Error al conectar a PostgreSQL:', err.message);
  }
}

testConnection();
