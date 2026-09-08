# StyleHub - Proyecto E-commerce

## Descripción
StyleHub es un proyecto académico de E-commerce de ropa con categorías para hombres, mujeres y niños. Para esta entrega final se utilizó React.js junto con Vite para construir una aplicación web (SPA) con navegación por rutas, estado global y diseño responsive, con integración a base de datos PostgreSQL.

## Funcionalidades principales
- Registro de nuevos usuarios con validación de datos, confirmación de contraseña y guardado en PostgreSQL.
- Inicio de sesión con validación de credenciales y usuario de prueba.
- Catálogo de productos con filtros por categorías: Todos, Hombres, Mujeres y Niños (consultados desde base de datos).
- Carrito de compras con actualización dinámica de cantidades, eliminación de productos, cálculo de subtotal, envío y total, además de vista para carrito vacío.
- Formulario para finalizar pedido con datos del comprador, dirección de envío y selección de método de pago (Tarjeta, Yape / Plin y Pago contra entrega).
- Pantalla de confirmación con resumen de la orden, código de compra generado y guardado en PostgreSQL.
- **Módulo de Opiniones del Producto y Seguridad Web:**
  - Publicación y visualización de opiniones y valoraciones con estrellas (1 a 5).
  - **Validación de esquemas JSON con Zod:** Validación estricta tanto en cliente como en backend evitando inyección de campos no autorizados.
  - **Sanitización contra Cross-Site Scripting (XSS) con DOMPurify:** Desinfección de contenido HTML antes de renderizar con `dangerouslySetInnerHTML`, permitiendo tags seguros como `<b>` e `<i>` y neutralizando scripts o eventos `onerror`.
  - **Protección contra Escalamiento de Privilegios y Mass Assignment:** Restricción estricta en actualización de perfiles impidiendo la inyección arbitraria de roles de administrador.
  - **Control de Acceso Seguro:** Eliminación de vulnerabilidades basadas en query params inseguros (`req.query.user === "admin"`).
- Diseño responsive para computadoras, tablets y celulares.

## Usuario de prueba para inicio de sesión
- Correo: usuario@stylehub.com
- Contraseña: 1234

## Integrante del Grupo 4
- Harry Sly Rodríguez Sandoval

## Tecnologías utilizadas
- HTML5 / CSS3
- JavaScript (ES6)
- React.js 18
- React Router DOM
- Vite
- Node.js / Express
- PostgreSQL
- Zod (Validación de esquemas y sanitización de payloads)
- DOMPurify (Prevención de ataques XSS en contenido enriquecido)

## Instrucciones para ejecutar el proyecto

### 1. Instalar las dependencias del proyecto
```bash
npm install
```

### 2. (Opcional) Inicializar y conectar la base de datos PostgreSQL
Para crear la base de datos `stylehub_db`, las tablas y los registros iniciales:
```bash
npm run db:init
```

Para iniciar el servidor backend conectado a PostgreSQL:
```bash
npm run server
```

### 3. Iniciar el servidor de desarrollo Frontend
En otra terminal (o si se evalúa solo el frontend):
```bash
npm run dev
```

Abrir la aplicación en el navegador:
```
http://localhost:5173
```

> **Nota:** La aplicación cuenta con arquitectura resiliente: si el backend de PostgreSQL está activo se conecta en tiempo real; si no está activo, funciona de forma autónoma con datos locales y almacenamiento en el navegador.

### 4. Compilar para producción (Opcional)
```bash
npm run build
```
